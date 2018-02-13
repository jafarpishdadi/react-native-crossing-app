//
//  PreviewImageModule.h
//
//  Created by 蔡晓伟 on 17/12/15.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <React/RCTBridgeModule.h>
#import <QuickLook/QuickLook.h>

@interface PreviewModule : NSObject<RCTBridgeModule,UIWebViewDelegate,QLPreviewControllerDataSource,QLPreviewControllerDelegate>

//打开图片需要引入的视图控制器
@property(nonatomic,strong) QLPreviewController *previewController;

//保存本地的地址
@property (nonatomic ,copy) NSString *path;

@property (nonatomic,strong)NSMutableData *data;

@end
