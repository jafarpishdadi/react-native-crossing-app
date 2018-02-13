/**
 * Created by richard.ji on 2017/10/31.
 */

import * as types from '../../../constant/ActionTypes';

const initialState = {
    openEnterpriseName: '',
    openEnterprisePerson: '',
    showDialog1: false,      //是否显示对话框1
    showDialog2: false,      //是否显示对话框2
    showDialog3: false,      //是否显示对话框3
    whereComeFrom:'',        //从哪个界面跳转过来
}

const openEnterpriseReducer = (state = initialState, action) => {
    switch (action.type){
        case types.NAVIGATOR_OPEN_ENTERPRISE:
            return state;
        case types.OPEN_ENTERPRISE_CHANGE_STATE:
            return {...state, ...action.state}
        default:
            return state;
    }
}

export default openEnterpriseReducer;