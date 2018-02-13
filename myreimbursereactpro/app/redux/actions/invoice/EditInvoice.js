import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';
import {back} from '../../actions/navigator/Navigator';
import Message from '../../../constant/Message';
import {
    loadInvoiceListDataWithoutReimbursement as withoutReimbursement,
    loadInvoiceListDataWithinReimbursement,
    loadInvoiceListDataDoneReimbursement,
    changeState as invoiceChangeState,
    doInitialise,
    loadInvoiceListDataReimbursement
} from '../../actions/invoice/Invoice';
import {
    loadInvoiceListDataWithoutReimbursement,
    changeState as addInvoiceChangeState
} from "../../actions/invoice/AddInvoice";
import {loadData as loadInvoiceDetailData} from '../../actions/invoice/InvoiceDetails';

import {loadInvoiceDelete} from '../../actions/invoice/Invoice';

export const initData = () => {
    return {
        type: types.EDIT_INVOICE_INIT_STATE,
    }
}

export const changeState = (state) => {
    return {
        type: types.EDIT_INVOICE_STATE,
        state: state,
    }
}

export const editToReimbursementSelectedInvoiceList = (expenseId, selectedInvoice) => {
    return {
        type: types.EDIT_TO_NEW_REIMBURSEMENT_WITH_SELECTED_INVOICE_LIST,
        expenseId: expenseId,
        selectedInvoice: selectedInvoice,
    }
}

export const invoiceDelete = (uuid) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true
        }))
        return HttpUtil.postJson(API.GET_INVOICE_DELETE, {uuid: uuid}, dispatch, function (ret, status) {
            setTimeout(() => {
                dispatch(loadInvoiceListDataReimbursement('N'));
            }, 200);
            dispatch(changeState({
                isLoading: false
            }))
        })
    }
}

export const loadInvoiceDetail = (uuid) => {
    return (dispatch, getState) => {
        const reimbursementTypeList = getState().Invoice.reimbursementTypeOriginalList;
        var reimburseTypeList = [];
        for (var i = 0; i < reimbursementTypeList.length; i++) {
            reimburseTypeList.push(reimbursementTypeList[i].name);
        }
        dispatch(changeState({
            isLoading: true,
            reimbursementTypeOriginalList: reimbursementTypeList,
            reimbursementTypeList: reimburseTypeList,
        }))
        return HttpUtil.postJson(API.GET_INVOICE_DETAIL_DATA, {uuid: uuid}, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false
            }))
            if (status) {
                if (ret.status) {
                    var goodsName = '';
                    var invoiceAmount = '';
                    var totalAmount = '';
                    if (ret.data.detailList != null && ret.data.detailList.length > 0) {
                        goodsName = ret.data.detailList[0].goodsName + (ret.data.detailList.length > 1 ? '等' : '');
                    }
                    invoiceAmount = (parseFloat(ret.data.invoiceAmount) == 'NaN') || ret.data.invoiceAmount == 0 ? '' : parseFloat(ret.data.invoiceAmount).toFixed(2);
                    totalAmount = (parseFloat(ret.data.totalAmount) == 'NaN') || ret.data.totalAmount == 0 ? '' : parseFloat(ret.data.totalAmount).toFixed(2);
                    dispatch(changeState({
                        invoiceTypeCode: ret.data.invoiceTypeCode,
                        invoiceTypeName: Util.getInvoiceTypeName(ret.data.invoiceTypeCode),
                        reimburseState: ret.data.reimburseState,
                        uuid: ret.data.uuid,
                        invoiceCode: ret.data.invoiceCode,
                        invoiceNo: ret.data.invoiceNo,
                        invoiceDate: ret.data.invoiceDate,
                        verifyCode: ret.data.verifyCode,
                        buyerName: ret.data.buyerName,
                        invoiceAmount: invoiceAmount,
                        totalAmount: totalAmount,
                        salerName: ret.data.salerName,
                        invoiceDetail: goodsName,
                        remark: ret.data.remark,
                        checkState: ret.data.checkState,
                        departCity: ret.data.departCity,
                        arriveCity: ret.data.arriveCity,
                        trainNumber: ret.data.trainNumber,
                        invoiceCount: ret.data.invoiceCount,
                        dataSourceCode: ret.data.dataSourceCode,
                        oldInvoiceTotalAmount: ret.data.totalAmount,  //保存发票修改前的税价合计
                        oldInvoiceTotalCount: ret.data.invoiceCount,  //保存发票修改前的附件张数
                    }))
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

/**
 * 保存发票
 * @param requestData 请求参数
 * @param returnCallBack bool  是否需要返回进行回调，继续归集和立即报销需要回调
 * @param callBack  回调方法
 */
export const saveInvoice = (requestData, returnCallBack, callBack) => {
    return (dispatch, getState) => {
        dispatch(changeState({
            isLoading: true
        }))
        return HttpUtil.postJson(API.UPDATE_INVOICE, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false
            }))
            if (status) {
                if (ret.status) {
                    dispatch(changeState({
                        dataSaved: true
                    }))
                    const emptyStr = '';
                    //从新建报销单，添加发票到票夹页面（即添加发票页面）,票夹中修改前选中的发票张数
                    const addInvoiceSelectedCount = parseInt(getState().AddInvoice.selectedItemIDCount);
                    //从新建报销单，添加发票到票夹页面（即添加发票页面）,票夹中选中的发票
                    const addInvoiceSelectedInvoices = getState().AddInvoice.reimbursementSelected;
                    var addInvoiceSelectedAmount = '';
                    var selectedItemAmount = '';
                    var updatedInvoiceTotalAmount = '';
                    var updatedInvoiceTotalCount = '';
                    if (addInvoiceSelectedCount > 0) {
                        addInvoiceSelectedAmount = parseFloat(getState().AddInvoice.selectedItemAmount);
                    }

                    //票夹中修改前选中的发票张数
                    const selectedItemIDCount = parseInt(getState().Invoice.selectedItemIDCount);
                    if (selectedItemIDCount > 0) {
                        //票夹中修改前选中的发票金额
                        selectedItemAmount = parseFloat(getState().Invoice.selectedItemAmount);
                    }
                    //发票修改前附件张数
                    const oldInvoiceTotalCount = parseInt(getState().EditInvoice.oldInvoiceTotalCount);
                    //发票修改前金额
                    const oldInvoiceTotalAmount = parseFloat(getState().EditInvoice.oldInvoiceTotalAmount);
                    //发票修改后附件张数
                    const newInvoiceTotalCount = parseInt(requestData.invoiceCount);
                    //发票修改后金额
                    const newInvoiceTotalAmount = parseFloat(requestData.totalAmount);

                    if (selectedItemIDCount > 0) {
                        //计算修改发票后的张数
                        updatedInvoiceTotalCount = selectedItemIDCount - oldInvoiceTotalCount + newInvoiceTotalCount;
                        //计算修改发票后的金额
                        updatedInvoiceTotalAmount = (selectedItemAmount - oldInvoiceTotalAmount + newInvoiceTotalAmount).toFixed(2);
                        dispatch(invoiceChangeState({
                            selectedItemIDCount: updatedInvoiceTotalCount,
                            selectedItemAmount: updatedInvoiceTotalAmount
                        }));
                    }
                    if (addInvoiceSelectedCount > 0) {
                        //计算修改发票后的张数
                        updatedInvoiceTotalCount = addInvoiceSelectedCount - oldInvoiceTotalCount + newInvoiceTotalCount;
                        //计算修改发票后的金额
                        updatedInvoiceTotalAmount = (addInvoiceSelectedAmount - oldInvoiceTotalAmount + newInvoiceTotalAmount).toFixed(2);
                        dispatch(addInvoiceChangeState({
                            selectedItemIDCount: updatedInvoiceTotalCount,
                            selectedItemAmount: updatedInvoiceTotalAmount
                        }));
                    }
                    dispatch(invoiceChangeState({
                        noReimbursementPage: 1,
                        inReimbursementPage: 1,
                        doneReimbursementPage: 1
                    }));
                    dispatch(loadInvoiceListDataReimbursement('N'));
                    dispatch(loadInvoiceListDataWithoutReimbursement('', addInvoiceSelectedInvoices));
                    dispatch(loadInvoiceDetailData(requestData.uuid, false));
                    if (returnCallBack) {
                        dispatch(getCheckState(requestData.uuid, callBack));
                    } else {
                        Util.showToast(Message.SAVE_SUCCESS);
                        dispatch(back());
                    }
                } else {
                    if (ret.message == '9993') {
                        Util.showToast(Message.SCAN_QR_CODE_ALREADY_COLLECTED);
                    } else if (ret.message == '9995') {
                        Util.showToast(Message.SCAN_QR_CODE_ALREADY_REIMBURSED);
                    } else if (ret.message == '9988') {
                        Util.showToast(Message.SCAN_QR_CODE_REIMBURSING);
                    } else {
                        Util.showToast(ret.message);
                    }
                }
            }
        })
    }
}

/**
 * 保存发票之后获取查验状态
 * @param requestData 请求参数
 * @param returnCallBack bool  是否需要返回进行回调，继续归集和立即报销需要回调
 * @param callBack  回调方法
 */
export const getCheckState = (uuid, callBack) => {
    return (dispatch) => {
        dispatch(changeState({
            isLoading: true
        }))
        return HttpUtil.postJson(API.GET_INVOICE_DETAIL_DATA, {uuid: uuid}, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false
            }))
            if (status) {
                if (ret.status) {
                    var goodsName = '';
                    var invoiceAmount = '';
                    var totalAmount = '';
                    if (ret.data.detailList != null && ret.data.detailList.length > 0) {
                        goodsName = ret.data.detailList[0].goodsName + (ret.data.detailList.length > 1 ? '等' : '');
                    }
                    invoiceAmount = (parseFloat(ret.data.invoiceAmount) == 'NaN') || ret.data.invoiceAmount == 0 ? '' : parseFloat(ret.data.invoiceAmount).toFixed(2);
                    totalAmount = (parseFloat(ret.data.totalAmount) == 'NaN') || ret.data.totalAmount == 0 ? '' : parseFloat(ret.data.totalAmount).toFixed(2);
                    dispatch(changeState({
                        invoiceTypeCode: ret.data.invoiceTypeCode,
                        invoiceTypeName: Util.getInvoiceTypeName(ret.data.invoiceTypeCode),
                        reimburseState: ret.data.reimburseState,
                        uuid: ret.data.uuid,
                        invoiceCode: ret.data.invoiceCode,
                        invoiceNo: ret.data.invoiceNo,
                        invoiceDate: ret.data.invoiceDate,
                        verifyCode: ret.data.verifyCode,
                        buyerName: ret.data.buyerName,
                        invoiceAmount: invoiceAmount,
                        totalAmount: totalAmount,
                        salerName: ret.data.salerName,
                        invoiceDetail: goodsName,
                        remark: ret.data.remark,
                        checkState: ret.data.checkState,
                        departCity: ret.data.departCity,
                        arriveCity: ret.data.arriveCity,
                        trainNumber: ret.data.trainNumber,
                        invoiceCount: ret.data.invoiceCount,
                    }))
                    setTimeout(
                        () => {
                            callBack(ret.data, goodsName);
                        },
                        500
                    );
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}
