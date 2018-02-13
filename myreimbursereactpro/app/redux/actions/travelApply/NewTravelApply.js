/**
 * Created by Louis.lu on 2018-01-23.
 */
import * as types from '../../../constant/ActionTypes';
import Util from '../../../utils/Util';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Message from '../../../constant/Message';

export const changeState = (state) => {
    return {
        type: types.NEW_TRAVEL_APPLY_CHANGE_STATE,
        state: state,
    }
}
export const initData = () => {
    return {
        type: types.NEW_TRAVEL_APPLY_INIT_DATA
    }
}

export const loadData = (params) => {
    return (dispatch) => {
        dispatch(changeState({
            isLoading: true,
        }))
        if (params && params.source === 'TravelApplyDetail') {
            dispatch(changeState(params.data));
        } else {
            dispatch(changeState({
                titleText: Message.NEW_TRAVEL_APPLY_TITLE
            }))
        }
        dispatch(getOrganization({organizationType: 'dep'}));
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

/**
 * 语音识别
 */
export const recogniseVoiceRecord = (requestData) => {
    return (dispatch, getState) => {
        dispatch(changeState({
            isLoading: true,
        }));
        return HttpUtil.postJson(API.VOICE_API_ADDRESS, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false,
                timeEnd: false,
                isVoice: false
            }));
            if (status) {
                if (ret.code == '00000') {
                    const NewTravelApply = getState().NewTravelApply;
                    var cause = NewTravelApply.cause + ret.data.result;
                    if (cause.length > 300) {
                        cause = cause.substring(0, 299);
                    }
                    dispatch(changeState({
                        cause: cause
                    }));
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
        var file1 = {
            uri: fileSource.uri,
            type: 'multipart/form-data',
            name: fileSource.fileName ? name : (new Date().getTime()) + '.jpg'
        };
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