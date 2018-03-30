/**
 * Created by sky.qian on 11/7/2017.
 */
import * as types from "../../../constant/ActionTypes";
import HttpUtil from "../../../network/HttpUtil";
import API from "../../../utils/API";
import Util from "../../../utils/Util";
import {back} from "../../actions/navigator/Navigator";
import {loadInvoiceListDataWithoutReimbursement} from "../../actions/invoice/AddInvoice";
import Message from "../../../constant/Message";
import {
    loadData,
    loadInvoiceListDataReimbursement
} from "../../actions/invoice/Invoice";

export const changeState = (state) => {
    return {
        type: types.NEW_INVOICE_CHANGE_STATE,
        state: state,
    }
}

export const initData = () => {
    return {
        type: types.NEW_INVOICE_INIT_STATE,
    }
}

export const getReimbursementList = () => {
    return (dispatch, getState) => {
        const reimbursementTypeList = getState().Invoice.reimbursementTypeOriginalList;
        var reimburseTypeList = [];
        for (var i = 0; i < reimbursementTypeList.length; i++) {
            reimburseTypeList.push(reimbursementTypeList[i].name);
        }
        dispatch(changeState({
            reimbursementTypeOriginalList: reimbursementTypeList,
            reimbursementTypeList: reimburseTypeList,
        }))
    }
}

export const saveOtherInvoice = (requestData, collection, reimburse, callback) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true
        }))
        return HttpUtil.postJson(API.COLLECT_OTHER, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false
            }))
            if (status) {
                if (ret.status) {
                    dispatch(changeState({
                        dataSaved: true,
                        firstSaved: true,
                    }))
                    // dispatch(loadData());
                    dispatch(loadInvoiceListDataReimbursement('N'));
                    dispatch(loadInvoiceListDataWithoutReimbursement('', []));
                    if (reimburse || collection) {
                        dispatch(getCheckState(requestData, callback));
                    } else {
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

export const updateInvoice = (requestData, collection, reimburse, callback) => {
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
                    dispatch(changeState({
                        dataSaved: true
                    }))
                    // dispatch(loadData());
                    dispatch(loadInvoiceListDataReimbursement('N'));
                    dispatch(loadInvoiceListDataWithoutReimbursement('', []));
                    Util.showToast(Message.SAVE_SUCCESS);
                    if (reimburse || collection) {
                        dispatch(getCheckState(requestData, callback));
                    } else {
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
export const getCheckState = (requestData, callBack) => {
    return (dispatch) => {
        dispatch(changeState({
            isLoading: true
        }))
        return HttpUtil.postJson(API.GET_INVOICE_DETAIL_DATA, {uuid: requestData.uuid}, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false
            }))
            if (status) {
                if (ret.status) {
                    if (Util.contains(['01', '02', '04', '10', '11'], ret.data.invoiceTypeCode)) {
                        var goodsName = '';
                        var invoiceAmount = '';
                        var totalAmount = '';
                        var invoiceDate = '';
                        if (ret.data.detailList != null && ret.data.detailList.length > 0) {
                            goodsName = ret.data.detailList[0].goodsName + (ret.data.detailList.length > 1 ? '等' : '');
                        }
                        invoiceAmount = isNaN(parseFloat(ret.data.invoiceAmount)) || ret.data.invoiceAmount == 0 ? '' : parseFloat(ret.data.invoiceAmount).toFixed(2) + '';
                        invoiceDate = ret.data.invoiceDate.substring(0, 4) + '-' +
                            ret.data.invoiceDate.substring(4, 6) + '-' + ret.data.invoiceDate.substring(6);
                        dispatch(changeState({
                            invoiceTypeCode: ret.data.invoiceTypeCode,
                            invoiceTypeName: Util.getInvoiceTypeName(ret.data.invoiceTypeCode),
                            reimburseState: ret.data.reimburseState,
                            uuid: ret.data.uuid,
                            invoiceCode: ret.data.invoiceCode,
                            invoiceNo: ret.data.invoiceNo,
                            invoiceDate: invoiceDate,
                            verifyCode: ret.data.verifyCode,
                            buyerName: ret.data.buyerName,
                            invoiceAmount: invoiceAmount,
                            totalAmount: ret.data.totalAmount == 0 ? '' : ret.data.totalAmount,
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
                        callBack(ret.data, requestData.invoiceDetail);
                    }
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}