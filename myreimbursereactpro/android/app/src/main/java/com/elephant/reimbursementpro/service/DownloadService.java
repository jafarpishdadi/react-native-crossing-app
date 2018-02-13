package com.elephant.reimbursementpro.service;

import android.app.IntentService;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Environment;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.NotificationCompat.Builder;
import android.util.Log;
import android.widget.Toast;

import com.elephant.reimbursementpro.R;
import com.elephant.reimbursementpro.rnInterface.UpdateAppModule;
import com.elephant.reimbursementpro.utils.StorageUtils;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Created by Denny.liu on 2017/6/30.
 */

public class DownloadService extends IntentService {

    private static final int BUFFER_SIZE = 10 * 1024; // 8k ~ 32K
    private static final String TAG = "DownloadService";

    private static final int NOTIFICATION_ID = 0;

    private NotificationManager mNotifyManager;
    private Builder mBuilder;

    public static final String DOWNLOAD_RESULT = "com.elephant.reimbursementpro.intentservice.DOWNLOAD_RESULT";

    public DownloadService() {
        super("DownloadService");
    }

    @Override
    protected void onHandleIntent(Intent intent) {


        mNotifyManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        mBuilder = new NotificationCompat.Builder(this);

        String appName = getString(getApplicationInfo().labelRes);
        int icon = getApplicationInfo().icon;

        mBuilder.setContentTitle(appName).setSmallIcon(icon);

        String urlStr = intent.getStringExtra("url");
        InputStream in = null;
        FileOutputStream out = null;
        try {
            URL url = new URL(urlStr);
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
            long bytesum = 0;
            int byteread = 0;
            in = urlConnection.getInputStream();
            File dir = StorageUtils.getCacheDirectory(this);
            String apkName = urlStr.substring(urlStr.lastIndexOf("/") + 1, urlStr.length());
            File apkFile = new File(dir, apkName);
            out = new FileOutputStream(apkFile);
            byte[] buffer = new byte[BUFFER_SIZE];

            int oldProgress = 0;

            while ((byteread = in.read(buffer)) != -1) {
                bytesum += byteread;
                out.write(buffer, 0, byteread);

                System.out.println(bytesum +" / " + bytetotal);
                int progress = (int) (bytesum * 100L / bytetotal);
                // 如果进度与之前进度相等，则不更新，如果更新太频繁，否则会造成界面卡顿
                if (progress != oldProgress) {
                    updateProgress(progress > 100 ? 100 : progress);
                }
                oldProgress = progress;
            }
            // 下载完成

            installAPk(apkFile);

            mNotifyManager.cancel(NOTIFICATION_ID);

            Intent newTntent = new Intent(UpdateAppModule.UPDATE_RESULT );
            newTntent.putExtra(DOWNLOAD_RESULT, "下载完成");
            sendBroadcast(newTntent);

        } catch (Exception e) {
            Log.e(TAG, "download apk file error");

            mNotifyManager.cancel(NOTIFICATION_ID);
            Intent newTntent2 = new Intent(UpdateAppModule.UPDATE_RESULT );
            newTntent2.putExtra(DOWNLOAD_RESULT, "网络连接失败，请稍后重试");
            sendBroadcast(newTntent2);
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
    }




//    @Override
//    protected void onHandleIntent(Intent intent) {
//
//
//        mNotifyManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
//        mBuilder = new NotificationCompat.Builder(this);
//
//        String appName = getString(getApplicationInfo().labelRes);
//        int icon = getApplicationInfo().icon;
//
//        mBuilder.setContentTitle(appName).setSmallIcon(icon);
//        String requestUrl = intent.getStringExtra("requestUrl");
//        String token = intent.getStringExtra("token");
//        String downloadUrl = intent.getStringExtra("downloadUrl");
//        InputStream in = null;
//        OutputStream out = null;
//        try {
//
//            File dir = StorageUtils.getCacheDirectory(this);
//
//            String apkName = downloadUrl.substring(downloadUrl.lastIndexOf("/") + 1, downloadUrl.length());
//            apkName = apkName.substring(0,apkName.length()-4) + ".apk";
//            //File apkFile = new File(dir, apkName);
//            String path = Environment.getExternalStorageDirectory() + "/reimbursement" +  downloadUrl.substring(0,downloadUrl.length()-4) + apkName ;
//            File apkFile = new File(path);
//            if (!apkFile.getParentFile().exists()) {
//                apkFile.getParentFile().mkdirs();
//            }
//            if(apkFile.exists()){
//                installAPk(apkFile);
//                mNotifyManager.cancel(NOTIFICATION_ID);
//                Intent newTntent = new Intent(UpdateAppModule.UPDATE_RESULT);
//                newTntent.putExtra(DOWNLOAD_RESULT, "下载完成");
//                sendBroadcast(newTntent);
//                return;
//            }
//            HttpURLConnection conn = null;
//            // 创建一个URL对象
//            URL mURL = new URL(requestUrl);
//            // 调用URL的openConnection()方法,获取HttpURLConnection对象
//            conn = (HttpURLConnection) mURL.openConnection();
//
//            conn.setRequestMethod("POST");// 设置请求方法为post
//            conn.setReadTimeout(60000000);// 设置读取超时为5秒
//            conn.setConnectTimeout(10000);// 设置连接网络超时为10秒
//            conn.setDoOutput(true);// 设置此方法,允许向服务器输出内容
//            conn.setRequestProperty("token", token);
//            conn.setRequestProperty("Content-Type", "application/json");
//
//            // 获得一个输出流,向服务器写数据,默认情况下,系统不允许向服务器输出内容
//            out = conn.getOutputStream();// 获得一个输出流,向服务器写数据
//            JSONObject requestData = new JSONObject();
//            requestData.put("fileDir",downloadUrl);
//            out.write((requestData.toString()).getBytes());
//
//            int responseCode = conn.getResponseCode();// 调用此方法就不必再使用conn.connect()方法
//            if (responseCode == 200) {
//                //得到输入流
//                InputStream inputStream = conn.getInputStream();
//                //获取自己数组
//                byte[] getData = readInputStream(inputStream);
//
//                FileOutputStream fos = new FileOutputStream(apkFile);
//                fos.write(getData);
//                if (fos != null) {
//                    fos.close();
//                }
//                if (inputStream != null) {
//                    inputStream.close();
//                }
//                out.flush();
//                out.close();
//                installAPk(apkFile);
//
//                mNotifyManager.cancel(NOTIFICATION_ID);
//
//                Intent newTntent = new Intent(UpdateAppModule.UPDATE_RESULT);
//                newTntent.putExtra(DOWNLOAD_RESULT, "下载完成");
//                sendBroadcast(newTntent);
//            }
//
//        } catch (Exception e) {
//            Log.e(TAG, "download apk file error");
//
//            mNotifyManager.cancel(NOTIFICATION_ID);
//            Intent newTntent2 = new Intent(UpdateAppModule.UPDATE_RESULT );
//            newTntent2.putExtra(DOWNLOAD_RESULT, "下载失败");
//            sendBroadcast(newTntent2);
//        } finally {
//            if (out != null) {
//                try {
//                    out.close();
//                } catch (IOException ignored) {
//
//                }
//            }
//            if (in != null) {
//                try {
//                    in.close();
//                } catch (IOException ignored) {
//
//                }
//            }
//        }
//    }

    /**
     * 从输入流中获取字节数组
     *
     * @param inputStream
     * @return
     * @throws IOException
     */
    public static byte[] readInputStream(InputStream inputStream) throws IOException {
        byte[] buffer = new byte[1024];
        int len = 0;
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        while ((len = inputStream.read(buffer)) != -1) {
            bos.write(buffer, 0, len);
        }
        bos.close();
        return bos.toByteArray();
    }


    private void updateProgress(int progress) {
        //"正在下载:" + progress + "%"
        mBuilder.setContentText(this.getString(R.string.android_auto_update_download_progress, progress)).setProgress(100, progress, false);
        //setContentInent如果不设置在4.0+上没有问题，在4.0以下会报异常
        PendingIntent pendingintent = PendingIntent.getActivity(this, 0, new Intent(), PendingIntent.FLAG_CANCEL_CURRENT);
        mBuilder.setContentIntent(pendingintent);
        mNotifyManager.notify(NOTIFICATION_ID, mBuilder.build());
    }


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
        startActivity(intent);

    }
}
