/**
 * Created by sky.qian on 11/6/2017.
 */
import * as types from '../../../constant/ActionTypes';

const initialState = {
	comment: '',        //评论内容
	attachmentList: [],     //附件列表
	isLoading: false,       //加载中
	token: '',

	showNoPermissionDialog:false
}

const commentReplyReducer = (state = initialState, action) => {
	switch (action.type) {
		case types.COMMENT_REPLY_CHANGE_STATE:
			return {...state, ...action.state};
		default:
			return state;
	}
}

export default commentReplyReducer;