/**
 * Created by sky.qian on 10/26/2017.
 */
import * as types from '../../../constant/ActionTypes';

const initialState = {
    isFirst: true,
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
    doneReimbursementLoadMore: false,

    showPickerShadow: false,   //是否显示选择器阴影

    showNoPermissionDialog:false,
    isShowDatePicker: false
}

const invoiceReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.INVOICE_LIST_CHANGE_STATE:
            return {...state, ...action.state}
        default:
            return state;
    }
}

export default invoiceReducer;