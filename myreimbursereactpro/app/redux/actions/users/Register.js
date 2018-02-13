/**
 * Created by Richard.ji on 2017/10/30.
 */

import * as types from '../../../constant/ActionTypes';
import {navigateRegisterPassword} from '../../actions/navigator/Navigator';
import {changeState as changePasswordState} from './RegisterPassword';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';

export const registerAction = (requestData) => {
    // return (dispatch) => {
    //     dispatch(navigateRegister);
    //     dispatch(navigateRegisterPassword());
    // }
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }));
        return HttpUtil.postJson(API.GET_VALIDATION_COMPARE, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false,
            }));
            if (status) {
                if (ret.status) {
                    dispatch(changePasswordState({registerPhone: requestData.phoneNumber}));
                    dispatch(navigateRegisterPassword());
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const getValidationCode = (requestData, callback) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }));
        return HttpUtil.postJson(API.GET_VALIDATION_CODE, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false,
            }));
            if (status) {
                if (ret.status) {
                    callback(ret.status);
                    Util.showToast(Message.REGISTER_VALIDATION_CODE_SENT);
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}


export const navigateRegister = () => {
    return {
        type: types.NAVIGATOR_REGISTER
    }
}

export const changeState = (state) => {
    return {
        type: types.NAVIGATOR_REGISTER_CHANGE_STATE,
        state
    }
}

export const registerInit = () => {
    return dispatch => {
        dispatch(changeState({
            registerPhoneNumber: "",
            registerVerificationCode: "",
            timeCount: 60,
            text: Message.GET_VERIFICATION_CODE,
            btnDisable: false,
            timeFlag: true,
        }))
    }
}