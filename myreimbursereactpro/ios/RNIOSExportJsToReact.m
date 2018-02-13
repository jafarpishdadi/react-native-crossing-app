//
//  RNIOSExportJsToReact.m
//  myinvoiceappro
//
//  Created by 蔡晓伟 on 17/8/16.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import "RNIOSExportJsToReact.h"

@implementation RNIOSExportJsToReact

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents {
  return @[@"BPush_Resp"]; //这里返回的将是你要发送的消息名的数组。
}
- (void)startObserving
{
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(emitEventInternal:)
                                               name:@"event-emitted"
                                             object:nil];
}
- (void)stopObserving
{
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)emitEventInternal:(NSNotification *)notification
{
  [self sendEventWithName:@"BPush_Resp"
                     body:notification.object];
}

+ (void)emitEventWithName:(NSString *)name andPayload:(NSDictionary *)payload
{
  [[NSNotificationCenter defaultCenter] postNotificationName:@"event-emitted"
                                                      object:self
                                                    userInfo:payload];
}

@end
