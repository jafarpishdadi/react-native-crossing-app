/**
 * Created by caixiaowei on 17/10/24.
 */

import * as types from "../../../constant/ActionTypes";
import {
    loadInvoiceListDataWithoutReimbursement,
    loadInvoiceListDataWithinReimbursement,
    loadInvoiceListDataDoneReimbursement,
    loadInvoiceListDataReimbursement} from "../invoice/Invoice";
import {loadData as reportData} from '../report/Report';
import Util from "../../../utils/Util";
import Message from "../../../constant/Message";
import {NavigationActions} from 'react-navigation';


//跳转到登陆页面
export const navigateLogin = (params) => {
    return {
        type: types.NAVIGATOR_LOGIN,
        params: params
    }
}

//返回到登录页面
export const backLogin = () => {
    return {
        type: types.BACK_LOGIN,
    }
}

//跳转到注册页面
export const navigateRegister = () => {
    return {
        type: types.NAVIGATOR_REGISTER,
    }
}

//跳转到用户注册协议页面
export const navigateRegisterAgreement = () => {
    return {
        type: types.NAVIGATOR_AGREEMENT,
    }
}

//跳转到注册密码页面
export const navigateRegisterPassword = () => {
    return {
        type: types.NAVIGATOR_REGISTER_PASSWORD,
    }
}

//跳转到创建企业页面
export const navigateOpenEnterprise = () => {
    return {
        type: types.NAVIGATOR_OPEN_ENTERPRISE,
    }
}

//跳转到创建企业页面
export const navigateOpenEnterpriseWithParams = (params) => {
    return {
        type: types.NAVIGATOR_OPEN_ENTERPRISE_WITH_PARAMS,
        params:params,
    }
}

//跳转到成功创建企业页面
export const navigateSuccessOpenEnterprise = () => {
    return {
        type: types.NAVIGATOR_SUCCESS_OPEN_ENTERPRISE,
    }
}

//跳转到个人信息
export const navigatePersonalInformation = (params) => {
    return {
        type: types.NAVIGATOR_PERSONAL_INFORMATION,
        params: params
    }
}

//跳转到个人信息
export const navigateAboutUs = () => {
    return {
        type: types.NAVIGATOR_ABOUT_US,
    }
}

//跳转到设置页面
export const navigateSetUp = () => {
    return {
        type: types.NAVIGATOR_SET_UP
    }
}

//跳转到我的页面
export const navigateMine = () => {
    return {
        type: types.NAVIGATOR_MINE
    }
}

//跳转到修改密码-手机验证码验证页面
export const navigateModifyPasswordVerification = () => {
    return {
        type: types.NAVIGATOR_MODIFY_PASSWORD_VERIFICATION
    }
}

//跳转到借款单详情页面
export const navigateLoanOrderDetail = (params) => {
    return {
        type: types.NAVIGATOR_LOAN_ORDER_DETAIL,
        params: params
    }
}

//跳转到借款单列表页面
export const navigateLoanOrderList = () => {
    return {
        type: types.NAVIGATOR_LOAN_ORDER_LIST
    }
}

//跳转到请选择城市页面
export const navigateSelectCity = () => {
    return {
        type: types.NAVIGATE_SELECT_CITY
    }
}

//跳转到新建借款单页面
export const navigateNewLoanOrder = () => {
    return {
        type: types.NAVIGATE_NEW_LOAN_ORDER
    }
}

//跳转到修改密码页面
export const navigateModifyPassword = (params) => {
    return {
        type: types.NAVIGATOR_MODIFY_PASSWORD,
        params: params
    }
}

//跳转到设置新密码页面
export const navigateCreateNewPassword = (params) => {
    return {
        type: types.NAVIGATOR_CREATE_NEW_PASSWORD,
        params: params,
    }
}

//跳转到我的通知页面
export const navigateMyNotices = () => {
    return {
        type: types.NAVIGATOR_MY_NOTICES
    }
}

//跳转到主页面
export const navigateMainScreen = (params) => {
    return {
        type: types.NAVIGATOR_MAINSCREEN,
        params: params,
    }
}

//跳转到主页面
export const navigateNewReimbursement = (params) => {
    return {
        type: types.NAVIGATOR_NEW_REIMBURSEMENT,
        params: params,
    }
}

export const resetNewReimbursement = (params) => {
    return {
        type: types.RESET_NEW_REIMBURSEMENT,
        params: params,
    }
}

export const backToInvoiceList = () => {
    return {
        type: types.RESET_INVOICE_LIST,
    }
}

//跳转到找回密码页面
export const navigateFindPassword = () => {
    return {
        type: types.NAVIGATOR_FIND_PASSWORD,
    }
}

//返回上个页面
export const back = () => {
    return {
        type: types.BACK,
    }
}

//跳转到我的申请页面
export const navigateApplicationList = () => {
    return {
        type: types.NAVIGATOR_APPLICATION_LIST,
    }
}

export const resetApplicationList = () => {
    return {
        type: types.RESET_APPLICATION_LIST,
    }
}

//跳转到我的审批页面
export const navigateAuditList = () => {
    return {
        type: types.NAVIGATOR_AUDIT_LIST,
    }
};

//跳转到申请详情页面
export const navigateReimbursementDetail = (params) => {
    return {
        type: types.NAVIGATOR_REIMBURSEMENT_DETAIL,
        params: params,
    }
}

//跳转到回复页面
export const navigateReimbursementReply = (params) => {
    return {
        type: types.NAVIGATOR_REIMBURSEMENT_REPLY,
        params
    }
}

//跳转到发票详情页面
export const navigateInvoiceList = (params) => {
    return {
        type: types.NAVIGATOR_INVOICE_LIST,
        params
    }
}

//跳转到发票详情页面
export const navigateInvoiceDetails = (params) => {
    return {
        type: types.NAVIGATOR_INVOICE_DETAIL,
        params
    }
}

//跳转到发票编辑页面
export const navigateEditInvoice = (params) => {
    return {
        type: types.NAVIGATOR_EDIT_INVOICE,
        params
    }
}


//跳转到新增发票页面
export const navigateNewInvoice = (params) => {
    return {
        type: types.NAVIGATOR_NEW_INVOICE,
        params
    }
}

//跳转到新增发票页面
//params:fromNew 表示从新建报销单页面进入扫一扫，只能显示‘立即报销’按钮，点击回到新建报销单页面
export const navigateScanQrCode = (params) => {
    return {
        type: types.NAVIGATOR_SCAN_QRCODE,
        params
    }
}

//跳转到扫一扫失败页面
export const navigateScanQrCodeError = () => {
    return {
        type: types.NAVIGATOR_SCAN_QRCODE_ERROR,
    }
}

//跳转到添加发票页面
export const navigateAddInvoice = (params) => {
    return {
        type: types.NAVIGATOR_ADD_INVOICE,
        params
    }
}

//跳转到选择抄送人页面
export const navigateSelectCopyPerson = (params) => {
    return {
        type: types.SELECT_COPY_PERSON,
        params
    }
}

//跳转到//成本中心--费用分摊
export const navigateCostSharing = (params) => {
    return {
        type: types.COST_SHARING,
        params
    }
}

//跳转到 选择核销借款页面
export const navigateSelectWriteOffLoan = (params) => {
    return {
        type: types.SELECT_WRITE_OFF_LOAN,
        params
    }
}

//选择出差申请
export const navigateTravelApply = (params) => {
    return {
        type: types.SELECT_TRAVEL_APPLY,
        params
    }
}

//新建出差申请单
export const navigateNewTravelApply = (params) => {
    return {
        type: types.NEW_TRAVEL_APPLY,
        params
    }
}

//出差申请单详情
export const navigateTravelApplyDetail = (params) => {
    return {
        type: types.TRAVEL_APPLY_DETAIL,
        params
    }
}

//出差申请列表
export const navigateTravelApplyList = (params) => {
    return {
        type: types.TRAVEL_APPLY_LIST,
        params
    }
}

/**
 * 根据扫一扫或ocr识别的返回结果判断跳转发票编辑页面还是新建发票页面
 * @param ret 归集返回的数据
 * @param isFromScan 是否来自于扫一扫页面；如果是则在下个页面点击继续归集的时候返回扫一扫页面，而不是push到扫一扫页面
 * @param params:{fromNew:true,expenseId:''} fromNew 表示从新建报销单页面进入扫一扫，只能显示‘立即报销’按钮，点击回到新建报销单页面
 */
export const navigateToNewOrEditInvoicePage = (ret,isFromScan,params) => {
    return (dispatch,getState) => {
        var navigationState = getState().nav;
        const currentRouteName = (navigationState.routes[navigationState.index]).routeName;

        if (ret.status) {
            if (ret.data && ret.data != null) {
                if (ret.data.checkState == '1') {

                    //如果是点击继续归集跳转到当前页面，先销毁，再跳转
                    if(currentRouteName == 'InvoiceDetails'){
                        // dispatch(back());
                        dispatch(NavigationActions.reset({
                            index: 1,
                            actions:[
                                NavigationActions.navigate({
                                    routeName: 'MainScreen',
                                    params: {
                                        tab: 'Invoice'
                                    }
                                }),
                                NavigationActions.navigate({
                                    routeName: 'InvoiceDetails',
                                    params: {
                                        invoiceTypeCode: ret.data.invoiceTypeCode,
                                        uuid: ret.data.uuid,
                                        showCollectBtn: true,       //是否显示立即归集按钮
                                        fromNew:params ? params.fromNew : false,        //是否是来自新建报销单页面
                                        expenseId:params ? params.expenseId : '',        //是否是来自新建报销单页面
                                        isFromScan:isFromScan,      //是否来自于扫一扫页面
                                        showReimbursementBtn: true, //是否显示立即报销按钮
                                    }})
                            ]
                        }));
                    }
                    //跳转发票详情页面
                    dispatch(navigateInvoiceDetails({
                        invoiceTypeCode: ret.data.invoiceTypeCode,
                        uuid: ret.data.uuid,
                        showCollectBtn: true,       //是否显示立即归集按钮
                        fromNew:params ? params.fromNew : false,        //是否是来自新建报销单页面
                        expenseId:params ? params.expenseId : '',        //是否是来自新建报销单页面
                        isFromScan:isFromScan,      //是否来自于扫一扫页面
                        showReimbursementBtn: true, //是否显示立即报销按钮
                    }));
                    dispatch(loadInvoiceListDataReimbursement('N'));
                } else if (ret.data.invoiceTypeCode != '00') {
                    if(currentRouteName == 'EditInvoice'){
                        // dispatch(back());
                        dispatch(NavigationActions.reset({
                            index: 1,
                            actions:[
                                NavigationActions.navigate({
                                    routeName: 'MainScreen',
                                    params: {
                                        tab: 'Invoice'
                                    }
                                }),
                                NavigationActions.navigate({
                                    routeName: 'EditInvoice',
                                    params: {
                                        invoiceTypeCode: ret.data.invoiceTypeCode,
                                        uuid: ret.data.uuid,
                                        returnDelete: true,
                                        hideSave: true,
                                        showCollectBtn: true,       //是否显示立即归集按钮
                                        fromNew:params ? params.fromNew : false,        //是否是来自新建报销单页面
                                        expenseId:params ? params.expenseId : '',        //是否是来自新建报销单页面
                                        isFromScan:isFromScan,      //是否来自于扫一扫页面
                                        showReimbursementBtn: true, //是否显示立即报销按钮
                                    }})
                            ]
                        }));
                    }
                    //跳转编辑发票页面
                    dispatch(navigateEditInvoice({
                        invoiceTypeCode: ret.data.invoiceTypeCode,
                        uuid: ret.data.uuid,
                        returnDelete: true,
                        hideSave: true,
                        showCollectBtn: true,       //是否显示立即归集按钮
                        fromNew:params ? params.fromNew : false,        //是否是来自新建报销单页面
                        expenseId:params ? params.expenseId : '',        //是否是来自新建报销单页面
                        isFromScan:isFromScan,      //是否来自于扫一扫页面
                        showReimbursementBtn: true, //是否显示立即报销按钮
                    }));
                } else {
                    if(!isFromScan && Util.checkIsEmptyString(ret.data.uuid)){
                        Util.showToast(Message.UPLOAD_FAIL);
                        return;
                    }
                    if(currentRouteName == 'NewInvoice'){
                        // dispatch(back());
                        dispatch(NavigationActions.reset({
                            index: 1,
                            actions:[
                                NavigationActions.navigate({
                                    routeName: 'MainScreen',
                                    params: {
                                        tab: 'Invoice'
                                    }
                                }),
                                NavigationActions.navigate({
                                    routeName: 'NewInvoice',
                                    params: {
                                        invoiceData: ret.data,
                                        fromNew:params ? params.fromNew : false,        //是否是来自新建报销单页面
                                        expenseId:params ? params.expenseId : '',        //是否是来自新建报销单页面
                                    }})
                            ]
                        }));
                    }
                    //跳转新增发票选择发票类型，输入发票要素页面
                    dispatch(navigateNewInvoice({
                        invoiceData: ret.data,
                        fromNew:params ? params.fromNew : false,        //是否是来自新建报销单页面
                        expenseId:params ? params.expenseId : '',        //是否是来自新建报销单页面
                    }));
                }
            } else {
                if(!isFromScan){
                    Util.showToast(Message.UPLOAD_FAIL);
                    return;
                }
                if(currentRouteName == 'NewInvoice'){
                    // dispatch(back());
                    dispatch(NavigationActions.reset({
                        index: 1,
                        actions:[
                            NavigationActions.navigate({
                                routeName: 'MainScreen',
                                params: {
                                    tab: 'Invoice'
                                }
                            }),
                            NavigationActions.navigate({
                                routeName: 'NewInvoice',
                                params: {
                                    invoiceData: ret.data,
                                    fromNew:params ? params.fromNew : false,        //是否是来自新建报销单页面
                                    expenseId:params ? params.expenseId : '',        //是否是来自新建报销单页面
                                }})
                        ]
                    }));
                }
                //跳转新增发票选择发票类型，输入发票要素页面
                dispatch(navigateNewInvoice({
                    invoiceData: ret.data,
                    fromNew:params ? params.fromNew : false,        //是否是来自新建报销单页面
                    expenseId:params ? params.expenseId : '',        //是否是来自新建报销单页面
                }));
            }
        } else {
            if (ret.message == '9993') {
                if(currentRouteName == 'InvoiceDetails'){
                    // dispatch(back());
                    dispatch(NavigationActions.reset({
                        index: 1,
                        actions:[
                            NavigationActions.navigate({
                                routeName: 'MainScreen',
                                params: {
                                    tab: 'Invoice'
                                }
                            }),
                            NavigationActions.navigate({
                                routeName: 'InvoiceDetails',
                                params: {
                                    invoiceTypeCode: ret.data.invoiceTypeCode,
                                    uuid: ret.data.uuid,
                                    showCollectBtn: true,       //是否显示立即归集按钮
                                    fromNew:params ? params.fromNew : false,        //是否是来自新建报销单页面
                                    expenseId:params ? params.expenseId : '',        //是否是来自新建报销单页面
                                    isFromScan:isFromScan,      //是否来自于扫一扫页面
                                    showReimbursementBtn: true, //是否显示立即报销按钮
                                }})
                        ]
                    }));
                }
                //跳转发票详情页面
                dispatch(navigateInvoiceDetails({
                    invoiceTypeCode: ret.data.invoiceTypeCode,
                    uuid: ret.data.uuid,
                    showCollectBtn: true,       //是否显示立即归集按钮
                    fromNew:params ? params.fromNew : false,        //是否是来自新建报销单页面
                    expenseId:params ? params.expenseId : '',        //是否是来自新建报销单页面
                    isFromScan:isFromScan,      //是否来自于扫一扫页面
                    showReimbursementBtn: true, //是否显示立即报销按钮
                }));
                Util.showToast(Message.SCAN_QR_CODE_ALREADY_COLLECTED);
            } else if (ret.message == '9995') {
                if(currentRouteName == 'InvoiceDetails'){
                    // dispatch(back());
                    dispatch(NavigationActions.reset({
                        index: 1,
                        actions:[
                            NavigationActions.navigate({
                                routeName: 'MainScreen',
                                params: {
                                    tab: 'Invoice'
                                }
                            }),
                            NavigationActions.navigate({
                                routeName: 'InvoiceDetails',
                                params: {
                                    invoiceTypeCode: ret.data.invoiceTypeCode,
                                    uuid: ret.data.uuid,
                                    showCollectBtn: true,       //是否显示立即归集按钮
                                    fromNew:params ? params.fromNew : false,        //是否是来自新建报销单页面
                                    expenseId:params ? params.expenseId : '',        //是否是来自新建报销单页面
                                    isFromScan:isFromScan,      //是否来自于扫一扫页面
                                    showReimbursementBtn: true, //是否显示立即报销按钮
                                }})
                        ]
                    }));
                }
                //跳转发票详情页面
                dispatch(navigateInvoiceDetails({
                    invoiceTypeCode: ret.data.invoiceTypeCode,
                    uuid: ret.data.uuid,
                    showCollectBtn: true,       //是否显示立即归集按钮
                    fromNew:params ? params.fromNew : false,        //是否是来自新建报销单页面
                    expenseId:params ? params.expenseId : '',        //是否是来自新建报销单页面
                    isFromScan:isFromScan,      //是否来自于扫一扫页面
                    showReimbursementBtn: true, //是否显示立即报销按钮
                }));
                Util.showToast(Message.SCAN_QR_CODE_ALREADY_REIMBURSED);
                dispatch(loadInvoiceListDataDoneReimbursement({
                    invoiceTime:'',
                    reimburseState:3,
                    invoiceTypeCode:'',
                    page:1,
                    rows:20,
                    isSyn: 'N'
                }));
            }else if (ret.message == '9988') {

                if(currentRouteName == 'InvoiceDetails'){
                    // dispatch(back());
                    dispatch(NavigationActions.reset({
                        index: 1,
                        actions:[
                            NavigationActions.navigate({
                                routeName: 'MainScreen',
                                params: {
                                    tab: 'Invoice'
                                }
                            }),
                            NavigationActions.navigate({
                                routeName: 'InvoiceDetails',
                                params: {
                                    invoiceTypeCode: ret.data.invoiceTypeCode,
                                    uuid: ret.data.uuid,
                                    showCollectBtn: true,       //是否显示立即归集按钮
                                    fromNew:params ? params.fromNew : false,        //是否是来自新建报销单页面
                                    expenseId:params ? params.expenseId : '',        //是否是来自新建报销单页面
                                    isFromScan:isFromScan,      //是否来自于扫一扫页面
                                    showReimbursementBtn: true, //是否显示立即报销按钮
                                }})
                        ]
                    }));
                }
                //跳转发票详情页面
                dispatch(navigateInvoiceDetails({
                    invoiceTypeCode: ret.data.invoiceTypeCode,
                    uuid: ret.data.uuid,
                    showCollectBtn: true,       //是否显示立即归集按钮
                    fromNew:params ? params.fromNew : false,        //是否是来自新建报销单页面
                    expenseId:params ? params.expenseId : '',        //是否是来自新建报销单页面
                    isFromScan:isFromScan,      //是否来自于扫一扫页面
                    showReimbursementBtn: true, //是否显示立即报销按钮
                }));

                Util.showToast(Message.SCAN_QR_CODE_REIMBURSING);

                dispatch(loadInvoiceListDataWithinReimbursement({
                    invoiceTime:'',
                    reimburseState:2,
                    invoiceTypeCode:'',
                    page:1,
                    rows:20,
                    isSyn: 'N'
                }));
            } else {
                if(!isFromScan){
                    Util.showToast(Message.UPLOAD_FAIL);
                    return;
                }
                if(currentRouteName == 'NewInvoice'){
                    // dispatch(back());
                    dispatch(NavigationActions.reset({
                        index: 1,
                        actions:[
                            NavigationActions.navigate({
                                routeName: 'MainScreen',
                                params: {
                                    tab: 'Invoice'
                                }
                            }),
                            NavigationActions.navigate({
                                routeName: 'NewInvoice',
                                params: {
                                    invoiceData: ret.data,
                                    fromNew:params ? params.fromNew : false,        //是否是来自新建报销单页面
                                    expenseId:params ? params.expenseId : '',        //是否是来自新建报销单页面
                                }})
                        ]
                    }));
                }
                //跳转新增发票选择发票类型，输入发票要素页面
                dispatch(navigateNewInvoice({
                    invoiceData: ret.data,
                    fromNew:params ? params.fromNew : false,        //是否是来自新建报销单页面
                    expenseId:params ? params.expenseId : '',        //是否是来自新建报销单页面
                }));
            }
        }
    }
};

