/**
 * Created by Richard.ji on 2017/11/7.
 */

import * as types from '../../../constant/ActionTypes';
import {navigateModifyPassword, backLogin} from '../../actions/navigator/Navigator';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';
import Store from 'react-native-simple-store';

export const modifyPasswordAction = (requestData) => {
    return (dispatch) => {
        dispatch(changeState({
            isLoading: true,
        }));
        return HttpUtil.postJson(API.GET_VALIDATION_COMPARE, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false,
            }));
            if (status) {
                if (ret.status) {
                    dispatch(navigateModifyPassword({
                        phoneNumber: requestData.phoneNumber
                    }));
                } else {
                    Util.showToast(ret.message);
                }
            }
        })

    }
}

export const changeState = (state) => {
    return {
        type: types.MODIFY_PASSWORD_CHANGE_STATE,
        state
    }
}

export const setNewPassword = (requestData) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }));
        return HttpUtil.postJson(API.RESET_PASSWORD, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false,
            }));
            if (status) {
                if (ret.status) {
                    Util.showToast(Message.MODIFY_PASSWORD_SUCCESS);
                    Store.delete('token');
                    Store.delete('userInfo').then(()=> {
                        dispatch(backLogin())
                    });
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const modifyPasswordInit = () => {
    return dispatch => {
        dispatch(changeState({
            modifyNewPassword: "",
            modifyConfirmedPassword: ""
        }))
    }
}