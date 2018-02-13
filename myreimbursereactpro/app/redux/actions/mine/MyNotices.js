/**
 * Created by richard.ji on 2017/11/1.
 */

import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';
import {navigateReimbursementDetail} from '../navigator/Navigator';
import Toast from "react-native-root-toast";

export const changeState = (state) => {
    return {
        type: types.MINE_NOTICES_STATE,
        state: state,
    }
}

export const initData = () => {
    return dispatch => {
        dispatch(changeState({
            messageData: [],
            page: 1,
            loadMore: true,
        }))
    }
}

export const loadData = () => {
    return dispatch => {
        dispatch(loadMessageListData());
    }
}

/**
 * 获取消息列表
 * @returns {function(*)}
 */
export const loadMessageListData = () => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }))
        return HttpUtil.postJson(API.GET_MESSAGE_LIST, {page: 1, rows: 10}, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false,
            }))
            if (status) {
                if (ret.data == null) {
                    Util.showToast(Message.NOTICES_IS_NULL, 1000);
                    dispatch(changeState({
                        loadMore: false,
                        messageData: [],
                    }))
                } else {
                    dispatch(changeState({
                        messageData: ret.data,
                        loadMore: ret.data.length == 10,
                    }))
                }
            }
        })
    }
}

/**
 * 更改消息状态
 * @returns {function(*)}
 */
export const updateMessageStatus = (requestData, callback) => {
    return dispatch => {
        return HttpUtil.postJson(API.GET_READ_MESSAGE, requestData, dispatch, function (ret, status) {
            if (status) {
                callback();
            }
        })
    }
}

/**
 * 判断用户权限
 * @param requestData
 * @returns {function(*)}
 */
export const checkApprovalUserAction = (requestData, callback) => {
    return dispatch => {
        return HttpUtil.postJson(API.CHECK_IS_APPROVAL_USER, requestData, dispatch, function (ret, status) {
            if (status) {
                if (ret.status) {
                    dispatch(navigateReimbursementDetail({
                        formId: requestData.expenseNo,
                        isApprovalUser: ret.data.isApprovalUser,
                        taskId: ret.data.taskId,
                        taskDefKey: ret.data.taskDefKey,
                        source: "notice"
                    }));
                    callback();
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const refreshMyNotices = () => {
    return dispatch => {
        dispatch(changeState({
            isRefreshing: true,
        }))
        return HttpUtil.postJson(API.GET_MESSAGE_LIST, {
            page: 1,
            rows: 10,
        }, dispatch, function (ret, status) {
            dispatch(changeState({
                isRefreshing: false,
            }))
            if (status) {
                if (ret.status) {
                    dispatch(changeState({
                        messageData: ret.data ? ret.data : [],
                        page: 1,
                        loadMore: true,
                    }))
                } else {
                    dispatch(changeState({
                        messageData: [],
                        page: 1,
                        loadMore: false,
                    }))
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

/**
 * 刷新加载更多消息数据
 * @param requestData
 * @param messageData
 * @returns {function(*)}
 */
export const loadMoreMyNotices = (requestData, messageData) => {
    return dispatch => {
        dispatch(changeState({
            showLoading: true
        }));
        return HttpUtil.postJson(API.GET_MESSAGE_LIST, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                showLoading: false
            }));
            if (status) {
                if (ret.status) {
                    if (ret.data) {
                        dispatch(changeState({
                            messageData: messageData.concat(ret.data),
                            page: requestData.page,
                            loadMore: ret.data.length == 10,
                        }))
                    } else {
                        dispatch(changeState({
                            page: requestData.page,
                            loadMore: false,
                        }))
                    }
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}