import Foundation
import WidgetKit

@objc(SharedGroupBridge)
class SharedGroupBridge: NSObject {

  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc
  func saveExamData(_ jsonString: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    // Write to App Group suite
    if let defaults = UserDefaults(suiteName: "group.com.likhitguru.app") {
      defaults.set(jsonString, forKey: "lekhitguru_exam_record")
      defaults.synchronize()
    }

    // Also write to standard defaults as fallback
    UserDefaults.standard.set(jsonString, forKey: "lekhitguru_exam_record")
    UserDefaults.standard.synchronize()

    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    }

    resolve(true)
  }

  @objc
  func reloadWidgets(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    }
    resolve(true)
  }
}
