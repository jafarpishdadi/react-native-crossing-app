import * as types from "../../../constant/ActionTypes";
import Util from "../../../utils/Util";
import API from "../../../utils/API";
import HttpUtil from "../../../network/HttpUtil";
import Message from "../../../constant/Message";
import {navigateNewLoanOrder, resetLoanList, back} from "../navigator/Navigator";
import {loadData as loadAuditData, changeState as changeAuditListState} from '../../../redux/actions/audit/AuditList';
import {loadApprovalTotalData} from '../../../redux/actions/homePage/HomePage';

export const changeState = (state) => {
    return {
        type: types.LOAN_ORDER_DETAIL_CHANGE_STATE,
        state: state,
    }
};

//初始化页面数据
export const initData = () => {
    return dispatch => {
        dispatch(changeState({
            applicationTitle: '',        //借款单名称
            applyPeople: '',       //借款申请人
            applyStatus: '',     //审批状态 0：未提交 1：已撤销 2：已驳回 3：审批中 4：审批通过
            applyNo: '',     //借款单号
            applyTime: '',      //借款时间
            applyAmount: '',        //借款金额
            departmentName: '',        //所在部门
            departmentId: '',        //所在部门
            loanReason: '',      //借款事由
            remark: '',         //备注
            attachmentList: [],       //附件列表
            approvalRecordList: [],
            procinstId: '',     //流程id
            currentUserId: '',  //当前用户id
            createUserId: '',   //借款单创建人id
            currentCommentItem: {},     //当前评论节点
            commentContent: '',     //评论内容
            payBackRecordList: [],
            debtAmount: '',
            selected: 0,        //0还款记录, 1审批流
            email: '',      //邮箱地址
            operateComment: '',     //驳回评论
            templateNo: '',        //模板编号
        }));
    }
}

export const loadData = (borrowNo) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }))
        dispatch(loadLoanDetail({
            borrowNo: borrowNo
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

//将借款单发送至邮箱
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

export const loadLoanDetail = (requestData) => {
    return dispatch => {
        return HttpUtil.postJson(API.GET_BORROW_BILL_BY_NUMBER, requestData, dispatch, function (ret, status) {
            if (status) {
                if (ret.status) {
                    const data = ret.data;
                    dispatch(changeState({
                        applicationTitle: data.borrowName,
                        applyPeople: data.createName,
                        applyStatus: data.borrowStateCode,
                        applyNo: data.borrowNo,
                        applyTime: data.applyTimeStr ? data.applyTimeStr.substring(0, data.applyTimeStr.length - 3) : '',
                        applyAmount: data.borrowAmount ? parseFloat(data.borrowAmount).toFixed(2) : '',
                        departmentName: data.borrowDname,
                        departmentId: data.borrowDid,
                        loanReason: data.borrowDesc,
                        remark: data.borrowRemark,
                        attachmentList: data.bizExpenseAttachmentList,
                        procinstId: data.procinstId,
                        createUserId: data.createUid,
                        templateNo: data.templatNo,
                        ccUid: data.ccUid,
                        ccName: data.ccName,
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

//撤回借款单
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
                    //跳转到借款申请列表
                    dispatch(resetLoanList());
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

//同意借款单
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
                    dispatch(loadApprovalTotalData());
                    dispatch(back());
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

// 评论
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

export const editLoanDetail = (requestData) => {
    return dispatch => {
        dispatch(navigateNewLoanOrder({
            source: 'LoanOrderDetail',
            data: requestData,
        }));
    }
}