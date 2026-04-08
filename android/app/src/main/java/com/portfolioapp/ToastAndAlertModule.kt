// Needed to specify the package name at the top of the file
// (native Kotlin / Android requirement)
package com.portfolioapp
// almost needed in all modules when the task is asynchronous one 
// like data is returned, so it can pass or fail 
// it is not required for synchronous tasks like 
// @ReactMethod fun showAlert(name: String) 
// @ReactMethod fun openSettings() 
// @ReactMethod fun logSomething()
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
// need to export methods to be accessible from JS side
import com.facebook.react.bridge.ReactMethod

/**
 * Native module exposed to React Native.
 *
 * - Uses Promise because data is returned to JS (async task)
 * - Promise is NOT required for fire-and-forget methods like:
 *   @ReactMethod fun showAlert(name: String)
 *   @ReactMethod fun openSettings()
 *   @ReactMethod fun logSomething()
 */
class ToastAndAlertModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ToastAndAlertModule"
    }

    @ReactMethod
    fun getGreetMessage(name: String, promise: Promise) {
        try {
            promise.resolve("Hello, $name to the portfolio app.")
        } catch (e: Exception) {
            promise.reject("GREET_ERROR", e)
        }
    }

    @ReactMethod
    fun showAlert(name: String) {
        
        val activity = reactApplicationContext.currentActivity ?: return

        val alertMessage = "Welcome, $name to the portfolio app."

        activity.runOnUiThread {
            android.app.AlertDialog.Builder(activity)
                .setTitle("Alert")
                .setMessage(alertMessage)
                .setPositiveButton("OK", null)
                .show()
        }
    }
}
