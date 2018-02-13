package com.elephant.reimbursementpro.rnInterface;

import android.app.Activity;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.ztec.adc.zdcode.Bardecoder;

import java.io.UnsupportedEncodingException;

public class QrCodeModule extends ReactContextBaseJavaModule {
    public static final String REACTCLASSNAME = "QrCodeModule";
    private Context mContext;
    private ReactApplicationContext mReactContext;

    private Bardecoder bardecoder;

    public QrCodeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
        mReactContext = reactContext;
    }

    @Override
    public String getName() {
        return REACTCLASSNAME;
    }

    /**
     * 从相册扫描
     */
    @ReactMethod
    public void scanCameraRoll(String path,Callback callback) {

        String result = scanningImage(path);
        if (result != null) {
            callback.invoke(result);
        }else {
            callback.invoke("");
        }
    }

    /**
     * 扫描二维码图片的方法
     * @param path
     * @return
     */
    public String scanningImage(String path) {
        if(path == null || "".equals(path)){
            return null;
        }
        if(bardecoder == null) {
            bardecoder = new Bardecoder();
        }
        bardecoder.init();

        short reserved = 0;
        String decodeStr = "";
        try {
            decodeStr = bardecoder.DecodeImageFile_toString2(path, reserved);
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }finally {
            //bardecoder.release();
        }
        return decodeStr;
    }
}