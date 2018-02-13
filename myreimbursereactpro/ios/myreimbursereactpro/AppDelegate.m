/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import "UMMobClick/MobClick.h"
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import "GSKeyChainDataManager.h"
#import "BPush.h"
#import "RNIOSExportJsToReact.h"

#ifdef NSFoundationVersionNumber_iOS_9_x_Max
#import <UserNotifications/UserNotifications.h>
#endif

#define BPUSH_KEY @"zZuFv3DyFkWlnbik7xTqWoQ0"

#define UMENG_APPKEY @"5a7d565e8f4a9d38fc00007e"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSString *version = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];
  [MobClick setAppVersion:version];
  UMConfigInstance.appKey = UMENG_APPKEY;
  UMConfigInstance.channelId = @"App Store";
  [MobClick startWithConfigure:UMConfigInstance];//配置以上参数后调用此方法初始化SDK！
  NSString *uuid =[GSKeyChainDataManager readUUID];
  if(uuid == NULL){
    NSString *deviceUUID = [[UIDevice currentDevice].identifierForVendor UUIDString];
    [GSKeyChainDataManager saveUUID:deviceUUID];
  }
  
  NSURL *jsCodeLocation;
  //loki
//  jsCodeLocation = [NSURL URLWithString:@"http://10.10.3.17:8081/index.bundle?platform=ios&dev=true&minify=false"];
  //sky
//  jsCodeLocation = [NSURL URLWithString:@"http://10.10.3.79:8081/index.bundle?platform=ios&dev=true&minify=false"];
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"myreimbursereactpro"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  // iOS10 下需要使用新的 API
  if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 10.0) {
#ifdef NSFoundationVersionNumber_iOS_9_x_Max
    UNUserNotificationCenter* center = [UNUserNotificationCenter currentNotificationCenter];
    
    [center requestAuthorizationWithOptions:(UNAuthorizationOptionAlert + UNAuthorizationOptionSound + UNAuthorizationOptionBadge)
                          completionHandler:^(BOOL granted, NSError * _Nullable error) {
                            // Enable or disable features based on authorization.
                            if (granted) {
                              [application registerForRemoteNotifications];
                            }
                          }];
#endif
  }
  else if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 8.0) {
    UIUserNotificationType myTypes = UIUserNotificationTypeBadge | UIUserNotificationTypeSound | UIUserNotificationTypeAlert;
    
    UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:myTypes categories:nil];
    [[UIApplication sharedApplication] registerUserNotificationSettings:settings];
  }else {
    UIRemoteNotificationType myTypes = UIRemoteNotificationTypeBadge|UIRemoteNotificationTypeAlert|UIRemoteNotificationTypeSound;
    [[UIApplication sharedApplication] registerForRemoteNotificationTypes:myTypes];
  }
  
  
  //开发模式
    [BPush registerChannel:launchOptions apiKey:BPUSH_KEY pushMode:BPushModeDevelopment withFirstAction:@"打开" withSecondAction:@"关闭" withCategory:nil useBehaviorTextInput:YES isDebug:YES];
  
  //生产模式
//  [BPush registerChannel:launchOptions apiKey:BPUSH_KEY pushMode:BPushModeProduction withFirstAction:@"打开" withSecondAction:@"关闭" withCategory:nil useBehaviorTextInput:YES isDebug:NO];
  
  
  // 禁用地理位置推送 需要再绑定接口前调用。
  
  [BPush disableLbs];
  
  // App 是用户点击推送消息启动
  NSDictionary *userInfo = [launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
  if (userInfo) {
    [BPush handleNotification:userInfo];
    
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    [userDefaults setObject:userInfo forKey:@"BPushInfo"];
    [userDefaults synchronize];
    
  }
#if TARGET_IPHONE_SIMULATOR
  Byte dt[32] = {0xc6, 0x1e, 0x5a, 0x13, 0x2d, 0x04, 0x83, 0x82, 0x12, 0x4c, 0x26, 0xcd, 0x0c, 0x16, 0xf6, 0x7c, 0x74, 0x78, 0xb3, 0x5f, 0x6b, 0x37, 0x0a, 0x42, 0x4f, 0xe7, 0x97, 0xdc, 0x9f, 0x3a, 0x54, 0x10};
  [self application:application didRegisterForRemoteNotificationsWithDeviceToken:[NSData dataWithBytes:dt length:32]];
#endif
  
  return YES;
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken

{
  
  NSLog(@"test:%@",deviceToken);
  
  [BPush registerDeviceToken:deviceToken];
  
  [BPush bindChannelWithCompleteHandler:^(id result,NSError *error) {
    
    //需要在绑定成功后进行 settag listtag deletetag unbind操作否则会失败
    
    if (result) {
      NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
      [userDefaults setObject:result forKey:@"BPushUserInfo"];
      [userDefaults synchronize];
      
      [BPush setTag:@"myReimbursement" withCompleteHandler:^(id result,NSError *error) {
        
        if (result) {
          
          NSLog(@"设置tag成功");
          
        }
        
      }];
      
    }
    
  }];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo

{
  
  // App收到推送的通知
  
  [BPush handleNotification:userInfo];
  
  //存储推送数据
  //  NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
  //  [userDefaults setObject:userInfo forKey:@"BPushInfo"];
  //  [userDefaults synchronize];
  //
  NSLog(@"********** ios7.0之前 **********");
  
  //应用在前台或者后台开启状态下，不跳转页面，让用户选择。
  
  if (application.applicationState ==UIApplicationStateActive || application.applicationState ==UIApplicationStateBackground) {
    
    NSLog(@"acitve or background");
    
    //    UIAlertView *alertView =[[UIAlertView alloc]initWithTitle:@"收到一条消息"message:userInfo[@"aps"][@"alert"]delegate:self cancelButtonTitle:@"取消"otherButtonTitles:@"确定",nil];
    //
    //    [alertView show];
    //    推送数据给前台
    RNIOSExportJsToReact(userInfo);
    
  }
  
  // 后台开启状态下，杀死情况下 直接跳转到页面
  if (application.applicationState == UIApplicationStateInactive) {
    
    //可以指定去相应的页面,推送数据给前台
    RNIOSExportJsToReact(userInfo);
  }
  
  NSLog(@"%@",userInfo);
  
}


@end
