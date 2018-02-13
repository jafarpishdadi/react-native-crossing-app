/**
 * Created by richard.ji on 2017/10/31.
 */

import * as types from '../../../constant/ActionTypes';
import {navigateOpenEnterprise, navigateMainScreen} from '../../actions/navigator/Navigator';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';
import Store from 'react-native-simple-store';
import {backLogin} from '../navigator/Navigator';
import {loginAction} from '../users/Login';

export const registerPasswordAction = (requestData) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }));
        return HttpUtil.postJson(API.REGISTER, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false,
            }));
            if (status) {
                if (ret.status) {
                    Store.save('token', ret.data.token);
                    Store.save('userInfo', requestData);
                    Util.showToast(Message.REGISTER_SUCCESSFULLY);
                    if (ret.data.turnType === 'enterprise') {
                        dispatch(navigateOpenEnterprise())
                    } else if (ret.data.turnType === 'home') {
                        //dispatch(navigateMainScreen())
                        dispatch(loginAction(requestData))
                    } else if (ret.data.turnType === 'forbidLogin') {
                        Util.showToast(Message.ENTERPRISE_HAS_BEEN_FORBIDDEN);
                        Store.delete('token');
                        Store.delete('userInfo').then(()=> {
                            dispatch(backLogin())
                        });
                    } else {
                        // Util.showToast(Message.NETWORK_DATA_ERROR)
                        Util.showToast(ret.message);
                    }
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const changeState = (state) => {
    return {
        type: types.NAVIGATOR_REGISTER_PASSWORD_CHANGE_STATE,
        state
    }
}

export const navigateRegisterPassword = () => {
    return {
        type: types.NAVIGATOR_REGISTER_PASSWORD
    }
}

export const registerPasswordInit = () => {
    return dispatch => {
        dispatch(changeState({
            registerPassword: "",
            registerConfirmedPassword: ""
        }))
    }
}
