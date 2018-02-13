/**
 * Created by Richard.ji on 2017/11/7.
 */

import * as types from '../../../constant/ActionTypes';
import {navigateLogin} from '../../actions/navigator/Navigator';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';
import Store from 'react-native-simple-store';

export const changeState = (state) => {
    return {
        type: types.CREATE_NEW_PASSWORD_CHANGE_STATE,
        state
    }
}

export const createNewPasswordPost = (requestDate) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }));
        return HttpUtil.postJson(API.RESET_PASSWORD, requestDate, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false,
            }));
            if (status) {
                if (ret.status) {
                    Util.showToast(Message.MODIFY_PASSWORD_SUCCESS);
                    Store.delete('userInfo').then(()=> {
                        dispatch(navigateLogin())
                    });
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const createPasswordInit = () => {
    return dispatch => {
        dispatch(changeState({
            createNewPassword: "",
            createConfirmedPassword: ""
        }))
    }
}