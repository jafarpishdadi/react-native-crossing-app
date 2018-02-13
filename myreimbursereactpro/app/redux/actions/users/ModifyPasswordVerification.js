/**
 * Created by Richard.ji on 2017/11/10.
 */

import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';

export const changeState = (state) => {
    return {
        type: types.MODIFY_PASSWORD_VERIFICATION_CHANGE_STATE,
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

export const modifyPasswordVerificationInit = () => {
    return dispatch => {
        dispatch(changeState({
            // modifyPasswordPhone : phoneNumber,
            modifyPasswordVerificationCode: "",
            text: Message.GET_VERIFICATION_CODE,   //获取与验证码的文本
            btnDisable: false,                      //按钮是否可以再次点击
            timeCount: 60,                          //倒计时文本
            timeFlag: true,                         //是否可以重新发送验证码
        }))
    }
}