/**
 * Created by Louis.lu on 2018-01-29.
 */
import * as types from "../../../constant/ActionTypes";
import ScreenUtil, {deviceHeight} from "../../../utils/ScreenUtil";
import {Animated} from "react-native";

const initialState = {
    isLoading: false,

    applicationTitle: '',        //差旅申请单名称
    applyPeople: '',       //申请人
    applyStatus: '',     //审批状态 0：未提交 1：已撤销 2：已驳回 3：审批中 4：审批通过
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
    approvalRecordList: [],

    showRejectDialog: false,        //是否显示驳回弹窗
    showEmailDialog: false,        //是否显示邮箱弹窗
    showCommentDialog: false,       //是否显示评论弹窗
    showCommentTip: false,			//评论时没有输入评论内容时，为TRUE，否则为FALSE，默认FALSE
    dialogTop: new Animated.Value((deviceHeight - ScreenUtil.scaleSize(502)) / 2),      //弹窗上移偏量

    token: '',
    createName: '',
    createUserId: '',
    currentUser: '',
    currentUserId: '',
    operateComment: '',     //驳回评论
    currentCommentItem: {},     //当前评论节点
    commentContent: '',     //评论内容
    email: '',      //邮箱地址

    previewShow: false,
    cancelModalVisible: false, //是否显示撤回对话框

    travelPartnerId:'',         //同行人id
    ccUid: '',                  //抄送人id
    ccName: '',                 //抄送人姓名
    procinstId: '',             //审批流程id
}

const TravelApplyDetailReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.TRAVEL_APPLY_DETAIL_CHANGE_STATE:
            return {...state, ...action.state}
        case types.TRAVEL_APPLY_DETAIL_INIT_DATA:
            return initialState;
        default:
            return state;
    }
}
export default TravelApplyDetailReducer;