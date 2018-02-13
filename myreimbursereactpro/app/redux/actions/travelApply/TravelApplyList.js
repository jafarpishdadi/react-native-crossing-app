/**
 * Created by Louis.lu on 2018-02-05.
 */
import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';

export const changeState = (state) => {
    return {
        type: types.TRAVEL_APPLY_LIST_CHANGE_STATE,
        state: state,
    }
}

export const initData = (state) => {
    return dispatch => {
        dispatch(changeState({
            page: 1,
            loadMore: true,
            spState: '',
            //travelApplyList: [],
        }))
    }
}

export const loadData = () => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }))
        dispatch(loadApplicationList({
            "spState": "",
            "page": 1,
            "rows": 5
        }));
    }
}

export const loadApplicationList = (requestData) => {
    return (dispatch, getState) => {
        dispatch(changeState({
            isLoading: false,
        }))

        const TravelApply = getState().TravelApplyList;
        dispatch(changeState({
            travelApplyList: TravelApply.travelApplyList,
        }))
    }
}

export const loadMoreTravelApply =  (requestData) => {
    return dispatch =>{
        dispatch(changeState({
            showLoading: true
        }));

        dispatch(changeState({
            showLoading: false
        }));
    }
}