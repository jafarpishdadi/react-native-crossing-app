/**
 * Created by Louis.lu on 2018-01-16.
 */
import * as types from '../../../constant/ActionTypes';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';

const initialState = {
    firstList: [],  //所有部门（人员）list
    dataList: [],  //所有部门（人员）list
    selectCopyPersonList: [],  //已选人员列表

    saveModalVisible: false,            //是否保存提示框
}

const SelectCopyPersonReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.SELECT_COPY_PERSON_INIT_DATA:
            return initialState;
        case types.SELECT_COPY_PERSON_CHANGE_STATE:
            return {...state, ...action.state}
        default:
            return state;
    }
}

export default SelectCopyPersonReducer;