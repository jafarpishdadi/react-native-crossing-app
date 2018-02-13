//
//  RNIOSExportJsToReact.h
//  myinvoiceappro
//
//  Created by 蔡晓伟 on 17/8/16.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>

#define RNIOSExportJsToReact(noti) [[NSNotificationCenter defaultCenter] postNotificationName:@"event-emitted" object:noti];

@interface RNIOSExportJsToReact : RCTEventEmitter<RCTBridgeModule>
@end
