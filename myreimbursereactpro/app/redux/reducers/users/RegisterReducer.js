/**
 * Created by Richard.ji on 2017/10/30.
 */

import * as types from '../../../constant/ActionTypes';
import Message from '../../../constant/Message';

const initialState = {
    registerPhoneNumber: '',        //注册手机号码
    registerVerificationCode: '',   //手机验证码
    isLoading:false,
    isHooked: true,         //是否勾选CheckBox
    showDialog1: false,      //是否显示提示对话框1
    showDialog2: false,      //是否显示提示对话框2
    showDialog3: false,      //是否显示提示对话框3
    showDialog4: false,      //是否显示提示对话框4
    showDialog5: false,      //是否显示提示对话框5
    showDialog6: false,      //是否显示提示对话框6
    showDialog7: false,      //是否显示提示对话框7


    text: Message.GET_VERIFICATION_CODE,   //获取与验证码的文本
    btnDisable1: false,                      //验证码按钮是否可以再次点击
    timeCount: 60,                          //倒计时文本
    timeFlag: true,                         //是否可以重新发送验证码
    btnDisable2: false,                      //下一步按钮是否可以再次点击
}

const registerReducer = (state = initialState, action) => {
    switch (action.type){
        case types.NAVIGATOR_REGISTER:
            return state;
        case types.NAVIGATOR_REGISTER_CHANGE_STATE:
            return {...state, ...action.state};
        default:
            return state;
    }
}

export default registerReducer;