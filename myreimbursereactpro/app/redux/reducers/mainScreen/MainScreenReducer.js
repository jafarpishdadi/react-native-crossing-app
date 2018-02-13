/**
 * Created by sky.qian on 11/17/2017.
 */
import * as types from '../../../constant/ActionTypes';

const initialState = {
	isLoading: false,       //加载中
	//首页参数
	companyOpen: false,
	selectHeightMax: 0,
	companyArr: [],
	selectCompany: '',
}

const mainScreenReducer = (state = initialState, action) => {
	switch (action.type) {
		case types.MAIN_SCREEN_CHANGE_STATE:
			return {...state, ...action.state}
		default:
			return state;
	}
}

export default mainScreenReducer;