package com.elephant.reimbursementpro.utils;

import android.content.Context;
import android.content.pm.PackageManager;

/**
 * Created by Denny.liu on 2017/7/1.
 */

public class AppUtils {

    /**
     * 获取当前app版本号
     * @param mContext
     * @return
     */
    public static  int getVersionCode(Context mContext) {
        if (mContext != null) {
            try {
                int versionCode = mContext.getPackageManager().getPackageInfo(mContext.getPackageName(), 0).versionCode;
                return versionCode;
            } catch (PackageManager.NameNotFoundException ignored) {
            }
        }
        return 0;
    }

    /**
     * 获取当前app版本名称
     * @param mContext
     * @return
     */
    public static String getVersionName(Context mContext) {
        if (mContext != null) {
            try {
                String versionName = mContext.getPackageManager().getPackageInfo(mContext.getPackageName(), 0).versionName;
                return versionName;
            } catch (PackageManager.NameNotFoundException ignored) {
            }
        }
        return "";
    }

    /**
     * 版本号比较
     *
     * @param remoteVersion 远程版本
     * @param localVersion 本地版本
     * @return if remoteVersion > localVersion, return 1, if equal, return 0, else return -1
     */
    public static int compareVersion(String remoteVersion, String localVersion) {
        if (remoteVersion.equals(localVersion)) {
            return 0;
        }

        String[] minArray = remoteVersion.split("\\.");
        String[] localArray = localVersion.split("\\.");

        int index = 0;
        int minLen = Math.min(minArray.length, localArray.length);
        int diff = 0;

        while (index < minLen && (diff = Integer.parseInt(minArray[index]) - Integer.parseInt(localArray[index])) == 0) {
            index++;
        }

        if (diff == 0) {
            for (int i = index; i < minArray.length; i++) {
                if (Integer.parseInt(minArray[i]) > 0) {
                    return 1;
                }
            }

            for (int i = index; i < localArray.length; i++) {
                if (Integer.parseInt(localArray[i]) > 0) {
                    return -1;
                }
            }

            return 0;
        } else {
            //return diff > 0 ? 1 : -1;
            for(int i = 0; i < minLen; i++) {
                int a = Integer.parseInt(minArray[i]);
                int b = Integer.parseInt(localArray[i]);
                if(a != b) {
                    return a > b ? 1: -1;
                }
            }
            if(minArray.length > localArray.length) {
                return 1;
            }
            return -1;

        }
    }
}
