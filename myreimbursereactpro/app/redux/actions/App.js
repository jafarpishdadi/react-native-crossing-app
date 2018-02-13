/**
 * Created by sky.qian on 1/12/2018.
 */
import * as types from '../../constant/ActionTypes';

export const changeState = (state) => {
	return {
		type: types.APP_CHANGE_STATE,
		state: state,
	}
}