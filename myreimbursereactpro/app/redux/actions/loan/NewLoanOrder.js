import * as types from '../../../constant/ActionTypes';
import API from "../../../utils/API";
import HttpUtil from "../../../network/HttpUtil";
import Util from "../../../utils/Util";

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

export const loadData = () => {
    return (dispatch) => {
        dispatch(changeState({
            isLoading: true,
        }))
        dispatch(getOrganization({organizationType: 'dep'}))
    }
}

/**
 * 语音识别
 */
export const recogniseVoiceRecord = (type,expenseId,requestData) => {
    //var data = "voice=" + requestData.voice + "&length=" + requestData.length;
    return (dispatch, getState) => {
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
                    const Reimbursement = getState().Reimbursement;
                    //报销事由
                    if(type == 0){
                        var expenseDesc=Reimbursement.expenseDesc + ret.data.result;
                        if(expenseDesc.length>300){
                            expenseDesc = text.substring(0,299);
                        }
                        dispatch(changeState({
                            LoanReason:expenseDesc
                        }));
                    }else if(type == 1){
                        var bizExpenseTypeList = Reimbursement.bizExpenseTypeList;
                        for(var i=0;i<bizExpenseTypeList.length;i++){
                            if(expenseId == bizExpenseTypeList[i].expenseId){
                                var detail = bizExpenseTypeList[i].detail + ret.data.result;
                                if(detail.length>300){
                                    detail = text.substring(0,299);
                                }
                                bizExpenseTypeList[i].detail = detail;
                                dispatch(changeState({bizExpenseTypeList:bizExpenseTypeList}))
                                break;
                            }
                        }
                    }

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