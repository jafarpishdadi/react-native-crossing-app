/**
 * Created by caixiaowei on 17/10/24.
 */

import * as types from '../../../constant/ActionTypes';

const initialState = {
    loginName: '',
    password: '',
    macAddress: '',
    passwordText: '',
    firstWord: '',
}

const loginReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.LOGIN_CHANGE_STATE:
            return {...state, ...action.state};
        default:
            return state;
    }
}

export default loginReducer;