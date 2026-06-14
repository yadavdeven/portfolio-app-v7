#import <React/RCTBridgeModule.h>

// Exposes the Swift `CursorPositionModule` to React Native under the same name
// the JS layer looks up (`NativeModules.CursorPositionModule`), matching the
// Android module's `getName()`.
@interface RCT_EXTERN_MODULE(CursorPositionModule, NSObject)

RCT_EXTERN_METHOD(getCaretRect:(nonnull NSNumber *)viewTag
                  charIndex:(nonnull NSNumber *)charIndex
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
