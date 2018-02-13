package com.elephant.reimbursementpro.rnInterface;

import android.accounts.NetworkErrorException;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;
import android.util.Base64;

import com.elephant.reimbursementpro.MainActivity;
import com.elephant.reimbursementpro.zxing.cameraSet.CameraManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Date;

public class RNBridgeModule extends ReactContextBaseJavaModule {
    public static final String REACTCLASSNAME = "RNBridgeModule";
    private Context mContext;
    private static Activity ma;
    private ReactApplicationContext mReactContext;

    public RNBridgeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
        mReactContext = reactContext;
    }

    @Override
    public String getName() {
        return REACTCLASSNAME;
    }

    /**
     * 检查悬浮窗权限
     */
    @ReactMethod
    public void checkFloatWindowOpAllowed(Callback callback) {
//        if (Build.VERSION.SDK_INT >= 23) {
//            if (!Settings.canDrawOverlays(mContext)) {
//                new AlertDialog.Builder(getCurrentActivity())
//                        .setTitle("权限提示")
//                        .setMessage("需要开启悬浮框权限，是否前往开启？")
//                        .setPositiveButton("是", new DialogInterface.OnClickListener() {
//
//                            public void onClick(DialogInterface dialog, int which) {
//                                Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION);
//                                intent.setData(Uri.parse("package:" + mContext.getPackageName()));
//                                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
//                                mContext.startActivity(intent);
//                                dialog.dismiss();
//                            }
//                        })
//                        .setNegativeButton("否", null)
//                        .show();
//
//            } else {
//                callback.invoke(0);
//            }
//        } else {
//            callback.invoke(0);
//        }
        callback.invoke(0);
    }

    @ReactMethod
    public void openCameraPreview(){
        Intent newTntent = new Intent(RCTScanView.CLOSE_CAMERA);
        newTntent.putExtra(MainActivity.CLOSE_CAMERA, "2");
        mContext.sendBroadcast(newTntent);
    }

    /**
     * 释放相机
     */
    @ReactMethod
    public void releaseCamera(){
        CameraManager.init(mContext.getApplicationContext());
        CameraManager.get().closeDriver();
    }

    /**
     * 退出app
     */
    @ReactMethod
    public void exitApp() {
        android.os.Process.killProcess(android.os.Process.myPid());
    }

    /**
     * 更新角标
     */
    @ReactMethod
    public void updateBadge(int badge) {
        String launcherClassName = "com.elephant.reimbursementpro.MainActivity";//启动的Activity完整名称
        Bundle localBundle = new Bundle();//需要存储的数据
        localBundle.putString("package", mContext.getPackageName());//包名
        localBundle.putString("class", launcherClassName);
        localBundle.putInt("badgenumber", badge);//未读信息条数
        mContext.getContentResolver().call(
                Uri.parse("content://com.huawei.android.launcher.settings/badge/"),
                "change_badge", null, localBundle);
    }

    /**
     * 检查悬浮窗权限
     */
    @ReactMethod
    public void loadImage(String requestUrl, String token, String requestData, Callback callback) {
        HttpURLConnection conn = null;
        try {
            // 创建一个URL对象
            URL mURL = new URL(requestUrl);
            // 调用URL的openConnection()方法,获取HttpURLConnection对象
            conn = (HttpURLConnection) mURL.openConnection();

            conn.setRequestMethod("POST");// 设置请求方法为post
            conn.setReadTimeout(60000);// 设置读取超时为5秒
            conn.setConnectTimeout(10000);// 设置连接网络超时为10秒
            conn.setDoOutput(true);// 设置此方法,允许向服务器输出内容
            conn.setRequestProperty("token", token);
            conn.setRequestProperty("Content-Type", "application/json");


            // 获得一个输出流,向服务器写数据,默认情况下,系统不允许向服务器输出内容
            OutputStream out = conn.getOutputStream();// 获得一个输出流,向服务器写数据
            out.write(requestData.getBytes());
            out.flush();
            out.close();

            int responseCode = conn.getResponseCode();// 调用此方法就不必再使用conn.connect()方法
            if (responseCode == 200) {
                InputStream is = conn.getInputStream();
                String timestamp = String.valueOf((new Date()).getTime() / 1000);
                String path = Environment.getExternalStorageDirectory() + "/" + timestamp + ".jpg";
                File file = new File(path);
                BufferedInputStream bis = new BufferedInputStream(is);
                BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(file));
                byte[] by = new byte[1024];
                int len = 0;
                while ((len = bis.read(by)) != -1) {
                    bos.write(by, 0, len);
                }
                bos.flush();
                bos.close();
                bis.close();
                is.close();
                ByteArrayOutputStream baos = null;
                Bitmap bit = BitmapFactory.decodeFile(path);
                baos = new ByteArrayOutputStream();
                bit.compress(Bitmap.CompressFormat.JPEG, 100, baos);
                baos.flush();
                baos.close();
                byte[] bitmapBytes = baos.toByteArray();
                String result = Base64.encodeToString(bitmapBytes, Base64.DEFAULT);
                callback.invoke("data:image/png;base64," + result);
            } else {
                callback.invoke("");
            }

        } catch (Exception e) {
            callback.invoke("");
        } finally {
            if (conn != null) {
                conn.disconnect();// 关闭连接
            }
        }
    }
}