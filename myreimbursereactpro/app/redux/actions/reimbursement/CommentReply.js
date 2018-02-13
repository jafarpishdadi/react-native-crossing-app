/**
 * Created by sky.qian on 11/29/2017.
 */
import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';
import {back} from '../../../redux/actions/navigator/Navigator';
import {loadData as loadReimbursement} from '../../../redux/actions/reimbursement/ReimbursementDetail';

export const changeState = (state) => {
    return {
        type: types.COMMENT_REPLY_CHANGE_STATE,
        state: state,
    }
}

export const initData = () => {
    return dispatch => {
        dispatch(changeState({
            comment: '',
            attachmentList: [],
            isLoading: false,
        }))
    }
}

export const addComment = (requestData) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true
        }))
        return HttpUtil.postJson(API.ADD_COMMENT, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false
            }))
            if (status) {
                if (ret.status) {
                    //清空回复内容
                    dispatch(changeState({
                        comment: '',
                        attachmentList: [],
                        isLoading: false,
                    }))
                    dispatch(loadReimbursement(requestData.commentContent.expenseNo));
                    dispatch(back());
                } else {
                    Util.showToast(ret.message);
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
                        id: Util.randomStr(),
                        fileName: decodeURI(ret.data[0].fileName),
                        fileDir: ret.data[0].fileAddress,
                        fileType: ret.data[0].fileType,
                        fileSize: ret.data[0].fileSize,
                        userType: fileSource.userType
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