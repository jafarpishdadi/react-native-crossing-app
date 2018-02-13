package com.elephant.reimbursementpro.rnInterface;

import android.Manifest;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.content.res.AssetFileDescriptor;
import android.graphics.Canvas;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Handler;
import android.os.Vibrator;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.util.Log;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.elephant.reimbursementpro.MainActivity;
import com.elephant.reimbursementpro.zxing.cameraSet.CameraManager;
import com.elephant.reimbursementpro.zxing.decode.CaptureActivityHandler;
import com.elephant.reimbursementpro.zxing.decode.InactivityTimer;
import com.elephant.reimbursementpro.R;

import java.io.IOException;


/**
 * Created by Denny.liu on 2017/7/3.
 */

public class RCTScanView extends LinearLayout implements SurfaceHolder.Callback {

    private Context mContext;
    private Activity mActivity;

    private CaptureActivityHandler handler;
    private boolean hasSurface;
    private InactivityTimer inactivityTimer;
    private MediaPlayer mediaPlayer;
    private boolean playBeep;
    private static final float BEEP_VOLUME = 0.50f;
    private boolean vibrate;
    private int x = 0;  //扫描框距离手机左边距left
    private int y = 0;  //扫描框距离手机上边距top
    private int cropWidth = 0;  //扫描框宽度width
    private int cropHeight = 0; //扫描框高度height
    private RelativeLayout mContainer = null;
    private RelativeLayout mCropLayout = null;
    private TextView inputBtn;
    private TextView res_view;
    private View loading_view;
    private Button save_picture;
    private boolean permitScan;   //是否开启扫码

    private RCTScanViewListener scanResultListener;

    public int getX2() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY2() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }

    public int getCropWidth() {
        return cropWidth;
    }

    public void setCropWidth(int cropWidth) {
        this.cropWidth = cropWidth;
    }

    public int getCropHeight() {
        return cropHeight;
    }

    public void setCropHeight(int cropHeight) {
        this.cropHeight = cropHeight;
    }

    public RCTScanView(Context context, Activity activity,RCTScanViewListener scanResultListener) {
        super(context);
        mContext = context;
        mActivity = activity;
        this.scanResultListener = scanResultListener;
        init();
    }

    private void init() {
        //setOrientation(VERTICAL);
        View rootView = inflate(mContext, R.layout.activity_capture_empty, this);

        // 初始化 CameraManager
        CameraManager.init(mContext.getApplicationContext());
        hasSurface = false;
        //inactivityTimer = new InactivityTimer(this);
        res_view=(TextView) findViewById(R.id.textview_result);
        loading_view = findViewById(R.id.loading_view);

        mContainer = (RelativeLayout) findViewById(R.id.capture_containter);
        mCropLayout = (RelativeLayout) findViewById(R.id.capture_crop_layout);
        inputBtn = (TextView) findViewById(R.id.textview);
        inputBtn.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View view) {
                if(scanResultListener != null) {
                    scanResultListener.onInputPress(RCTScanView.this);
                }
            }
        });

        /*ImageView mQrLineView = (ImageView) findViewById(R.id.capture_scan_line);
        ScaleAnimation animation = new ScaleAnimation(1.0f, 1.0f, 0.0f, 1.0f);
        animation.setRepeatCount(-1);
        animation.setRepeatMode(Animation.RESTART);
        animation.setInterpolator(new LinearInterpolator());
        animation.setDuration(1200);
        mQrLineView.startAnimation(animation);*/



/*        ImageView scanLine = (ImageView) findViewById(R.id.scan_line);
        TranslateAnimation translateAnimation = new TranslateAnimation(0,0,0,dip2px(mContext,200));
        translateAnimation.setRepeatCount(Animation.INFINITE);
        translateAnimation.setRepeatMode(Animation.RESTART);
        translateAnimation.setInterpolator(new LinearInterpolator());
        translateAnimation.setDuration(1600);
        scanLine.startAnimation(translateAnimation);*/

        //API22以上手机需要对camera 进行授权
        if (ContextCompat.checkSelfPermission(mContext, Manifest.permission.CAMERA)
                == PackageManager.PERMISSION_GRANTED) {
            Log.i("CaptureActivity","Granted");
            //init(barcodeScannerView, getIntent(), null);
        } else {
            ActivityCompat.requestPermissions(mActivity,
                    new String[]{Manifest.permission.CAMERA}, 1);//1 can be another integer
        }

    }

    public void setScanWidth(int value) {
        this.cropWidth = dip2px(mContext,value);
    }

    public void setScanHeight(int value) {
        this.cropHeight = dip2px(mContext,value);
    }

    public void setScanLeft(int value) {
        this.x = dip2px(mContext,value);
    }

    public void setScanTop(int value) {
        this.y = dip2px(mContext,value);
    }

    public int dip2px(Context context, float dpValue) {
        final float scale = context.getResources().getDisplayMetrics().density;
        return (int) (dpValue * scale + 0.5f);
    }

    public static final String CLOSE_CAMERA = "com.elephant.reimbursementpro.intentservice.CLOSE_CAMERA";

    private void registerReceiver()
    {
        IntentFilter filter = new IntentFilter();
        filter.addAction(CLOSE_CAMERA);
        mContext.getApplicationContext().registerReceiver(closeCameraReceiver, filter);
    }

    private BroadcastReceiver closeCameraReceiver = new BroadcastReceiver()
    {
        @Override
        public void onReceive(Context context, Intent intent)
        {

            if (intent.getAction() == CLOSE_CAMERA)
            {
                String action = intent.getStringExtra(MainActivity.CLOSE_CAMERA);

                handleResult(action);

            }
        }
    };

    private void handleResult(String action)
    {
        if("1".equals(action)) {
            //扫码准备
            initElseSetting();
        }else if("2".equals(action)){
            stopScan();
            //打开相机
            initElseSetting();
            //继续扫描
            restartScan();
        }else {
            //关闭相机，停止扫描
            stopScan();
        }
    }

    public void showTips(boolean visible) {
        View tipView = findViewById(R.id.textview);
        tipView.setVisibility(visible ? View.VISIBLE : View.GONE);
        //postInvalidate();
    }

    @Override
    protected void dispatchDraw(Canvas canvas) {
        super.dispatchDraw(canvas);
    }

    public void initElseSetting() {
        SurfaceView surfaceView = (SurfaceView) findViewById(R.id.capture_preview);
        SurfaceHolder surfaceHolder = surfaceView.getHolder();
        //surfaceView.setZOrderOnTop(true);

        if(!hasSurface) {
            surfaceHolder.addCallback(this);
            surfaceHolder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);
        }
//        playBeep = true;
//        AudioManager audioService = (AudioManager) mContext.getSystemService(mActivity.AUDIO_SERVICE);
//        if (audioService.getRingerMode() != AudioManager.RINGER_MODE_NORMAL) {
//            playBeep = false;
//        }
//        initBeepSound();
        playBeep = false;
        vibrate = true;


    }
 /*   public void startScan() {
        SurfaceView surfaceView = (SurfaceView) findViewById(R.id.capture_preview);
        SurfaceHolder surfaceHolder = surfaceView.getHolder();
        if (hasSurface) {
            initCamera(surfaceHolder);
        } else {
            surfaceHolder.addCallback(this);
            surfaceHolder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);
        }
        playBeep = true;
        AudioManager audioService = (AudioManager) mContext.getSystemService(mActivity.AUDIO_SERVICE);
        if (audioService.getRingerMode() != AudioManager.RINGER_MODE_NORMAL) {
            playBeep = false;
        }
        initBeepSound();
        vibrate = true;

    }*/



    public void restartScan() {
        SurfaceView surfaceView = (SurfaceView) findViewById(R.id.capture_preview);
        SurfaceHolder surfaceHolder = surfaceView.getHolder();
        if (hasSurface) {
            initCamera(surfaceHolder);
            if(handler != null) {
                // 连续扫描，不发送此消息扫描一次结束后就不能再次扫描
                handler.sendEmptyMessage(R.id.restart_preview);
            }else {
                System.out.println("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
                handler = new CaptureActivityHandler(RCTScanView.this);
                handler.sendEmptyMessage(R.id.restart_preview);
            }
        } else {
            System.out.println("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
            if(handler == null) {
                handler = new CaptureActivityHandler(RCTScanView.this);
            }
            surfaceHolder.addCallback(this);
            surfaceHolder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);
            handler.sendEmptyMessageDelayed(R.id.restart_preview,500L);
        }
    }

    public void pauseScan() {
        if (handler != null) {
            //停止扫描，仍然可以预览
            handler.sendEmptyMessage(R.id.pause_scan);
        }
    }

    public void stopScan() {
        if (handler != null) {
            //停止扫描
            handler.release();
            handler.quitSynchronously();
            handler = null;
        }
        //关相机
        CameraManager.get().closeDriver();
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        System.out.println("rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
        registerReceiver();
        //startScan();
        initElseSetting();
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        stopScan();
        mContext.getApplicationContext().unregisterReceiver(closeCameraReceiver);
    }

    public void handleDecode(String result) {

        //inactivityTimer.onActivity();
        playBeepSoundAndVibrate();
        //	Toast.makeText(getApplicationContext(), result, Toast.LENGTH_SHORT).show(); //显示数据
        //res_view.setText(result);   //将数据显示在Textview
        if(scanResultListener != null) {
            scanResultListener.onScanResult(RCTScanView.this, result);
        }
        // 连续扫描，不发送此消息扫描一次结束后就不能再次扫描
        //handler.sendEmptyMessage(R.id.restart_preview);
    }

    private void initCamera(SurfaceHolder surfaceHolder) {
        try {
            CameraManager.get().openDriver(surfaceHolder);

            /*//设置扫描区域
            int x = mCropLayout.getLeft();
            int y = mCropLayout.getTop();
            int cropWidth = mCropLayout.getWidth();
            int cropHeight = mCropLayout.getHeight();
            setX(x);
            setY(y);
            setCropWidth(cropWidth);
            setCropHeight(cropHeight);*/
        } catch (IOException ioe) {
            return;
        } catch (RuntimeException e) {
            return;
        }
        if (handler == null) {
            handler = new CaptureActivityHandler(RCTScanView.this);
        }
    }

    private int lastWidth,lastHeight;

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width,
                               int height) {
        if(lastWidth != width || lastHeight != height) {
            lastWidth = width;
            lastHeight = height;
            initCamera(holder);
        }
        System.out.println("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee:  " + width + "    " + height);
    }

    @Override
    public void surfaceCreated(SurfaceHolder holder) {
/*        Bitmap bitmap = BitmapFactory.decodeResource(getResources(), R.drawable.scan_mask);
        Canvas canvas = holder.lockCanvas();
        if(canvas != null) {
            RectF rectF = new RectF(0, 0, this.getWidth(), this.getHeight());
            canvas.drawBitmap(bitmap, null, rectF, null);
            holder.unlockCanvasAndPost(canvas);
        }*/
        System.out.println("fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
        if (!hasSurface) {
            hasSurface = true;
            initCamera(holder);
        }
        //initCamera(holder);
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {
        System.out.println("gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg");
        hasSurface = false;
        //loading_view.setVisibility(View.VISIBLE);
    }

    public Handler getHandler() {
        return handler;
    }

    private void initBeepSound() {
        if (playBeep && mediaPlayer == null) {
            mActivity.setVolumeControlStream(AudioManager.STREAM_MUSIC);
            mediaPlayer = new MediaPlayer();
            mediaPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC);
            mediaPlayer.setOnCompletionListener(beepListener);

            AssetFileDescriptor file = getResources().openRawResourceFd(
                    R.raw.beep);
            try {
                mediaPlayer.setDataSource(file.getFileDescriptor(),
                        file.getStartOffset(), file.getLength());
                file.close();
                mediaPlayer.setVolume(BEEP_VOLUME, BEEP_VOLUME);
                mediaPlayer.prepare();
            } catch (IOException e) {
                mediaPlayer = null;
            }
        }
    }

    private static final long VIBRATE_DURATION = 200L;

    private void playBeepSoundAndVibrate() {
        if (playBeep && mediaPlayer != null) {
            mediaPlayer.start();
        }
        if (vibrate) {
            Vibrator vibrator = (Vibrator) mContext.getSystemService(mContext.VIBRATOR_SERVICE);
            vibrator.vibrate(VIBRATE_DURATION);
        }
    }

    private final MediaPlayer.OnCompletionListener beepListener = new MediaPlayer.OnCompletionListener() {
        public void onCompletion(MediaPlayer mediaPlayer) {
            mediaPlayer.seekTo(0);
        }
    };
}
