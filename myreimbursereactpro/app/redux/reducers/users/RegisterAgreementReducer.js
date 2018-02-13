/**
 * Created by Richard.ji on 2017/11/14.
 */

import * as types from '../../../constant/ActionTypes';

const initialState = {
}

const registerAgreementReducer = (state = initialState, action) => {
    switch (action.type){
        case types.NAVIGATOR_AGREEMENT:
            return state;
        default:
            return state;
    }
}

export default registerAgreementReducer;