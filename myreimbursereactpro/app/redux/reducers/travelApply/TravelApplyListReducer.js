/**
 * Created by Louis.lu on 2018-02-05.
 */
import * as types from '../../../constant/ActionTypes';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';
import ScreenUtil, {deviceHeight} from '../../../utils/ScreenUtil';
import {
    Animated,
} from 'react-native';

const initialState = {
    isLoading: false,
    isRefreshing: false,
    showFilter: false,      //是否显示过滤条件
    deleteModal: false,     //是否显示删除确认框
    deleteFormId: null,     //待删除表单ID
    spState: '',        //当前状态
    showLoading: false,         //上拉加载时，是否显示加载信息,如‘正在加载...’
    page: 1, //我的申请页数
    loadMore: true,  //是否加载更多
    travelApplyList: [],    //差旅申请申请列表
}

const TravelApplyListReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.TRAVEL_APPLY_LIST_CHANGE_STATE:
            return {...state, ...action.state}
        case types.TRAVEL_APPLY_LIST_INIT_DATA:
            return initialState;
        default:
            return state;
    }
}

export default TravelApplyListReducer;