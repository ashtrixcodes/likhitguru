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
        // Multi-suite fallback sequence
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

// ─── Entry View ──────────────────────────────────────────────────────
struct ExamWidgetEntryView : View {
    var entry: ExamWidgetProvider.Entry

    private var daysRemaining: Int {
        guard let record = entry.record,
              let targetTs = record.targetAdTimestamp else { return 0 }
        let nowMs = Date().timeIntervalSince1970 * 1000
        let diffMs = targetTs - nowMs
        let days = Int(ceil(diffMs / (1000 * 60 * 60 * 24)))
        return days >= 0 ? days : 0
    }

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
        let content = Group {
            if let record = entry.record {
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Image(systemName: "car.fill")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(Color(red: 0.98, green: 0.42, blue: 0.21))
                        Text("Lekhit Guru")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.white.opacity(0.8))
                        Spacer()
                    }

                    Text(record.typeNp ?? record.typeEn ?? "परीक्षा काउन्टडाउन")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(Color(red: 0.58, green: 0.77, blue: 0.99))
                        .lineLimit(1)

                    Spacer()

                    HStack(alignment: .lastTextBaseline, spacing: 4) {
                        Text(toNepaliDigits(daysRemaining))
                            .font(.system(size: 34, weight: .black, design: .rounded))
                            .foregroundColor(.white)
                        Text("दिन बाँकी")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(Color(red: 0.98, green: 0.42, blue: 0.21))
                    }

                    Text(record.bsDateStrNp ?? record.bsDateStrEn ?? "")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.white.opacity(0.6))
                        .lineLimit(1)
                }
                .padding(16)
            } else {
                VStack(spacing: 8) {
                    Image(systemName: "calendar.badge.clock")
                        .font(.system(size: 28))
                        .foregroundColor(Color(red: 0.98, green: 0.42, blue: 0.21))
                    Text("परीक्षा मिति तय छैन")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(.white)
                    Text("पात्रोमा मिति तय गर्नुहोस्")
                        .font(.system(size: 10))
                        .foregroundColor(.white.opacity(0.6))
                }
                .padding()
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
        .configurationDisplayName("Lekhit Guru Exam Countdown")
        .description("Driving License Exam Countdown Widget.")
        .supportedFamilies([.systemSmall, .systemMedium])
        .disableContentMarginsIfNeeded()
    }
}
