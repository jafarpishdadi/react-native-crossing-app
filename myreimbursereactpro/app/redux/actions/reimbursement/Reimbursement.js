import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';
import {loadData as loadHomePageData} from '../../../redux/actions/homePage/HomePage';
import {loadData as loadReimbursementDetail} from '../../../redux/actions/reimbursement/ReimbursementDetail';
import {back, resetApplicationList} from '../../../redux/actions/navigator/Navigator';
import {refreshReimbursementList} from '../../../redux/actions/reimbursement/ReimbursementList';
import ScreenUtil from '../../../utils/ScreenUtil';
import {loadData as reportData, changeState as reportChangeState} from '../../actions/report/Report';

export const loadData = (params, bizExpenseTypeList) => {

    return (dispatch) => {
        dispatch(changeState({
            isLoading: true,
        }))
        if (params && params.source === 'ReimbursementDetail') {
            dispatch(changeState(params.data));
        }
        dispatch(getApplyType({}, params, bizExpenseTypeList));
    }
}

export const initData = () => {
    return {
        type: types.INIT_NEW_REIMBURSEMENT,
    }
}


export const getApplyType = (requestData, params, bizExpenseTypeList) => {

    return dispatch => {
        return HttpUtil.postJson(API.GET_APPLY_TYPE, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false,
            }));
            if (status) {
                if (ret.status) {
                    var reimbursementTypeList = ret.data;
                    var reimburseTypeList = [];
                    for (var i = 0; i < reimbursementTypeList.length; i++) {
                        reimburseTypeList.push(reimbursementTypeList[i].name);
                    }
                    if (params) {
                        if (params.source === 'ReimbursementDetail') {
                            dispatch(changeState({
                                reimbursementTypeOriginalList: reimbursementTypeList,
                                reimbursementTypeList: reimburseTypeList,
                            }));
                            const reimbursementDetail = reimbursementTypeList.find(function (reimbursementType) {
                                return reimbursementType.templatNo == params.applyTypeCode;
                            });
                            if (params.applyTypeCode) {
                                dispatch(getExpenseType({
                                    templatNo: params.applyTypeCode,
                                    expenseRange: reimbursementDetail.expenseRange,
                                }));
                            }
                        } else {
                            var reimbursementDetail = reimbursementTypeList.find(function (reimbursementType) {
                                return reimbursementType.name === params.applyTypeName;
                            });
                            bizExpenseTypeList[0].bizExpenseBillList = params.selectedList ? params.selectedList : [];
                            let amount = 0;
                            let num = 0;
                            if (params.selectedList) {
                                params.selectedList.forEach(item => {
                                    amount += parseFloat(item.invoiceAmount)
                                    num += parseInt(item.invoiceNum);
                                });
                                bizExpenseTypeList[0].totalNum = num;
                                bizExpenseTypeList[0].totalAmount = parseFloat(amount).toFixed(2);
                            }

                            dispatch(changeState({
                                applyTypeCode: reimbursementDetail.templatNo,
                                bizExpenseTypeList: bizExpenseTypeList,
                                reimbursementTypeOriginalList: reimbursementTypeList,
                                reimbursementTypeList: reimburseTypeList,
                                totalAmount: parseFloat(amount).toFixed(2),
                                totalNum: num,
                            }));
                            dispatch(selectReimType(params.applyTypeName));
                            dispatch(getExpenseType({
                                templatNo: reimbursementDetail.templatNo,
                                expenseRange: reimbursementDetail.expenseRange,
                            }));
                        }
                    } else {
                        dispatch(changeState({
                            reimbursementTypeOriginalList: reimbursementTypeList,
                            reimbursementTypeList: reimburseTypeList,
                        }));
                    }

                    dispatch(getOrganization({organizationType: 'dep'}));
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

export const getExpenseType = (requestData) => {

    return dispatch => {
        return HttpUtil.postJson(API.GET_EXPENSE_TYPE, requestData, dispatch, function (ret, status) {
            if (status) {
                if (ret.status) {
                    var expenseTypeOriginalList = ret.data;
                    //一级费用类别
                    const expenseTypeOne = expenseTypeOriginalList.filter(item => item.pcode == 'ROOT');
                    //二级费用类别
                    const expenseTypeTwo = expenseTypeOriginalList.filter(item => item.pcode != 'ROOT');
                    //生成二级菜单二维数组
                    const expenseTypeList = expenseTypeOne.map((one) => {
                        const data = {};
                        data[one.name] = (expenseTypeTwo.filter(item => item.pcode == one.expenseCode)).map(two => two.name);
                        if (data[one.name].length === 0) {
                            data[one.name] = [one.name];
                        }
                        return data;
                    })
                    dispatch(changeState({
                        expenseTypeOriginalList: expenseTypeOriginalList,
                        expenseTypeList: expenseTypeList,
                        expenseTypeOne: expenseTypeOne,
                        expenseTypeTwo: expenseTypeTwo,
                    }));
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const addNewExpenseDetails = () => {
    return {
        type: types.ADD_NEW_EXPENSE_DETAIL
    }
}

export const deleteExpenseDetail = (expenseId) => {
    return {
        type: types.DELETE_EXPENSE_DETAIL,
        expenseId
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
                        bizExpenseAttachmentList: attachList,
                    }));

                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}


export const addInvoice = (expenseId) => {
    return {
        type: types.ADD_INVOICE,
        expenseId
    }
}


export const selectReimType = (typeName) => {
    return {
        type: types.SELECT_REIM_TYPE,
        typeName
    }
}


export const deleteInvoice = (expenseId, invoiceId) => {
    return {
        type: types.DELETE_INVOICE,
        expenseId,
        invoiceId
    }
}

export const saveReimbursement = (requestData) => {

    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }));
        return HttpUtil.postJson(API.SAVE_REIMBURSEMENT, requestData, dispatch, function (ret, status) {

            dispatch(changeState({
                isLoading: false,
            }));
            if (status) {
                if (ret.status) {
                    Util.showToast(Message.ACTION_SUCCESS);
                    dispatch(resetApplicationList());
                    // dispatch(reportChangeState({isReloading: true}));
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const editReimbursement = (requestData) => {

    return (dispatch) => {
        dispatch(changeState({
            isLoading: true,
        }));
        return HttpUtil.postJson(API.EDIT_REIMBURSEMENT, requestData, dispatch, function (ret, status) {

            dispatch(changeState({
                isLoading: false,
            }));
            if (status) {
                if (ret.status) {
                    Util.showToast(Message.ACTION_SUCCESS);
                    dispatch(resetApplicationList());
                    // dispatch(reportChangeState({isReloading: true}));
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const showAlert = (title, content) => {
    return {
        type: types.SHOW_ALERT,
        title,
        content
    }
}

export const closeAlert = () => {
    return {
        type: types.CLOSE_ALERT,
    }
}

export const changeState = (state) => {
    return {
        type: types.NEW_REIMBURSEMENT_CHANGE_STATE,
        state: state,
    }
}

//参数param用来接收切换报销类型传进来的参数
export const initReimbursement = (param) => {
    return dispatch => {
        dispatch(changeState({
            selectReimType: false,                  //报销类型选择器
            selectedStartDate: '',                  //开始日期
            selectedEndDate: '',                    //结束日期
            travelDays: '',                          //出差天数
            targetCity: '',                          //目的城市
            expenseDesc: '',                         //报销说明
            expenseDescCommon: '',                   //通用报销单说明
            expenseTypeList: [],                    //费用类别列表
            totalNum: '0',                            //发票总张数
            totalAmount: '0.00',                         //发票总金额
            travelBill: '',
            bizExpenseTypeList: [{
                expenseId: Util.randomStr(),
                code: '',
                name: '',
                detail: '',
                totalNum: '',
                totalAmount: '',
                bizExpenseBillList: [],
                textInputHeight: ScreenUtil.scaleSize(40),
            }],
            bizExpenseAttachmentList: [],
            warningDialog: false,        //显示弹窗
            alertTitle: '',              //弹窗标题
            alertContent: '',            //弹窗内容
            expenseStateCode: '0',       //0保存，3提交
            showPrompt: false,          //保存结果提示
            promptType: '',             //提示类型
            promptMsg: '',              //提示内容
            bizExpenseAttachmentIDList: param ? param.bizExpenseAttachmentIDList : [],     //删除的报销单附件ID集合
            bizExpenseAttachmentURLList: param ? param.bizExpenseAttachmentURLList : [],    //删除的报销单附件URL集合
            bizExpenseTypeIDList: param ? param.bizExpenseTypeIDList : [],           //删除的报销单明细ID集合
            bizExpenseBillIDList: param ? param.bizExpenseBillIDList : [],           //删除的发票ID集合
            expenseDescTextInputHeight: ScreenUtil.scaleSize(40), //报销说明输入框高度
        }));
    }
}


/**
 * 语音识别
 */
export const recogniseVoiceRecord = (type, expenseId, requestData) => {
    //var data = "voice=" + requestData.voice + "&length=" + requestData.length;
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
                    const Reimbursement = getState().Reimbursement;
                    //报销事由
                    if (type == 0) {
                        var expenseDesc = Reimbursement.expenseDesc + ret.data.result;
                        if (expenseDesc.length > 300) {
                            expenseDesc = text.substring(0, 299);
                        }
                        dispatch(changeState({
                            expenseDesc: expenseDesc
                        }));
                    } else if (type == 1) {
                        var bizExpenseTypeList = Reimbursement.bizExpenseTypeList;
                        for (var i = 0; i < bizExpenseTypeList.length; i++) {
                            if (expenseId == bizExpenseTypeList[i].expenseId) {
                                var detail = bizExpenseTypeList[i].detail + ret.data.result;
                                if (detail.length > 300) {
                                    detail = text.substring(0, 299);
                                }
                                bizExpenseTypeList[i].detail = detail;
                                dispatch(changeState({bizExpenseTypeList: bizExpenseTypeList}))
                                break;
                            }
                        }
                    }

                }
            }
        })
    }
}




