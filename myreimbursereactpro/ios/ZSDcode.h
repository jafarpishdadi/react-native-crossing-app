#ifndef ZSDCODE_H
#define ZSDCODE_H
#define ZSDCODE_VERSION        "1.4.4"


#if !defined(ZSDCODE_LIB)
#define ZSDCODE_API 
#else

#ifdef WIN32

#ifdef ZSDCODE_EXPORTS
#define ZSDCODE_API __declspec(dllexport)
#else
#define ZSDCODE_API __declspec(dllimport)
#endif //ZSDCODE_EXPORTS

#else
//#define ZSDCODE_API __declspec(dllexport)
#define ZSDCODE_API __attribute__ ((visibility("default"))) 
//#define DLLLOCAL __attribute__ ((visibility("hidden")))
#endif // WIN32
#endif //ZSDCODE_LIB


// API error values
#define ZSDCODE_OK                       0
#define ZSDCODE_INVALID_INPUT            1
#define ZSDCODE_IMAGE_NOT_SUPPORTED      2
#define ZSDCODE_IMAGE_SIZE_TOO_BIG       3
#define ZSDCODE_NOT_INITIALIZED          4
#define ZSDCODE_DECODE_DONE              5
#define ZSDCODE_DECODE_FAIL              6
#define ZSDCODE_INVALID_DEVICE           7
#define ZSDCODE_INTERNAL_ERROR           10
#define ZSDCODE_BUFFER_SIZE_NOT_ENOUGH   11
#define ZSDCODE_JNI_ERROR				   20

typedef int ZSDCODE_STATUS;

//Formats for input image data pixel
#define IMAGE_RGB24     1
#define IMAGE_GRAY      3
#define IMAGE_YUYV      5
#define IMAGE_YUV420    6
#define IMAGE_RGBA8     7

//IMAGE_MODE_xxx | IMAGE_RGB24
#define IMAGE_MODE_MIRROR       (0x01 << 16)

#define SAVE_DECODE_IMG         (0x01 << 3)

// value of  decodeResID in DECODE_DATA struct
#define RESID_UNKNOWN           0  //unknown eror
#define RESID_SUCCESS           1  //decoded successfully 
#define RESID_NOT_DET_CODE      3  //no bar code detected
#define RESID_DET_CODE          4  //bar code detected but not decoded
#define RESID_LIGHT_OFF         100
#define RESID_LIGHT_ON          101

/**
 * Bar codes type ID number
 * returned from codeTypeID of DECODE_DATA if decoded successfully
 * 
 */
typedef enum symbology_id 
{ 
    ID_NULL = 0, 
    ID_QR = 1, 
    ID_CS = 2, 
    ID_DM = 3, 
    ID_PDF417 = 4, 
    ID_AZTEC =5 , 
    ID_MICROQR =6, 
    ID_MICROPDF417 =7,
    ID_GM  =30,
    ID_UPCE = 8, 
    ID_UPCA =9 , 
    ID_EAN8 = 10, 
    ID_EAN13 = 11, 
    ID_CODE128 = 12, 
    ID_CODE39 = 13, 
    ID_ITF = 14, //Interleaved 2 of 5 
    ID_CODE93 = 16, 
    ID_CODABAR = 17, 
    ID_MATRIX25 = 18, 
    ID_INDUSTRIAL25 = 19, //Standard 2 of 5 
    ID_CODE11 = 20, 
    ID_MSI = 21, 
    ID_DATABAR_OMNI = 22, //GS1 DataBar Omni-Directional (RSS14) 
    ID_DATABAR_LIMITED = 23, 
    ID_DATABAR_EXPANDED = 24, 
    ID_PLESSEY = 25, 
    ID_CHINAPOST = 26, 
    ID_CODE32 = 27 
}SYMBOLOGY_ID; 


typedef enum _PropertyNum
{
    MAX_FRAME_BUFFER_SIZE = 2,
    MAX_FRAME_COL_RES = 3,
    MAX_FRAME_ROW_RES = 4,
    LIB_VER = 5//string
}PropertyNum;

typedef struct _RawData
{
    unsigned char  *pBuffer;
    unsigned short  width;
    unsigned short  height;
    unsigned int    dataFormat; 
    unsigned char   reserved;
} RAW_DATA;

typedef struct _LabelPosition
{
    unsigned short area_x;
    unsigned short area_y;
    unsigned short area_w;
    unsigned short area_h;
    unsigned short point[4][2];
    unsigned short  reserved[4];
} LABEL_POSITION;


#define  MAX_RESULT_LEN 4096
typedef struct _DecodeData
{
    /**
	 * Result of decoding
     */
    unsigned int   decodeResID;
    /**
	 * Code type id defined in SYMBOLOGY_ID
     */
    unsigned int   codeTypeID;
    /**
	 * Information about bar code location
     */
    LABEL_POSITION labelPosition;
    /**
	 * decoded data length
     */
    unsigned int   nBytesInData;
    /**
	 * decoded data
     */
    unsigned char  decodeData[MAX_RESULT_LEN];
    unsigned int   reserved[2];
}DECODE_DATA;

#ifdef __cplusplus
extern "C" {
#endif

//Initialize decoder settings. MUST be called before decode image
//return API error values
ZSDCODE_API 
ZSDCODE_STATUS Initialize(char  *resourcePath, unsigned char *pStatus);

ZSDCODE_API ZSDCODE_STATUS Initialize2(void);
    
ZSDCODE_API ZSDCODE_STATUS SetSaveImagePath(const char* path);
//Free resources. MUST be called when not to decode at all
ZSDCODE_API ZSDCODE_STATUS Deinitialize(void);

ZSDCODE_API int Certificate(unsigned char * idd, int iddlen);


//get decoder version
ZSDCODE_API ZSDCODE_STATUS GetDecoderVersion(unsigned char* pOutputBuffer,
                                             unsigned int nSizeOfOutputBuffer,
                                             unsigned int *pnBytesReturned);
//get api lib version
ZSDCODE_API ZSDCODE_STATUS GetLibVersion(unsigned char* pOutputBuffer,
                                         unsigned int nSizeOfOutputBuffer,
                                         unsigned int *pnBytesReturned);

/**
* Decode from raw image data
*
* @param[in]  pRawData               pointer to RAW_DATA
* @param[out] pDecodeData            array of decode data struct DECODE_DATA
* @param[in]  nMaxDecodeDataNum      array size
* @param[in]  reserved               
*
* @return 
* ZSDCODE_DECODE_DONE        if decoded successfully
* other ZSDCODE_STATUS value if decoded failed
*/
ZSDCODE_API 
ZSDCODE_STATUS DecodeRawData(RAW_DATA *pRawData,
                             DECODE_DATA pDecodeData[],
                             unsigned int nMaxDecodeDataNum,
                             unsigned int reserved);

/**
* Write config parameter value
* the setting will write to config file zd.cfg
*
* @return 
* ZSDCODE_OK if successful 
* ZSDCODE_INTERNAL_ERROR if the specified parameter number or value is invalid.
*/
ZSDCODE_API ZSDCODE_STATUS SetupWrite(unsigned char* pInputBuffer,
                                      unsigned int nBytesInInputBuffer);

/**
* Read config parameter value
*
* @return 
* ZSDCODE_OK if successful 
* ZSDCODE_INTERNAL_ERROR if the specified parameter number or value is invalid.
*/
ZSDCODE_API ZSDCODE_STATUS SetupRead(unsigned char pid,
                                     unsigned char fid,
                                     unsigned char *pValueBuffer, 
                                     unsigned int  nSizeOfValueBuffer, 
                                     unsigned int  *pnBytesReturned);


/**
* Setup multiple decode session
*
* @param[in] active      1 for enable  multiple decode or 0 for disable
* @param[in] multi_num   setup multiple decode count for one multiple decode session (2-6)
*
* @return
* ZSDCODE_OK              if set successfully
* ZSDCODE_INTERNAL_ERROR  if failed set 
* ZSDCODE_INVALID_INPUT   input value not valid
*/
ZSDCODE_API ZSDCODE_STATUS SetupMultiCode(int active, int multi_num);

/**
* Setup decode work mode
*
* @param[in] mode   the value of work mode
*                   0 for normal  1 for sensor mode
*
* @return
* ZSDCODE_OK              if set successfully
* ZSDCODE_INTERNAL_ERROR  if failed set 
* ZSDCODE_INVALID_INPUT   input value not valid
*/
ZSDCODE_API ZSDCODE_STATUS SetWorkMode(int mode);
/**
 * Enables all code types
 */
ZSDCODE_API void EnableAllCodeTypes(void);

/**
 * Disables all code types
 */
ZSDCODE_API void DisableAllCodeTypes(void);


/**
 * Sets all bar code reader parameters to their default values.
 */
ZSDCODE_API void SetDefaultParameters(void);

#ifdef __cplusplus
}
#endif

#endif
