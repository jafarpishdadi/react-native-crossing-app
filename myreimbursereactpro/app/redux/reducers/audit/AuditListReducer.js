/**
 * Created by howard.li on 11/8/2017.
 */
import * as types from '../../../constant/ActionTypes';

const initialState = {
    isLoading: false,       //加载中
    selected: 0,        //0未审批， 1已审批， 2抄送我
    unapproved: [],     //未审批
    alreadyApproved: [],        //已审批
    isRefreshing: false,        //刷新中
    showLoading: false,         //上拉加载时，是否显示加载信息,如‘正在加载...’
    unapprovedPage: 1,          //未审批页数
    unapprovedLoadMore: true,   //是否加载更多
    alreadyApprovedPage:1,      //已审批页数
    alreadyApprovedLoadMore: true,  //是否加载更多
    //hasCopyToMeMsg: false,       //是否有抄送我信息
    showFilter: false,      //是否显示过滤器
    applyType: '',      //单子种类
    copyToMe: [],       //抄送我
    copyToMePage: 1,          //抄送我页数
    copyToMeLoadMore: true,   //是否加载更多
    unapprovedCount: 0,     //未审批数
}

const auditListReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.AUDIT_LIST_CHANGE_STATE:
            return {...state, ...action.state};
        default:
            return state;
    }
}

export default auditListReducer;