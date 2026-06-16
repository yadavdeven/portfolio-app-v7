package com.portfolioapp

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

/**
 * Registers the DeviceInfo TurboModule.
 *
 *  - [getModule]: lazily builds the module instance, looked up by name.
 *  - [getReactModuleInfoProvider]: metadata for the TurboModule system. The
 *    last `true` -> `isTurboModule` wires it over JSI (enabling the synchronous
 *    `getDeviceInfo` call).
 */
class DeviceInfoPackage : BaseReactPackage() {

    override fun getModule(
        name: String,
        reactContext: ReactApplicationContext,
    ): NativeModule? =
        if (name == DeviceInfoModule.NAME) {
            DeviceInfoModule(reactContext)
        } else {
            null
        }

    override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
        mapOf(
            DeviceInfoModule.NAME to ReactModuleInfo(
                DeviceInfoModule.NAME,             // name (matches getName())
                DeviceInfoModule::class.java.name, // className (fully-qualified)
                false, // canOverrideExistingModule
                false, // needsEagerInit
                false, // isCxxModule
                true,  // isTurboModule
            ),
        )
    }
}
