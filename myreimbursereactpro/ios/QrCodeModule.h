//
//  QrCodeModule.h
//  myreimbursereactpro
//
//  Created by 蔡晓伟 on 17/11/13.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <React/RCTBridgeModule.h>

@interface QrCodeModule : NSObject<RCTBridgeModule,UIImagePickerControllerDelegate,UINavigationControllerDelegate>

@end
