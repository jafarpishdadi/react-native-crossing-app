/**
 * Created by richard.ji on 2017/10/31.
 */

import * as types from '../../../constant/ActionTypes';

const initialState = {
    pcAddress: '',           //pc端地址
}

const openEnterpriseReducer = (state = initialState, action) => {
    switch (action.type){
        case types.NAVIGATOR_SUCCESS_OPEN_ENTERPRISE:
            return state;
        case types.SUCCESS_OPEN_ENTERPRISE_CHANGE_STATE:
            return {...state, ...action.state};
        default:
            return state;
    }
}

export default openEnterpriseReducer;