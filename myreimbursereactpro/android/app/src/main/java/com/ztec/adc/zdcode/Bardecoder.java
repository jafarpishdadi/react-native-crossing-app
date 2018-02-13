package com.ztec.adc.zdcode;

import java.io.UnsupportedEncodingException;
import java.nio.IntBuffer;
import java.util.Arrays;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Log;

public class Bardecoder 
{
	private static final String TAG = "Bardecoder";
	
	/**
	 * Bardecoder returned msg error values
	 */
	public static final int BARDECODE_OK			           = 0;
	public static final int BARDECODE_INVALID_INPUT            = 1;
	public static final int BARDECODE_IMAGE_NOT_SUPPORTED      = 2;
	public static final int BARDECODE_IMAGE_SIZE_TOO_BIG       = 3;
	public static final int BARDECODE_NOT_INITIALIZED          = 4;
	public static final int BARDECODE_DECODE_DONE              = 5;
	public static final int BARDECODE_DECODE_FAIL              = 6;
	public static final int BARDECODE_INVALID_DEVICE           = 7;
	public static final int BARDECODE_INTERNAL_ERROR           = 10;
	public static final int BARDECODE_JNI_ERROR				   = 20;

    /*
        Save decode image data to bmp file
        Used for RawData.reserved
    */
    public static final int OPTION_SAVE_IMAGE                  = (0x01 << 3);
	/**
	 * Image format type ID
	 */
	public static class ImageType
	{
		
		public static final int RGB24		= 1;
		public static final int RGB565	    = 2;
		public static final int GRAY		= 3;
		public static final int YUYV        = 5;
		public static final int YUY420      = 6;
	}
	
	public static class RawData
	{
		public byte[]  pBuffer;
		public short  width;
		public short  height;
		public int    dataFormat; 
		public short   reserved;
	    public RawData() {
            pBuffer = null;
            width = 0;
            height = 0;
            dataFormat = 0;
            reserved = 0;
		}
	    
	    public RawData(byte[] imgdata,
	    		       short  imgw,    		           
	                   short  imgh,
	                   int    dataformat,
	                   short   rsvd)
		{
	    	pBuffer = imgdata;
	    	width = imgw;
	    	height = imgh;
	    	dataFormat = dataformat;
	    	reserved = rsvd;
		}
	}
	
	/**
	 * Decoded info object include result no, data if success
	 * 
	 */
	public static class DecodeData
	{
		//decode result id
		public static final int RESID_UNKNOWN		= 0;
		public static final int RESID_SUCCESS		= 1;
		public static final int RESID_NOT_DET_CODE	= 2;
		public static final int RESID_DET_CODE		= 3;
		
		//decode result id number
		public int   	decodeRes;
		//barcode type
		public int   	codeType;
	    //decode raw data
		public byte[] 	decodeData;
		public int[] 	reserved;
	    public DecodeData(int  res, 
	    		           int  codetype,	    		           
	    		           byte[] decodedata)
	    {
	    	decodeRes = res;
	    	codeType = codetype;
	    	decodeData = Arrays.copyOf(decodedata, decodeData.length);
	    }
		public DecodeData() {
			//  Auto-generated constructor stub
		}
	}
	
	/**
	 * Initialize decoder settings. MUST be called before decode image
	 * 
	 * @return Bardecoder returned msg error values 
	 */
	public int init()
	{
		int ret = Initialize();
		Log.i(TAG, "init ret " + String.valueOf(ret));
		
		return ret;
	}
	
	/**
	 * Disconnects and releases the Bardecoder object resources.
	 *
	 * <p>You must call this as soon as you're done with the Bardecoder object.</p>
	 * MUST be called when not to decode at all
	 */
	public final void release()
	{
		Deinitialize();
	}
	
	protected void finalize() {
        //release();
		Deinitialize();
    }


	private RawData toRawGrayByte(String pathname)
	{
		BitmapFactory.Options opt = new BitmapFactory.Options();
		opt.inMutable = true;
		opt.inPreferredConfig = Bitmap.Config.ARGB_8888;
        RawData grayImg = new RawData();
		Bitmap picBitmap = null;

		try {
			// 实例化Bitmap
			picBitmap = BitmapFactory.decodeFile(pathname,opt);
		} catch (OutOfMemoryError e) {
			Log.d(TAG,"toRawGrayByte OutOfMemoryError");
			return grayImg;
		}

		if(picBitmap != null)
		{
			int img_h = picBitmap.getHeight();
			int img_w = picBitmap.getWidth();
			Bitmap.Config config = picBitmap.getConfig();
			Log.d(TAG,"decodeFile img w "+ img_w +" img_h " + img_h + " config " + config);
			IntBuffer rawBuffer = IntBuffer.allocate(img_h * img_w);
			picBitmap.copyPixelsToBuffer(rawBuffer);
			int[] rawRGB = rawBuffer.array();
			byte[] imgGray = new byte[img_w * img_h];
			double r,g,b;
			int gray;
			double redCoefficient = 0.2125, greenCoefficient = 0.7154, blueCoefficient = 0.0721;
			for (int i = 0; i < img_w * img_h; i++) {
				// 计算灰度值
				r = rawRGB[i] >> 16 & 0xFF;
				g = rawRGB[i] >> 8 & 0xFF;
				b = rawRGB[i] & 0xFF;
				gray = (int)(r*redCoefficient+g*greenCoefficient+b*blueCoefficient);

				imgGray[i] = (byte) gray;
			}
            grayImg.width = (short)img_w;
            grayImg.height = (short)img_h;
            grayImg.pBuffer = imgGray;
            grayImg.dataFormat = ImageType.GRAY;

			//recycle the source bitmap, this will be no longer used.
			picBitmap.recycle();

		}
		else
		{
			Log.d(TAG,"toRawGrayByte decodeFile null");
		}
		return grayImg;
	}
	
	private final native int Initialize();	
	/**
	 * Free resources. MUST be called when not to decode at all
	 * 
	 * @return Bardecoder returned msg error values
	 */
	private final native int Deinitialize();
	
	/**
	 * Decode image data 
	 * 
	 * @param raw_data  decode input obj of RawData
	 * @param DecodeData   decoded info object
	 * 
	 * @return  Bardecoder returned msg error values 
	 */	
	public final native int DecodeRawData(RawData raw_data, DecodeData dec_data);
	
	/**
	 * Decode image data 
	 * 
	 * @param img     image raw data bytes
	 * @param width   image width
	 * @param height  image height
	 * @param imgfmt  image format defined in class ImageType
	 * @param decodeDataBuffer  [INOUT] filed raw bytes decoded successfully 
	 * @param buffersize   decodeDataBuffer size
	 * 
	 * @return  returned msg error values 
	 */	
	public final native int DecodeRawDataByte(byte[] img, int width, int height, int imgfmt, 
			                                  byte[] decodeDataBuffer, int buffersize);

	/**
	 * Get decoder lib version 
	 * 
	 * 
	 * @return  string of version number 
	 */
	public final native String getZDcodeLibVersion();
	
	/**
	 * Get decode engine version
	 * 
	 * 
	 * @return  string of version number 
	 */
	public final native String getDecoderVersion();
	
	/**
	 * Wrapper of  DecodeRawDataByte return decode data String
	 * 
	 * @param img     image raw data bytes
	 * @param width   image width
	 * @param height  image height
	 * @param imgfmt    image format defined in class ImageType
	 * 
	 * @return  returned decoded data string or empty data 
	 */	
	public String Decode_toString(byte[] img, int width, int height, int imgfmt) 
			throws UnsupportedEncodingException 
	{
		byte[] decdata = new byte[4096];
	    int ret = DecodeRawDataByte(img, width, height, imgfmt,decdata,4096);
	    
	    Log.d(TAG, "Decode ret "+ String.valueOf(ret));
		if(ret == BARDECODE_DECODE_DONE)
		{
			int i = 0;
			while(decdata[i] != 0) i++;
			//decode success			
			return new String(decdata,0, i, "GBK");
		}
		return new String("");
	}

    /**
     * Wrapper of  DecodeRawDataByte return decode data String
     *
     * @param img     image raw data bytes
     * @param width   image width
     * @param height  image height
     * @param imgfmt    image format defined in class ImageType
     * @param reserved    reserve option setting
     *                    default to be 0
     *                    others to be OPTION_SAVE_IMAGE
     *
     * @return  returned decoded data string or empty data
     */
    public String Decode_toString2(byte[] img, int width, int height, int imgfmt, short reserved)
			throws UnsupportedEncodingException 
	{
		RawData rd = new RawData(img, (short)width, (short)height,imgfmt,(short)reserved);
		DecodeData dd = new DecodeData();
	    int ret = DecodeRawData(rd,dd);
	    
	    Log.d(TAG, "Decode ret "+ String.valueOf(ret));
		if(ret == BARDECODE_DECODE_DONE)
		{
			int i = 0;

			//decode success			
			return new String(dd.decodeData,0, dd.decodeData.length, "GBK");
		}
		return new String("");
	}

    /**
     * Decode from image file  of  DecodeRawDataByte return decode data String
     *
     * @param imgPath     image raw data bytes
     * @param reserved    reserve option setting
     *                    default to be 0
     *                    others to be OPTION_SAVE_IMAGE
     *
     * @return  returned decoded data string or empty data
     */
	public String DecodeImageFile_toString2(String imgPath, short reserved)
			throws UnsupportedEncodingException
	{
		RawData rd = toRawGrayByte(imgPath);
		DecodeData dd = new DecodeData();
        rd.reserved = reserved;
        if (rd.pBuffer == null)
        {
            Log.d(TAG, "Get image data failed");
            return new String("");
        }

		int ret = DecodeRawData(rd,dd);

		Log.d(TAG, "Decode ret "+ String.valueOf(ret));
		if(ret == BARDECODE_DECODE_DONE)
		{
			int i = 0;

			//decode success
			return new String(dd.decodeData,0, dd.decodeData.length, "GBK");
		}
		return new String("");
	}
}
