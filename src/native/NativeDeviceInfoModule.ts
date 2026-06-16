import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Shape returned by `getDeviceInfo`. Codegen maps this object type to a
 * `WritableMap` in the generated Kotlin base class `NativeDeviceInfoModuleSpec`.
 */
export type DeviceInfo = {
  model: string;
  manufacturer: string;
  brand: string;
  osVersion: string;
  apiLevel: number;
  batteryLevel: number;
};

/**
 * Turbo Module spec.
 *
 * Codegen reads this file (filename prefixed `Native`, exports a
 * `TurboModuleRegistry` lookup) and generates the abstract Kotlin base class
 * `NativeDeviceInfoModuleSpec` in package `com.portfolioapp`. NOTE: the file is
 * named `NativeDeviceInfoModule` (not `NativeDeviceInfo`) to avoid colliding
 * with React Native's built-in core `NativeDeviceInfo` spec.
 *
 * The string passed to `getEnforcing` MUST equal the native `getName()`.
 */
export interface Spec extends TurboModule {
  /** Synchronous: returns static + live device facts directly (no Promise). */
  getDeviceInfo(): DeviceInfo;
}

export default TurboModuleRegistry.getEnforcing<Spec>('DeviceInfoModule');
