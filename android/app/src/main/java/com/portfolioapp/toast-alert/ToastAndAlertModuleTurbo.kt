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
// UiThreadUtil: runs work on the UI thread (required for any UI like dialogs/toasts).
import com.facebook.react.bridge.UiThreadUtil
// @ReactModule: registers the module's JS name for the New Arch / TurboModule lookup.
import com.facebook.react.module.annotations.ReactModule

// NOTE: the codegen-generated base class `NativeToastAndAlertTurboSpec` lives in
// this same package (com.portfolioapp), so no import is needed. It is emitted
// from our TS spec and only resolves after codegen has run.

@ReactModule(name = ToastAndAlertModuleTurbo.NAME)
class ToastAndAlertModuleTurbo(
    reactContext: ReactApplicationContext
) : NativeToastAndAlertTurboSpec(reactContext) {

    override fun getName(): String = NAME

    override fun showAlert(name: String) {
        UiThreadUtil.runOnUiThread {
            val activity = reactApplicationContext.currentActivity ?: return@runOnUiThread

            val alertMessage = "Welcome, $name to the portfolio app."

            val dialog = AlertDialog.Builder(activity)
                .setTitle("Alert")
                .setMessage(alertMessage)
                .setPositiveButton("OK", null)
                .create()

            dialog.show()

            // Light, semi-transparent scrim to match BlankScreenModal
            // (rgba(0,0,0,0.25)). 1.0 = fully black, 0.0 = no dim.
            dialog.window?.setDimAmount(0.25f)
        }
    }

    override fun showToast(name: String): String {
        val message = "Hello, $name from the portfolio app."
        UiThreadUtil.runOnUiThread {
            Toast.makeText(reactApplicationContext, message, Toast.LENGTH_SHORT).show()
        }
        return message
    }

    companion object {
        const val NAME = "ToastAndAlertModuleTurbo"
    }
}