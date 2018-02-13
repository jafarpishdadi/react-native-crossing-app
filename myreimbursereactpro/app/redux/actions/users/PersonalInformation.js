/**
 * Created by richard.ji on 2017/10/31.
 */

import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';
import {back} from '../../../redux/actions/navigator/Navigator';
import {loadData} from '../../../redux/actions/mine/Mine';

export const changeState = (state) => {
    return {
        type: types.PERSONAL_INFORMATION_CHANGE_STATE,
        state: state
    }
}

export const saveData = (requestData) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }))
        return HttpUtil.postJson(API.UPDATE_USER_INFO, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false
            }))
            if (status) {
                if (ret.status) {
                    dispatch(loadData());
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}