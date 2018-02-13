/**
 * Created by Louis.lu on 2018-01-29.
 */
import * as types from '../../../constant/ActionTypes';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';
import ScreenUtil, {deviceHeight} from '../../../utils/ScreenUtil';
import {
    Animated,
} from 'react-native';

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
    approvalRecordList: [
        {
            bizCommentExtList: null,
            createTimeStr: "2018-01-10 17:25:06",
            id: "20180110172506543f4a2bd2be396429fa4116b456d2cd0f9",
            operate: "0",
            operateComment: null,
            procinstId: "1018227",
            taskId: null,
            taskKey: null,
            userId: "20171121160219900e4de63969adb43798792baa35ae6a0b7",
            userName: "毛同学",
        },
        {
            bizCommentExtList: null,
            createTimeStr: "2018-01-23 14:38:16",
            id: "20180123143816029e208a996682840b8bdfe3a907a59437d",
            operate: "4",
            operateComment: null,
            procinstId: "1018227",
            taskId: "1018440",
            taskKey: "task1502966055902",
            userId: "20171128105508365848c29f1c40545e9a9bbd41d6175cd0e",
            userName: "成吉思汗",
        },
        {
            bizCommentExtList: null,
            createTimeStr: "2018-01-23 14:38:16",
            id: "20180123143816029e208a996682840b8bdfe3a907a59437d",
            operate: "3",
            operateComment: null,
            procinstId: "1018227",
            taskId: "1018440",
            taskKey: "task1502966055902",
            userId: "20171128105508365848c29f1c40545e9a9bbd41d6175cd0e",
            userName: "成吉思汗",
        }
    ],

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