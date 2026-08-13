import WidgetKit
import SwiftUI

// ─── Data Structures ────────────────────────────────────────────────
struct ExamWidgetRecord: Codable {
    let typeNp: String?
    let typeEn: String?
    let bsDateStrNp: String?
    let bsDateStrEn: String?
    let targetAdTimestamp: Double?
}

struct ExamWidgetEntry: TimelineEntry {
    let date: Date
    let record: ExamWidgetRecord?
}

// ─── Nepali Calendar Engine (Swift) ──────────────────────────────────
struct BSDate {
    let year: Int
    let month: Int
    let day: Int
    let dayOfWeek: Int // 0 = Sunday, 6 = Saturday
    let monthNameNp: String
    let daysInMonth: Int
}

struct NepaliCalendarEngine {
    static let bsMonthDays: [Int: [Int]] = [
        2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
        2081: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
        2082: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 30],
        2083: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
        2084: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
        2085: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
        2086: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
        2087: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 30],
        2088: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
        2089: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
        2090: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30]
    ]

    static let monthNamesNp = ["वैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज", "कात्तिक", "मंसिर", "पुस", "माघ", "फागुन", "चैत"]
    static let shortDayNamesNp = ["आ", "सो", "मं", "बु", "बि", "शु", "श"]

    static func getDaysInMonth(year: Int, month: Int) -> Int {
        let yearDays = bsMonthDays[year] ?? [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 30]
        return yearDays[month - 1]
    }

    static func convertADtoBS(date: Date = Date()) -> BSDate {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "Asia/Kathmandu") ?? TimeZone.current

        let refAd = calendar.date(from: DateComponents(year: 2023, month: 4, day: 14))!
        let diffDays = calendar.dateComponents([.day], from: calendar.startOfDay(for: refAd), to: calendar.startOfDay(for: date)).day ?? 0

        var bsYear = 2080
        var bsMonth = 1
        var bsDay = 1
        var daysLeft = diffDays

        if daysLeft >= 0 {
            while daysLeft > 0 {
                let dim = getDaysInMonth(year: bsYear, month: bsMonth)
                if daysLeft >= dim - (bsDay - 1) {
                    daysLeft -= dim - (bsDay - 1)
                    bsDay = 1
                    bsMonth += 1
                    if bsMonth > 12 {
                        bsMonth = 1
                        bsYear += 1
                    }
                } else {
                    bsDay += daysLeft
                    daysLeft = 0
                }
            }
        }

        // Reference 2023-04-14 AD was Friday (5 in 0-based where 0=Sun)
        let dayOfWeek = (5 + diffDays) % 7
        let finalDayOfWeek = dayOfWeek < 0 ? (dayOfWeek + 7) % 7 : dayOfWeek

        return BSDate(
            year: bsYear,
            month: bsMonth,
            day: bsDay,
            dayOfWeek: finalDayOfWeek,
            monthNameNp: monthNamesNp[bsMonth - 1],
            daysInMonth: getDaysInMonth(year: bsYear, month: bsMonth)
        )
    }

    static func firstWeekdayOfMonth(bsDate: BSDate) -> Int {
        let dayOffset = (bsDate.day - 1) % 7
        var startDay = (bsDate.dayOfWeek - dayOffset) % 7
        if startDay < 0 { startDay += 7 }
        return startDay
    }

    static func toNepaliDigits(_ num: Int) -> String {
        let digits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"]
        let str = String(num)
        return str.compactMap { ch in
            if let d = Int(String(ch)) {
                return digits[d]
            }
            return String(ch)
        }.joined()
    }
}

// ─── Timeline Provider ──────────────────────────────────────────────
struct ExamWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> ExamWidgetEntry {
        ExamWidgetEntry(
            date: Date(),
            record: ExamWidgetRecord(
                typeNp: "लिखित परीक्षा",
                typeEn: "Written Exam",
                bsDateStrNp: "२०८३ साउन २५",
                bsDateStrEn: "Shrawan 25, 2083 BS",
                targetAdTimestamp: Date().timeIntervalSince1970 * 1000 + (12 * 86400 * 1000)
            )
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (ExamWidgetEntry) -> Void) {
        let entry = loadEntry()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ExamWidgetEntry>) -> Void) {
        let entry = loadEntry()
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date().addingTimeInterval(900)
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    private func loadEntry() -> ExamWidgetEntry {
        let suites = [
            "group.com.likhitguru.app",
            "group.com.likhitguru",
            "group.lekhitguru"
        ]

        var jsonString: String? = nil
        for suite in suites {
            if let defaults = UserDefaults(suiteName: suite),
               let str = defaults.string(forKey: "lekhitguru_exam_record"),
               !str.isEmpty {
                jsonString = str
                break
            }
        }

        if jsonString == nil {
            jsonString = UserDefaults.standard.string(forKey: "lekhitguru_exam_record")
        }

        guard let validJson = jsonString,
              !validJson.isEmpty,
              let data = validJson.data(using: .utf8),
              let record = try? JSONDecoder().decode(ExamWidgetRecord.self, from: data) else {
            return ExamWidgetEntry(date: Date(), record: nil)
        }

        return ExamWidgetEntry(date: Date(), record: record)
    }
}

// ─── Mini Nepali Calendar SwiftUI View ────────────────────────────────
struct MiniNepaliCalendarView: View {
    let bsDate: BSDate
    let firstWeekday: Int

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 1), count: 7)

    var body: some View {
        VStack(spacing: 3) {
            // Month & Year Header
            HStack {
                Text("\(bsDate.monthNameNp), \(NepaliCalendarEngine.toNepaliDigits(bsDate.year))")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(Color(red: 0.36, green: 0.90, blue: 0.58))
                Spacer()
            }
            .padding(.bottom, 1)

            // Weekday Headers
            LazyVGrid(columns: columns, spacing: 1) {
                ForEach(0..<7, id: \.self) { idx in
                    Text(NepaliCalendarEngine.shortDayNamesNp[idx])
                        .font(.system(size: 8, weight: .bold))
                        .foregroundColor(idx == 6 ? Color(red: 0.95, green: 0.35, blue: 0.35) : Color.white.opacity(0.6))
                }
            }

            // Days Grid
            let totalCells = firstWeekday + bsDate.daysInMonth
            let rows = Int(ceil(Double(totalCells) / 7.0))

            LazyVGrid(columns: columns, spacing: 2) {
                ForEach(0..<(rows * 7), id: \.self) { index in
                    let dayNum = index - firstWeekday + 1
                    let isCurrentDay = dayNum == bsDate.day
                    let isSaturday = index % 7 == 6

                    if dayNum >= 1 && dayNum <= bsDate.daysInMonth {
                        Text(NepaliCalendarEngine.toNepaliDigits(dayNum))
                            .font(.system(size: 8, weight: isCurrentDay ? .black : .semibold))
                            .foregroundColor(isCurrentDay ? .black : (isSaturday ? Color(red: 0.95, green: 0.35, blue: 0.35) : .white.opacity(0.9)))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 1.5)
                            .background(
                                Group {
                                    if isCurrentDay {
                                        RoundedRectangle(cornerRadius: 3)
                                            .fill(Color(red: 0.36, green: 0.90, blue: 0.58))
                                    }
                                }
                            )
                    } else {
                        Text("")
                            .font(.system(size: 8))
                            .frame(maxWidth: .infinity)
                    }
                }
            }
        }
        .padding(8)
        .background(Color.white.opacity(0.06))
        .cornerRadius(10)
    }
}

// ─── Countdown Card View ─────────────────────────────────────────────
struct CountdownCardView: View {
    let record: ExamWidgetRecord?
    let daysRemaining: Int

    private func toNepaliDigits(_ num: Int) -> String {
        let digits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"]
        let str = String(num)
        return str.compactMap { ch in
            if let d = Int(String(ch)) {
                return digits[d]
            }
            return String(ch)
        }.joined()
    }

    var body: some View {
        if let record = record {
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Image(systemName: "car.fill")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(Color(red: 0.98, green: 0.42, blue: 0.21))
                    Text("Lekhit Guru")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.white.opacity(0.8))
                    Spacer()
                }

                Text(record.typeNp ?? record.typeEn ?? "परीक्षा काउन्टडाउन")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(Color(red: 0.58, green: 0.77, blue: 0.99))
                    .lineLimit(1)

                Spacer()

                HStack(alignment: .lastTextBaseline, spacing: 3) {
                    Text(toNepaliDigits(daysRemaining))
                        .font(.system(size: 30, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                    Text("दिन बाँकी")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(Color(red: 0.98, green: 0.42, blue: 0.21))
                }

                Text(record.bsDateStrNp ?? record.bsDateStrEn ?? "")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.white.opacity(0.6))
                    .lineLimit(1)
            }
        } else {
            VStack(spacing: 6) {
                Image(systemName: "calendar.badge.clock")
                    .font(.system(size: 24))
                    .foregroundColor(Color(red: 0.98, green: 0.42, blue: 0.21))
                Text("परीक्षा मिति तय छैन")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white)
                Text("पात्रोमा मिति तय गर्नुहोस्")
                    .font(.system(size: 9))
                    .foregroundColor(.white.opacity(0.6))
            }
        }
    }
}

// ─── Entry View ──────────────────────────────────────────────────────
struct ExamWidgetEntryView : View {
    @Environment(\.widgetFamily) var family
    var entry: ExamWidgetProvider.Entry

    private var daysRemaining: Int {
        guard let record = entry.record,
              let targetTs = record.targetAdTimestamp else { return 0 }
        let nowMs = Date().timeIntervalSince1970 * 1000
        let diffMs = targetTs - nowMs
        let days = Int(ceil(diffMs / (1000 * 60 * 60 * 24)))
        return days >= 0 ? days : 0
    }

    var body: some View {
        let bsDate = NepaliCalendarEngine.convertADtoBS(date: entry.date)
        let firstWeekday = NepaliCalendarEngine.firstWeekdayOfMonth(bsDate: bsDate)

        let content = Group {
            switch family {
            case .systemMedium:
                HStack(spacing: 10) {
                    CountdownCardView(record: entry.record, daysRemaining: daysRemaining)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    MiniNepaliCalendarView(bsDate: bsDate, firstWeekday: firstWeekday)
                        .frame(maxWidth: .infinity)
                }
                .padding(12)

            default: // .systemSmall
                CountdownCardView(record: entry.record, daysRemaining: daysRemaining)
                    .padding(14)
            }
        }

        let bgGradient = LinearGradient(
            gradient: Gradient(colors: [Color(red: 0.12, green: 0.16, blue: 0.24), Color(red: 0.08, green: 0.10, blue: 0.15)]),
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )

        if #available(iOS 17.0, *) {
            content.containerBackground(bgGradient, for: .widget)
        } else {
            ZStack {
                bgGradient.edgesIgnoringSafeArea(.all)
                content
            }
        }
    }
}

// ─── Main Widget ─────────────────────────────────────────────────────
extension WidgetConfiguration {
    func disableContentMarginsIfNeeded() -> some WidgetConfiguration {
        if #available(iOS 17.0, *) {
            return self.contentMarginsDisabled()
        }
        return self
    }
}

@main
struct ExamWidget: Widget {
    let kind: String = "ExamWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ExamWidgetProvider()) { entry in
            ExamWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Lekhit Guru Exam & Calendar")
        .description("Driving License Exam Countdown and Mini Nepali Calendar Widget.")
        .supportedFamilies([.systemSmall, .systemMedium])
        .disableContentMarginsIfNeeded()
    }
}
