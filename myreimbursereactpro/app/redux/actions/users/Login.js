/**
 * Created by caixiaowei on 17/10/24.
 */
import * as types from '../../../constant/ActionTypes';
import {navigateMainScreen, navigateOpenEnterpriseWithParams} from '../../actions/navigator/Navigator';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';
import Store from 'react-native-simple-store';
import {changeState as changeHomePageState} from '../../actions/homePage/HomePage';
import {changeState as invoiceChangeState} from '../../actions/invoice/Invoice';

export const loginAction = (requestData) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }));
        return HttpUtil.postJson(API.LOGIN, requestData, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false,
            }));
            if (status) {
                if (ret.status) {
                    Store.save('token', ret.data.token);
                    Store.save('userInfo', requestData);
                    if (ret.data.turnType === 'enterprise') {
                        dispatch(navigateOpenEnterpriseWithParams({whereComeFrom: 'Login'}))
                    } else if (ret.data.turnType === 'home') {
                        dispatch(navigateMainScreen())
                    } else if (ret.data.turnType === 'forbidLogin') {
                        Util.showToast(Message.ENTERPRISE_HAS_BEEN_FORBIDDEN);
                    }
                    else {
                        // Util.showToast(Message.NETWORK_DATA_ERROR)
                        Util.showToast(ret.message);
                    }
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const changeState = (state) => {
    return {
        type: types.LOGIN_CHANGE_STATE,
        state: state
    }
}
export const logoutTo = () => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }));
        return HttpUtil.postJson(API.LOGIN_OUT, {}, dispatch, function (ret, status) {
            dispatch(changeState({
                isLoading: false,
            }));
            if (status) {
                if (ret.status) {
                    Store.delete('token');
                    dispatch(changeState({
                        password: '',
                        macAddress: '',
                    }));
                    dispatch(changeHomePageState({
                        isFirst: true,
                        companyArr: [],
                        reimbursementList: [],
                        unreadMessageCount: 0,
                        applicationCount: 0,
                        applicationAmount: 0,
                        approvalCount: 0,
                        approvalAmount: 0,
                        selectCompany: '',      //选择的公司
                    }));
                    //退出重新登录时，清空票夹数据，防止数据缓存为上次数据
                    dispatch(invoiceChangeState({
                        isLoading: false,
                        deleteConfirm: false,
                        showCountDetail: false,      //显示累计张数详情
                        showAmountDetail: false,     //显示累计金额详情
                        showDialog: false,          //是否显示提示对话框
                        showCheckbox: false,        //是否显示复选框

                        selectedItem: [],       //单行选中的发票
                        selectedItemIDCount: 0, //单行选中的发票ID数
                        selectedItemAmount: 0,  //单行选中的发票金额数
                        isSelectedItem: [],     //单行发票按钮是否选中
                        allItemCount: 0,       //列表所有发票数
                        allItemAmount: [],       //列表所有发票金额
                        allItem: [],            //列表所有发票
                        isSelectedAll: false,   //是否选择全选按钮
                        checkedInvoice: [],      //未查验的增票发票

                        reimbursementType: '',      //报销单类型
                        reimbursementTypeList: [],  //报销单类型模板list

                        selectedYear: '',
                        selectedMonth: '',
                        selectedDateStr: '',
                        defaultData: '全部',

                        zje: '',        //总金额
                        zsl: '',        //总数量
                        wbxje: '',       //未报销金额
                        wbxzs: '',       //未报销张数
                        bxzje: '',       //报销中金额
                        bxzzs: '',       //报销中张数
                        ybxje: '',       //已报销金额
                        ybxzs: '',       //已报销张数

                        /**
                         * 返回发票Data数组数据为：uuid,invoiceTypeCode,totalAmount,reimburseState,reimburseSerialNo,
                         * invoiceDate,invoiceDetail,isBlush,checkSate,isCanceled,isException,invoiceCount
                         */         //
                        dataWithoutReimbursement: [],       //未报销发票
                        dataWithinReimbursement: [],        //报销中发票
                        dataDoneReimbursement: [],          //已报销发票
                        reimbursementStatus: 0,             //报销状态，值0=未报销,2=报销中,3=已报销,默认0

                        preDeleteInvoiceId: '',                           //删除发票uuid

                        targetExpenseId: '',                         //进入票夹页面选择发票去保险单

                        canDelete: false,                   //左滑是否删除,报销0时可以删除，2、3时不可删除

                        isRefreshing: false,        //刷新中
                        showLoading: false,         //上拉加载时，是否显示加载信息,如‘正在加载...’

                        noReimbursementPage: 1,
                        noReimbursementLoadMore: false,

                        inReimbursementPage: 1,
                        inReimbursementLoadMore: false,

                        doneReimbursementPage: 1,
                        doneReimbursementLoadMore: false
                    }));
                    Store.delete('userInfo').then(()=> {
                        dispatch(logoutToLogin())
                    });

                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}

export const logoutToLogin = () => {

    return {
        type: types.NAVIGATOR_LOGIN
    }
}

export const loginInit = (params) => {
    return dispatch => {
        dispatch(changeState({
            loginName: "",
            password: ""
        }))
    }
}
