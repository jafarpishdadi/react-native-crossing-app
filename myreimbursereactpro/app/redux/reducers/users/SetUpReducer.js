/**
 * Created by richard.ji on 2017/11/1.
 */

import * as types from '../../../constant/ActionTypes';

const initialState = {
    isRemind : true,         //是否开启公众号同步
    isLoading: false,       //加载中
}

const setUpReducer = (state = initialState, action) => {
    switch (action.type){
        case types.SET_UP_CHANGE_STATE:
            return {...state, ...action.state};
        default:
            return state;
    }
}

export default setUpReducer;