package com.elephant.reimbursementpro.zxing.decode;

import android.os.Handler;
import android.os.Looper;

import com.elephant.reimbursementpro.rnInterface.RCTScanView;

import java.util.concurrent.CountDownLatch;


/**
 *
 * 描述: 解码线程
 */
final class DecodeThread extends Thread {

	//CaptureActivity activity;
	RCTScanView scanView;
	private Handler handler;
	private final CountDownLatch handlerInitLatch;

	DecodeThread(RCTScanView scanView) {
		//this.activity = activity;
		this.scanView = scanView;
		handlerInitLatch = new CountDownLatch(1);
	}



	Handler getHandler() {
		try {
			handlerInitLatch.await();
		} catch (InterruptedException ie) {

		}
		return handler;
	}

	@Override
	public void run() {
		Looper.prepare();
		handler = new DecodeHandler(scanView);
		handlerInitLatch.countDown();
		Looper.loop();
	}

}
