/**
 * Created by sky.qian on 10/31/2017.
 */
import * as types from '../../../constant/ActionTypes';

const initialState = {
	isLoading: false,       //加载中
	reimbursementList: [],      //申请报销单列表
	showFilter: false,      //是否显示过滤条件
	deleteModal: false,     //是否显示删除确认框
	deleteFormId: null,     //待删除表单ID
	page: 1, //我的申请页数
	loadMore: true,  //是否加载更多
	isRefreshing: false,        //刷新中
	showLoading: false,         //上拉加载时，是否显示加载信息,如‘正在加载...’
	spState: '',        //报销单状态
	viewRef: null,
}

const reimbursementListReducer = (state = initialState, action) => {
	switch (action.type) {
		case types.REIMBURSEMENT_LIST_CHANGE_STATE:
			return {...state, ...action.state};
		default:
			return state;
	}
}

export default reimbursementListReducer;