//
//  MyDeviceInfoModule.m
//  myreimbursereactpro
//
//  Created by 蔡晓伟 on 17/11/20.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import "MyDeviceInfoModule.h"
#import "GSKeyChainDataManager.h"

@implementation MyDeviceInfoModule

RCT_EXPORT_MODULE(MyDeviceInfoModule)

//打开相册
RCT_EXPORT_METHOD(getLocalMacAddressFromIp:
                  (RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString *uuid =[GSKeyChainDataManager readUUID];
  if(uuid == NULL){
    NSError *error=[NSError errorWithDomain:@"未获取到uuid" code:101 userInfo:nil];
    reject(@"no_events", @"There were no events", error);
  }else{
    resolve(uuid);
  }
}

@end
