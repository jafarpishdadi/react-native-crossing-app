/**
 * Created by Louis.lu on 2018-01-19.
 */
import * as types from '../../../constant/ActionTypes';
import Util from '../../../utils/Util';

export const changeState = (state) => {
    return {
        type: types.COST_SHARING_CHANGE_STATE,
        state: state,
    }
}

export const loadData = () => {
    return dispatch => {
    }
}

export const initData = () => {
    return {
        type: types.COST_SHARING_INIT_DATA
    }
}

export const refreshDeptData = () => {

}

export const refreshProjectData = () => {

}

