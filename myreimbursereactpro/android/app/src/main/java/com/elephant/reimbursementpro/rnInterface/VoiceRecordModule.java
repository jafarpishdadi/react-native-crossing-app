package com.elephant.reimbursementpro.rnInterface;
import android.content.ContentValues;
import android.content.Context;
import android.app.Activity;
import android.database.Cursor;
import android.net.Uri;
import android.os.Environment;
import android.provider.MediaStore;

import com.dear.voice.IRecordListener;
import com.dear.voice.VoiceFormat;
import com.dear.voice.VoiceRecorder;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;


import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

import Decoder.BASE64Encoder;

public class VoiceRecordModule extends ReactContextBaseJavaModule {
    public static final String REACTCLASSNAME = "VoiceRecordModule";
    private Context mContext;
    private ReactApplicationContext mReactContext;

    private VoiceRecorder voiceRecorder;

    public VoiceRecordModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
        mReactContext = reactContext;
    }

    @Override
    public String getName() {
        return REACTCLASSNAME;
    }

    /**
     * ��ʼ��¼������
     */
    @ReactMethod
    public void initRecordTools() {
        if (voiceRecorder == null) {
            voiceRecorder = new VoiceRecorder(mContext, VoiceFormat.AUDIOFORMAT_16K16BIT_MONO);
        }
    }

    /**
     * �ͷ���Դ
     */
    @ReactMethod
    public void releaseRecordTools() {
        if (voiceRecorder != null) {
            voiceRecorder.releaseRecord();
            voiceRecorder = null;
        }
    }


    /**
     * ��ʼ¼��
     */
    @ReactMethod
    public void start() {
        if(voiceRecorder != null) {
            voiceRecorder.startRecord();
        }else{
            initRecordTools();
            voiceRecorder.startRecord();
        }
    }

    /**
     * ����¼��
     */
    @ReactMethod
    public void stop(Callback callback) {
        if(voiceRecorder != null) {
            voiceRecorder.stopRecord();
            byte[] buf = voiceRecorder.getRecordData();
            BASE64Encoder encoder = new BASE64Encoder();
            String recordBase64 = encoder.encode(buf);

            WritableMap response;
            response = Arguments.createMap();
            response.putString("recordData", recordBase64);

            callback.invoke(response);
        }
    }
}