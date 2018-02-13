package com.elephant.reimbursementpro.rnInterface;

import android.app.Activity;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.RCTEventEmitter;

/**
 * Created by Denny.liu on 2017/7/3.
 */

public class RCTScanViewManager extends SimpleViewManager<RCTScanView> {

    public static final String REACT_CLASS = "RCTScanView";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected RCTScanView createViewInstance(final ThemedReactContext reactContext) {
        Activity currentActivity = reactContext.getCurrentActivity();

        final RCTScanView rctScanView = new RCTScanView(reactContext, currentActivity, new RCTScanViewListener() {
            @Override
            public void onScanResult(RCTScanView scanView, String qrCode) {
                WritableMap map = Arguments.createMap();
                map.putString("data", qrCode);
                reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(scanView.getId(), "topChange", map);
                //topChange 映射到js端的onChange回调属性上，具体映射关系看 com.facebook.react.uimanager.UIManagerModuleConstants
            }

            @Override
            public void onInputPress(RCTScanView scanView) {
                WritableMap map = Arguments.createMap();
                map.putString("position", "d");
                reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(scanView.getId(), "topSelect", map);
                //topSelect 映射到js端的onSelect回调属性上，具体映射关系看 com.facebook.react.uimanager.UIManagerModuleConstants
            }
        });
        return rctScanView;
    }

    @ReactProp(name = "scanLeft")
    public void LeftController(RCTScanView view, int left) {
        view.setScanLeft(left);
    }

    @ReactProp(name = "scanTop")
    public void TopController(RCTScanView view, int top) {
        view.setScanTop(top);
    }

    @ReactProp(name = "scanWidth")
    public void WidthController(RCTScanView view, int width) {
        view.setScanWidth(width);
    }

    @ReactProp(name = "scanHeight")
    public void HeightController(RCTScanView view, int height) {
        view.setScanHeight(height);
    }

    @ReactProp(name = "showTips", defaultBoolean = false)
    public void TipController(RCTScanView view, Boolean showTips) {

        view.showTips(showTips);
    }

    @ReactProp(name = "doScan", defaultBoolean = false)
    public void scanController(RCTScanView view, Boolean doScan) {

        System.out.println("wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww" + (doScan ? "33333" : "5555"));
        if(doScan) {
            //开扫描
            view.restartScan();
        }else {
            //关扫描
            view.pauseScan();
        }
    }

    /**
     * 控制相机
     * @param view
     * @param doPreview
     */
    @ReactProp(name = "doPreview", defaultBoolean = true)
    public void previewController(RCTScanView view, Boolean doPreview) {

        if(!doPreview) {
            //关相机
            view.stopScan();
        }
    }


}
