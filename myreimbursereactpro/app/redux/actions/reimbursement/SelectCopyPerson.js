/**
 * Created by Louis.lu on 2018-01-16.
 */
import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';
import {back} from '../../../redux/actions/navigator/Navigator';


export const changeState = (state) => {
    return {
        type: types.SELECT_COPY_PERSON_CHANGE_STATE,
        state: state,
    }
}

export const initData = () => {
    return dispatch => {
        return dispatch(changeState({
            searchValue: '',
            selectedDepList: [],
            selectedPersonList: [],
            selectedPersonIdList: [],
            isRefreshing: false,
            searchPersonList: [],
            page: 1,
            loadMore: true,
        }))
    }
}

export const loadData = (selectedPersonList) => {
    return (dispatch, getState) => {
        dispatch(changeState({
            selectedPersonList: selectedPersonList.concat(),
            selectedPersonIdList: selectedPersonList.map(item => item.userNo),
        }))

        /*if (Util.checkListIsEmpty(getState().SelectCopyPerson.depTree)) {

        }*/

        dispatch(changeState({
            isLoading: true
        }));
        return HttpUtil.postJson(API.GET_DEP_TREE, {}, dispatch, function (ret, status) {
            if (status) {
                if (ret.status) {
                    if (ret.data) {
                        dispatch(changeState({
                            depTree: ret.data
                        }))
                        //获取需要打开的组织
                        HttpUtil.postJson(API.GET_ORGANIZATION, {organizationType: 'org'}, dispatch, function (ret, status) {
                            dispatch(changeState({
                                isLoading: false,
                            }));
                            if (status) {
                                if (ret.status) {
                                    if (ret.data) {
                                        dispatch(changeState({
                                            selectedDepList: ret.data.map((item) => item.orgDepId)
                                        }))
                                    } else {
                                        dispatch(changeState({
                                            selectedDepList: []
                                        }))
                                    }
                                } else {
                                    Util.showToast(ret.message);
                                }
                            }
                        })
                    } else {
                        dispatch(changeState({
                            depTree: [],
                            isLoading: false,
                        }))
                    }
                } else {
                    Util.showToast(ret.message);
                    dispatch(changeState({
                        isLoading: false,
                    }));
                }
            } else {
                dispatch(changeState({
                    isLoading: false,
                }));
            }
        })
    }
}

export const refreshData = () => {
    return dispatch => {
        dispatch(changeState({
            isRefreshing: true,
        }))
        return HttpUtil.postJson(API.GET_DEP_TREE, {}, dispatch, function (ret, status) {
            if (status) {
                if (ret.status) {
                    if (ret.data) {
                        dispatch(changeState({
                            depTree: ret.data
                        }))
                        //获取需要打开的组织
                        HttpUtil.postJson(API.GET_ORGANIZATION, {organizationType: 'org'}, dispatch, function (ret, status) {
                            dispatch(changeState({
                                isRefreshing: false,
                            }));
                            if (status) {
                                if (ret.status) {
                                    if (ret.data) {
                                        dispatch(changeState({
                                            selectedDepList: ret.data.map((item) => item.orgDepId)
                                        }))
                                    } else {
                                        dispatch(changeState({
                                            selectedDepList: []
                                        }))
                                    }
                                } else {
                                    Util.showToast(ret.message);
                                }
                            }
                        })
                    } else {
                        dispatch(changeState({
                            depTree: [],
                            isRefreshing: false,
                        }))
                    }
                } else {
                    Util.showToast(ret.message);
                    dispatch(changeState({
                        isRefreshing: false,
                    }));
                }
            } else {
                dispatch(changeState({
                    isRefreshing: false,
                }));
            }
        })
    }
}

export const loadMorePerson = (requestData, searchPersonList) => {
    return dispatch => {
        dispatch(changeState({
            showLoading: true
        }));
        return HttpUtil.postJson(API.GET_ORGANIZATION_USERS_BY_NAME, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                showLoading: false,
                loadMore: true,
            }));
            if (status) {
                if (ret.status) {
                    if (ret.data) {
                        dispatch(changeState({
                            searchPersonList: searchPersonList.concat(ret.data),
                            page: requestData.page,
                            loadMore: ret.data.length == 50,
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

export const refreshPersonList = (requestData) => {
    return dispatch => {
        dispatch(changeState({
            isRefreshing: true,
        }))
        HttpUtil.postJson(API.GET_ORGANIZATION_USERS_BY_NAME, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isRefreshing: false,
                page: 1,
            }))
            if (status) {
                if (ret.status) {
                    if (ret.data) {
                        dispatch(changeState({
                            searchPersonList: ret.data,
                            loadMore: ret.data.length == 50,
                        }))
                    } else {
                        dispatch(changeState({
                            searchPersonList: [],
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

export const searchPersonList = (requestData) => {
    return dispatch => {
        dispatch(changeState({
            isRefreshing: true,
        }))
        HttpUtil.postJson(API.GET_ORGANIZATION_USERS_BY_NAME, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isRefreshing: false,
                page: 1,
            }))
            if (status) {
                if (ret.status) {
                    if (ret.data) {
                        dispatch(changeState({
                            searchPersonList: ret.data,
                            loadMore: ret.data.length == 50,
                        }))
                    } else {
                        dispatch(changeState({
                            searchPersonList: [],
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