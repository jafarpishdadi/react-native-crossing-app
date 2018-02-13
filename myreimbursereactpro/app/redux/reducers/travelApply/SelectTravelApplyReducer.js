/**
 * Created by Louis.lu on 2018-01-22.
 */
import * as types from '../../../constant/ActionTypes';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';

const data = [
    {applyNo: "SQD001", id: 'SQD001'},
    {applyNo: "SQD002", id: 'SQD002'},
    {applyNo: "SQD003", id: 'SQD003'},
    {applyNo: "SQD004", id: 'SQD004'},
    {applyNo: "SQD005", id: 'SQD005'},
    {applyNo: "SQD006", id: 'SQD006'},
    {applyNo: "SQD007", id: 'SQD007'},
];

const initialState = {
    isLoading: false,
    showLoading: false,
    travelApplyList: data,   //list
    isRefreshing: false,
    selectItem : {},
}

const SelectTravelApplyReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.TRAVEL_APPLY_CHANGE_STATE:
            return {...state, ...action.state}
        case types.TRAVEL_APPLY_INIT_DATA:
            return initialState;
        default:
            return state;
    }
}

export default SelectTravelApplyReducer;