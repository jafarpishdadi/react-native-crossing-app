package com.elephant.reimbursementpro.rnInterface;

/**
 * Created by Denny.liu on 2017/7/3.
 */

public interface RCTScanViewListener {

    /**
     * 扫描结果通知
     *
     * @param scanView
     * @param qrCode
     */
    public void onScanResult(RCTScanView scanView, String qrCode);

    /**
     * 手动输入
     *
     * @param scanView
     */
    public void onInputPress(RCTScanView scanView);
}
