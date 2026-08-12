package com.portfolioapp.showalert

// ReactPackage            → the classic registration interface. Deprecated in
//                           favour of BaseReactPackage, but still fully supported
//                           on the new architecture via RN's interop layer.
// NativeModule            → common supertype of all native modules; the list
//                           element type createNativeModules returns.
// ReactApplicationContext → handed in by RN, forwarded to the module constructor.
// ViewManager             → type param for createViewManagers; unused here.
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * Registers ShowAlertModule with React Native.
 *
 * A module class alone is inert — RN never scans your code for @ReactMethod.
 * It asks each registered package what it provides. This is that answer, which
 * is why MainApplication has to add(ShowAlertPackage()).
 */
class ShowAlertPackage : ReactPackage {

    /**
     * Called once at startup. Return every native module this package provides.
     * The ReactApplicationContext handed in here is what reaches your module's
     * constructor and gets passed up to ReactContextBaseJavaModule.
     *
     * Eager by design: every module in this list is constructed at app start,
     * whether or not JS ever calls it.
     */
    @Suppress("OVERRIDE_DEPRECATION")
    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): List<NativeModule> = listOf(ShowAlertModule(reactContext))

    /**
     * Required by the interface. ViewManagers expose native *Views* to JS
     * (a custom map, a native video player). We're exposing a method, not a
     * view, so this stays empty.
     */
    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> = emptyList()
}
