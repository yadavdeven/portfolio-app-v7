import { NativeModules, Platform } from 'react-native';

export interface CaretRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CursorPositionNative {
  getCaretRect: (viewTag: number, charIndex: number) => Promise<CaretRect>;
}

const CursorPositionModule = (NativeModules as Record<string, unknown>)
  .CursorPositionModule as CursorPositionNative | undefined;

if (!CursorPositionModule && __DEV__) {
  console.warn(
    `CursorPositionModule is not available on ${Platform.OS}. ` +
      'Rebuild the app after adding the native module (Android: Kotlin, ' +
      'iOS: Swift + the .m bridge added to the Xcode target).',
  );
}

/**
 * Returns the caret rectangle (in DIP) for the given char index inside the
 * native EditText resolved from `viewTag`, or `null` when the native module
 * is unavailable (e.g. iOS) or the caret position cannot be resolved.
 */
export async function getCaretRect(
  viewTag: number,
  charIndex: number,
): Promise<CaretRect | null> {
  if (!CursorPositionModule) {
    if (__DEV__) {
      console.warn('getCaretRect: CursorPositionModule is undefined (native module not in build?)');
    }
    return null;
  }
  try {
    return await CursorPositionModule.getCaretRect(viewTag, charIndex);
  } catch (e) {
    if (__DEV__) {
      console.warn('getCaretRect: native rejected ->', e);
    }
    return null;
  }
}

export const isCursorPositionAvailable = (): boolean => !!CursorPositionModule;

export default CursorPositionModule;
