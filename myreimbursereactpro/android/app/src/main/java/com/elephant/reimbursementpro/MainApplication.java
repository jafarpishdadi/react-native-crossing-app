package com.elephant.reimbursementpro;

import android.app.Application;

import com.elephant.reimbursementpro.rnInterface.PreviewPackage;
import com.elephant.reimbursementpro.rnInterface.QrCodePackage;
import com.elephant.reimbursementpro.rnInterface.RCTScanViewPackage;
import com.elephant.reimbursementpro.rnInterface.RNBridgePackage;
import com.elephant.reimbursementpro.rnInterface.UpdateAppReactPackage;
import com.elephant.reimbursementpro.rnInterface.VoiceRecordPackage;
import com.facebook.react.ReactApplication;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.cmcewen.blurview.BlurViewPackage;
import com.umeng.commonsdk.UMConfigure;
import com.wheelpicker.WheelPickerPackage;
import com.github.wuxudong.rncharts.MPAndroidChartPackage;
import com.facebook.react.bridge.Promise;
import com.mehcode.reactnative.splashscreen.SplashScreenPackage;
import com.imagepicker.ImagePickerPackage;
import com.pusherman.networkinfo.RNNetworkInfoPackage;
import com.joshblour.reactnativepermissions.ReactNativePermissionsPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.lwansbrough.RCTCamera.RCTCameraPackage;
import com.beefe.picker.PickerViewPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.github.wuxudong.rncharts.MPAndroidChartPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {
    Promise promise;

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                new MainReactPackage(),
            new BlurViewPackage(),
            new WheelPickerPackage(),
            new MPAndroidChartPackage(),
            new RNDeviceInfo(),
                new SplashScreenPackage(),
                new ImagePickerPackage(),
                new RNNetworkInfoPackage(),
                new ReactNativePermissionsPackage(),
                new LinearGradientPackage(),
                new UpdateAppReactPackage(),
                new RNBridgePackage(),
                new RCTCameraPackage(),
                new PickerViewPackage(),
                new RCTScanViewPackage(),
                new QrCodePackage(),
                new MyDeviceInfoPackage(),
                new VoiceRecordPackage(),
                new OpenFileSystemPackage(),
                new PreviewPackage(),
                new MPAndroidChartPackage()
            );
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
        UMConfigure.setLogEnabled(true);
        UMConfigure.init(this, UMConfigure.DEVICE_TYPE_PHONE, null);
    }
}
