/**
 * Created by sky.qian on 10/26/2017.
 */
import * as types from '../../../constant/ActionTypes';

const initialState = {
    isFirst: true,
    isLoading: false,       //加载中
    userInfo: {},           //个人信息
}

const mineReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.MINE_CHANGE_STATE:
            return {...state, ...action.state}
        default:
            return state;
    }
}

export default mineReducer;