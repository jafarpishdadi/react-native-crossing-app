/**
 * Created by sky.qian on 1/12/2018.
 */
import * as types from '../../constant/ActionTypes';

const initialState = {
	routeName: '',      //当前页面名字
	isMain: true,       //是否在主页
	backLock: false,    //锁定返回
}

const appReducer = (state = initialState, action) => {
	switch (action.type) {
		case types.APP_CHANGE_STATE:
			return {...state, ...action.state}
		default:
			return state;
	}
}

export default appReducer;