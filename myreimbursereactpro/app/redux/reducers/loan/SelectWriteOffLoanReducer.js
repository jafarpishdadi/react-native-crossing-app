/**
 * Created by Louis.lu on 2018-01-22.
 */
import * as types from '../../../constant/ActionTypes';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';

const data = [
    {loanNo: "SQD001", id: 'SQD001'},
    {loanNo: "SQD002", id: 'SQD002'},
    {loanNo: "SQD003", id: 'SQD003'},
    {loanNo: "SQD004", id: 'SQD004'},
    {loanNo: "SQD005", id: 'SQD005'},
    {loanNo: "SQD006", id: 'SQD006'},
    {loanNo: "SQD007", id: 'SQD007'},
];

const initialState = {
    isLoading: false,
    showLoading: false,
    loanList: data,   //核销借款单list
    isRefreshing: false,
    selectItem: {},
}

const SelectWriteOffLoanReucer = (state = initialState, action) => {
    switch (action.type) {
        case types.SELECT_WRITE_OFF_LOAN_CHANGE_STATE:
            return {...state, ...action.state}
        case types.SELECT_WRITE_OFF_LOAN_INIT_DATA:
            return initialState;
        default:
            return state;
    }
}

export default SelectWriteOffLoanReucer;