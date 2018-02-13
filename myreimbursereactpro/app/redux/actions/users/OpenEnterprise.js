/**
 * Created by richard.ji on 2017/10/31.
 */

import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';
import {navigateSuccessOpenEnterprise} from '../../actions/navigator/Navigator';
import {changeState as successOpenEnterprise} from '../../actions/users/SuccessOpenEnterprise';
import Store from 'react-native-simple-store';

export const changeState = (state) => {
    return {
        type: types.OPEN_ENTERPRISE_CHANGE_STATE,
        state: state
    }
}

export const newEnterprise = (requestData) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }));
        let create = "创建企业专用";
        return HttpUtil.postJson1(API.NEW_ENTERPRISE, requestData, create, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false,
            }));
            if (status) {
                if (ret.status) {
                    Store.save('token', ret.data.token);
                    dispatch(successOpenEnterprise({
                        pcAddress: ret.data.pcAddress
                    }));
                    dispatch(navigateSuccessOpenEnterprise());
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const openEnterpriseInit = () => {
    return dispatch => {
        dispatch(changeState({
            openEnterpriseName: "",
            openEnterprisePerson: ""
        }))
    }
}