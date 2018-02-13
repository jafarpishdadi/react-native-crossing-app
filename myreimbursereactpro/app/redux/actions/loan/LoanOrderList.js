import * as types from "../../../constant/ActionTypes";
import HttpUtil from "../../../network/HttpUtil";
//import {refreshApplicationData} from '../../../redux/actions/homePage/HomePage';
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
            loanList: [
                {
                    "id": "927168",
                    "formDesc": "{\"expenseDesc\":\"我的发票项目\",\"amount\":1000,\"expenseDname\":\"研究开发三部\"}",
                    "startName": "成吉思汗",
                    "formTypeName": "报销申请",
                    "createTimeStr": "2018-01-08 10:30:04",
                    "formId": "270861",
                    "applyTimeStr": "2018-01-08 10:30:04",
                    "formName": "成吉思汗的借款单申请",
                    "startDid": "1061",
                    "procinstId": "986443",
                    "formTypeCode": "BXSQ",
                    "formState": "0"
                },
                {
                    "id": "352190",
                    "formDesc": "{\"expenseDesc\":\"我的发票项目\",\"amount\":1000,\"expenseDname\":\"研究开发三部\"}",
                    "startName": "成吉思汗",
                    "formTypeName": "报销申请",
                    "createTimeStr": "2018-01-08 10:18:51",
                    "formId": "402859",
                    "applyTimeStr": "2018-01-08 10:30:04",
                    "formName": "成吉思汗的借款单申请",
                    "startDid": "109",
                    "procinstId": "986351",
                    "formTypeCode": "BXSQ",
                    "formState": "1"
                },
                {
                    "id": "189437",
                    "formDesc": "{\"expenseDesc\":\"我的发票项目\",\"amount\":1000,\"expenseDname\":\"研究开发三部\"}",
                    "startName": "成吉思汗",
                    "formTypeName": "报销申请",
                    "createTimeStr": "2018-01-05 08:35:04",
                    "formId": "392087",
                    "applyTimeStr": "2018-01-08 10:30:04",
                    "formName": "成吉思汗的借款单申请",
                    "startDid": "1061",
                    "procinstId": "957851",
                    "formTypeCode": "BXSQ",
                    "formState": "2"
                },
                {
                    "id": "780396",
                    "formDesc": "{\"expenseDesc\":\"我的发票项目\",\"amount\":1000,\"expenseDname\":\"研究开发三部\"}",
                    "startName": "成吉思汗",
                    "formTypeName": "报销申请",
                    "createTimeStr": "2018-01-04 10:08:46",
                    "formId": "746021",
                    "applyTimeStr": "2018-01-08 10:30:04",
                    "formName": "成吉思汗的借款单申请",
                    "startDid": "1061",
                    "procinstId": "945557",
                    "formTypeCode": "BXSQ",
                    "formState": "3"
                },
                {
                    "id": "184056",
                    "formDesc": "{\"expenseDesc\":\"我的发票项目\",\"amount\":1000,\"expenseDname\":\"研究开发三部\"}",
                    "startName": "成吉思汗",
                    "formTypeName": "报销申请",
                    "createTimeStr": "2017-12-28 18:17:56",
                    "formId": "968357",
                    "applyTimeStr": "2018-01-08 10:30:04",
                    "formName": "成吉思汗的借款单申请",
                    "startDid": "1061",
                    "procinstId": "855178",
                    "formTypeCode": "BXSQ",
                    "formState": "4"
                }],
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
        return HttpUtil.postJson(API.DELETE_APPLICATION, requestData, dispatch, function (ret, status) {
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
        return HttpUtil.postJson(API.GET_APPLICATION_LIST, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false,
            }))
            if (status) {
                if (ret.status) {
/*                    if (ret.data != null) {
                        dispatch(changeState({
                            //reimbursementList: ret.data,
                            //loadMore: ret.data.length == 5,
                        }))
                    } else {
                        dispatch(changeState({
                            //reimbursementList: [],
                            //loadMore: false,
                        }))
                    }*/
                     if (requestData.spState == ''){
                         dispatch(changeState({
                             loanList: [
                                 {
                                 "id": "927168",
                                 "formDesc": "{\"expenseDesc\":\"我的发票项目\",\"amount\":1000,\"expenseDname\":\"研究开发三部\"}",
                                 "startName": "成吉思汗",
                                 "formTypeName": "报销申请",
                                 "createTimeStr": "2018-01-08 10:30:04",
                                 "formId": "270861",
                                 "applyTimeStr": "2018-01-08 10:30:04",
                                 "formName": "成吉思汗的借款单申请",
                                 "startDid": "1061",
                                 "procinstId": "986443",
                                 "formTypeCode": "BXSQ",
                                 "formState": "0"
                             },
                                 {
                                     "id": "352190",
                                     "formDesc": "{\"expenseDesc\":\"我的发票项目\",\"amount\":1000,\"expenseDname\":\"研究开发三部\"}",
                                     "startName": "成吉思汗",
                                     "formTypeName": "报销申请",
                                     "createTimeStr": "2018-01-08 10:18:51",
                                     "formId": "402859",
                                     "applyTimeStr": "2018-01-08 10:30:04",
                                     "formName": "成吉思汗的借款单申请",
                                     "startDid": "109",
                                     "procinstId": "986351",
                                     "formTypeCode": "BXSQ",
                                     "formState": "1"
                                 },
                                 {
                                     "id": "189437",
                                     "formDesc": "{\"expenseDesc\":\"我的发票项目\",\"amount\":1000,\"expenseDname\":\"研究开发三部\"}",
                                     "startName": "成吉思汗",
                                     "formTypeName": "报销申请",
                                     "createTimeStr": "2018-01-05 08:35:04",
                                     "formId": "392087",
                                     "applyTimeStr": "2018-01-08 10:30:04",
                                     "formName": "成吉思汗的借款单申请",
                                     "startDid": "1061",
                                     "procinstId": "957851",
                                     "formTypeCode": "BXSQ",
                                     "formState": "2"
                                 },
                                 {
                                     "id": "780396",
                                     "formDesc": "{\"expenseDesc\":\"我的发票项目\",\"amount\":1000,\"expenseDname\":\"研究开发三部\"}",
                                     "startName": "成吉思汗",
                                     "formTypeName": "报销申请",
                                     "createTimeStr": "2018-01-04 10:08:46",
                                     "formId": "746021",
                                     "applyTimeStr": "2018-01-08 10:30:04",
                                     "formName": "成吉思汗的借款单申请",
                                     "startDid": "1061",
                                     "procinstId": "945557",
                                     "formTypeCode": "BXSQ",
                                     "formState": "3"
                                 },
                                 {
                                     "id": "184056",
                                     "formDesc": "{\"expenseDesc\":\"我的发票项目\",\"amount\":1000,\"expenseDname\":\"研究开发三部\"}",
                                     "startName": "成吉思汗",
                                     "formTypeName": "报销申请",
                                     "createTimeStr": "2017-12-28 18:17:56",
                                     "formId": "968357",
                                     "applyTimeStr": "2018-01-08 10:30:04",
                                     "formName": "成吉思汗的借款单申请",
                                     "startDid": "1061",
                                     "procinstId": "855178",
                                     "formTypeCode": "BXSQ",
                                     "formState": "4"
                                 }],
                             loadMore: true,
                         }))
                     }
                     if(requestData.spState == '0'){
                         dispatch(changeState({
                             loanList: [
                                 {
                                     "id": "927168",
                                     "formDesc": "{\"expenseDesc\":\"我的发票项目\",\"amount\":1000,\"expenseDname\":\"研究开发三部\"}",
                                     "startName": "成吉思汗",
                                     "formTypeName": "报销申请",
                                     "createTimeStr": "2018-01-08 10:30:04",
                                     "formId": "270861",
                                     "applyTimeStr": "2018-01-08 10:30:04",
                                     "formName": "成吉思汗的借款单申请",
                                     "startDid": "1061",
                                     "procinstId": "986443",
                                     "formTypeCode": "BXSQ",
                                     "formState": "0"
                                 }
                             ],
                             loadMore: false,
                         }))
                     }
                    if(requestData.spState == '1'){
                        dispatch(changeState({
                            loanList: [
                                {
                                    "id": "352190",
                                    "formDesc": "{\"expenseDesc\":\"我的发票项目\",\"amount\":1000,\"expenseDname\":\"研究开发三部\"}",
                                    "startName": "成吉思汗",
                                    "formTypeName": "报销申请",
                                    "createTimeStr": "2018-01-08 10:18:51",
                                    "formId": "402859",
                                    "applyTimeStr": "2018-01-08 10:30:04",
                                    "formName": "成吉思汗的借款单申请",
                                    "startDid": "109",
                                    "procinstId": "986351",
                                    "formTypeCode": "BXSQ",
                                    "formState": "1"
                                }
                            ],
                            loadMore: false,
                        }))
                    }
                    if(requestData.spState == '2'){
                        dispatch(changeState({
                            loanList: [
                                {
                                    "id": "189437",
                                    "formDesc": "{\"expenseDesc\":\"我的发票项目\",\"amount\":1000,\"expenseDname\":\"研究开发三部\"}",
                                    "startName": "成吉思汗",
                                    "formTypeName": "报销申请",
                                    "createTimeStr": "2018-01-05 08:35:04",
                                    "formId": "392087",
                                    "applyTimeStr": "2018-01-08 10:30:04",
                                    "formName": "成吉思汗的借款单申请",
                                    "startDid": "1061",
                                    "procinstId": "957851",
                                    "formTypeCode": "BXSQ",
                                    "formState": "2"
                                }
                            ],
                            loadMore: false,
                        }))
                    }
                    if(requestData.spState == '3'){
                        dispatch(changeState({
                            loanList: [
                                {
                                    "id": "780396",
                                    "formDesc": "{\"expenseDesc\":\"我的发票项目\",\"amount\":1000,\"expenseDname\":\"研究开发三部\"}",
                                    "startName": "成吉思汗",
                                    "formTypeName": "报销申请",
                                    "createTimeStr": "2018-01-04 10:08:46",
                                    "formId": "746021",
                                    "applyTimeStr": "2018-01-08 10:30:04",
                                    "formName": "成吉思汗的借款单申请",
                                    "startDid": "1061",
                                    "procinstId": "945557",
                                    "formTypeCode": "BXSQ",
                                    "formState": "3"
                                }
                            ],
                            loadMore: false,
                        }))
                    }
                    if(requestData.spState == '4'){
                        dispatch(changeState({
                            loanList: [
                                {
                                    "id": "184056",
                                    "formDesc": "{\"expenseDesc\":\"我的发票项目\",\"amount\":1000,\"expenseDname\":\"研究开发三部\"}",
                                    "startName": "成吉思汗",
                                    "formTypeName": "报销申请",
                                    "createTimeStr": "2017-12-28 18:17:56",
                                    "formId": "968357",
                                    "applyTimeStr": "2018-01-08 10:30:04",
                                    "formName": "成吉思汗的借款单申请",
                                    "startDid": "1061",
                                    "procinstId": "855178",
                                    "formTypeCode": "BXSQ",
                                    "formState": "4"
                                }
                            ],
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
        HttpUtil.postJson(API.GET_APPLICATION_LIST, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isRefreshing: false,
                page: 1,
                loadMore: true,
            }))
            if (status) {
                if (ret.status) {
                    dispatch(changeState({
                        //reimbursementList: ret.data,
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
        return HttpUtil.postJson(API.GET_APPLICATION_LIST, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                showLoading: false,
            }));
            if (status) {
                if (ret.status) {
                    if (ret.data) {
                        dispatch(changeState({
                            //reimbursementList: reimbursementList.concat(ret.data),
                            //page: requestData.page,
                            //loadMore: ret.data.length == 5,
                            loadMore: true
                        }))
                    } else {
                        dispatch(changeState({
                            //page: requestData.page,
                            //loadMore: false,
                            //loadMore: true
                        }))
                    }
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}