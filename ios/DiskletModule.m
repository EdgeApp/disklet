#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_REMAP_MODULE(Disklet, DiskletModule, NSObject)

RCT_EXTERN_METHOD(delete:(NSString *)path
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)rejecT)

RCT_EXTERN_METHOD(getData:(NSString *)path
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getText:(NSString *)path
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(list:(NSString *)path
              resolver:(RCTPromiseResolveBlock)resolve
              rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setData:(NSString *)path
                     data:(NSString *)base64data
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setText:(NSString *)path
                     text:(NSString *)text
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

@end
