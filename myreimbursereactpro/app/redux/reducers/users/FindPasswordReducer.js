/**
 * Created by sky.qian on 10/30/2017.
 */
import * as types from '../../../constant/ActionTypes';
import Message from '../../../constant/Message';

const initialState = {
	isLoading: false,
	findPasswordPhone: '',      //手机号
	findPasswordVerificationCode: '',       //验证码
	text: Message.GET_VERIFICATION_CODE,   //获取与验证码的文本
	btnDisable: false,                      //按钮是否可以再次点击
	timeCount: 60,                          //倒计时文本
	timeFlag: true,                         //是否可以重新发送验证码
	showDialog1: false,                    //是否显示对话框1
	showDialog2: false,                    //是否显示对话框2
	showDialog3: false,                     //是否显示对话框3
}

const findPasswordReducer = (state = initialState, action) => {
	switch (action.type) {
		case types.FIND_PASSWORD_CHANGE_STATE:
			return {...state, ...action.state};
		default:
			return state;
	}
}

export default findPasswordReducer;