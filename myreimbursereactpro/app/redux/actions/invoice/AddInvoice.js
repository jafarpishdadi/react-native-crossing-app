/**
 * Created by Richard.ji on 2017/11/28.
 */

import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';

export const changeState = (state) => {
    return {
        type: types.ADD_INVOICE_STATE,
        state: state,
    }
}

/**
 * 初始化数据
 * @returns {function(*)}
 */
export const doInitialise = () => {
    return dispatch => {
        return dispatch(changeState({

            dataWithoutReimbursement: [],       //未报销发票

            selectedItem: [],       //单行选中的发票
            selectedItemIDCount: 0, //单行选中的发票ID数
            selectedItemAmount: 0,  //单行选中的发票金额数
            isSelectedItem: [],     //单行发票按钮是否选中
            allItemCount: 0,       //列表所有发票数
            allItemAmount: [],       //列表所有发票金额
            allItem: [],            //列表所有发票
            isSelectedAll: false,   //是否选择全选按钮
            checkedInvoice: [],      //已查验的发票

            selectedYear: '',
            selectedMonth: '',
            selectedDateStr: '',

            showPickerShadow: false,   //是否显示选择器阴影

            noReimbursementPage: 1,
            noReimbursementLoadMore: true,
        }))
    }
}

export const selectInvoice = (expenseId, selectedInvoice) => {
    return {
        type: types.SELECTED_INVOICE_LIST,
        expenseId: expenseId,
        selectedInvoice: selectedInvoice,
    }
};

/**
 * 未报销发票列表
 * @param selectedDateStr 请求日期，格式如201701
 * @param selectedInvoice 新建报销单-添加发票后，传给添加发票页面的参数
 * 该参数用来过滤掉请求返回的数据中在参数中已存在的发票，得到最终请求返回的未报销发票列表
 * @returns {function(*)}
 */
export const loadInvoiceListDataWithoutReimbursement = (selectedDateStr, selectedInvoice) => {
    return (dispatch, getState) => {
        dispatch(changeState({isLoading: true}));
        return HttpUtil.postJson(API.GET_INVOICE_LIST_DATA, {
            invoiceTime: selectedDateStr,
            reimburseState: 0,
            invoiceTypeCode: '',
            page: 1,
            rows: 20,
            isSyn: 'N',
        }, dispatch, function (ret, status) {
            var selectedInvoiceFromNewReimbursement = getState().AddInvoice.reimbursementSelected;
            var isFilter = getState().AddInvoice.isFilter;  // handle issue#3012
            if (selectedInvoice.length == 0 || selectedInvoice == null) {
                selectedInvoiceFromNewReimbursement = [];
            }
            if (status) {
                if (ret.data == null) {
                    dispatch(changeState({
                        dataWithoutReimbursement: [],
                        noReimbursementLoadMore: false,
                        isLoading: false
                    }))
                } else {
                    var preArray = [].concat(ret.data);
                    var preSelectedInvoice = [].concat(selectedInvoiceFromNewReimbursement);
                    var filterData = [];
                    if (selectedInvoiceFromNewReimbursement != null &&
                        selectedInvoiceFromNewReimbursement.length > 0 &&
                        isFilter) {
                        for (var i = 0; i < preArray.length; i++) {
                            if (Util.contains(selectedInvoiceFromNewReimbursement, preArray[i].uuid) && !Util.contains(selectedInvoiceFromNewReimbursement, '-' + preArray[i].uuid)) {
                                preArray.splice(i, 1, '-' + preArray[i].uuid);
                            }
                        }
                        for (var k = 0; k < selectedInvoiceFromNewReimbursement.length; k++) {
                            preSelectedInvoice.splice(k, 1, '-' + selectedInvoiceFromNewReimbursement[k]);
                        }
                        for (var j = 0; j < preArray.length; j++) {
                            if (!Util.contains(preSelectedInvoice, preArray[j])) {
                                filterData.push(preArray[j]);
                            }
                        }
                        dispatch(changeState({
                            dataWithoutReimbursement: filterData,
                            noReimbursementLoadMore: filterData.length == 20,
                            isLoading: false
                        }))
                    } else {
                        dispatch(changeState({
                            dataWithoutReimbursement: ret.data,
                            noReimbursementLoadMore: ret.data.length == 20,
                            isLoading: false
                        }))
                    }

                }
            } else {
                dispatch(changeState({isLoading: false}));
            }
        })
    }
};

/**
 * 刷新未报销发票列表
 * @param requestData
 * @returns {function(*=)}
 */
export const refreshNoReimbursementData = (selectedDateStr) => {
    return (dispatch, getState) => {
        dispatch(changeState({
            isRefreshing: true,

            selectedItem: [],       //单行选中的发票
            selectedItemIDCount: 0, //单行选中的发票ID数
            selectedItemAmount: 0,  //单行选中的发票金额数
            isSelectedItem: [],     //单行发票按钮是否选中
            allItemCount: 0,       //列表所有发票数
            allItemAmount: [],       //列表所有发票金额
            allItem: [],            //列表所有发票
            isSelectedAll: false,   //是否选择全选按钮
            checkedInvoice: [],      //已查验的发票
            showPickerShadow: false,   //是否显示选择器阴影

            dataWithoutReimbursement: [],       //未报销发票

            noReimbursementPage: 1,
            noReimbursementLoadMore: true,
        }));
        return HttpUtil.postJson(API.GET_INVOICE_LIST_DATA, {
            invoiceTime: selectedDateStr,
            reimburseState: 0,
            invoiceTypeCode: '',
            page: 1,
            rows: 20,
            isSyn: 'Y',
        }, dispatch, function (ret, status) {
            var selectedInvoiceFromNewReimbursement = getState().AddInvoice.reimbursementSelected;
            dispatch(changeState({
                isRefreshing: false,
            }));
            if (status) {
                if (ret.status) {
                    var preArray = [].concat(ret.data);
                    var preSelectedInvoice = [].concat(selectedInvoiceFromNewReimbursement);
                    var filterData = [];
                    if (selectedInvoiceFromNewReimbursement != null && selectedInvoiceFromNewReimbursement.length > 0) {
                        for (var i = 0; i < preArray.length; i++) {
                            if (Util.contains(selectedInvoiceFromNewReimbursement, preArray[i].uuid) && !Util.contains(selectedInvoiceFromNewReimbursement, '-' + preArray[i].uuid)) {
                                preArray.splice(i, 1, '-' + preArray[i].uuid);
                            }
                        }
                        for (var k = 0; k < selectedInvoiceFromNewReimbursement.length; k++) {
                            preSelectedInvoice.splice(k, 1, '-' + selectedInvoiceFromNewReimbursement[k]);
                        }
                        for (var j = 0; j < preArray.length; j++) {
                            if (!Util.contains(preSelectedInvoice, preArray[j])) {
                                filterData.push(preArray[j]);
                            }
                        }
                        dispatch(changeState({
                            dataWithoutReimbursement: filterData,
                            noReimbursementPage: 1,
                            noReimbursementLoadMore: filterData.length == 20
                        }))
                    } else {
                        dispatch(changeState({
                            dataWithoutReimbursement: ret.data,
                            noReimbursementPage: 1,
                            noReimbursementLoadMore: ret.data.length == 20
                        }))
                    }
                } else {
                    dispatch(changeState({
                        dataWithoutReimbursement: [],
                        noReimbursementPage: 1,
                        noReimbursementLoadMore: false,
                    }));
                    Util.showToast(ret.message);
                }
            }
        });
    }
};

/**
 * 加载更多未报销发票
 * @param requestData
 * @param dataWithoutReimbursement
 * @returns {function(*=)}
 */
export const loadMoreNoReimbursementData = (requestData, dataWithoutReimbursement) => {
    return (dispatch, getState) => {
        dispatch(changeState({
            showLoading: true
        }));
        return HttpUtil.postJson(API.GET_INVOICE_LIST_DATA, requestData, dispatch, function (ret, status) {
            var selectedInvoiceFromNewReimbursement = getState().AddInvoice.reimbursementSelected;
            dispatch(changeState({
                showLoading: false
            }));
            if (status) {
                if (ret.status) {
                    var preArray = [].concat(ret.data);
                    var preSelectedInvoice = [].concat(selectedInvoiceFromNewReimbursement);
                    var filterData = [];
                    if (selectedInvoiceFromNewReimbursement != null && selectedInvoiceFromNewReimbursement.length > 0) {
                        for (var i = 0; i < preArray.length; i++) {
                            if (Util.contains(selectedInvoiceFromNewReimbursement, preArray[i].uuid) && !Util.contains(selectedInvoiceFromNewReimbursement, '-' + preArray[i].uuid)) {
                                preArray.splice(i, 1, '-' + preArray[i].uuid);
                            }
                        }
                        for (var k = 0; k < selectedInvoiceFromNewReimbursement.length; k++) {
                            preSelectedInvoice.splice(k, 1, '-' + selectedInvoiceFromNewReimbursement[k]);
                        }
                        for (var j = 0; j < preArray.length; j++) {
                            if (!Util.contains(preSelectedInvoice, preArray[j])) {
                                filterData.push(preArray[j]);
                            }
                        }
                        dispatch(changeState({
                            dataWithoutReimbursement: dataWithoutReimbursement.concat(filterData),
                            noReimbursementPage: requestData.page,
                            noReimbursementLoadMore: ret.data.length == 20
                        }))
                    } else {
                        dispatch(changeState({
                            dataWithoutReimbursement: dataWithoutReimbursement.concat(ret.data),
                            noReimbursementPage: requestData.page,
                            noReimbursementLoadMore: ret.data.length == 20
                        }))
                    }
                } else {
                    Util.showToast(ret.message);
                }
            }
        });
    }
};