/**
 * Created by sky.qian on 11/3/2017.
 */
import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';
import {back, navigateNewReimbursement, resetApplicationList} from '../../../redux/actions/navigator/Navigator';
import {loadData as loadAuditData, changeState as changeAuditListState} from '../../../redux/actions/audit/AuditList';
import {loadApprovalTotalData} from '../../../redux/actions/homePage/HomePage';
import {refreshReimbursementList} from '../../../redux/actions/reimbursement/ReimbursementList';
import Store from 'react-native-simple-store';
import fetch from "react-native-fetch-polyfill";

export const changeState = (state) => {
    return {
        type: types.REIMBURSEMENT_DETAIL_CHANGE_STATE,
        state: state,
    }
}

export const initData = () => {
    return dispatch => {
        dispatch(changeState({
            reimbursementDetail: {},
            applicationTitle: '',
            applyPeople: '',
            applyStatus: '',
            applyNo: '',
            applyTime: '',
            applyAmount: '',
            applyType: '',
            applyTypeCode: '',
            applyStartTime: '',
            applyEndTime: '',
            travelDays: '',
            applyCity: '',
            department: '',
            expenseDesc: '',
            applyDetail: '',
            travelBill: '',
            invoiceTotalNum: '',
            fileList: [],
            procinstId: '',
            expenseNo: '',
            createName: '',
            approvalRecordList: [],
            expenseDepartmentId: '',
            invoiceUUIDList: [],
            email: '',
        }));
    }
}

export const loadData = (expenseNo) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }))
        dispatch(loadReimbursementDetail({
            "expenseNo": expenseNo,
        }));
        dispatch(getEmail());
    }
}

export const getEmail = () => {
    return dispatch => {
        return HttpUtil.postJson(API.GET_EMAIL, {}, dispatch, function (ret, status) {
            if (status) {
                if (ret.status) {
                    dispatch(changeState({
                        email: ret.data,
                    }));
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const sendEmail = (requestData) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }))
        return HttpUtil.postJson(API.SEND_EMAIL, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false,
            }))
            if (status) {
                if (ret.status) {
                    Util.showToast(Message.REIMBURSEMENT_EMAIL_SUCCESS_MSG);
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const loadReimbursementDetail = (requestData) => {
    return dispatch => {
        return HttpUtil.postJson(API.GET_REIMBURSEMENT_DETAIL, requestData, dispatch, function (ret, status) {
            if (status) {
                if (ret.status) {
                    const data = ret.data;
                    //获取发票uuid list
                    const uuidList = [];
                    const bizExpenseTypeList = data.bizExpenseTypeList
                    for (let i = 0; i < bizExpenseTypeList.length; i++) {
                        bizExpenseTypeList[i].totalAmount = bizExpenseTypeList[i].totalAmount ? parseFloat(bizExpenseTypeList[i].totalAmount).toFixed(2) : '';
                        bizExpenseTypeList[i].totalNum = bizExpenseTypeList[i].totalNum ? parseInt(bizExpenseTypeList[i].totalNum) : '';
                        const bizExpenseBillList = bizExpenseTypeList[i].bizExpenseBillList;
                        for (let j = 0; j < bizExpenseBillList.length; j++) {
                            bizExpenseBillList[j].invoiceAmount = parseFloat(bizExpenseBillList[j].invoiceAmount).toFixed(2);
                            uuidList.push(bizExpenseBillList[j].invoiceUUID);
                        }
                    }

                    let applyTime = '';
                    const applicationDate = data.applyTimeStr;
                    applyTime = applicationDate ? applicationDate.substring(0, applicationDate.length - 3) : '';

                    dispatch(changeState({
                        reimbursementDetail: data,
                        applicationTitle: data.expenseName,
                        applyPeople: data.createName,
                        applyStatus: data.expenseStateCode,
                        applyNo: data.expenseNo,
                        applyTime: applyTime,
                        applyAmount: parseFloat(data.totalAmount).toFixed(2),
                        applyType: data.applyTypeName,
                        applyTypeCode: data.applyTypeCode,
                        applyStartTime: data.beginDateStr,
                        applyEndTime: data.endDateStr,
                        travelDays: data.travelDays,
                        applyCity: data.targetCity,
                        department: data.expenseDepartmentName,
                        expenseDesc: data.expenseDesc,
                        applyDetail: bizExpenseTypeList,
                        travelBill: data.travelBill ? parseFloat(data.travelBill).toFixed(2) : data.travelBill,
                        invoiceTotalNum: data.totalNum,
                        fileList: data.bizExpenseAttachmentList,
                        procinstId: data.procinstId,
                        expenseNo: data.expenseNo,
                        createName: data.createName,
                        createUserId: data.createUserid,
                        expenseDepartmentId: data.expenseDepartmentId,
                        invoiceUUIDList: uuidList,
                    }));
                    if (data.procinstId) {
                        dispatch(loadApprovalRecordList({
                            procinstId: data.procinstId
                        }))
                    } else {
                        dispatch(changeState({
                            isLoading: false
                        }))
                    }
                } else {
                    Util.showToast(ret.message);
                    dispatch(changeState({
                        isLoading: false
                    }))
                }
            } else {
                dispatch(changeState({
                    isLoading: false
                }))
            }
        })
    }
}

export const loadApprovalRecordList = (requestData) => {
    return dispatch => {
        return HttpUtil.postJson(API.GET_APPROVAL_RECORD_LIST, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false
            }))
            if (status) {
                if (ret.status) {
                    dispatch(changeState({
                        approvalRecordList: ret.data,
                    }));
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const operateCancel = (requestData) => {
    return (dispatch, getState) => {
        dispatch(changeState({
            isLoading: true
        }))
        return HttpUtil.postJson(API.OPERATE_CANCEL, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
             isLoading: false
             }))
            if (status) {
                if (ret.status) {
                    Util.showToast(Message.ACTION_SUCCESS);
                    //刷新申请列表
                    /*dispatch(refreshReimbursementList({
                     spState: getState().ReimbursementList.spState,
                     page: 1,
                     rows: 5,
                     }));*/
                    //跳转到申请列表
                    dispatch(resetApplicationList());
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const operateApproval = (requestData) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true
        }))
        return HttpUtil.postJson(API.DO_APPROVAL, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false
            }))
            if (status) {
                if (ret.status) {
                    Util.showToast(Message.ACTION_SUCCESS);
                    dispatch(changeAuditListState({
                        unapprovedPage: 1,          //未审批页数
                        unapprovedLoadMore: true,   //是否加载更多
                        alreadyApprovedPage: 1,      //已审批页数
                        alreadyApprovedLoadMore: true,  //是否加载更多
                    }))
                    dispatch(loadAuditData());
                    dispatch(loadApprovalTotalData());	//刷新首页审批显示数量和金额
                    dispatch(back());
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const addComment = (requestData) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true
        }))
        return HttpUtil.postJson(API.ADD_COMMENT, requestData, dispatch, function (ret, status) {
            if (status) {
                if (ret.status) {
                    dispatch(loadApprovalRecordList({
                        procinstId: requestData.commentContent.procinstId
                    }))
                } else {
                    Util.showToast(ret.message);
                    dispatch(changeState({
                        isLoading: false
                    }))
                }
            } else {
                dispatch(changeState({
                    isLoading: false
                }))
            }
        })
    }
}

export const editReimbursementDetail = (requestData) => {
    return dispatch => {
        const arr = requestData.bizExpenseTypeList.map((item) => {
            item.expenseId = item.id;
            return item;
        })
        requestData.bizExpenseTypeList = arr;
        dispatch(navigateNewReimbursement({
            source: 'ReimbursementDetail',
            applyTypeCode: requestData.applyTypeCode,
            data: requestData,
        }));
    }
}

export const downloadAttachment = (requestData) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true
        }))
        return HttpUtil.postJsonForFile(API.DOWNLOAD_ATTACHMENT_BY_DIR, requestData, function (ret, status) {
            dispatch(changeState({
                isLoading: false
            }))
            if (status) {
                if (ret.status) {
                    //nothing to do
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}