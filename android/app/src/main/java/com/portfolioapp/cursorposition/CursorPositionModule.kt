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
                val ctx = reactApplicationContext

                // Try Fabric first, fall back to Paper
                var rootView: View? = try {
                    UIManagerHelper.getUIManager(ctx, UIManagerType.FABRIC)
                        ?.resolveView(viewTag)
                } catch (e: Exception) {
                    null
                }

                if (rootView == null) {
                    rootView = try {
                        UIManagerHelper.getUIManager(ctx, UIManagerType.DEFAULT)
                            ?.resolveView(viewTag)
                    } catch (e: Exception) {
                        null
                    }
                }

                if (rootView == null) {
                    promise.reject("E_NO_VIEW", "No view found for tag $viewTag")
                    return@runOnUiThread
                }

                val editText = findEditText(rootView)
                if (editText == null) {
                    promise.reject("E_NO_EDIT_TEXT", "No EditText found in view tree")
                    return@runOnUiThread
                }

                val layout = editText.layout
                if (layout == null) {
                    promise.reject("E_NO_LAYOUT", "Layout not ready yet")
                    return@runOnUiThread
                }

                val safeOffset = charIndex.coerceIn(0, editText.text.length)
                val line = layout.getLineForOffset(safeOffset)
                val xPx = layout.getPrimaryHorizontal(safeOffset) + editText.totalPaddingLeft
                val topPx = (layout.getLineTop(line) + editText.totalPaddingTop).toFloat()
                val bottomPx = (layout.getLineBottom(line) + editText.totalPaddingTop).toFloat()

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