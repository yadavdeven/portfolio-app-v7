// import type { TurboModule } from 'react-native';
// import { TurboModuleRegistry } from 'react-native';

// /**
//  * Turbo Module spec.
//  *
//  * Codegen reads this file (filename is prefixed `Native` and it exports a
//  * `TurboModuleRegistry` lookup) and generates the abstract Kotlin base class
//  * `NativeToastAndAlertTurboSpec` that the native module extends.
//  *
//  * The name passed to `getEnforcing` ("ToastAndAlertTurbo") must equal the
//  * native `getName()`.
//  */
// export interface Spec extends TurboModule {
//   /** Async -> returns a value, so it is a Promise on the native side. */
//   greetWithToast(name: string): Promise<string>;

//   /** Fire-and-forget: native AlertDialog (Android). */
//   showAlert(name: string): void;

//   /**
//    * Fire-and-forget: native Android Toast.
//    * @param isLong true -> Toast.LENGTH_LONG, false -> LENGTH_SHORT
//    * (avoid `long`: it is a reserved keyword in the generated Java spec)
//    */
//   showToast(message: string, isLong: boolean): void;
// }

// export default TurboModuleRegistry.getEnforcing<Spec>('ToastAndAlertTurbo');
