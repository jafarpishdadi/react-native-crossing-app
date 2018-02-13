/**
 * Created by Richard.ji on 2017/11/10.
 */

import * as types from '../../../constant/ActionTypes';
import Message from '../../../constant/Message';

const initialState = {
    isLoading: false,
    modifyPasswordPhone: '',            //修改密码手机号
    modifyPasswordVerificationCode: '', //修改密码验证码
    showDialog: false,      //是否显示提示对话框
    text: Message.GET_VERIFICATION_CODE,   //获取与验证码的文本
    btnDisable: false,                      //按钮是否可以再次点击
    timeCount: 60,                          //倒计时文本
    timeFlag: true,                         //是否可以重新发送验证码
}

const ModifyPasswordVerificationReducer = (state = initialState, action) => {
    switch (action.type){
        case types.MODIFY_PASSWORD_VERIFICATION_CHANGE_STATE:
            return {...state, ...action.state};
        default:
            return state;
    }
}

export default ModifyPasswordVerificationReducer;