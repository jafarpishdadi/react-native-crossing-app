import * as types from "../../../constant/ActionTypes";
import Util from "../../../utils/Util";
import API from "../../../utils/API";
import HttpUtil from "../../../network/HttpUtil";
import Message from "../../../constant/Message";
import {navigateNewLoanOrder} from "../navigator/Navigator";

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
            applicationTitle: '张三的借款单申请',        //借款单名称
            applyPeople: '张三',       //借款申请人
            applyStatus: '4',     //审批状态 0：未提交 1：已撤销 2：已驳回 3：审批中 4：审批通过
            applyNo: '201711717784',     //借款单号
            applyTime: '2017-09-22 14:50',      //借款时间
            applyAmount: '2121.00',        //借款金额
            department: '产品创新部',        //所在部门
            loanReason: '长途,住宿费',      //借款事由
            remark: '长途，住宿费',         //备注
            attachmentList: [
                {
                    "isDelete": null,
                    "id": "849725",
                    "fileSize": 3683.19,
                    "enterpriseNo": null,
                    "createTime": null,
                    "fileType": "jpg",
                    "expenseNo": "270861",
                    "fileName": "IMG_20180101_194356.jpg",
                    "fileAddress": "/bx/bxsaas/bxftp/product/DX100086/2018/70d6630a5ac34decb7949283e9e9fa4a.zip",
                    "fileSourceType": "FTP",
                    "createUserId": null
                }
            ],       //附件列表
            approvalRecordList: [
                {
                    "taskId": null,
                    "id": "201712280848287055523fcb504b74f769dc8f3440f1dda9e",
                    "bizCommentExtList": null,
                    "createTimeStr": "2017-12-28 08:48:28",
                    "userId": "20171128105508365848c29f1c40545e9a9bbd41d6175cd0e",
                    "operate": "0",
                    "userName": "成吉思汗",
                    "procinstId": "827904",
                    "taskKey": null,
                    "operateComment": null
                },
                {
                    "taskId": "827975",
                    "id": "20171228084904785cea680df30d74311b374ad9c2a0172f2",
                    "bizCommentExtList": null,
                    "createTimeStr": "2017-12-28 08:49:04",
                    "userId": "20171128105508365848c29f1c40545e9a9bbd41d6175cd0e",
                    "operate": "4",
                    "userName": "成吉思汗",
                    "procinstId": "827904",
                    "taskKey": "task1502966055902",
                    "operateComment": null
                },
                {
                    "taskId": "827994",
                    "id": "20180211091059284361786fcbed5431294272f653dcae629",
                    "bizCommentExtList": [
                        {
                            "taskId": "827994",
                            "id": "201712280851304364a60580599e84dcca05aa3c7de973e35",
                            "createTimeStr": "2017-12-28 08:51:30",
                            "toUserId": "20171128105508365848c29f1c40545e9a9bbd41d6175cd0e",
                            "userId": "20171130120727831063c0411bd754d72822f88af6efc19aa",
                            "bizCommentAttachmentExtList": [],
                            "userName": "Lynn",
                            "procinstId": "827904",
                            "pid": "root",
                            "taskKey": "task1502966055902",
                            "comment": "评论"
                        },
                        {
                            "taskId": "827994",
                            "id": "201712280856250859d5eab7402584ecd9df9873d7b10764b",
                            "createTimeStr": "2017-12-28 08:56:25",
                            "toUserId": "20171130120727831063c0411bd754d72822f88af6efc19aa",
                            "userId": "20171128105508365848c29f1c40545e9a9bbd41d6175cd0e",
                            "bizCommentAttachmentExtList": [
                                {
                                    "fileSize": 4657.78,
                                    "fileType": "jpg",
                                    "fileDir": "/bx/bxsaas/bxftp/product/DX100086/2017/f18991bdcccb4db2b28cda51feb3d372.zip",
                                    "fileName": "IMG_20171217_164825.jpg",
                                    "userType": 1
                                }
                            ],
                            "userName": "成吉思汗",
                            "procinstId": "827904",
                            "pid": "201712280851304364a60580599e84dcca05aa3c7de973e35",
                            "taskKey": "task1502966055902",
                            "comment": "我回复下，哈哈哈"
                        }
                    ],
                    "createTimeStr": "2017-12-28 08:49:04",
                    "userId": "20171130120727831063c0411bd754d72822f88af6efc19aa",
                    "operate": "3",
                    "userName": "Lynn",
                    "procinstId": "827904",
                    "taskKey": "task1502966055902",
                    "operateComment": null
                },
                {
                    "taskId": "827984",
                    "id": "201802110910592846c6fc8f51fb3466c8aca83c6c79f06f8",
                    "bizCommentExtList": null,
                    "createTimeStr": "2017-12-28 08:49:04",
                    "userId": "20171201183543160e50987b9dcdc4acd9786fc34e2b8cb80",
                    "operate": "3",
                    "userName": "张三",
                    "procinstId": "827904",
                    "taskKey": "task1502966055902",
                    "operateComment": null
                },
                {
                    "taskId": "827965",
                    "id": "201802110910592844714ca788b8a47aa8254b159a268e4f2",
                    "bizCommentExtList": null,
                    "createTimeStr": "2017-12-28 08:49:04",
                    "userId": "2017120814121580277740557dfb44ceab6629550717d3c6b",
                    "operate": "3",
                    "userName": "袁立",
                    "procinstId": "827904",
                    "taskKey": "task1502966055902",
                    "operateComment": null
                }
            ],
            showCommentDialog: false,       //是否显示评论弹窗
            currentCommentItem: {},     //当前评论节点
            commentContent: '',     //评论内容
            expenseNo: '',              //借款单编号
            createUserId: '',          //借款单创建者id
            payBackRecordList: [
                {
                    "payBackDate": "11月23日",
                    "payBackAmount": "666.00",
                    "payBackDesc": "获得借款",
                },
                {
                    "payBackDate": "11月23日",
                    "payBackAmount": "666.00",
                    "payBackDesc": "核销借款 (北京出差)",
                },
                {
                    "payBackDate": "11月23日",
                    "payBackAmount": "666.00",
                    "payBackDesc": "核销借款 (北京出差)",
                },
            ],
            debtAmount: '666.00',
            selected: 0,        //0还款记录, 1审批流
            email: '',      //邮箱地址
            procinstId: '',             //流程id
            operateComment: '',     //驳回评论
        }));
    }
}

export const loadData = (expenseNo) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }))
        dispatch(loadLoanDetail({
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
                    Util.showToast("发送邮件接口待调试");
                }
            }
        })
    }
}

export const loadLoanDetail = (requestData) => {
    return dispatch => {
        return HttpUtil.postJson(API.GET_REIMBURSEMENT_DETAIL, requestData, dispatch, function (ret, status) {
            if (status) {
                if (ret.status) {
                    const data = ret.data;
                    dispatch(changeState({}));
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
                    Util.showToast("获取借款单详情接口待调试");
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
                        //approvalRecordList: ret.data,
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
                    if (status) {
                        if (ret.status) {
                            Util.showToast(Message.ACTION_SUCCESS);
                        } else {
                            Util.showToast("撤回接口待调试");
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
                } else {
                    Util.showToast("审批接口待调试");
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
                } else {
                    Util.showToast("评论接口待调试");
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
        dispatch(navigateNewLoanOrder({}));
    }
}