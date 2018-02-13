//
//  dEarRecordManager.h
//  dEarVoiceRecord
//
//  Created by 王茹冰 on 15/12/10.
//  Copyright © 2015年 王茹冰. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface WRBVoiceRecordManager : NSObject

+(instancetype)sharedInstance;
/** 开始录音 */
-(void)start;
/** 结束录音 */
-(void)stop;
/** 更新音频波浪线幅度 */
-(void)updateSiriWaveViewBlock:(void (^)(CGFloat power, CGFloat normalizedValue))siriWaveViewBlock;
/** 录音完成 */
- (void)recordFinishedBlock:(void (^)(NSString *audioPath))recordFinishedBlock;

- (void)noiseCheckFinishBlock:(void(^)(NSData *noiseData))noiseCheckFinishBlock;

/** 删除录音 */
-(void)removeAudioData:(NSString *) path;

@end
