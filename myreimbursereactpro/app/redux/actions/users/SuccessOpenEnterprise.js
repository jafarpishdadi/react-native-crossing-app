/**
 * Created by richard.ji on 2017/10/31.
 */

import * as types from '../../../constant/ActionTypes';

export const changeState = (state) => {
    return {
        type: types.SUCCESS_OPEN_ENTERPRISE_CHANGE_STATE,
        state: state
    }
}