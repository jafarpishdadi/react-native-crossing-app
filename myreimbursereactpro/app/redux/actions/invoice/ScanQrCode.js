import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';
import {back} from './../navigator/Navigator';
import Message from '../../../constant/Message';
import {navigateToNewOrEditInvoicePage} from '../navigator/Navigator';

export const changeState = (state) => {
    return {
        type: types.SCAN_QRCODE_CHANGE_STATE,
        state: state,
    }
}

export const initData = () => {
    return {
        type: types.SCAN_QRCODE_INIT_STATE,
    }
}

export const readQrCode = (requestData, params) => {
    return (dispatch) => {
        dispatch(changeState({
            isLoading: true,
        }));
        return HttpUtil.postJson(API.COLLECT_BY_QRCODE, requestData, dispatch, function (ret, status) {

            dispatch(changeState({
                isLoading: false,
            }));
            if (status) {
                dispatch(navigateToNewOrEditInvoicePage(ret, true, params));
            } else {
                Util.showToast(Message.SCAN_QR_CODE_SCAN_FAILED);
                dispatch(changeState({readQrCodeEnable: true}));
            }
        })
    }
}

export const validateQrCode = (qrCode) => {
    return {
        type: types.SCAN_QRCODE_READ_QRCODE,
        qrCode: qrCode,
    }
}




