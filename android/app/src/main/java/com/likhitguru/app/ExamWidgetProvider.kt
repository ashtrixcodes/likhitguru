package com.likhitguru.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.widget.RemoteViews
import org.json.JSONObject
import java.util.Calendar
import java.util.TimeZone
import kotlin.math.ceil

data class BSDate(
    val year: Int,
    val month: Int,
    val day: Int,
    val dayOfWeek: Int, // 0 = Sunday, 6 = Saturday
    val monthNameNp: String,
    val daysInMonth: Int
)

object NepaliCalendarEngine {
    private val bsMonthDays = mapOf(
        2080 to intArrayOf(31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30),
        2081 to intArrayOf(31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31),
        2082 to intArrayOf(31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 30),
        2083 to intArrayOf(31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30),
        2084 to intArrayOf(31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30),
        2085 to intArrayOf(31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30),
        2086 to intArrayOf(31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31),
        2087 to intArrayOf(31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 30),
        2088 to intArrayOf(31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30),
        2089 to intArrayOf(31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30),
        2090 to intArrayOf(31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30)
    )

    private val monthNamesNp = arrayOf("वैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज", "कात्तिक", "मंसिर", "पुस", "माघ", "फागुन", "चैत")

    private fun getDaysInMonth(year: Int, month: Int): Int {
        val yearDays = bsMonthDays[year] ?: intArrayOf(31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 30)
        return yearDays[month - 1]
    }

    fun convertADtoBS(dateMs: Long = System.currentTimeMillis()): BSDate {
        val calendar = Calendar.getInstance(TimeZone.getTimeZone("Asia/Kathmandu"))
        calendar.timeInMillis = dateMs

        val refCal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Kathmandu"))
        refCal.set(2023, 3, 14, 0, 0, 0) // 2023-04-14

        val diffTime = calendar.timeInMillis - refCal.timeInMillis
        var diffDays = (diffTime / (1000 * 60 * 60 * 24)).toInt()

        var bsYear = 2080
        var bsMonth = 1
        var bsDay = 1

        if (diffDays >= 0) {
            while (diffDays > 0) {
                val dim = getDaysInMonth(bsYear, bsMonth)
                if (diffDays >= dim - (bsDay - 1)) {
                    diffDays -= dim - (bsDay - 1)
                    bsDay = 1
                    bsMonth += 1
                    if (bsMonth > 12) {
                        bsMonth = 1
                        bsYear += 1
                    }
                } else {
                    bsDay += diffDays
                    diffDays = 0
                }
            }
        }

        // 2023-04-14 AD was Friday (5 where 0=Sun)
        val rawDays = (diffTime / (1000 * 60 * 60 * 24)).toInt()
        val dayOfWeek = (5 + rawDays) % 7
        val finalDayOfWeek = if (dayOfWeek < 0) (dayOfWeek + 7) % 7 else dayOfWeek

        return BSDate(
            year = bsYear,
            month = bsMonth,
            day = bsDay,
            dayOfWeek = finalDayOfWeek,
            monthNameNp = monthNamesNp[bsMonth - 1],
            daysInMonth = getDaysInMonth(bsYear, bsMonth)
        )
    }

    fun firstWeekdayOfMonth(bsDate: BSDate): Int {
        val dayOffset = (bsDate.day - 1) % 7
        var startDay = (bsDate.dayOfWeek - dayOffset) % 7
        if (startDay < 0) startDay += 7
        return startDay
    }
}

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

            // Populate Mini Nepali Calendar
            populateMiniCalendar(context, views)

            // Click to open main app
            val intent = Intent(context, MainActivity::class.java)
            val pendingIntent = PendingIntent.getActivity(
                context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_exam_type, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun populateMiniCalendar(context: Context, views: RemoteViews) {
            val bsDate = NepaliCalendarEngine.convertADtoBS()
            val startWeekday = NepaliCalendarEngine.firstWeekdayOfMonth(bsDate)

            // Header title (e.g. साउन, २०८३)
            val headerText = "${bsDate.monthNameNp}, ${toNepaliDigits(bsDate.year)}"
            views.setTextViewText(R.id.widget_calendar_title, headerText)

            val cellIds = intArrayOf(
                R.id.cell_0, R.id.cell_1, R.id.cell_2, R.id.cell_3, R.id.cell_4, R.id.cell_5, R.id.cell_6,
                R.id.cell_7, R.id.cell_8, R.id.cell_9, R.id.cell_10, R.id.cell_11, R.id.cell_12, R.id.cell_13,
                R.id.cell_14, R.id.cell_15, R.id.cell_16, R.id.cell_17, R.id.cell_18, R.id.cell_19, R.id.cell_20,
                R.id.cell_21, R.id.cell_22, R.id.cell_23, R.id.cell_24, R.id.cell_25, R.id.cell_26, R.id.cell_27,
                R.id.cell_28, R.id.cell_29, R.id.cell_30, R.id.cell_31, R.id.cell_32, R.id.cell_33, R.id.cell_34
            )

            for (i in cellIds.indices) {
                val resId = cellIds[i]
                val dayNum = i - startWeekday + 1
                val isCurrentDay = dayNum == bsDate.day
                val isSaturday = i % 7 == 6

                if (dayNum in 1..bsDate.daysInMonth) {
                    views.setTextViewText(resId, toNepaliDigits(dayNum))
                    if (isCurrentDay) {
                        views.setTextColor(resId, Color.BLACK)
                        views.setInt(resId, "setBackgroundResource", R.drawable.calendar_today_bg)
                    } else if (isSaturday) {
                        views.setTextColor(resId, Color.parseColor("#FF6B6B"))
                        views.setInt(resId, "setBackgroundResource", 0)
                    } else {
                        views.setTextColor(resId, Color.parseColor("#E2E8F0"))
                        views.setInt(resId, "setBackgroundResource", 0)
                    }
                } else {
                    views.setTextViewText(resId, "")
                    views.setInt(resId, "setBackgroundResource", 0)
                }
            }
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
