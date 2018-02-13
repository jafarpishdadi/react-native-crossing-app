package com.elephant.reimbursementpro.zxing.decode;

import android.graphics.Bitmap;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.util.Log;

import com.elephant.reimbursementpro.R;
import com.elephant.reimbursementpro.rnInterface.RCTScanView;
import com.elephant.reimbursementpro.zxing.cameraSet.CameraManager;
import com.ztec.adc.zdcode.Bardecoder;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;


final class DecodeHandler extends Handler {
	static {

		System.loadLibrary("zdcode");
	}
	//CaptureActivity activity = null;
	RCTScanView scanView = null;
	Bardecoder bardecoder;
	DecodeHandler(RCTScanView scanView) {
		//this.activity = activity;
		this.scanView = scanView;
		bardecoder = new Bardecoder();
		bardecoder.init();
	}

	@Override
	public void handleMessage(Message message) {
		switch (message.what) {
		case R.id.decode:
			decode((byte[]) message.obj, message.arg1, message.arg2);
			break;
		case R.id.quit:
			Looper.myLooper().quit();
			break;
		case R.id.release:
			bardecoder.release();
			break;
		}
	}


	private void decode(byte[] data, int width, int height) {

		Log.d("DecodeHandler","decode width" + width + "height" + height);

		//下面为竖屏模式
		byte[] rotatedData = new byte[data.length];
		for (int y = 0; y < height; y++) {
			for (int x = 0; x < width; x++)
				rotatedData[x * height + height - y - 1] = data[x + y * width];
		}
		int tmp = width;// Here we are swapping, that's the difference to #11
		width = height;
		height = tmp;



		Log.d("DecodeHandler","rotatedData width" + width + "height" + height);
		Log.d("DecodeHandler","rotatedData width" + width + "height" + height);
		PlanarYUVLuminanceSource source = CameraManager.get().buildLuminanceSource(rotatedData, width, height,
				scanView.getX2(), scanView.getY2(), scanView.getCropWidth(),scanView.getCropHeight());

/*		long time= System.currentTimeMillis();

		String SS="123.jpg";
		try {
			saveBitmap(source.renderCroppedGreyscaleBitmap(),SS);  //保存图片
		} catch (IOException e) {
			e.printStackTrace();
		}*/
		try {


			String result1= bardecoder.Decode_toString(source.getMatrix(),source.getWidth(),source.getHeight(),3);
			if (result1.length() != 0) {  //null
				if(null != scanView.getHandler()){
					Message msg = new Message();
					msg.obj = result1;
					msg.what = R.id.decode_succeeded;
					scanView.getHandler().sendMessage(msg);
				}
			} else {
				if (null != scanView.getHandler()) {
					scanView.getHandler().sendEmptyMessage(R.id.decode_failed);
				}
			}
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}

	}


	public void saveBitmap(Bitmap bitmap, String bitName) throws IOException
	{
		File file = new File("/sdcard/zdcode/img/"+bitName);
		if(file.exists()){
			file.delete();
		}
		FileOutputStream out;
		try{
			out = new FileOutputStream(file);
			if(bitmap.compress(Bitmap.CompressFormat.JPEG, 100, out))
			{
				out.flush();
				out.close();
			}
		}
		catch (FileNotFoundException e)
		{
			e.printStackTrace();
		}
		catch (IOException e)
		{
			e.printStackTrace();
		}
	}


}
