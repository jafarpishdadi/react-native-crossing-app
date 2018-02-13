/**
 * Created by sky.qian on 11/17/2017.
 */
import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import Util from '../../../utils/Util';
import {navigateNewReimbursement} from '../../actions/navigator/Navigator';

export const changeState = (state) => {
	return {
		type: types.MAIN_SCREEN_CHANGE_STATE,
		state: state,
	}
}

export const gotoNewReimbursement = () => {

	return (dispatch, getState) => {
		const list = getState().Invoice.reimbursementTypeOriginalList;
		const item = list.filter(item => item.templatNo == '100001');
		if (item.length > 0) {
			dispatch(navigateNewReimbursement({applyTypeName: item[0].name}));
		}
	}
}