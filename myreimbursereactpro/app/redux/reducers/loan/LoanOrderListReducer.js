import * as types from '../../../constant/ActionTypes';

const initialState = {
    showFilter: false,      //是否显示过滤条件
    isLoading: false,       //加载中
    deleteModal: false,     //是否显示删除确认框
    deleteFormId: null,     //待删除表单ID
    spState: '',             //借款单状态
    page: 1,                  //我的申请页数
    loadMore: true,         //是否加载更多
    loanList: [],          //借款申请列表
    isRefreshing: false,   //列表是否刷新中
    showLoading: false,         //上拉加载时，是否显示加载信息,如‘正在加载...’
}

const  loanOrderListReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.LOAN_ORDER_LIST_CHANGE_STATE:
            return {...state, ...action.state};
        default:
            return state;
    }
}

export default loanOrderListReducer;