/**
 * Created by howard.li on 11/8/2017.
 */
import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';

export const changeState = (state) => {
    return {
        type: types.AUDIT_LIST_CHANGE_STATE,
        state: state,
    }
};

export const initData = () => {
    return dispatch => {
        dispatch(changeState({
            selected: 0,
            unapproved: [],
            alreadyApproved: [],
            unapprovedPage: 1,
            unapprovedLoadMore: true,
            alreadyApprovedPage:1,
            alreadyApprovedLoadMore: true,
            showFilter: false,
            copyToMe: [],
        }))
    }
}

export const loadData = () => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }))
        dispatch(loadUnapproved())
    }
}

export const loadUnapproved = () => {
    return dispatch => {
        return HttpUtil.postJson(API.GET_APPROVAL_LIST, {
            flag: 0,
            page: 1,
            rows: 5,
        }, dispatch, function(ret, status) {
            if (status) {
                if (ret.status) {
                    if (ret.data != null) {
                        dispatch(changeState({
                            unapproved: ret.data,
                            unapprovedLoadMore: ret.data.length == 5,
                        }))
                    } else {
                        dispatch(changeState({
                            unapproved: [],
                            unapprovedLoadMore: false
                        }))
                    }
                    dispatch(loadAlreadyApproved())
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

export const loadAlreadyApproved = () => {
    return dispatch => {
        return HttpUtil.postJson(API.GET_APPROVAL_LIST, {
            flag: 1,
            page: 1,
            rows: 5,
        }, dispatch, function(ret, status) {
            dispatch(changeState({
                isLoading: false,
            }))
            if (status) {
                if (ret.status) {
                    if (ret.data != null) {
                        dispatch(changeState({
                            alreadyApproved: ret.data,
                            alreadyApprovedLoadMore: ret.data.length == 5,
                        }))
                    } else {
                        dispatch(changeState({
                            alreadyApproved: [],
                            alreadyApprovedLoadMore: false,
                        }))
                    }
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const refreshUnApproved = () => {
    return dispatch => {
        dispatch(changeState({
            isRefreshing: true,
        }))
        return HttpUtil.postJson(API.GET_APPROVAL_LIST, {
            flag: 0,
            page: 1,
            rows: 5,
        }, dispatch, function(ret, status) {
            dispatch(changeState({
                isRefreshing: false,
            }))
            if (status) {
                if (ret.status) {
                    dispatch(changeState({
                        unapproved: ret.data ? ret.data : [],
                        unapprovedPage: 1,
                        unapprovedLoadMore: true,
                    }))
                } else {
                    dispatch(changeState({
                        unapproved: [],
                        unapprovedPage: 1,
                        unapprovedLoadMore: false,
                    }))
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const refreshAlreadyApproved = () => {
    return dispatch => {
        dispatch(changeState({
            isRefreshing: true,
        }))
        return HttpUtil.postJson(API.GET_APPROVAL_LIST, {
            flag: 1,
            page: 1,
            rows: 5,
        }, dispatch, function(ret, status) {
            dispatch(changeState({
                isRefreshing: false,
            }))
            if (status) {
                if (ret.status) {
                    dispatch(changeState({
                        alreadyApproved: ret.data ? ret.data : [],
                        alreadyApprovedPage:1,
                        alreadyApprovedLoadMore: true,
                    }))
                } else {
                    dispatch(changeState({
                        alreadyApproved: [],
                        alreadyApprovedPage:1,
                        alreadyApprovedLoadMore: false,
                    }))
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const loadMoreUnApproved = (requestData, unapproved) => {
    return dispatch => {
        dispatch(changeState({
            showLoading: true
        }));
        return HttpUtil.postJson(API.GET_APPROVAL_LIST, requestData, dispatch, function(ret, status) {
            dispatch(changeState({
                showLoading: false
            }));
            if (status) {
                if (ret.status) {
                    if (ret.data != null) {
                        dispatch(changeState({
                            unapproved: unapproved.concat(ret.data),
                            unapprovedPage: requestData.page,
                            unapprovedLoadMore: ret.data.length == 5,
                        }))
                    }
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const  loadMoreAlreadyApproved = (requestData, alreadyApproved) => {
    return dispatch => {
        dispatch(changeState({
            showLoading: true
        }));
        return HttpUtil.postJson(API.GET_APPROVAL_LIST, requestData, dispatch, function(ret, status) {
            dispatch(changeState({
                showLoading: false
            }));
            if (status) {
                if (ret.status) {
                    if (ret.data != null) {
                        dispatch(changeState({
                            alreadyApproved: alreadyApproved.concat(ret.data),
                            alreadyApprovedPage: requestData.page,
                            alreadyApprovedLoadMore: ret.data.length == 5,
                        }))
                    }
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}
