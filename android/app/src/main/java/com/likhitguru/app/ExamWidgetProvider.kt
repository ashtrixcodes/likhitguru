package com.likhitguru.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import org.json.JSONObject
import kotlin.math.ceil

class ExamWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val views = RemoteViews(context.packageName, R.layout.exam_widget_layout)

            val prefs = context.getSharedPreferences("group.com.likhitguru.app", Context.MODE_PRIVATE)
            val jsonString = prefs.getString("lekhitguru_exam_record", null)

            if (!jsonString.isNullOrEmpty()) {
                try {
                    val jsonObj = JSONObject(jsonString)
                    val typeNp = jsonObj.optString("typeNp", "परीक्षा")
                    val typeEn = jsonObj.optString("typeEn", "Exam")
                    val bsDateStrNp = jsonObj.optString("bsDateStrNp", "")
                    val bsDateStrEn = jsonObj.optString("bsDateStrEn", "")
                    val targetAdTimestamp = jsonObj.optDouble("targetAdTimestamp", 0.0)

                    val nowMs = System.currentTimeMillis().toDouble()
                    val diffMs = targetAdTimestamp - nowMs
                    val days = ceil(diffMs / (1000.0 * 60.0 * 60.0 * 24.0)).toInt()
                    val daysCount = if (days >= 0) days else 0

                    val titleText = if (typeNp.isNotEmpty()) typeNp else typeEn
                    val dateText = if (bsDateStrNp.isNotEmpty()) bsDateStrNp else bsDateStrEn

                    views.setTextViewText(R.id.widget_exam_type, titleText)
                    views.setTextViewText(R.id.widget_days_count, toNepaliDigits(daysCount))
                    views.setTextViewText(R.id.widget_date_str, dateText)

                } catch (e: Exception) {
                    views.setTextViewText(R.id.widget_exam_type, "परीक्षा मिति तय छैन")
                    views.setTextViewText(R.id.widget_days_count, "०")
                    views.setTextViewText(R.id.widget_date_str, "पात्रोमा मिति तय गर्नुहोस्")
                }
            } else {
                views.setTextViewText(R.id.widget_exam_type, "परीक्षा मिति तय छैन")
                views.setTextViewText(R.id.widget_days_count, "०")
                views.setTextViewText(R.id.widget_date_str, "पात्रोमा मिति तय गर्नुहोस्")
            }

            // Click to open main app
            val intent = Intent(context, MainActivity::class.java)
            val pendingIntent = PendingIntent.getActivity(
                context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_exam_type, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun toNepaliDigits(num: Int): String {
            val digits = arrayOf("०", "१", "२", "३", "४", "५", "६", "७", "८", "९")
            val str = num.toString()
            val sb = StringBuilder()
            for (ch in str) {
                if (ch.isDigit()) {
                    val d = ch.toString().toInt()
                    sb.append(digits[d])
                } else {
                    sb.append(ch)
                }
            }
            return sb.toString()
        }
    }
}
