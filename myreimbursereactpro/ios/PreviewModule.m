//
//  PreviewImageModule.m
//
//  Created by 蔡晓伟 on 17/12/15.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import "PreviewModule.h"

@interface PreviewModule ()<NSURLSessionDelegate>

@end

@implementation PreviewModule{
  RCTResponseSenderBlock previewCallback;
  NSString* destPath;
}


@synthesize bridge = _bridge;

RCT_EXPORT_MODULE(PreviewModule)


RCT_EXPORT_METHOD(previewDocument:(NSString *)docPath token:(NSString *)token requestData:(NSString *)requestData filePath:(NSString *)filePath fileName:(NSString *)fileName callback:(RCTResponseSenderBlock)callback)
{
  previewCallback = callback;
  destPath = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) firstObject];
  
  if(![filePath isEqual: @""]){
    filePath = [filePath substringToIndex:filePath.length - 4];
    NSArray *pathArr = [filePath componentsSeparatedByString:@"/"];
    for(int i=1;i<pathArr.count;i++){
      destPath = [destPath stringByAppendingPathComponent:pathArr[i]];
    }
    [[NSFileManager defaultManager] createDirectoryAtPath:destPath withIntermediateDirectories:YES attributes:nil error:nil];
  }
  
  destPath = [destPath stringByAppendingPathComponent:[NSString stringWithFormat:@"%@",fileName]];
  
  NSFileManager *fileManager = [NSFileManager defaultManager];
  BOOL result = [fileManager fileExistsAtPath:destPath];
  if(result){
    NSMutableArray *retArr = [[NSMutableArray alloc] init];
    [retArr addObject:@""];
    callback(retArr);
    
    [self previewImage:destPath];
    return;
  }

  NSURL *url = [NSURL URLWithString:docPath];
  NSData *postData = [requestData dataUsingEncoding:NSUTF8StringEncoding allowLossyConversion:YES];
  NSMutableURLRequest *request = [[NSMutableURLRequest alloc] initWithURL:url];
  [request setHTTPMethod:@"POST"];
  [request setValue:token forHTTPHeaderField:@"token"];
  [request setHTTPBody:postData];
  [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
  [request setCachePolicy:NSURLRequestReloadIgnoringLocalCacheData];
  [request setHTTPShouldHandleCookies:NO];
  [request setTimeoutInterval:60];
  
  
  self.data = [[NSMutableData alloc] init];
  
  //创建管理类NSURLSessionConfiguration
  NSURLSessionConfiguration *config =[NSURLSessionConfiguration defaultSessionConfiguration];
  
  //初始化session并制定代理
  NSURLSession *session = [NSURLSession sessionWithConfiguration:config delegate:self delegateQueue:[NSOperationQueue mainQueue]];
  
  NSURLSessionDataTask *task = [session dataTaskWithRequest:request];
  
  // 开始
  [task resume];
 
  
}

//下载图片到本地
RCT_EXPORT_METHOD(previewImage:(NSString *)imagePathStr)
{
  _path = imagePathStr;
  if (_path) {
    self.previewController = [QLPreviewController new];
    self.previewController.dataSource = self;
    [self.previewController setDelegate:self];
    //跳转到打开world文档页面
    UIWindow *window = [[UIApplication sharedApplication].delegate window];
    dispatch_async(dispatch_get_main_queue(), ^{
      [window.rootViewController presentViewController:self.previewController animated:YES completion:nil];
    });
  }
}

#pragma QLPreViewDelegate
- (NSInteger) numberOfPreviewItemsInPreviewController: (QLPreviewController *) controller
{
  return 1;
}
- (id <QLPreviewItem>)previewController: (QLPreviewController *)controller previewItemAtIndex:(NSInteger)index
{
  return [NSURL fileURLWithPath:_path];
}

- (void)previewControllerDidDismiss:(QLPreviewController *)controller
{
//  if(![_path  isEqual: @""]){
//    NSFileManager * fileManager = [[NSFileManager alloc]init];
//    [fileManager removeItemAtPath:_path error:nil];
//  }
}


#pragma mark  ===== 接收到数据调用
- (void)URLSession:(NSURLSession *)session dataTask:(NSURLSessionDataTask *)dataTask
    didReceiveData:(NSData *)data{
  
  //将每次接受到的数据拼接起来
  [self.data appendData:data];
}


#pragma mark ====  下载用到的 代理方法
#pragma mark *下载完成调用
- (void)URLSession:(NSURLSession *)session task:(NSURLSessionTask *)task
didCompleteWithError:(nullable NSError *)error{
  
  NSLog(@"%@",[NSThread currentThread]);
  //将下载的二进制文件转成入文件
  NSFileManager *manager = [NSFileManager defaultManager];
  BOOL isDownLoad =  [manager createFileAtPath:destPath contents:self.data attributes:nil];
  NSMutableArray *returnArr =[[NSMutableArray alloc] init];
  if (isDownLoad) {
    NSMutableArray *retArr = [[NSMutableArray alloc] init];
    [retArr addObject:@""];
    previewCallback(retArr);

    [self previewImage:destPath];
  }else{
    NSMutableArray *retArr = [[NSMutableArray alloc] init];
    [retArr addObject:@""];
    previewCallback(retArr);
  }
}


@end
