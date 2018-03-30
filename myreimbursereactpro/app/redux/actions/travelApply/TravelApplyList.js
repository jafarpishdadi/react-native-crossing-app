/**
 * Created by Louis.lu on 2018-02-05.
 */
import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';

export const changeState = (state) => {
    return {
        type: types.TRAVEL_APPLY_LIST_CHANGE_STATE,
        state: state,
    }
}

export const initData = (state) => {
    return dispatch => {
        dispatch(changeState({
            page: 1,
            loadMore: true,
            spState: '',
            travelApplyList: [],
        }))
    }
}

export const loadData = () => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }))
        dispatch(loadApplicationList({
            "spState": "",
            "page": 1,
            "rows": 5
        }));
    }
}

export const loadApplicationList = (requestData) => {
    return (dispatch, getState) => {
        dispatch(changeState({
            isLoading: true,
        }))
        return HttpUtil.postJson(API.GET_TRAVEL_APPLY_LIST, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false,
            }))
            if (status) {
                if (ret.status) {
                    if (ret.data != null) {
                        dispatch(changeState({
                            travelApplyList: ret.data,
                            loadMore: ret.data.length == 5,
                        }))
                    } else {
                        dispatch(changeState({
                            travelApplyList: [],
                            loadMore: false,
                        }))
                    }
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const loadMoreTravelApply =  (requestData,travelApplyList) => {
    return dispatch =>{
        dispatch(changeState({
            showLoading: true
        }));

        return HttpUtil.postJson(API.GET_TRAVEL_APPLY_LIST, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                showLoading: false,
                loadMore: true,
            }));
            if (status) {
                if (ret.status) {
                    if (ret.data) {
                        dispatch(changeState({
                            travelApplyList: travelApplyList.concat(ret.data),
                            page: requestData.page,
                            loadMore: ret.data.length == 5,
                        }))
                    } else {
                        dispatch(changeState({
                            page: requestData.page,
                            loadMore: false,
                        }))
                    }
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

/**
 * 删除未提交的差旅申请单
 * @param requestData 请求实体
 * @param spState 差旅申请单状态
 */
export const deleteTravelApply = (requestData, spState) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
            page: 1,
        }))
        return HttpUtil.postJson(API.DELETE_TRAVEL_APPLY_BILL, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false,
            }))
            if (status) {
                if (ret.status) {
                    dispatch(loadApplicationList({
                        spState: spState,
                        page: 1,
                        rows: 5,
                    }));
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}