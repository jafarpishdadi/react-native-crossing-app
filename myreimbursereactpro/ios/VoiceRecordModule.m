//
//  VoiceRecordModule.m
//  myreimbursereactpro
//
//  Created by 蔡晓伟 on 17/12/14.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import "VoiceRecordModule.h"
#import "WRBVoiceRecordManager.h"

@implementation VoiceRecordModule{
  WRBVoiceRecordManager *voiceRecordManager;
}

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE(VoiceRecordModule)

//开始录音
RCT_EXPORT_METHOD(start)
{
  voiceRecordManager = [[WRBVoiceRecordManager sharedInstance] init];
  [voiceRecordManager start];
}
//结束录音
RCT_EXPORT_METHOD(stop :(RCTResponseSenderBlock)callback)
{
  [voiceRecordManager stop];
  [voiceRecordManager recordFinishedBlock:^(NSString *auditPath) {
    NSData *data = [NSData dataWithContentsOfFile:auditPath];
    NSData *base64Data = [data base64EncodedDataWithOptions:0];
    NSString *recordData = @"";
    if(base64Data){
      recordData = [NSString stringWithUTF8String:[base64Data bytes]];
    }
    
    NSMutableDictionary *dic = [[NSMutableDictionary alloc] init];
    [dic setObject:recordData forKey:@"recordData"];
    NSMutableArray *retArr = [[NSMutableArray alloc] init];
    [retArr addObject:dic];
    callback(retArr);
  }];
}
//删除录音
RCT_EXPORT_METHOD(remove : (NSString *) path)
{
  [voiceRecordManager removeAudioData:path];
}

@end
