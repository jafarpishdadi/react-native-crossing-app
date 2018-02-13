/**
 * Created by Richard.ji on 2017/11/10.
 */

import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';
import {navigateCreateNewPassword} from '../../actions/navigator/Navigator';

export const changeState = (state) => {
    return {
        type: types.FIND_PASSWORD_CHANGE_STATE,
        state
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

export const createNewPasswordAction = (requestData) => {
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
                    dispatch(navigateCreateNewPassword({
                        findPasswordPhone: requestData.phoneNumber
                    }));
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const findPasswordInit = () => {
    return dispatch => {
        dispatch(changeState({
            findPasswordPhone: "",
            findPasswordVerificationCode: "",
            timeCount: 60,
            text: Message.GET_VERIFICATION_CODE,
            btnDisable: false,
            timeFlag: true,
        }))
    }
}