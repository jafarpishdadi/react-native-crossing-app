/**
 * Created by sky.qian on 11/6/2017.
 */
import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';
import {refreshApplicationData} from '../../../redux/actions/homePage/HomePage';

export const changeState = (state) => {
    return {
        type: types.REIMBURSEMENT_LIST_CHANGE_STATE,
        state: state,
    }
}

export const initData = () => {
    return dispatch => {
        dispatch(changeState({
            page: 1,
            loadMore: true,
            spState: '',
            reimbursementList: [],
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
    return dispatch => {
        return HttpUtil.postJson(API.GET_APPLICATION_LIST, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false,
            }))
            if (status) {
                if (ret.status) {
                    if (ret.data != null) {
                        dispatch(changeState({
                            reimbursementList: ret.data,
                            loadMore: ret.data.length == 5,
                        }))
                    } else {
                        dispatch(changeState({
                            reimbursementList: [],
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

export const deleteApplication = (requestData, spState) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
            page: 1,
        }))
        return HttpUtil.postJson(API.DELETE_APPLICATION, requestData, dispatch, function (ret, status) {
            if (status) {
                if (ret.status) {
                    dispatch(loadApplicationList({
                        spState: spState,
                        page: 1,
                        rows: 5,
                    }));
                    //删除未提交报销单后，刷新首页关联数据
                    dispatch(refreshApplicationData());

                } else {
                    Util.showToast(ret.message);
                    dispatch(changeState({
                        isLoading: false,
                    }))
                }
            } else {
                dispatch(changeState({
                    isLoading: false,
                }))
            }
        })
    }
}

export const loadMoreReimbursement = (requestData, reimbursementList) => {
    return dispatch => {
        dispatch(changeState({
            showLoading: true
        }));
        return HttpUtil.postJson(API.GET_APPLICATION_LIST, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                showLoading: false,
                loadMore: true,
            }));
            if (status) {
                if (ret.status) {
                    if (ret.data) {
                        dispatch(changeState({
                            reimbursementList: reimbursementList.concat(ret.data),
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

export const refreshReimbursementList = (requestData) => {
    return dispatch => {
        dispatch(changeState({
            isRefreshing: true,
        }))
        HttpUtil.postJson(API.GET_APPLICATION_LIST, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isRefreshing: false,
                page: 1,
                loadMore: true,
            }))
            if (status) {
                if (ret.status) {
                    dispatch(changeState({
                        reimbursementList: ret.data,
                    }))
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}