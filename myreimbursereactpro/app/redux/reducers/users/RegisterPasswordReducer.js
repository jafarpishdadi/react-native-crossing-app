/**
 * Created by richard.ji on 2017/10/31.
 */

import * as types from '../../../constant/ActionTypes';

const initialState = {
    registerPhone:'' ,              //注册电话
    registerPassword: '',           //注册密码
    registerConfirmedPassword: '',  //注册确认密码
    showDialog: false,      //是否显示提示对话框
    showContent:'',
}

const registerPasswordReducer = (state = initialState, action) => {
    switch (action.type){
        case types.NAVIGATOR_REGISTER_PASSWORD:
            return state;
        case types.NAVIGATOR_REGISTER_PASSWORD_CHANGE_STATE:
            return {...state, ...action.state};
        default:
            return state;
    }
}

export default registerPasswordReducer;