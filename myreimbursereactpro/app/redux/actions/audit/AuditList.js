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
            applyType: '',
            unapprovedCount: 0,
        }))
    }
}

export const loadData = () => {
    return (dispatch, getState) => {
        dispatch(changeState({
            isLoading: true,
        }))
        dispatch(getUnapprovedCount())
        dispatch(loadUnapproved({
            flag: 0,
            page: 1,
            rows: 5,
            formTypeCode: getState().AuditList.applyType,
        }))
    }
}

export const getUnapprovedCount = () => {
    return (dispatch, getState) => {
        return HttpUtil.postJson(API.GET_UNAPPROVED_COUNT, {
            //formTypeCode: getState().AuditList.applyType,
            formTypeCode: '',
        }, dispatch, function(ret, status) {
            if (status) {
                if (ret.status) {
                    dispatch(changeState({
                        unapprovedCount: ret.data,
                    }))
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const loadUnapproved = (requestData, single) => {
    return (dispatch, getState) => {
        return HttpUtil.postJson(API.GET_APPROVAL_LIST, requestData, dispatch, function(ret, status) {
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
                    if (!single) {
                        dispatch(loadAlreadyApproved({
                            flag: 1,
                            page: 1,
                            rows: 5,
                            formTypeCode: getState().AuditList.applyType,
                        }))
                    } else {
                        dispatch(changeState({
                            isLoading: false,
                        }))
                    }
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

export const loadAlreadyApproved = (requestData, single) => {
    return (dispatch, getState) => {
        return HttpUtil.postJson(API.GET_APPROVAL_LIST, requestData, dispatch, function(ret, status) {
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
                    if (!single) {
                        dispatch(loadCopyList({
                            flag: 2,
                            page: 1,
                            rows: 5,
                            formTypeCode: getState().AuditList.applyType,
                        }))
                    } else {
                        dispatch(changeState({
                            isLoading: false,
                        }))
                    }
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

export const loadCopyList = (requestData) => {
    return dispatch => {
        return HttpUtil.postJson(API.GET_APPROVAL_LIST, requestData, dispatch, function(ret, status) {
            dispatch(changeState({
                isLoading: false,
            }))
            if (status) {
                if (ret.status) {
                    if (ret.data != null) {
                        dispatch(changeState({
                            copyToMe: ret.data,
                            copyToMeLoadMore: ret.data.length == 5,
                        }))
                    } else {
                        dispatch(changeState({
                            copyToMe: [],
                            copyToMeLoadMore: false,
                        }))
                    }
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const refreshUnApproved = (requestData) => {
    return dispatch => {
        dispatch(changeState({
            isRefreshing: true,
        }))
        dispatch(getUnapprovedCount())
        return HttpUtil.postJson(API.GET_APPROVAL_LIST, requestData, dispatch, function(ret, status) {
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

export const refreshAlreadyApproved = (requestData) => {
    return dispatch => {
        dispatch(changeState({
            isRefreshing: true,
        }))
        return HttpUtil.postJson(API.GET_APPROVAL_LIST, requestData, dispatch, function(ret, status) {
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

export const refreshCopyList = (requestData) => {
    return dispatch => {
        dispatch(changeState({
            isRefreshing: true,
        }))
        return HttpUtil.postJson(API.GET_APPROVAL_LIST, requestData, dispatch, function(ret, status) {
            dispatch(changeState({
                isRefreshing: false,
            }))
            if (status) {
                if (ret.status) {
                    dispatch(changeState({
                        copyToMe: ret.data ? ret.data : [],
                        copyToMePage:1,
                        copyToMeLoadMore: true,
                    }))
                } else {
                    dispatch(changeState({
                        copyToMe: [],
                        copyToMePage:1,
                        copyToMeLoadMore: false,
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

export const loadMoreCopy = (requestData, copyList) => {
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
                            copyToMe: copyList.concat(ret.data),
                            copyToMePage: requestData.page,
                            copyToMeLoadMore: ret.data.length == 5,
                        }))
                    }
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}
