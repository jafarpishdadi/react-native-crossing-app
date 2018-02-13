//
//  RNBridgeModule.m
//  myreimbursereactpro
//
//  Created by 蔡晓伟 on 18/1/26.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "RNBridgeModule.h"

@implementation RNBridgeModule
@synthesize bridge = _bridge;

RCT_EXPORT_MODULE(RNBridgeModule)


//打电话
RCT_EXPORT_METHOD(call:(NSString *)phone)
{
  NSMutableString* str=[[NSMutableString alloc] initWithFormat:@"telprompt://%@",phone];
  [[UIApplication sharedApplication] openURL:[NSURL URLWithString:str]];
}

//打电话
RCT_EXPORT_METHOD(updateBadge:(int)badge)
{
  //设置角标数
  [[UIApplication sharedApplication] setApplicationIconBadgeNumber:badge];
}

@end
