import Foundation
import UIKit
import React

/// iOS counterpart of the Android `CursorPositionModule`.
///
/// Returns the caret rectangle (in points, which match React Native DIP) for a
/// given character index inside the currently focused text input. Mirrors the
/// Android module's behaviour: it resolves the editor via the first responder
/// (the field the caret actually lives in while typing) rather than the RN
/// `viewTag`, which is unreliable to resolve under the new architecture.
///
/// `react-native-enriched`'s `InputTextView` is a `UITextView` subclass, so the
/// `UITextInput` caret APIs apply directly.
@objc(CursorPositionModule)
class CursorPositionModule: NSObject {

  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc(getCaretRect:charIndex:resolver:rejecter:)
  func getCaretRect(_ viewTag: NSNumber,
                    charIndex: NSNumber,
                    resolver resolve: @escaping RCTPromiseResolveBlock,
                    rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      guard let textInput = Self.focusedTextInput() else {
        reject("E_NO_TEXT_INPUT", "No focused UITextInput found", nil)
        return
      }

      // Clamp the requested index into the document's bounds.
      let start = textInput.beginningOfDocument
      let length = textInput.offset(from: start, to: textInput.endOfDocument)
      let safeOffset = max(0, min(charIndex.intValue, length))

      guard let position = textInput.position(from: start, offset: safeOffset) else {
        reject("E_NO_POSITION", "Could not resolve text position for index \(safeOffset)", nil)
        return
      }

      var rect = textInput.caretRect(for: position)

      // `caretRect(for:)` is in the text view's own coordinate space. The text
      // view is inset within the RN host by the editor's padding and shifted by
      // scroll. Convert into the host (superview) coordinate space — which the
      // RN mention overlay is positioned in — so both the padding offset (the
      // iOS analogue of Android's totalPaddingTop) and scroll are accounted for.
      if let textView = textInput as? UIView, let host = textView.superview {
        rect = textView.convert(rect, to: host)
      }

      // Guard against the non-finite caret width UIKit can return.
      let width = rect.size.width.isFinite ? rect.size.width : 2.0

      resolve([
        "x": rect.origin.x,
        "y": rect.origin.y,
        "width": width,
        "height": rect.size.height,
      ])
    }
  }

  /// Finds the first responder that conforms to `UITextInput`, searching every
  /// active window's view hierarchy.
  private static func focusedTextInput() -> UITextInput? {
    for window in activeWindows() {
      if let found = findTextInput(in: window) {
        return found
      }
    }
    return nil
  }

  private static func activeWindows() -> [UIWindow] {
    return UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap { $0.windows }
  }

  private static func findTextInput(in view: UIView) -> UITextInput? {
    if view.isFirstResponder, let textInput = view as? UITextInput {
      return textInput
    }
    for subview in view.subviews {
      if let found = findTextInput(in: subview) {
        return found
      }
    }
    return nil
  }
}
