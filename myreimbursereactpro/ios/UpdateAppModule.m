//
//  UpdateAppModule.m
//  myreimbursereactpro
//
//  Created by 蔡晓伟 on 18/1/24.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "UpdateAppModule.h"

@implementation UpdateAppModule
@synthesize bridge = _bridge;

RCT_EXPORT_MODULE(UpdateAppModule)

//打分
RCT_EXPORT_METHOD(check:(NSString *) newVersion callback:(RCTResponseSenderBlock)callback)
{
  
  newVersion=[newVersion stringByReplacingOccurrencesOfString:@"V"withString:@""];
  newVersion=[newVersion stringByReplacingOccurrencesOfString:@"v"withString:@""];
  newVersion=[newVersion stringByReplacingOccurrencesOfString:@"-"withString:@""];
  NSString * versionStr = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];
  NSString *result = @"0";
  if(![versionStr isEqualToString:newVersion]){
    result = @"1";
  }
  
  NSMutableArray *retArr = [[NSMutableArray alloc] init];
  [retArr addObject:result];
  callback(retArr);
}

//打分
RCT_EXPORT_METHOD(gotoAppstore)
{
  NSString *appleID = @"1339533185";
  NSString *url = [NSString stringWithFormat:@"itms-apps://itunes.apple.com/app/id%@",appleID];
  [[UIApplication sharedApplication]openURL:[NSURL URLWithString:url]];
}


@end
