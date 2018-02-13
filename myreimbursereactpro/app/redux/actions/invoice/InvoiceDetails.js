import * as types from "../../../constant/ActionTypes";
import HttpUtil from "../../../network/HttpUtil";
import API from "../../../utils/API";
import Util from "../../../utils/Util";
import Message from "../../../constant/Message";
import {
    loadInvoiceListDataReimbursement
} from "../../actions/invoice/Invoice";

export const changeState = (state) => {
    return {
        type: types.INVOICE_DETAIL_CHANGE_STATE,
        state: state,
    }
}

export const loadData = (uuid, isFromNew) => {
    return dispatch => {
        dispatch(loadInvoiceDetailData(uuid, isFromNew));
    }
}

export const initData = () => {
    return {
        type: types.INIT_INVOICE_DETAIL,
    }
}

export const loadInvoiceDetailData = (uuid, isFromNew) => {
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

        //来自新见报销单  判断该uuid是否已经在报销单中，如果在则显示提示
        if (isFromNew) {
            const bizExpenseTypeList = getState().Reimbursement.bizExpenseTypeList;
            var alreadySelectedInvoice = [];
            for (var z = 0; z < bizExpenseTypeList.length; z++) {
                alreadySelectedInvoice = alreadySelectedInvoice.concat(bizExpenseTypeList[z].bizExpenseBillList);
            }
            for (var y = 0; y < alreadySelectedInvoice.length; y++) {
                if (uuid == alreadySelectedInvoice[y].invoiceUUID) {
                    dispatch(changeState({
                        alreadyInNewReimbursement: true,
                    }))
                }
            }
        }
        return HttpUtil.postJson(API.GET_INVOICE_DETAIL_DATA, {uuid: uuid}, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false
            }))
            if (status) {
                if (ret.status) {
                    var goodsName = '';
                    if (ret.data.detailList != null && ret.data.detailList.length > 0) {
                        if (ret.data.detailList[0].goodsName != '' &&
                            (typeof(ret.data.detailList[0].goodsName) != 'undefined')) {
                            goodsName = ret.data.detailList[0].goodsName + (ret.data.detailList.length > 1 ? '等' : '');
                        }
                        // else {
                        //     goodsName = '其他';
                        // }
                    }
                    // else {
                    //     goodsName = '其他';
                    // }
                    dispatch(changeState({
                        invoiceTypeCode: ret.data.invoiceTypeCode,
                        reimburseState: ret.data.reimburseState,
                        uuid: ret.data.uuid,
                        checkState: ret.data.checkState,
                        invoiceCode: ret.data.invoiceCode,
                        invoiceNo: ret.data.invoiceNo,
                        invoiceDate: ret.data.invoiceDate,
                        verifyCode: ret.data.verifyCode,
                        buyerName: ret.data.buyerName,
                        invoiceAmount: ret.data.invoiceAmount == 0 ? '' : ret.data.invoiceAmount,
                        totalAmount: ret.data.totalAmount == 0 ? '' : ret.data.totalAmount,
                        salerName: ret.data.salerName,
                        goodsName: goodsName,
                        remark: ret.data.remark,
                        departCity: ret.data.departCity,
                        arriveCity: ret.data.arriveCity,
                        trainNumber: ret.data.trainNumber,
                        invoiceCount: ret.data.invoiceCount,
                        dataSourceCode: ret.data.dataSourceCode,
                    }))
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const invoiceCheck = (requestData) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true
        }))
        return HttpUtil.postJson(API.UPDATE_INVOICE, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false
            }))
            if (status) {
                if (ret.status) {
                    var goodsName = '';
                    if (ret.data.detailList != null && ret.data.detailList.length > 0) {
                        if (ret.data.detailList[0].goodsName != '' &&
                            (typeof(ret.data.detailList[0].goodsName) != 'undefined')) {
                            goodsName = ret.data.detailList[0].goodsName + (ret.data.detailList.length > 1 ? '等' : '');
                        }
                    }
                    if (ret.data.checkState != '1') {
                        Util.showToast(Message.INVOICE_DETAIL_CHECK_FAILED);
                    }
                    dispatch(changeState({
                        invoiceTypeCode: ret.data.invoiceTypeCode,
                        reimburseState: ret.data.reimburseState,
                        uuid: ret.data.uuid,
                        checkState: ret.data.checkState,
                        invoiceCode: ret.data.invoiceCode,
                        invoiceNo: ret.data.invoiceNo,
                        invoiceDate: ret.data.invoiceDate,
                        verifyCode: ret.data.verifyCode,
                        buyerName: ret.data.buyerName,
                        invoiceAmount: ret.data.invoiceAmount == 0 ? '' : ret.data.invoiceAmount,
                        totalAmount: ret.data.totalAmount == 0 ? '' : ret.data.totalAmount,
                        salerName: ret.data.salerName,
                        goodsName: goodsName,
                        remark: ret.data.remark,
                        departCity: ret.data.departCity,
                        arriveCity: ret.data.arriveCity,
                        trainNumber: ret.data.trainNumber,
                        invoiceCount: ret.data.invoiceCount,
                        dataSourceCode: ret.data.dataSourceCode,
                    }));
                    dispatch(loadInvoiceListDataReimbursement('N'));
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}



