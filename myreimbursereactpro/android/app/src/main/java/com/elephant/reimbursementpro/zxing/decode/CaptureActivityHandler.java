package com.elephant.reimbursementpro.zxing.decode;

import android.os.Handler;
import android.os.Message;

import com.elephant.reimbursementpro.R;
import com.elephant.reimbursementpro.rnInterface.RCTScanView;
import com.elephant.reimbursementpro.zxing.cameraSet.CameraManager;


public final class CaptureActivityHandler extends Handler {

	DecodeThread decodeThread = null;
	//CaptureActivity activity = null;
	RCTScanView scanView = null;
	private State state;



	private enum State {
		PREVIEW, SUCCESS, DONE
	}

	public CaptureActivityHandler(RCTScanView scanView) {
		//this.activity = activity;
		this.scanView = scanView;
		decodeThread = new DecodeThread(scanView);
		decodeThread.start();
		state = State.SUCCESS;
		//2017.10.23修改，创建完不立即开启，通过发送消息开启
		/*CameraManager.get().startPreview();
		restartPreviewAndDecode();*/
	}

	@Override
	public void handleMessage(Message message) {

		switch (message.what) {
		case R.id.auto_focus:
			if (state == State.PREVIEW) {
				CameraManager.get().requestAutoFocus(this, R.id.auto_focus);
			}
			break;
		case R.id.restart_preview:
			CameraManager.get().startPreview();
			restartPreviewAndDecode();
			break;
		case R.id.decode_succeeded:
			state = State.SUCCESS;
			scanView.handleDecode((String) message.obj);// 解析成功，回调
			break;

		case R.id.decode_failed:
			state = State.PREVIEW;
			CameraManager.get().requestPreviewFrame(decodeThread.getHandler(),
					R.id.decode);
			break;
		case R.id.pause_scan:
			state = State.SUCCESS;
			break;
		case R.id.save_img:
			break;

		}

	}

	public void quitSynchronously() {
		state = State.DONE;
		CameraManager.get().stopPreview();
		removeMessages(R.id.decode_succeeded);
		removeMessages(R.id.decode_failed);
		removeMessages(R.id.decode);
		removeMessages(R.id.auto_focus);
		removeMessages(R.id.save_img);
	}

	public void release() {
		decodeThread.getHandler().sendEmptyMessage(R.id.release);
	}

	private void restartPreviewAndDecode() {
		if (state == State.SUCCESS) {
			state = State.PREVIEW;
			CameraManager.get().requestPreviewFrame(decodeThread.getHandler(),
					R.id.decode);
			//CameraManager.get().requestAutoFocus(this, R.id.auto_focus);
			mCameraAutoFocusHandler.sendEmptyMessageDelayed(MSG_DO_AUTO_FOCUS, 3000);
		}
	}

	private final int MSG_DO_AUTO_FOCUS = 1;

	private final Handler mCameraAutoFocusHandler = new Handler() {
		@Override
		public void handleMessage(Message msg) {
			switch (msg.what) {
				case MSG_DO_AUTO_FOCUS:
					CameraManager.get().requestAutoFocus(CaptureActivityHandler.this, R.id.auto_focus);
					break;
			}
		}
	};

}
