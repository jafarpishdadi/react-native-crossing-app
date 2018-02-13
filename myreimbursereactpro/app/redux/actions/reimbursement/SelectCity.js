/**
 * Created by Jack.Fan on 2018/1/15.
 */

import * as types from '../../../constant/ActionTypes';

export const changeState = (state) => {
    return {
        type: types.SELECT_CITY_CHANGE_STATE,
        state: state,
    }
};