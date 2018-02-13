import * as types from "../../../constant/ActionTypes";
import ScreenUtil, {deviceHeight} from "../../../utils/ScreenUtil";
import {
    Animated,
} from 'react-native';

const initialState = {
    applicationTitle: '',        //借款单名称
    applyPeople: '',       //借款申请人
    applyStatus: '',     //审批状态 0：未提交 1：已撤销 2：已驳回 3：审批中 4：审批通过
    applyNo: '',         //借款单号
    procinstId: '',     //流程id
    currentUserId: '',  //当前用户id
    createUserId: '',   //借款单创建人id
    applyTime: '',      //借款时间
    applyAmount: '',        //借款金额
    department: '',        //所在部门
    loanReason: '',      //借款事由
    attachmentList: [],       //附件列表
    approvalRecordList: [],
    showCommentDialog: false,       //是否显示评论弹窗
    currentCommentItem: {},     //当前评论节点
    commentContent: '',     //评论内容
    expenseNo: '',              //借款单编号
    createUserId: '',          //借款单创建者id
    dialogTop: new Animated.Value((deviceHeight - ScreenUtil.scaleSize(502)) / 2),      //弹窗上移偏量
    showCommentTip: false,			//评论时没有输入评论内容时，为TRUE，否则为FALSE，默认FALSE
    payBackRecordList: [],
    debtAmount: '',
    selected: 0,        //0还款记录, 1审批流
    showEmailDialog: false,        //是否显示邮箱弹窗
    email: '',      //邮箱地址
    showRejectDialog: false,        //是否显示驳回弹窗
    operateComment: '',     //驳回评论
    showAgreeDialog: false, //是否显示同意确认对话框
    isLoading: false,       //是否显示加载中标记
    cancelModalVisible:false, //是否显示撤回对话框
    remark: ''
}


const  LoanOrderDetailReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.LOAN_ORDER_DETAIL_CHANGE_STATE:
            return {...state, ...action.state};
        default:
            return state;
    }
}

export default LoanOrderDetailReducer;