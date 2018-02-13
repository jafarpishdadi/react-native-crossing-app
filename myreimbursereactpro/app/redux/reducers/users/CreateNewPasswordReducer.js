/**
 * Created by Richard.ji on 2017/11/7.
 */

import * as types from '../../../constant/ActionTypes';

const initialState = {
    createNewPassword: '',
    createConfirmedPassword: ''
}

const createNewPasswordReducer = (state = initialState, action) => {
    switch (action.type){
        case types.NAVIGATOR_CREATE_NEW_PASSWORD:
            return state;
        case types.CREATE_NEW_PASSWORD_CHANGE_STATE:
            return {...state, ...action.state};
        default:
            return state;
    }
}

export default createNewPasswordReducer;