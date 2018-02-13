/**
 * Created by Louis.lu on 2018-01-22.
 */
import * as types from '../../../constant/ActionTypes';
import Util from '../../../utils/Util';

export const changeState = (state) => {
    return {
        type: types.SELECT_WRITE_OFF_LOAN_CHANGE_STATE,
        state: state,
    }
}

export const loadData = () => {
    return dispatch => {
    }
}
export const initData = () => {
    return {
        type: types.SELECT_WRITE_OFF_LOAN_INIT_DATA
    }
}