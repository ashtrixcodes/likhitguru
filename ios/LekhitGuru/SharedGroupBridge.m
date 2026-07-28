#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(SharedGroupBridge, NSObject)

RCT_EXTERN_METHOD(saveExamData:(NSString *)jsonString
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(reloadWidgets:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
