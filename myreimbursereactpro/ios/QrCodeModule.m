//
//  QrCodeModule.m
//  myreimbursereactpro
//
//  Created by 蔡晓伟 on 17/11/13.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import "QrCodeModule.h"
#import "ZSDcode.h"
#import <Photos/Photos.h>

@implementation QrCodeModule{
  RCTResponseSenderBlock qrCodeCallback;
}


RCT_EXPORT_MODULE(QrCodeModule)

//打开相册
RCT_EXPORT_METHOD(scanCameraRoll:(RCTResponseSenderBlock)callback)
{
  qrCodeCallback = callback;
  [self openLocalPhoto];
}

#pragma mark --打开相册并识别图片

/*!
 *  打开本地照片，选择图片识别
 */
- (void)openLocalPhoto
{
  dispatch_async(dispatch_get_main_queue(), ^{

      UIImagePickerController *picker = [[UIImagePickerController alloc] init];
      
      picker.sourceType = UIImagePickerControllerSourceTypePhotoLibrary;
      
      picker.delegate = self;
      
      UIWindow *window = [[UIApplication sharedApplication].delegate window];
      
      [window.rootViewController presentViewController:picker animated:YES completion:nil];

  });
}

//当选择一张图片后进入这里

-(void)imagePickerController:(UIImagePickerController*)picker didFinishPickingMediaWithInfo:(NSDictionary *)info
{
  
  dispatch_async(dispatch_get_main_queue(), ^{
    [picker dismissViewControllerAnimated:YES completion:nil];
    UIImage *image1 =[info valueForKey:UIImagePickerControllerOriginalImage];
    UIImage* image = [info objectForKey:UIImagePickerControllerEditedImage];
    
    if (!image){
      image = [info objectForKey:UIImagePickerControllerOriginalImage];
    }
    image = [self comPressImage:image];        //返回的UIImage
    
    int a = Initialize2();
    NSString *result = @"";
    if(!a){
      RAW_DATA raw_data;
      DECODE_DATA dres[1];
      
      UIImage* grayImage = [self getGrayImage:image];
      raw_data.dataFormat = IMAGE_RGBA8;
      raw_data.width = grayImage.size.width;
      raw_data.height = grayImage.size.height;
      raw_data.pBuffer = [self convertUIImageToBitmapRGBA8:grayImage];
      int res = DecodeRawData(&raw_data,dres, 1, 0);
      
      if(res == ZSDCODE_DECODE_DONE){
        if(dres[0].decodeResID == RESID_SUCCESS && dres[0].nBytesInData > 0){
          for(int i=0;i<dres[0].nBytesInData;i++){
            result = [NSString stringWithFormat:@"%@%c",result, dres[0].decodeData[i]];
          }
        }
      }
    }
    
    Deinitialize();
    
    [self callCallBack:result];
    
  });
  
}

-(UIImage*)getGrayImage:(UIImage*)sourceImage

{
  
  int width = sourceImage.size.width;
  
  int height = sourceImage.size.height;
  
  CGColorSpaceRef colorSpace =CGColorSpaceCreateDeviceGray();
  
  CGContextRef context =CGBitmapContextCreate(nil,width,height,8,0,colorSpace,kCGImageAlphaNone);
  
  CGColorSpaceRelease(colorSpace);
  
  
  
  if(context== NULL){
    
    return nil;
    
  }
  
  CGContextDrawImage(context,CGRectMake(0,0, width, height), sourceImage.CGImage);
  
  CGImageRef grayImageRef =CGBitmapContextCreateImage(context);
  
  UIImage*grayImage=[UIImage imageWithCGImage:grayImageRef];
  
  CGContextRelease(context);
  
  CGImageRelease(grayImageRef);
  
  
  
  return grayImage;
  
}

- (CGContextRef) newBitmapRGBA8ContextFromImage:(CGImageRef) image {
  CGContextRef context = NULL;
  CGColorSpaceRef colorSpace;
  uint32_t *bitmapData;
  
  size_t bitsPerPixel = 32;
  size_t bitsPerComponent = 8;
  size_t bytesPerPixel = bitsPerPixel / bitsPerComponent;
  
  size_t width = CGImageGetWidth(image);
  size_t height = CGImageGetHeight(image);
  
  size_t bytesPerRow = width * bytesPerPixel;
  size_t bufferLength = bytesPerRow * height;
  
  colorSpace = CGColorSpaceCreateDeviceRGB();
  
  if(!colorSpace) {
    NSLog(@"Error allocating color space RGB\n");
    return NULL;
  }
  
  // Allocate memory for image data
  bitmapData = (uint32_t *)malloc(bufferLength);
  
  if(!bitmapData) {
    NSLog(@"Error allocating memory for bitmap\n");
    CGColorSpaceRelease(colorSpace);
    return NULL;
  }
  
  //Create bitmap context
  
  context = CGBitmapContextCreate(bitmapData,
                                  width,
                                  height,
                                  bitsPerComponent,
                                  bytesPerRow,
                                  colorSpace,
                                  kCGImageAlphaPremultipliedLast);    // RGBA
  if(!context) {
    free(bitmapData);
    NSLog(@"Bitmap context not created");
  }
  
  CGColorSpaceRelease(colorSpace);
  
  return context;
}

- (unsigned char *) convertUIImageToBitmapRGBA8:(UIImage *) image {
  
  CGImageRef imageRef = image.CGImage;
  
  // Create a bitmap context to draw the uiimage into
  CGContextRef context = [self newBitmapRGBA8ContextFromImage:imageRef];
  
  if(!context) {
    return NULL;
  }
  
  size_t width = CGImageGetWidth(imageRef);
  size_t height = CGImageGetHeight(imageRef);
  
  CGRect rect = CGRectMake(0, 0, width, height);
  
  // Draw image into the context to get the raw image data
  CGContextDrawImage(context, rect, imageRef);
  
  // Get a pointer to the data
  unsigned char *bitmapData = (unsigned char*)CGBitmapContextGetData(context);
  
  // Copy the data and release the memory (return memory allocated with new)
  size_t bytesPerRow = CGBitmapContextGetBytesPerRow(context);
  size_t bufferLength = bytesPerRow * height;
  
  unsigned char *newBitmap = NULL;
  
  if(bitmapData) {
    newBitmap = (unsigned char *)malloc(sizeof(unsigned char) * bytesPerRow * height);
    
    if(newBitmap) {    // Copy the data
      for(int i = 0; i < bufferLength; ++i) {
        newBitmap[i] = bitmapData[i];
      }
    }
    
    free(bitmapData);
    
  } else {
    NSLog(@"Error getting bitmap pixel data\n");
  }
  
  CGContextRelease(context);
  
  return newBitmap;
}

-(void)callCallBack:(NSString *)resultStr{
  NSMutableArray *retArr = [[NSMutableArray alloc] init];
  [retArr addObject:resultStr];
  qrCodeCallback(retArr);
}

- (void)imagePickerControllerDidCancel:(UIImagePickerController *)picker
{
  [self callCallBack:@"cancle"];
  dispatch_async(dispatch_get_main_queue(), ^{
    [picker dismissViewControllerAnimated:YES completion:nil];
  });
}

-(UIImage *)comPressImage:(UIImage *) bigImage{
  UIImage* theImage = bigImage;
  float actualHeight = bigImage.size.height;
  float actualWidth = bigImage.size.width;
  float newWidth =0;
  float newHeight =0;
  if(actualWidth > actualHeight) {
    //宽图
    newHeight =768.0f;
    newWidth = actualWidth / actualHeight * newHeight;
  }
  else
  {
    //长图
    newWidth =768.0f;
    newHeight = actualHeight / actualWidth * newWidth;
  }
  CGRect rect =CGRectMake(0.0,0.0, newWidth, newHeight);
  UIGraphicsBeginImageContext(rect.size);
  [bigImage drawInRect:rect];// scales image to rect
  theImage =UIGraphicsGetImageFromCurrentImageContext();
  UIGraphicsEndImageContext();
  //RETURN
  return theImage;
}


@end
