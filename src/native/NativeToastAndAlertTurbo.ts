import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

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

export default TurboModuleRegistry.getEnforcing<Spec>('ToastAndAlertModuleTurbo');
