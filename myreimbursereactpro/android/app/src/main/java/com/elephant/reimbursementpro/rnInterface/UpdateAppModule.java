package com.elephant.reimbursementpro.rnInterface;

import android.app.Dialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.os.AsyncTask;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.elephant.reimbursementpro.service.DownloadService;
import com.elephant.reimbursementpro.utils.AppUtils;
import com.elephant.reimbursementpro.utils.StorageUtils;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Created by Denny.liu on 2017/6/30.
 */

public class UpdateAppModule extends ReactContextBaseJavaModule {

    public static final String REACTCLASSNAME = "UpdateAppModule";

    private static Dialog mSplashDialog;
    private static final int BUFFER_SIZE = 10 * 1024; // 8k ~ 32K
    private Context mContext;
    private ReactApplicationContext mReactContext;

    private Boolean isUpdating = false; //是否正在下载

    public static final String UPDATE_RESULT = "com.elephant.reimbursementpro.intentservice.UPDATE_RESULT";

    @Override
    public String getName() {
        return REACTCLASSNAME;
    }

    public UpdateAppModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.mContext = reactContext;
        this.mReactContext = reactContext;
        registerReceiver();
    }

    //控制apk更新的广播
    private BroadcastReceiver downloadReceiver = new BroadcastReceiver()
    {
        @Override
        public void onReceive(Context context, Intent intent)
        {

            if (intent.getAction() == UPDATE_RESULT) {
                String path = intent.getStringExtra(DownloadService.DOWNLOAD_RESULT);
                handleResult(path);
            }
        }
    };

    /**
     * 注册广播
     */
    private void registerReceiver() {
        IntentFilter filter = new IntentFilter();
        filter.addAction(UPDATE_RESULT);
        mContext.getApplicationContext().registerReceiver(downloadReceiver, filter);
    }

    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        mContext.getApplicationContext().unregisterReceiver(downloadReceiver);

    }

    private void handleResult(String message) {
        this.isUpdating = false;
        Toast.makeText(mContext, message, Toast.LENGTH_SHORT).show();
    }

    /**
     * 更新apk
     * @param downloadUrl
     * @param callback
     */
    @ReactMethod
    public void update(String downloadUrl, Callback callback) {
        if(isUpdating) {
            callback.invoke("0");
        }else {
            this.isUpdating = true;
            Intent intent = new Intent(mContext.getApplicationContext(), DownloadService.class);
            intent.putExtra("url", downloadUrl);
            mContext.startService(intent);
        }
    }

//    /**
//     * 更新apk
//     * @param requestUrl
//     * @param token
//     * @param downloadUrl
//     * @param callback
//     */
//    @ReactMethod
//    public void update(String requestUrl, String token, String downloadUrl, Callback callback) {
//        if(isUpdating) {
//            callback.invoke("0");
//        }else {
//            this.isUpdating = true;
//            Intent intent = new Intent(mContext.getApplicationContext(), DownloadService.class);
//            intent.putExtra("requestUrl", requestUrl);
//            intent.putExtra("token", token);
//            intent.putExtra("downloadUrl", downloadUrl);
//            mContext.startService(intent);
//        }
//    }

    /**
     * 强制更新apk
     * @param downloadUrl
     */
    @ReactMethod
    public void forceUpdate(String downloadUrl) {
        MyAsyncTask myAsyncTask = new MyAsyncTask();
        myAsyncTask.execute(downloadUrl);
    }

    class MyAsyncTask extends AsyncTask<String, Integer, File> {

        @Override
        protected void onPreExecute() {
            //这里是开始线程之前执行的,是在UI线程
            super.onPreExecute();
        }

        @Override
        protected File doInBackground(String... params) {
            InputStream in = null;
            FileOutputStream out = null;
            File apkFile = null;
            try {
                URL url = new URL(params[0]);
                HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();

                urlConnection.setRequestMethod("GET");
                urlConnection.setDoOutput(false);
                urlConnection.setConnectTimeout(10 * 1000);
                urlConnection.setReadTimeout(10 * 1000);
                urlConnection.setRequestProperty("Connection", "Keep-Alive");
                urlConnection.setRequestProperty("Charset", "UTF-8");
                urlConnection.setRequestProperty("Accept-Encoding", "gzip, deflate");

                urlConnection.connect();
                long bytetotal = urlConnection.getContentLength();
                //long bytetotal =  Long.parseLong(params[1]);
                long bytesum = 0;
                int byteread = 0;
                in = urlConnection.getInputStream();
                File dir = StorageUtils.getCacheDirectory(mContext);
                String apkName = params[0].substring(params[0].lastIndexOf("/") + 1, params[0].length());
                apkFile = new File(dir, apkName);
                out = new FileOutputStream(apkFile);
                byte[] buffer = new byte[BUFFER_SIZE];

                int oldProgress = 0;

                while ((byteread = in.read(buffer)) != -1) {
                    bytesum += byteread;
                    out.write(buffer, 0, byteread);

                    System.out.println(bytesum +" / " + bytetotal);
                    int progress = (int) (bytesum * 100L / bytetotal);
                    // 如果进度与之前进度相等，则不更新，如果更新太频繁，否则会造成界面卡顿
                    if (progress - oldProgress > 0) {
                        //dialog.setProgress(progress);
                        oldProgress = progress;
                        publishProgress(progress);
                    }
                }

            } catch (Exception e) {
                Log.e("forceUpdate", "download apk file error");
                mReactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("forceUpdateFail",e.getMessage());
            } finally {
                if (out != null) {
                    try {
                        out.close();
                    } catch (IOException ignored) {

                    }
                }
                if (in != null) {
                    try {
                        in.close();
                    } catch (IOException ignored) {

                    }
                }
            }
            return apkFile;
        }

        @Override
        protected void onCancelled() {
            //当任务被取消时回调
            super.onCancelled();
        }

        @Override
        protected void onProgressUpdate(Integer... values) {
            super.onProgressUpdate(values);
            //更新进度
            int progress = values[0];
            mReactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("updateProcess", progress > 100 ? 100 : progress);
        }

        @Override
        protected void onPostExecute(File apkFile) {
            super.onPostExecute(apkFile);
            //当任务执行完成是调用,在UI线程
            installAPk(apkFile);
        }
    }

    /**
     * 安装程序
     * @param apkFile apk
     */
    private void installAPk(File apkFile) {
        Intent intent = new Intent(Intent.ACTION_VIEW);
        //如果没有设置SDCard写权限，或者没有sdcard,apk文件保存在内存中，需要授予权限才能安装
        try {
            String[] command = {"chmod", "777", apkFile.toString()};
            ProcessBuilder builder = new ProcessBuilder(command);
            builder.start();
        } catch (IOException ignored) {
        }
        intent.setDataAndType(Uri.fromFile(apkFile), "application/vnd.android.package-archive");

        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        mContext.startActivity(intent);

    }

    /**
     * 检查是否要更新
     * @param newVersion
     * @param callback
     */
    @ReactMethod
    public void check(String newVersion, Callback callback) {
        newVersion = newVersion.replace("V","");
        newVersion = newVersion.replace("v","");
        newVersion = newVersion.replace("-","");
        System.out.println(newVersion);
        int result = AppUtils.compareVersion(newVersion, AppUtils.getVersionName(mContext));
        if(result > 0) {
            callback.invoke("1");
        } else {
            callback.invoke("0");
        }
    }


    /**
     * 获取当前版本号
     * @param callback
     */
    @ReactMethod
    public void getVersionCode(Callback callback) {
        int versionCode = AppUtils.getVersionCode(mContext);
        callback.invoke(versionCode);
    }

    /**
     * 获取当前版本名称
     * @param callback
     */
    @ReactMethod
    public void getVersionName(Callback callback) {
        String versionName = AppUtils.getVersionName(mContext);
        callback.invoke(versionName);
    }
}
