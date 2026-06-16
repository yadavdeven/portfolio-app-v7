package com.portfolioapp

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

import android.os.Build
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments

import android.content.Context
import android.os.BatteryManager

/**
 * Bridgeless (TurboModule) native module exposing read-only device info.
 *
 * Extends the codegen-generated `NativeDeviceInfoModuleSpec`, produced from the
 * TS spec (`NativeDeviceInfoModule.ts`). The Kotlin signature below MUST match
 * that spec or the project won't compile.
 */
@ReactModule(name = DeviceInfoModule.NAME)
class DeviceInfoModule(
    reactContext: ReactApplicationContext
) : NativeDeviceInfoModuleSpec(reactContext) {

    override fun getName(): String = NAME

    /**
     * Synchronous JSI call: gathers device facts into a map and returns it
     * directly to JS (no Promise needed on the New Architecture).
     */
    override fun getDeviceInfo(): WritableMap {
        val map = Arguments.createMap()

        // Static facts from Build (no context required).
        map.putString("model", Build.MODEL)
        map.putString("manufacturer", Build.MANUFACTURER)
        map.putString("brand", Build.BRAND)
        map.putString("osVersion", Build.VERSION.RELEASE)
        map.putInt("apiLevel", Build.VERSION.SDK_INT)

        // Battery percentage (0..100) via the BatteryManager system service.
        val batteryManager = reactApplicationContext
            .getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        val batteryLevel = batteryManager
            .getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
        map.putInt("batteryLevel", batteryLevel)

        return map
    }

    companion object {
        const val NAME = "DeviceInfoModule"
    }
}
