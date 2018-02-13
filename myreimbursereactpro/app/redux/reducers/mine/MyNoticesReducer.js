/**
 * Created by richard.ji on 2017/11/1.
 */

import * as types from '../../../constant/ActionTypes';

const initialState = {
    isLoading: true,        //正在加载
    messageData: [],        //消息列表数组
    loadMore:true, //是否加载更多
    page:1,        //我的通知页数
    isRefreshing: false,    //刷新中
    showLoading: false,         //上拉加载时，是否显示加载信息,如‘正在加载...’
}

const myNoticesReducer = (state = initialState, action) => {
    switch (action.type){
        case types.NAVIGATOR_MY_NOTICES:
            return state;
        case types.MINE_NOTICES_STATE:
            return {...state, ...action.state};
        default:
            return state;
    }
}

export default myNoticesReducer;