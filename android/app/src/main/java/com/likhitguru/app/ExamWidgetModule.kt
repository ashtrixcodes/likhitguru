package com.likhitguru.app

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ExamWidgetModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ExamWidgetModule"
    }

    @ReactMethod
    fun saveExamData(jsonString: String, promise: Promise) {
        try {
            val context = reactApplicationContext
            val prefs = context.getSharedPreferences("group.com.likhitguru.app", Context.MODE_PRIVATE)
            val editor = prefs.edit()
            editor.putString("lekhitguru_exam_record", jsonString)
            editor.apply()

            reloadWidgetsInternal(context)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_ANDROID_WIDGET", e.message, e)
        }
    }

    @ReactMethod
    fun reloadWidgets(promise: Promise) {
        try {
            reloadWidgetsInternal(reactApplicationContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_ANDROID_WIDGET", e.message, e)
        }
    }

    private fun reloadWidgetsInternal(context: Context) {
        val intent = Intent(context, ExamWidgetProvider::class.java).apply {
            action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
        }
        val widgetManager = AppWidgetManager.getInstance(context)
        val ids = widgetManager.getAppWidgetIds(ComponentName(context, ExamWidgetProvider::class.java))
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
        context.sendBroadcast(intent)

        for (id in ids) {
            ExamWidgetProvider.updateAppWidget(context, widgetManager, id)
        }
    }
}
