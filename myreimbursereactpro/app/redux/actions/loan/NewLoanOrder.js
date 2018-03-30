import * as types from '../../../constant/ActionTypes';
import API from "../../../utils/API";
import HttpUtil from "../../../network/HttpUtil";
import Util from "../../../utils/Util";
import {resetLoanList} from '../../../redux/actions/navigator/Navigator';
import Message from '../../../constant/Message';

export const changeState = (state) => {
    return {
        type: types.NEW_LOAN_ORDER_CHANGE_STATE,
        state: state,
    }
};

export const initData = () => {
    return {
        type: types.INIT_NEW_LOAN,
    }
}

export const loadData = (params) => {
    return (dispatch) => {
        dispatch(changeState({
            isLoading: true,
        }))
        if (params && params.source === 'LoanOrderDetail') {
            dispatch(changeState(params.data));
        }
        dispatch(getOrganization({organizationType: 'dep'}))
    }
}

/**
 * 语音识别
 */
export const recogniseVoiceRecord = (requestData, callback) => {
    //var data = "voice=" + requestData.voice + "&length=" + requestData.length;
    return (dispatch) => {
        dispatch(changeState({
            isLoading: true,
        }));
        return HttpUtil.postJson(API.VOICE_API_ADDRESS, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false,
                timeEnd: false,
                isVoice:false
            }));
            if (status) {
                if(ret.code == '00000'){
                    callback(ret.data.result);
                }
            }
        })
    }
}


export const uploadAttachment = (attachList, fileSource) => {

    return (dispatch) => {
        dispatch(changeState({
            isLoading: true,
        }));

        var formData = new FormData();
        const name = encodeURI(fileSource.fileName);
        var file1 = {uri: fileSource.uri, type: 'multipart/form-data', name: fileSource.fileName ? name : (new Date().getTime())+'.jpg'};
        formData.append("files", file1);

        return HttpUtil.postFileForm(API.UPLOAD_ATTACHMENT, formData, dispatch, function (ret, status) {

            dispatch(changeState({
                isLoading: false,
            }));
            if (status) {
                if (ret.status) {
                    var attachmentItem = {
                        fileName: decodeURI(ret.data[0].fileName),
                        fileAddress: ret.data[0].fileAddress,
                        fileSourceType: 'FTP',
                        fileType: ret.data[0].fileType,
                        fileSize: ret.data[0].fileSize
                    }
                    attachList.push(attachmentItem);
                    dispatch(changeState({
                        attachmentList: attachList,
                    }));

                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const getOrganization = (requestData) => {

    return dispatch => {
        return HttpUtil.postJson(API.GET_ORGANIZATION, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false,
            }));
            if (status) {
                if (ret.status) {
                    var organizationList = ret.data;
                    var organizationLists = [];
                    for (var i = 0; i < organizationList.length; i++) {
                        organizationLists.push(organizationList[i].orgDepName);
                    }
                    dispatch(changeState({
                        organizationOriginalList: organizationList,
                        organizationList: organizationLists,
                    }));
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const saveLoan = (requestData) => {

    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }));
        return HttpUtil.postJson(API.SAVE_BORROW_BILL, requestData, dispatch, function (ret, status) {

            dispatch(changeState({
                isLoading: false,
            }));
            if (status) {
                if (ret.status) {
                    Util.showToast(Message.ACTION_SUCCESS);
                    dispatch(resetLoanList());
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const resaveLoan = (requestData) => {

    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }));
        return HttpUtil.postJson(API.RE_SAVE_BORROW_BILL, requestData, dispatch, function (ret, status) {

            dispatch(changeState({
                isLoading: false,
            }));
            if (status) {
                if (ret.status) {
                    Util.showToast(Message.ACTION_SUCCESS);
                    dispatch(resetLoanList());
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const submitLoan = (requestData) => {

    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }));
        return HttpUtil.postJson(API.SUBMIT_BORROW_BILL, requestData, dispatch, function (ret, status) {

            dispatch(changeState({
                isLoading: false,
            }));
            if (status) {
                if (ret.status) {
                    Util.showToast(Message.ACTION_SUCCESS);
                    dispatch(resetLoanList());
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const resubmitLoan = (requestData) => {

    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }));
        return HttpUtil.postJson(API.RE_SUBMIT_BORROW_BILL, requestData, dispatch, function (ret, status) {

            dispatch(changeState({
                isLoading: false,
            }));
            if (status) {
                if (ret.status) {
                    Util.showToast(Message.ACTION_SUCCESS);
                    dispatch(resetLoanList());
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}