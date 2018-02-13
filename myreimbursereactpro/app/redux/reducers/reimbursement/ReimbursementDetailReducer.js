/**
 * Created by sky.qian on 10/31/2017.
 */
import * as types from '../../../constant/ActionTypes';
import {
	Animated,
} from 'react-native';
import ScreenUtil, {deviceHeight} from '../../../utils/ScreenUtil';

const initialState = {
	reimbursementDetail: {},        //报销详情
	isLoading: false,       //加载中
	applicationTitle: '',        //报销单名称
	applyPeople: '',       //申请人
	applyStatus: '',     //审批状态 0：未提交 1：已撤销 2：已驳回 3：审批中 4：审批通过
	applyNo: '',     //报销单号
	applyTime: '',      //报销时间
	applyAmount: '',        //金额
	applyType: '',        //报销费用类别
	applyTypeCode: '',       //报销费用类别代码
	applyStartTime: '',     //开始时间
	applyEndTime: '',       //结束时间
	travelDays: 0,      //出差天数
	applyCity: '',        //目标城市
	department: '',        //所在部门
	expenseDesc: '',        //报销事由
	applyDetail: [],      //明细列表
	travelBill: '',       //出差补助
	fileList: [],       //文件列表
	invoiceTotalNum: 15,        //发票总张数
	approvalRecordList: [],
	showRejectDialog: false,        //是否显示驳回弹窗
	showEmailDialog: false,        //是否显示邮箱弹窗
	showCommentDialog: false,       //是否显示评论弹窗
	showCommentTip: false,			//评论时没有输入评论内容时，为TRUE，否则为FALSE，默认FALSE
	dialogTop: new Animated.Value((deviceHeight - ScreenUtil.scaleSize(502)) / 2),      //弹窗上移偏量
	procinstId: '',             //流程id
	expenseNo: '',              //报销单编号
	token: '',
	createName: '',
	createUserId: '',
	currentUser: '',
	currentUserId: '',
	operateComment: '',     //驳回评论
	currentCommentItem: {},     //当前评论节点
	commentContent: '',     //评论内容
	expenseDepartmentId: '',        //部门id
	previewShow:false,
	invoiceUUIDList: [],        //发票UUID集合
	cancelModalVisible:false, //是否显示撤回对话框
	email: '',      //邮箱地址
}

const reimbursementDetailReducer = (state = initialState, action) => {
	switch (action.type) {
		case types.REIMBURSEMENT_DETAIL_CHANGE_STATE:
			return {...state, ...action.state};
		default:
			return state;
	}
}

export default reimbursementDetailReducer;