/**
 * Created by richard.ji on 2017/11/1.
 */

import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';
import Store from 'react-native-simple-store';
import {Platform,NativeModules} from 'react-native';
import Message from "../../../constant/Message";
import {changeState as changeHomePageState} from '../homePage/HomePage';
var UpdateAppModule = NativeModules.UpdateAppModule;

export const changeState = (state) => {
    return {
        type: types.MINE_CHANGE_STATE,
        state: state,
    }
}

export const loadData = () => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
            isFirst: false,
        }))
        return HttpUtil.postJson(API.GET_USER_INFO, {}, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false
            }))
            if (status) {
                if (ret.status) {
                    Store.save('user', ret.data);
                    if (ret.data) {
                        if (ret.data.enterpriseName) {
                            dispatch(changeHomePageState({
                                selectCompany: ret.data.enterpriseName.length > 12 ? (
                                    ret.data.enterpriseName.substring(0, 12) + '...'
                                ) : (
                                    ret.data.enterpriseName
                                ),
                                selectCompanyWholeName: ret.data.enterpriseName
                            }))
                        }
                    }
                    dispatch(changeState({
                        userInfo: ret.data ? ret.data : {},
                    }));
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const checkUpgrade = () => {
    return (dispatch) => {

        var request = {operateSystem:'ANDROID'};
        if (Platform.OS == 'ios') {
            request = {operateSystem:'IOS'};
        }
        return HttpUtil.postJson(API.CHECK_UPGRADE, request, dispatch, function(ret, status) {
            if (status) {
                if (ret.status) {
                    UpdateAppModule.check(ret.data.versionNo, (resultCode)=> {
                        if (resultCode == '1') {
                            //不强制更新  仅提示更新
                            // dispatch(changeState({
                            //     versionData:ret.data,
                            //     showUpgrade: true,
                            // }))

                            Util.showToast(Message.APP_DOWNLOADING);
                            UpdateAppModule.update(ret.data.versionAddress, (resultCode)=> {
                                if (resultCode == '0') {
                                    Util.showToast(Message.IS_BEING_UPDATE);
                                }
                            });
                        }else{
                            if(Platform.OS == 'android'){
                                Util.showToast(Message.MINE_IS_LATEST_VERSION);
                            }
                        }
                    });
                }
            }
        })
    }
}