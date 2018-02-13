import {
    Animated,
} from 'react-native';

import * as types from '../../../constant/ActionTypes';

const initialState = {
    isLoading:false,
    readQrCodeEnable:true,                  //扫描flag
    fadeInOpacity: new Animated.Value(0),   // 初始值
    isEndAnimation: false,                  //结束动画标记
    qrCodeInfo:'' ,                          //二维码数据

    cameraPermission: '',                   //相机权限
    showNoPermissionDialog: false,          //是否显示没有权限对话框
}

const scanQrCodeReducer = (state = initialState, action) => {
    switch (action.type) {

        case types.SCAN_QRCODE_INIT_STATE:
            return initialState
        case types.SCAN_QRCODE_CHANGE_STATE:
            return {...state, ...action.state}
        case types.SCAN_QRCODE_READ_QRCODE:
            return {...state, qrCodeInfo:action.qrCode}
        default:
            return state;
    }
}

export default scanQrCodeReducer;