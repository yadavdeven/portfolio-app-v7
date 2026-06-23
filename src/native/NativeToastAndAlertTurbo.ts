import type { TurboModule } from 'react-native';
import { Platform, TurboModuleRegistry } from 'react-native';

/**
 * Turbo Module spec.
 *
 * Codegen reads this file (filename is prefixed `Native` and it exports a
 * `TurboModuleRegistry` lookup) and generates the abstract Kotlin base class
 * `NativeToastAndAlertTurboSpec` (filename + "Spec") in package
 * `com.portfolioapp` (from codegenConfig.android.javaPackageName).
 *
 * The string passed to `getEnforcing` MUST equal the native `getName()`.
 */
export interface Spec extends TurboModule {
  /** Fire-and-forget: shows a native Android AlertDialog. */
  showAlert(name: string): void;

  /**
   * Synchronous: shows a native Toast AND returns the greeting string
   * directly (no Promise) — this is the JSI synchronous call.
   */
  showToast(name: string): string;
}

// The native side is only implemented on Android for now. On iOS `getEnforcing`
// would throw at import time ("module could not be found"), crashing the app at
// startup, so guard the lookup and export `null` there until the iOS TurboModule
// is written. Call sites must null-check the default export.
export default Platform.OS === 'android'
  ? TurboModuleRegistry.getEnforcing<Spec>('ToastAndAlertModuleTurbo')
  : null;
