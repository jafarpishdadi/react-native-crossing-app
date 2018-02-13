import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';
import {navigateToNewOrEditInvoicePage} from '../navigator/Navigator';
import Message from "../../../constant/Message";
import {
    changeState as changeReimState
} from "../reimbursement/Reimbursement";
import {changeState as changeNewInvoiceState} from '../invoice/NewInvoice';
import {changeState as changeEditInvoiceState} from '../invoice/EditInvoice';
import {changeState as changeInvoiceDetailsState} from '../invoice/InvoiceDetails';


export const changeState = (state) => {
    return {
        type: types.INVOICE_LIST_CHANGE_STATE,
        state: state,
    }
}

export const selectInvoice = (expenseId, selectedInvoice) => {
    return {
        type: types.SELECTED_INVOICE_LIST,
        expenseId: expenseId,
        selectedInvoice: selectedInvoice,
    }
}

export const doInitialise = () => {
    return dispatch => {
        return dispatch(changeState({
            // isLoading:false,
            deleteConfirm: false,
            showCountDetail: false,      //显示累计张数详情
            showAmountDetail: false,     //显示累计金额详情
            showDialog: false,          //是否显示提示对话框
            showCheckbox: false,        //是否显示复选框

            // reimbursementStatus: 0,             //报销状态，值0=未报销,2=报销中,3=已报销,默认0

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

            // zje: '',        //总金额
            // zsl: '',        //总数量
            // wbxje: '',       //未报销金额
            // wbxzs: '',       //未报销张数
            // bxzje: '',       //报销中金额
            // bxzzs: '',       //报销中张数
            // ybxje: '',       //已报销金额
            // ybxzs: '',       //已报销张数

            targetExpenseId: '',

            noReimbursementPage: 1,
            noReimbursementLoadMore: true,

            inReimbursementPage: 1,
            inReimbursementLoadMore: true,

            doneReimbursementPage: 1,
            doneReimbursementLoadMore: true,

            showPickerShadow: false,   //是否显示选择器阴影
        }))
    }
};

export const loadData = () => {
    return dispatch => {
        dispatch(loadInvoiceTypeListData());
        dispatch(loadInvoiceTotalData());
        dispatch(getApplyType());
    }
};

/**
 * 报销类别
 */
export const getApplyType = (requestData) => {

    return dispatch => {
        return HttpUtil.postJson(API.GET_APPLY_TYPE, requestData, dispatch, function (ret, status) {
            if (status) {
                if (ret.status) {
                    var reimbursementTypeList = ret.data;
                    var reimburseTypeList = [];
                    for (var i = 0; i < reimbursementTypeList.length; i++) {
                        reimburseTypeList.push(reimbursementTypeList[i].name);
                    }
                    dispatch(changeState({
                        reimbursementTypeOriginalList: reimbursementTypeList,
                        reimbursementTypeList: reimburseTypeList,
                    }));
                } else {
                    dispatch(changeState({
                        isLoading: false,
                    }));
                    Util.showToast(ret.message);
                }
            } else {
                dispatch(changeState({
                    isLoading: false,
                }));
            }
        })
    }

};

/**
 * 票夹第一次加载数据
 * @param isSyn
 * @returns {function(*=)}
 */
export const loadInvoiceListDataReimbursement = (isSyn) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
            isFirst: false,
        }));
        return HttpUtil.postJson(API.GET_APPLY_TYPE, {}, dispatch, function (ret, status) {
            if (status) {
                if (ret.status) {
                    var reimbursementTypeList = ret.data;
                    var reimburseTypeList = [];
                    for (var i = 0; i < reimbursementTypeList.length; i++) {
                        reimburseTypeList.push(reimbursementTypeList[i].name);
                    }
                    dispatch(changeState({
                        reimbursementTypeOriginalList: reimbursementTypeList,
                        reimbursementTypeList: reimburseTypeList,
                    }));
                    return HttpUtil.postJson(API.GET_INVOICE_LIST_DATA, {
                        invoiceTime: '',
                        reimburseState: 0,
                        invoiceTypeCode: '',
                        page: 1,
                        rows: 20,
                        isSyn: isSyn,
                    }, dispatch, function (ret, status) {
                        if (status) {
                            if (ret.data == null) {
                                dispatch(changeState({
                                    dataWithoutReimbursement: [],
                                    noReimbursementLoadMore: false
                                }))
                            } else {
                                dispatch(changeState({
                                    dataWithoutReimbursement: ret.data,
                                    noReimbursementLoadMore: ret.data.length == 20
                                }));
                                return HttpUtil.postJson(API.GET_INVOICE_LIST_DATA, {
                                    invoiceTime: '',
                                    reimburseState: 2,
                                    invoiceTypeCode: '',
                                    page: 1,
                                    rows: 20,
                                    isSyn: 'N'
                                }, dispatch, function (ret, status) {
                                    if (status) {
                                        if (ret.data == null) {
                                            dispatch(changeState({
                                                dataWithinReimbursement: [],
                                                inReimbursementLoadMore: false
                                            }))
                                        } else {
                                            dispatch(changeState({
                                                dataWithinReimbursement: ret.data,
                                                inReimbursementLoadMore: ret.data.length == 20
                                            }));
                                            return HttpUtil.postJson(API.GET_INVOICE_LIST_DATA, {
                                                invoiceTime: '',
                                                reimburseState: 3,
                                                invoiceTypeCode: '',
                                                page: 1,
                                                rows: 20,
                                                isSyn: 'N'
                                            }, dispatch, function (ret, status) {
                                                if (status) {
                                                    if (ret.data == null) {
                                                        dispatch(changeState({
                                                            dataWithoutReimbursement: [],
                                                            doneReimbursementLoadMore: false
                                                        }))
                                                    } else {
                                                        dispatch(changeState({
                                                            dataDoneReimbursement: ret.data,
                                                            doneReimbursementLoadMore: ret.data.length == 20
                                                        }));
                                                        return HttpUtil.postJson(API.GET_INVOICE_TOTAL_DATA, {}, dispatch, function (ret, status) {
                                                            if (status) {
                                                                dispatch(changeState({
                                                                    zje: ret.data.zje,
                                                                    zsl: ret.data.zsl,
                                                                    wbxje: ret.data.wbxje,
                                                                    wbxzs: ret.data.wbxzs,
                                                                    bxzje: ret.data.bxzje,
                                                                    bxzzs: ret.data.bxzzs,
                                                                    ybxje: ret.data.ybxje,
                                                                    ybxzs: ret.data.ybxzs,
                                                                    isLoading: false
                                                                }));
                                                            } else {
                                                                dispatch(changeState({
                                                                    isLoading: false
                                                                }));
                                                            }
                                                        });
                                                    }
                                                } else {
                                                    dispatch(changeState({
                                                        isLoading: false
                                                    }));
                                                }
                                            });
                                        }
                                    } else {
                                        dispatch(changeState({
                                            isLoading: false
                                        }));
                                    }
                                });
                            }
                        } else {
                            dispatch(changeState({
                                isLoading: false
                            }));
                        }
                    })
                } else {
                    dispatch(changeState({
                        isLoading: false,
                    }));
                    Util.showToast(ret.message);
                }
            } else {
                dispatch(changeState({
                    isLoading: false,
                }));
            }
        });
    }
};

/**
 * 根据票夹日期选择加载数据
 * @param dateStr
 * @returns {function(*=)}
 */
export const loadInvoiceListDataReimbursementByDate = (dateStr) => {
    return dispatch => {
        dispatch(changeState({
            isFirst: false,
        }));
        return HttpUtil.postJson(API.GET_INVOICE_LIST_DATA, {
            invoiceTime: dateStr,
            reimburseState: 0,
            invoiceTypeCode: '',
            page: 1,
            rows: 20,
            isSyn: 'N',
        }, dispatch, function (ret, status) {
            if (status) {
                if (ret.data == null) {
                    dispatch(changeState({
                        dataWithoutReimbursement: [],
                        noReimbursementLoadMore: false
                    }))
                } else {
                    dispatch(changeState({
                        dataWithoutReimbursement: ret.data,
                        noReimbursementLoadMore: ret.data.length == 20
                    }));
                    return HttpUtil.postJson(API.GET_INVOICE_LIST_DATA, {
                        invoiceTime: dateStr,
                        reimburseState: 2,
                        invoiceTypeCode: '',
                        page: 1,
                        rows: 20,
                        isSyn: 'N'
                    }, dispatch, function (ret, status) {
                        if (status) {
                            if (ret.data == null) {
                                dispatch(changeState({
                                    dataWithinReimbursement: [],
                                    inReimbursementLoadMore: false
                                }))
                            } else {
                                dispatch(changeState({
                                    dataWithinReimbursement: ret.data,
                                    inReimbursementLoadMore: ret.data.length == 20
                                }));
                                return HttpUtil.postJson(API.GET_INVOICE_LIST_DATA, {
                                    invoiceTime: dateStr,
                                    reimburseState: 3,
                                    invoiceTypeCode: '',
                                    page: 1,
                                    rows: 20,
                                    isSyn: 'N'
                                }, dispatch, function (ret, status) {
                                    if (status) {
                                        if (ret.data == null) {
                                            dispatch(changeState({
                                                dataWithoutReimbursement: [],
                                                doneReimbursementLoadMore: false,
                                                isLoading: false
                                            }));
                                        } else {
                                            dispatch(changeState({
                                                dataDoneReimbursement: ret.data,
                                                doneReimbursementLoadMore: ret.data.length == 20,
                                                isLoading: false
                                            }));
                                        }
                                    } else {
                                        dispatch(changeState({
                                            isLoading: false
                                        }));
                                    }
                                });
                            }
                        } else {
                            dispatch(changeState({
                                isLoading: false
                            }));
                        }
                    });
                }
            } else {
                dispatch(changeState({
                    isLoading: false
                }));
            }
        })
    }
};

/**
 * 票夹页面点击报销按钮到票夹多选页面数据加载
 * 日期，列表数据;
 * 反之，从票夹多选页面到票夹页面也需数据加载
 * @returns {function(*=)}
 */
export const loadInvoiceListReimbursedData = () => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
            isFirst: false
        }));
        return HttpUtil.postJson(API.GET_INVOICE_LIST_DATA, {
            invoiceTime: '',
            reimburseState: 0,
            invoiceTypeCode: '',
            page: 1,
            rows: 20,
            isSyn: 'N',
        }, dispatch, function (ret, status) {
            if (status) {
                if (ret.data == null) {
                    dispatch(changeState({
                        dataWithoutReimbursement: [],
                        noReimbursementLoadMore: false
                    }))
                } else {
                    dispatch(changeState({
                        dataWithoutReimbursement: ret.data,
                        noReimbursementLoadMore: ret.data.length == 20
                    }));
                    return HttpUtil.postJson(API.GET_INVOICE_LIST_DATA, {
                        invoiceTime: '',
                        reimburseState: 2,
                        invoiceTypeCode: '',
                        page: 1,
                        rows: 20,
                        isSyn: 'N'
                    }, dispatch, function (ret, status) {
                        if (status) {
                            if (ret.data == null) {
                                dispatch(changeState({
                                    dataWithinReimbursement: [],
                                    inReimbursementLoadMore: false
                                }))
                            } else {
                                dispatch(changeState({
                                    dataWithinReimbursement: ret.data,
                                    inReimbursementLoadMore: ret.data.length == 20
                                }));
                                return HttpUtil.postJson(API.GET_INVOICE_LIST_DATA, {
                                    invoiceTime: '',
                                    reimburseState: 3,
                                    invoiceTypeCode: '',
                                    page: 1,
                                    rows: 20,
                                    isSyn: 'N'
                                }, dispatch, function (ret, status) {
                                    if (status) {
                                        if (ret.data == null) {
                                            dispatch(changeState({
                                                dataWithoutReimbursement: [],
                                                doneReimbursementLoadMore: false,
                                                isLoading: false
                                            }));
                                        } else {
                                            dispatch(changeState({
                                                dataDoneReimbursement: ret.data,
                                                doneReimbursementLoadMore: ret.data.length == 20,
                                                isLoading: false
                                            }));
                                        }
                                    } else {
                                        dispatch(changeState({
                                            isLoading: false
                                        }));
                                    }
                                });
                            }
                        } else {
                            dispatch(changeState({
                                isLoading: false
                            }));
                        }
                    });
                }
            } else {
                dispatch(changeState({
                    isLoading: false
                }));
            }
        })
    }
};

/**
 * 未报销发票列表
 */
export const loadInvoiceListDataWithoutReimbursement = (requestData) => {
    return dispatch => {
        dispatch(changeState({isLoading: true}));
        return HttpUtil.postJson(API.GET_INVOICE_LIST_DATA, requestData, dispatch, function (ret, status) {
            if (status) {
                if (ret.data == null) {
                    dispatch(changeState({
                        dataWithoutReimbursement: [],
                        noReimbursementLoadMore: false
                    }))
                } else {
                    dispatch(changeState({
                        dataWithoutReimbursement: ret.data,
                        noReimbursementLoadMore: ret.data.length == 20
                    }));
                    dispatch(loadInvoiceTotalData());
                }
            }
        })
    }
};

/**
 * 报销中发票列表
 */
export const loadInvoiceListDataWithinReimbursement = (requestData) => {
    return dispatch => {
        return HttpUtil.postJson(API.GET_INVOICE_LIST_DATA, requestData, dispatch, function (ret, status) {
            if (status) {
                if (ret.data == null) {
                    dispatch(changeState({
                        dataWithinReimbursement: [],
                        inReimbursementLoadMore: false
                    }))
                } else {
                    dispatch(changeState({
                        dataWithinReimbursement: ret.data,
                        inReimbursementLoadMore: ret.data.length == 20
                    }));
                    dispatch(loadInvoiceTotalData());
                }
            }
        })
    }
};

/**
 * 已报销发票列表
 */
export const loadInvoiceListDataDoneReimbursement = (requestData) => {
    return dispatch => {
        return HttpUtil.postJson(API.GET_INVOICE_LIST_DATA, requestData, dispatch, function (ret, status) {
            if (status) {
                if (ret.data == null) {
                    dispatch(changeState({
                        dataWithoutReimbursement: [],
                        doneReimbursementLoadMore: false
                    }))
                } else {
                    dispatch(changeState({
                        dataDoneReimbursement: ret.data,
                        doneReimbursementLoadMore: ret.data.length == 20
                    }));
                    dispatch(loadInvoiceTotalData());
                }
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
            dataWithoutReimbursement: [],       //未报销发票

            noReimbursementPage: 1,
            noReimbursementLoadMore: false,
            inReimbursementPage: 1,
            inReimbursementLoadMore: false,
            doneReimbursementPage: 1,
            doneReimbursementLoadMore: false,
        }));
        return HttpUtil.postJson(API.GET_INVOICE_LIST_DATA, {
            invoiceTime: selectedDateStr,
            reimburseState: 0,
            invoiceTypeCode: '',
            page: 1,
            rows: 20,
            isSyn: 'Y',
        }, dispatch, function (ret, status) {
            dispatch(changeState({
                isRefreshing: false,
            }));
            var invoiceState = getState().Invoice;
            var lastInvoiceData = invoiceState.dataWithoutReimbursement;
            if (status) {
                if (ret.status) {
                    dispatch(changeState({
                        dataWithoutReimbursement: ret.data ? ret.data : [],
                        noReimbursementPage: 1,
                        noReimbursementLoadMore: ret.data.length == 20,
                    }));
                    dispatch(loadInvoiceTotalData());
                    // 更新底部状态
                    // if (invoiceState.showCheckbox) {
                    //     updateInvoiceData(dispatch, lastInvoiceData, ret.data, invoiceState);
                    // }
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

export const updateInvoiceData = (dispatch, oldDataList, newDataList, invoiceState) => {
    var selectedItemIDCount;//单行选中的发票ID数
    var allItemCount = 0;        //列表所有发票数
    var isSelectedAll;      //是否选择全选按钮
    var selectedItem;       //单行选中的发票
    var allItem;            //列表所有发票
    var selectedItemAmount; //单行选中的发票金额数
    var allItemAmount;      //列表所有发票金额
    var totalAmount         //所有发票金额数值
    var dataWithoutReimbursement;   //未报销发票数组
    var status;
    var selectedDateStr;

    selectedItemIDCount = invoiceState.selectedItemIDCount;
    isSelectedAll = invoiceState.isSelectedAll;
    selectedItem = invoiceState.selectedItem;
    allItem = invoiceState.allItem;
    selectedItemAmount = invoiceState.selectedItemAmount;
    allItemAmount = invoiceState.allItemAmount;
    totalAmount = 0;//初始化,防止undefined
    status = invoiceState.reimbursementStatus;
    dataWithoutReimbursement = newDataList;

    for (var k = 0; k < dataWithoutReimbursement.length; k++) {
        if (!(Util.contains(['01', '02', '04', '10', '11'], dataWithoutReimbursement[k].invoiceTypeCode)
            && dataWithoutReimbursement[k].checkState == 0) && status != 2 && status != 3) {
            allItemCount += parseInt(dataWithoutReimbursement[k].invoiceCount);
            totalAmount += parseFloat(dataWithoutReimbursement[k].totalAmount);
        }
    }

    if (selectedItemIDCount == allItemCount && isSelectedAll) {
        selectedItem = [].concat(allItem);
        selectedItemAmount = totalAmount;
        dispatch(changeState({
            isSelectedAll: true,
            selectedItemIDCount: allItemCount,
            selectedItem: selectedItem,
            selectedItemAmount: selectedItemAmount
        }));
    } else {
        selectedItem = [];
        dispatch(changeState({
            isSelectedAll: false,
            selectedItemIDCount: 0,
            selectedItem: selectedItem,
            selectedItemAmount: 0
        }));
    }
};

/**
 * 刷新报销中发票列表
 * @param requestData
 * @returns {function(*=)}
 */
export const refreshInReimbursementData = (selectedDateStr) => {
    return dispatch => {
        dispatch(changeState({
            isRefreshing: true,
        }));
        return HttpUtil.postJson(API.GET_INVOICE_LIST_DATA, {
            invoiceTime: selectedDateStr,
            reimburseState: 2,
            invoiceTypeCode: '',
            page: 1,
            rows: 20,
            isSyn: 'Y',
        }, dispatch, function (ret, status) {
            dispatch(changeState({
                isRefreshing: false,
            }));
            if (status) {
                if (ret.status) {
                    dispatch(changeState({
                        dataWithinReimbursement: ret.data ? ret.data : [],
                        inReimbursementPage: 1,
                        inReimbursementLoadMore: ret.data.length == 20,
                    }));
                    dispatch(loadInvoiceTotalData());
                } else {
                    dispatch(changeState({
                        dataWithinReimbursement: [],
                        inReimbursementPage: 1,
                        inReimbursementLoadMore: false,
                    }));
                    Util.showToast(ret.message);
                }
            }
        });
    }
};

/**
 * 刷新已报销发票列表
 * @param requestData
 * @returns {function(*=)}
 */
export const refreshCompletedReimbursementData = (selectedDateStr) => {
    return dispatch => {
        dispatch(changeState({
            isRefreshing: true,
        }));
        return HttpUtil.postJson(API.GET_INVOICE_LIST_DATA, {
            invoiceTime: selectedDateStr,
            reimburseState: 3,
            invoiceTypeCode: '',
            page: 1,
            rows: 20,
            isSyn: 'Y',
        }, dispatch, function (ret, status) {
            dispatch(changeState({
                isRefreshing: false,
            }));
            if (status) {
                if (ret.status) {
                    dispatch(changeState({
                        dataDoneReimbursement: ret.data ? ret.data : [],
                        doneReimbursementPage: 1,
                        doneReimbursementLoadMore: ret.data.length == 20,
                    }));
                    dispatch(loadInvoiceTotalData());
                } else {
                    dispatch(changeState({
                        dataDoneReimbursement: [],
                        doneReimbursementPage: 1,
                        doneReimbursementLoadMore: false,
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
export const loadMoreNoReimbursementData = (requestData) => {
    return (dispatch, getState) => {
        dispatch(changeState({
            showLoading: true
        }));
        return HttpUtil.postJson(API.GET_INVOICE_LIST_DATA, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                showLoading: false
            }));
            var dataWithoutReimbursement = getState().Invoice.dataWithoutReimbursement;
            if (status) {
                if (ret.status) {
                    if (ret.data != null) {
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

/**
 * 加载更多报销中发票
 * @param requestData
 * @param dataWithinReimbursement
 * @returns {function(*=)}
 */
export const loadMoreInReimbursementData = (requestData) => {
    return (dispatch, getState) => {
        dispatch(changeState({
            showLoading: true
        }));
        return HttpUtil.postJson(API.GET_INVOICE_LIST_DATA, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                showLoading: false
            }));
            var dataWithinReimbursement = getState().Invoice.dataWithinReimbursement;
            if (status) {
                if (ret.status) {
                    if (ret.data != null) {
                        dispatch(changeState({
                            dataWithinReimbursement: dataWithinReimbursement.concat(ret.data),
                            inReimbursementPage: requestData.page,
                            inReimbursementLoadMore: ret.data.length == 20,
                        }))
                    }
                } else {
                    Util.showToast(ret.message);
                }
            }
        });
    }
};

/**
 * 加载更多已报销发票
 * @param requestData
 * @param dataDoneReimbursement
 * @returns {function(*=)}
 */
export const loadMoreCompletedReimbursementData = (requestData) => {
    return (dispatch, getState) => {
        dispatch(changeState({
            showLoading: true
        }));
        return HttpUtil.postJson(API.GET_INVOICE_LIST_DATA, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                showLoading: false
            }));
            var dataDoneReimbursement = getState().Invoice.dataDoneReimbursement;
            if (status) {
                if (ret.status) {
                    if (ret.data != null) {
                        dispatch(changeState({
                            dataDoneReimbursement: dataDoneReimbursement.concat(ret.data),
                            doneReimbursementPage: requestData.page,
                            doneReimbursementLoadMore: ret.data.length == 20,
                        }))
                    }
                } else {
                    Util.showToast(ret.message);
                }
            }
        });
    }
};

/**
 * 发票类型
 * @returns {function(*)}
 */
export const loadInvoiceTypeListData = () => {
    return dispatch => {
        return HttpUtil.postJson(API.GET_INVOICE_TYPE_LIST_DATA, {}, dispatch, function (ret, status) {
            if (status) {
                dispatch(changeState({
                    invoiceTypeData: ret.data
                }))
            }
        })
    }
}

/**
 * 获取发票汇总数据
 * @returns {function(*)}
 */
export const loadInvoiceTotalData = () => {
    return dispatch => {
        return HttpUtil.postJson(API.GET_INVOICE_TOTAL_DATA, {}, dispatch, function (ret, status) {
            if (status) {
                dispatch(changeState({
                    zje: ret.data.zje,
                    zsl: ret.data.zsl,
                    wbxje: ret.data.wbxje,
                    wbxzs: ret.data.wbxzs,
                    bxzje: ret.data.bxzje,
                    bxzzs: ret.data.bxzzs,
                    ybxje: ret.data.ybxje,
                    ybxzs: ret.data.ybxzs,
                    isLoading: false
                }))
            }
        })
    }
};

/**
 * 删除
 * @returns {function(*)}
 */
export const loadInvoiceDelete = (uuid) => {
    return (dispatch, getState) => {
        dispatch(changeState({isLoading: true}));
        return HttpUtil.postJson(API.GET_INVOICE_DELETE, {uuid: uuid}, dispatch, function (ret, status) {
            if (status) {
                if (ret.status) {
                    var dataWithoutReimbursement = getState().Invoice.dataWithoutReimbursement;
                    var newDataWithoutReimbursement = [];
                    for (let i = 0; i < dataWithoutReimbursement.length; i++) {
                        if (dataWithoutReimbursement[i].uuid !== uuid) {
                            newDataWithoutReimbursement.push(dataWithoutReimbursement[i]);
                        }
                    }

                    dispatch(changeState({dataWithoutReimbursement: newDataWithoutReimbursement}));
                    return HttpUtil.postJson(API.GET_INVOICE_TOTAL_DATA, {}, dispatch, function (ret, status) {
                        if (status) {
                            dispatch(changeState({
                                zje: ret.data.zje,
                                zsl: ret.data.zsl,
                                wbxje: ret.data.wbxje,
                                wbxzs: ret.data.wbxzs,
                                bxzje: ret.data.bxzje,
                                bxzzs: ret.data.bxzzs,
                                ybxje: ret.data.ybxje,
                                ybxzs: ret.data.ybxzs,
                                isLoading: false
                            }))
                        }
                    });
                } else {
                    dispatch(changeState({isLoading: false}));
                    Util.showToast(Message.INVOICE_LIST_DELETE_INVOICE_WITHIN_USING_TIP);
                }
            }else {
                dispatch(changeState({isLoading: false}));
            }
        })
    }
}


/**
 * ocr方式归集发票
 */
export const ocrValidation = (requestData, params) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true
        }));
        return HttpUtil.postJson(API.COLLECT_BY_PIC, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false
            }));
            dispatch(changeReimState({
                isLoading: false
            }));
            dispatch(changeNewInvoiceState({
                isLoading: false
            }));
            dispatch(changeEditInvoiceState({
                isLoading: false
            }));
            dispatch(changeInvoiceDetailsState({
                isLoading: false
            }))

            if (status) {
                dispatch(navigateToNewOrEditInvoicePage(ret, false, params));
            }
        })
    }
}


