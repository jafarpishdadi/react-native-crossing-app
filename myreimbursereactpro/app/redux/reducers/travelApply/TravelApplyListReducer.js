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
    travelApplyList: [
        {
            "id": "927168",
            "formDesc": "{\"expenseDesc\":\"我的发票项目\",\"expenseTargetCity\":\"北京-上海\",\"expectedCostAmount\":\"1000\",\"expenseDname\":\"研发部门\"}",
            "startName": "成吉思汗",
            "formTypeName": "差旅申请",
            "createTimeStr": "2018-01-08 10:30:04",
            "formId": "270861",
            "applyTimeStr": "2017.03.22",
            "formName": "成吉思汗的差旅申请",
            "startDid": "1061",
            "procinstId": "986443",
            "formTypeCode": "BXSQ",
            "formState": "0"
        },
        {
            "id": "352190",
            "formDesc": "{\"expenseDesc\":\"我的发票项目\",\"expenseTargetCity\":\"北京-上海\",\"expectedCostAmount\":\"1000\",\"expenseDname\":\"研发部门\"}",
            "startName": "成吉思汗",
            "formTypeName": "差旅申请",
            "createTimeStr": "2018-01-08 10:18:51",
            "formId": "402859",
            "applyTimeStr": "2017.03.22",
            "formName": "成吉思汗的差旅申请",
            "startDid": "109",
            "procinstId": "986351",
            "formTypeCode": "BXSQ",
            "formState": "1"
        },
        {
            "id": "189437",
            "formDesc": "{\"expenseDesc\":\"我的发票项目\",\"expenseTargetCity\":\"北京-上海\",\"expectedCostAmount\":\"1000\",\"expenseDname\":\"研发部门\"}",
            "startName": "成吉思汗",
            "formTypeName": "差旅申请",
            "createTimeStr": "2018-01-05 08:35:04",
            "formId": "392087",
            "applyTimeStr": "2017.03.22",
            "formName": "成吉思汗的差旅申请",
            "startDid": "1061",
            "procinstId": "957851",
            "formTypeCode": "BXSQ",
            "formState": "2"
        },
        {
            "id": "780396",
            "formDesc": "{\"expenseDesc\":\"我的发票项目\",\"expenseTargetCity\":\"北京-上海\",\"expectedCostAmount\":\"1000\",\"expenseDname\":\"研发部门\"}",
            "startName": "成吉思汗",
            "formTypeName": "差旅申请",
            "createTimeStr": "2018-01-04 10:08:46",
            "formId": "746021",
            "applyTimeStr": "2017.03.22",
            "formName": "成吉思汗的差旅申请",
            "startDid": "1061",
            "procinstId": "945557",
            "formTypeCode": "BXSQ",
            "formState": "3"
        },
        {
            "id": "184056",
            "formDesc": "{\"expenseDesc\":\"我的发票项目\",\"expenseTargetCity\":\"北京-上海\",\"expectedCostAmount\":\"1000\",\"expenseDname\":\"研发部门\"}",
            "startName": "成吉思汗",
            "formTypeName": "差旅申请",
            "createTimeStr": "2017-12-28 18:17:56",
            "formId": "968357",
            "applyTimeStr": "2017.03.22",
            "formName": "成吉思汗的差旅申请",
            "startDid": "1061",
            "procinstId": "855178",
            "formTypeCode": "BXSQ",
            "formState": "4"
        }],    //差旅申请申请列表
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