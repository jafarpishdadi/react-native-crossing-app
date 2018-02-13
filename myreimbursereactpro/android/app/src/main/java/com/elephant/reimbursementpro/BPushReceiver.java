package com.elephant.reimbursementpro;

import android.app.ActivityManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.TextUtils;

import com.baidu.android.pushservice.PushMessageReceiver;

import java.util.List;

public class BPushReceiver extends PushMessageReceiver {
    @Override
    public void onBind(Context context, int i, String s, String s1, String s2, String s3) {
        SharedPreferences sp = context.getSharedPreferences("BPushUserInfo", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sp.edit();
        editor.putString("app_id", s);
        editor.putString("user_id", s1);
        editor.putString("channel_id", s2);
        editor.putString("request_id", s3);
        editor.commit();
    }

    @Override
    public void onUnbind(Context context, int i, String s) {

    }

    @Override
    public void onSetTags(Context context, int i, List<String> list, List<String> list1, String s) {

    }

    @Override
    public void onDelTags(Context context, int i, List<String> list, List<String> list1, String s) {

    }

    @Override
    public void onListTags(Context context, int i, List<String> list, String s) {

    }

    @Override
    public void onMessage(Context context, String s, String s1) {

    }

    @Override
    public void onNotificationClicked(Context context, String s, String s1, String s2) {
        if (!isAppRunning(context)) {
            SharedPreferences sp = context.getSharedPreferences("BPushInfo", Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = sp.edit();
            editor.putString("title", s);
            editor.putString("content", s1);
            editor.putString("data", s2);
            editor.commit();
        }
        final Intent intent = new Intent();
        intent.setClass(context.getApplicationContext(), MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        final Bundle bundle = new Bundle();
        bundle.putBoolean("isUserClick", true);
        bundle.putString("title", s);
        bundle.putString("content", s1);
        bundle.putString("data", s2);
        intent.putExtras(bundle);
        context.getApplicationContext().startActivity(intent);
    }

    @Override
    public void onNotificationArrived(Context context, String s, String s1, String s2) {
        if (isAppForeground(context)) {
            final Intent intent = new Intent();
            intent.setClass(context.getApplicationContext(), MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            final Bundle bundle = new Bundle();
            bundle.putBoolean("isUserClick", true);
            bundle.putBoolean("isAppForeground", true);
            bundle.putString("title", s);
            bundle.putString("content", s1);
            bundle.putString("data", s2);
            intent.putExtras(bundle);
            context.getApplicationContext().startActivity(intent);
        }
    }

    //当前应用是否运行（包括前台后台）
    private boolean isAppRunning(Context context) {
        boolean isAppRunning = false;
        if (context != null) {
            ActivityManager am = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
            List<ActivityManager.RunningTaskInfo> list = am.getRunningTasks(100);
            String MY_PKG_NAME = context.getPackageName();
            for (ActivityManager.RunningTaskInfo info : list) {
                if (info.topActivity.getPackageName().equals(MY_PKG_NAME) && info.baseActivity.getPackageName().equals(MY_PKG_NAME)) {
                    isAppRunning = true;
                    break;
                }
            }
        }
        return isAppRunning;
    }

    //当前应用是否处于前台
    private boolean isAppForeground(Context context) {
        if (context != null) {
            ActivityManager am = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
            ComponentName cn = am.getRunningTasks(1).get(0).topActivity;
            String currentPackageName = cn.getPackageName();
            if (!TextUtils.isEmpty(currentPackageName) && currentPackageName.equals(context.getPackageName())) {
                return true;
            }
            return false;
        }
        return false;
    }
}

