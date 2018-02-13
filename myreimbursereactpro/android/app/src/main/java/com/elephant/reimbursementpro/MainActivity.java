package com.elephant.reimbursementpro;

import android.content.Intent;
import android.os.Bundle;

import com.elephant.reimbursementpro.rnInterface.RCTScanView;
import com.facebook.react.bridge.Promise;
import com.mehcode.reactnative.splashscreen.SplashScreen;
import com.facebook.react.ReactActivity;
import com.baidu.android.pushservice.PushConstants;
import com.baidu.android.pushservice.PushManager;
import com.umeng.analytics.MobclickAgent;

public class MainActivity extends ReactActivity {

    public Promise promise;
    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "myreimbursereactpro";
    }

    private static final String BPUSH_APP_ID = "lRTqGbacNGsbYED6isCt8Utc";

    public static final String CLOSE_CAMERA = "com.elephant.reimbursementpro.intentservice.CLOSE_CAMERA";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Show the js-controlled splash screen
        SplashScreen.show(this, getReactInstanceManager());
        super.onCreate(savedInstanceState);
        PushManager.startWork(getApplicationContext(), PushConstants.LOGIN_TYPE_API_KEY, BPUSH_APP_ID);
    }

    @Override
    public void onResume() {
        Intent newTntent = new Intent(RCTScanView.CLOSE_CAMERA);
        newTntent.putExtra(CLOSE_CAMERA, "1");
        sendBroadcast(newTntent);
        super.onResume();
        MobclickAgent.onResume(this);
    }

    @Override
    public void onPause() {
        super.onPause();
        MobclickAgent.onPause(this);
    }
}
