/**
 * Created by Louis.lu on 2018-01-29.
 */
import * as types from "../../../constant/ActionTypes";
import HttpUtil from "../../../network/HttpUtil";
import API from "../../../utils/API";
import Util from "../../../utils/Util";
import Message from "../../../constant/Message";
import {navigateNewTravelApply, resetTravelApplyList, back} from "../navigator/Navigator";
import {loadData as loadAuditData, changeState as changeAuditListState} from "../../../redux/actions/audit/AuditList";
import {loadApprovalTotalData} from "../../../redux/actions/homePage/HomePage";

export const changeState = (state) => {
    return {
        type: types.TRAVEL_APPLY_DETAIL_CHANGE_STATE,
        state: state,
    }
}

export const initData = () => {
    return dispatch => {
        dispatch(changeState({
            applicationTitle: '',        //差旅申请单名称
            applyPeople: '',
            applyStatus: '0',     //审批状态 0：未提交 1：已撤销 2：已驳回 3：审批中 4：审批通过
            applyNo: '',     //申请单号
            applyTime: '',      //申请时间
            expenseDepartmentName: '',              //选中的部门
            expenseDepartmentId: '',    //部门ID
            targetCity: '',                          //目的城市
            cause: "",                              //出差事由
            applyStartDate: '',                  //开始日期
            applyEndDate: '',                    //结束日期
            travelDays: '',                          //出差天数
            expectedCostAmount: '',      //预计花费金额
            peerPerple: "",   //同行人
            attachmentList: [],     //附件列表
            token: '',
            createName: '',
            createUserId: '',
            currentUser: '',
            currentUserId: '',
            operateComment: '',     //驳回评论
            currentCommentItem: {},     //当前评论节点
            commentContent: '',     //评论内容
            email: '',      //邮箱地址
            travelPartnerId: '',     //同行人id
            ccUid: '',                //抄送人id
            ccName: '',                 //抄送人姓名
            approvalRecordList: [],
        }))
    }
}

export const loadData = (requestData) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }))
        dispatch(loadTravelApplyDetail({travelApplyNo: requestData}));
        dispatch(getEmail());
    }
}

export const loadTravelApplyDetail = (requestData) => {
    return dispatch => {
        return HttpUtil.postJson(API.FIND_TRAVEL_APPLY_BILL, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false
            }))
            if (status) {
                if (ret.status) {
                    const data = ret.data;
                    dispatch(changeState({
                        templateNo: data.templatNo,
                        isLoading: false,
                        applicationTitle: data.travelApplyName,        //差旅申请单名称
                        applyPeople: data.createName,
                        applyStatus: data.travelApplyStateCode,     //审批状态 0：未提交 1：已撤销 2：已驳回 3：审批中 4：审批通过
                        applyNo: data.travelApplyNo,                //申请单号
                        applyTime: data.travelApplyStateCode == '0' ? '' : data.applyTime,    //申请时间
                        expenseDepartmentName: data.travelApplyDname,//选中的部门
                        expenseDepartmentId: data.travelApplyDid,   //部门ID
                        targetCity: data.targetCity,                //目的城市
                        cause: data.travelApplyDesc,                //出差事由
                        applyStartDate:data.beginDate,              //开始日期
                        applyEndDate: data.endDate,                 //结束日期
                        travelDays: data.travelDays,                //出差天数
                        expectedCostAmount: data.planCost == null ? 0 : data.planCost,          //预计花费金额
                        peerPerple: data.travelPartner,             //同行人
                        attachmentList: data.travelApplyAttachmentList,//附件列表
                        ccName: data.ccName,                        //抄送人
                        travelPartnerId: data.travelPartnerId,      //同行人id
                        ccUid: data.ccUid,                          //抄送人id
                        procinstId: data.procinstId,                //流程实例id
                        createUserId: data.createUid,               //创建用户id
                    }))

                    if (data.procinstId) {
                        dispatch(loadApprovalRecordList({
                            procinstId: data.procinstId
                        }))
                    }
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

/**
 * 明细审批流程关联评论内容关联评论附件接口
 * @param requestData 请求实体
 */
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


export const editTravelApplyDetail = (requestData) => {
    return dispatch => {
        dispatch(navigateNewTravelApply({
            source: 'TravelApplyDetail',
            data: requestData
        }))
    }
}

/**
 * 撤回差旅申请单
 * @param requestData 请求实体
 */
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
                    //跳转到申请列表
                    dispatch(resetTravelApplyList());
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

/**
 * 同意/驳回差旅申请单
 * @param requestData 请求实体
 */
export const operateApproval = (requestData) => {
    return (dispatch, getState) => {
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

/**
 * 评论差旅申请单
 * @param requestData 请求实体
 */
export const addComment = (requestData) => {
    return (dispatch, getState) => {
        dispatch(changeState({
            isLoading: true
        }))
        return HttpUtil.postJson(API.ADD_COMMENT, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false
            }))
            if (status) {
                if (ret.status) {
                    dispatch(changeState({
                        isLoading: true
                    }))
                    dispatch(loadApprovalRecordList({
                        procinstId: requestData.commentContent.procinstId
                    }))
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}


/**
 * 打印差旅申请单
 * @param requestData 请求实体
 */
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
                    Util.showToast(Message.TRAVEL_APPLY_EMAIL_SUCCESS_MSG);
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}


