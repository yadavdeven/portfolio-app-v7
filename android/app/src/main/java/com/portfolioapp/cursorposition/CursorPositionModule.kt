package com.portfolioapp.cursorposition

import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.common.UIManagerType

class CursorPositionModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "CursorPositionModule"

    @ReactMethod
    fun getCaretRect(viewTag: Int, charIndex: Int, promise: Promise) {
        UiThreadUtil.runOnUiThread {
            try {
                val editText = resolveEditText(viewTag)
                if (editText == null) {
                    promise.reject(
                        "E_NO_EDIT_TEXT",
                        "No EditText found (tag=$viewTag, no focused EditText)",
                    )
                    return@runOnUiThread
                }

                val layout = editText.layout
                if (layout == null) {
                    promise.reject("E_NO_LAYOUT", "Layout not ready yet")
                    return@runOnUiThread
                }

                val safeOffset = charIndex.coerceIn(0, editText.text.length)
                val line = layout.getLineForOffset(safeOffset)
                // Subtract scrollX/scrollY so the rect is relative to the visible
                // EditText viewport (matches the RN view's coordinate space), not
                // the full scrollable text content.
                val xPx = layout.getPrimaryHorizontal(safeOffset) +
                    editText.totalPaddingLeft - editText.scrollX
                val topPx = (layout.getLineTop(line) + editText.totalPaddingTop -
                    editText.scrollY).toFloat()
                val bottomPx = (layout.getLineBottom(line) + editText.totalPaddingTop -
                    editText.scrollY).toFloat()

                val result = Arguments.createMap().apply {
                    putDouble("x", PixelUtil.toDIPFromPixel(xPx).toDouble())
                    putDouble("y", PixelUtil.toDIPFromPixel(topPx).toDouble())
                    putDouble("width", PixelUtil.toDIPFromPixel(2f).toDouble())
                    putDouble("height", PixelUtil.toDIPFromPixel(bottomPx - topPx).toDouble())
                }
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("E_CURSOR", e.message ?: "Unknown error", e)
            }
        }
    }

    /**
     * Resolves the target EditText. View-tag resolution via the UIManager is
     * unreliable in bridgeless/Fabric, so we primarily rely on the currently
     * focused view (which IS the editor while the user is typing), and fall
     * back to walking the view tree resolved from the RN tag.
     */
    private fun resolveEditText(viewTag: Int): EditText? {
        // 1. Currently focused view — the editor the caret lives in.
        val ctx = reactApplicationContext
        val focused = ctx.currentActivity?.currentFocus
        if (focused is EditText) return focused

        // 2. Fall back to resolving the RN view by tag (Fabric, then Paper).
        val rootView: View? =
            resolveViewByTag(ctx, viewTag, UIManagerType.FABRIC)
                ?: resolveViewByTag(ctx, viewTag, UIManagerType.DEFAULT)
        return rootView?.let { findEditText(it) }
    }

    private fun resolveViewByTag(
        ctx: ReactApplicationContext,
        viewTag: Int,
        type: Int,
    ): View? = try {
        UIManagerHelper.getUIManager(ctx, type)?.resolveView(viewTag)
    } catch (e: Exception) {
        null
    }

    private fun findEditText(view: View): EditText? {
        if (view is EditText) return view
        if (view is ViewGroup) {
            for (i in 0 until view.childCount) {
                val found = findEditText(view.getChildAt(i))
                if (found != null) return found
            }
        }
        return null
    }
}