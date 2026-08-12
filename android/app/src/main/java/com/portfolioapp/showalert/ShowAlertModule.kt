// Must mirror the folder path under src/main/java — this file lives in
// .../java/com/portfolioapp/showalert/, so the package is com.portfolioapp.showalert.
// Kotlin won't compile if the two disagree.
package com.portfolioapp.showalert

// ── Standard imports: required by every legacy native module ────────────────
// ReactApplicationContext    → app-wide React context passed in by the ReactPackage.
//                              Your gateway to currentActivity, the event emitter,
//                              and lifecycle hooks.
// ReactContextBaseJavaModule → base class that makes this a native module and
//                              forces you to implement getName().
// ReactMethod                → annotation that exposes a function to JS.
//                              Unannotated methods are invisible to JS.
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

// ── Use-case imports: needed only because THIS module draws UI ──────────────
// AlertDialog  → the dialog we're showing. AppCompat version (not
//                android.app.AlertDialog) so it picks up the app's Material theme.
//                Ships with React Native already; no extra dependency.
// UiThreadUtil → @ReactMethod runs on the native modules thread, NOT Android's
//                main thread. Any UI work must hop to the main thread or Android
//                throws CalledFromWrongThreadException. A module that only does
//                math, file I/O, or networking wouldn't import this.
import androidx.appcompat.app.AlertDialog
import com.facebook.react.bridge.UiThreadUtil

/**
 * Native module that shows an Android AlertDialog greeting a name passed from JS.
 *
 * JS side:  NativeModules.ShowAlertModule.showAlert('Deven')
 *
 * The constructor param is handed in by ShowAlertPackage.getModule(); passing it
 * up to the superclass is what gives this class access to reactApplicationContext.
 */
class ShowAlertModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    // The ONLY link between Kotlin and JS is this string. Whatever it returns
    // becomes the property name on NativeModules. Mismatch it and JS gets
    // undefined with no error pointing here.
    override fun getName(): String = NAME

    /**
     * Exposed to JS. String params cross the bridge natively — no conversion
     * needed, unlike objects/arrays which arrive as ReadableMap/ReadableArray.
     *
     * Returns Unit, so this is fire-and-forget: JS gets no signal when the
     * dialog is dismissed. Adding a `promise: Promise` last param would fix that.
     */
    @ReactMethod
    fun showAlert(name: String) {
        // @ReactMethod bodies run on the native modules thread, so every line
        // that touches UI has to be inside this block.
        UiThreadUtil.runOnUiThread {
            // A Dialog needs a window, which only an Activity has — passing the
            // application context throws BadTokenException. currentActivity is
            // null when the app is backgrounded, so we drop the alert instead.
            //
            // Note: reactApplicationContext.currentActivity, NOT the inherited
            // getCurrentActivity() — that's deprecated as of RN 0.80.
            val activity = reactApplicationContext.currentActivity ?: return@runOnUiThread

            // .create() rather than .show(): we need the Window handle before the
            // dialog is drawn. .show() builds AND displays in one call, so any
            // window tweak after it would land too late or cause a visible flash.
            val dialog = AlertDialog.Builder(activity)
                .setTitle("Greeting")
                // Kotlin string template — this is where the dynamic name lands.
                .setMessage("Hello $name")
                .setPositiveButton("OK") { d, _ -> d.dismiss() }
                .create()

            // Opacity of the scrim behind the dialog: 0f = fully transparent
            // (screen shows through), 1f = solid black. Android's default is 0.6.
            dialog.window?.setDimAmount(0.1f)

            dialog.show()
        }
    }

    companion object {
        // The JS-facing module name, kept in one place. Must match the key used
        // in src/native/ShowAlert.ts — a mismatch is the classic "module is
        // undefined" bug, and nothing warns you about it.
        const val NAME = "ShowAlertModule"
    }

}
