/**
 * Created by Richard.ji on 2017/11/7.
 */

import * as types from '../../../constant/ActionTypes';

const initialState = {
    modifyNewPassword: '',          //修改密码新密码
    modifyConfirmedPassword: '',    //修改密码确认密码
    showDialog: false,      //是否显示提示对话框
}

const modifyPasswordReducer = (state = initialState, action) => {
    switch (action.type){
        case types.MODIFY_PASSWORD_CHANGE_STATE:
            return {...state, ...action.state};
        default:
            return state;
    }
}

export default modifyPasswordReducer;