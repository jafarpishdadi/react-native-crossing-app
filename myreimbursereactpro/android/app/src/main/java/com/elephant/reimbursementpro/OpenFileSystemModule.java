package com.elephant.reimbursementpro;

import android.content.Intent;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/**
 * Created by sky.qian on 12/15/2017.
 */

public class OpenFileSystemModule extends ReactContextBaseJavaModule{
    ReactApplicationContext aContext;

    public OpenFileSystemModule(ReactApplicationContext reactContext) {
        super(reactContext);
        aContext = reactContext;
    }

    @Override
    public String getName() {
        return "OpenFileSystem";
    }

    @ReactMethod
    public void openFileSystem(Promise promise) {
        Intent intent = new Intent(aContext, OpenFileSystemActivity.class);
        MainApplication m = (MainApplication)(getCurrentActivity().getApplication());
        m.promise = promise;
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        aContext.startActivity(intent);

    }
}
