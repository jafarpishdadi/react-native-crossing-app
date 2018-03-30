import * as types from "../../../constant/ActionTypes";
import HttpUtil from "../../../network/HttpUtil";
import {refreshApplicationData} from '../../../redux/actions/homePage/HomePage';
import API from "../../../utils/API";
import Util from "../../../utils/Util";

export const changeState = (state) => {
    return {
        type: types.LOAN_ORDER_LIST_CHANGE_STATE,
        state: state,
    }
};

export const initData = () => {
    return dispatch => {
        dispatch(changeState({
            page: 1,
            loadMore: true,
            spState: '',
            loanList: []
        }))
    }
}

export const loadData = () => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }))
        dispatch(loadLoanList({
            "spState": "",
            "page": 1,
            "rows": 5
        }));
    }
}

export const deleteLoanOrder = (requestData, spState) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
            page: 1,
        }))
        return HttpUtil.postJson(API.DELETE_BORROW_BILL, requestData, dispatch, function (ret, status) {
            if (status) {
                if (ret.status) {
                    dispatch(loadLoanList({
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

export const loadLoanList = (requestData) => {
    return dispatch => {
        return HttpUtil.postJson(API.GET_BORROW_LIST, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false,
            }))
            if (status) {
                if (ret.status) {
                    if (ret.data != null) {
                        dispatch(changeState({
                            loanList: ret.data,
                            loadMore: ret.data.length == 5,
                        }))
                    } else {
                        dispatch(changeState({
                            loanList: [],
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

//刷新借款单列表
export const refreshLoanList = (requestData) => {
    return dispatch => {
        dispatch(changeState({
            isRefreshing: true,
        }))
        HttpUtil.postJson(API.GET_BORROW_LIST, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isRefreshing: false,
                page: 1,
                loadMore: true,
            }))
            if (status) {
                if (ret.status) {
                    dispatch(changeState({
                        loanList: ret.data,
                    }))
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

//加载更多的借款单
export const loadMoreLoan = (requestData, loanList) => {
    return dispatch => {
        dispatch(changeState({
            showLoading: true
        }));
        return HttpUtil.postJson(API.GET_BORROW_LIST, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                showLoading: false,
                loadMore: true,
            }));
            if (status) {
                if (ret.status) {
                    if (ret.data) {
                        dispatch(changeState({
                            loanList: loanList.concat(ret.data),
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