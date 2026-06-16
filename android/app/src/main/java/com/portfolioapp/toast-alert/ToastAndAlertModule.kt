// Needed to specify the package name at the top of the file
// (native Kotlin / Android requirement)
package com.portfolioapp

// --- Feature-specific (unique to THIS module) ---
// AlertDialog lives in android.app because a dialog is a window owned by an
// Activity (the app/UI framework layer) — it needs an Activity context to
// attach its window to.
import android.app.AlertDialog
// Toast lives in android.widget because it's just a small floating view, not a
// window — it's part of the widgets/views toolkit and only needs any Context.
import android.widget.Toast

// --- Common to (almost) every native module ---
// ReactApplicationContext: the RN context handed to the module's constructor.
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
// @ReactMethod: exports a method so it's callable from JS.
import com.facebook.react.bridge.ReactMethod
// UiThreadUtil: runs work on the UI thread (required for any UI like dialogs/toasts).
import com.facebook.react.bridge.UiThreadUtil

/**
 * Legacy (old architecture / bridge) native module.
 *
 * Mirrors the same functionality as [ToastAndAlertModuleTurbo]:
 * - showAlert(name): fire-and-forget native AlertDialog.
 * - showToast(name): String: shows a native Toast AND returns the greeting
 *   string directly. On the old architecture a synchronous return value is
 *   achieved with `isBlockingSynchronousMethod = true` (the bridge analogue of
 *   the TurboModule's JSI synchronous call).
 */
class ToastAndAlertModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "ToastAndAlertModule"

    @ReactMethod
    fun showAlert(name: String) {
        UiThreadUtil.runOnUiThread {
            val activity = reactApplicationContext.currentActivity ?: return@runOnUiThread

            val alertMessage = "Welcome, $name to the portfolio app."

            AlertDialog.Builder(activity)
                .setTitle("Alert")
                .setMessage(alertMessage)
                .setPositiveButton("OK", null)
                .show()
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun showToast(name: String): String {
        val message = "Hello, $name from the portfolio app."
        UiThreadUtil.runOnUiThread {
            Toast.makeText(reactApplicationContext, message, Toast.LENGTH_SHORT).show()
        }
        return message
    }
}
