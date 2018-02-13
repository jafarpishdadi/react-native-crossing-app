/**
 * Created by Richard.ji on 2017/11/28.
 */

import * as types from '../../../constant/ActionTypes';

const initialState = {
    isLoading: false,
    reimbursementCategory: [
        '差旅费报销单',
        '通用报销单'
    ],
    selectedYear: '',
    selectedMonth: '',
    selectedDateStr: '',
    defaultData: '全部',

    dataWithoutReimbursement: [],       //未报销发票

    isRefreshing: false,        //刷新中
    showLoading: false,         //上拉加载时，是否显示加载信息,如‘正在加载...’

    noReimbursementPage: 1,
    noReimbursementLoadMore: true,

    selectedItem: [],       //单行选中的发票
    selectedItemIDCount: 0, //单行选中的发票ID数
    selectedItemAmount: 0,  //单行选中的发票金额数
    isSelectedItem: [],     //单行发票按钮是否选中
    allItemCount: 0,       //列表所有发票数
    allItemAmount: [],       //列表所有发票金额
    allItem: [],            //列表所有发票
    isSelectedAll: false,   //是否选择全选按钮
    checkedInvoice: [],      //已查验的发票

    reimbursementType: '',      //报销单类型

    targetExpenseId: '',         //进入票夹页面选择发票去报销单

    reimbursementSelected: [],  //来自报销单已经选择的发票

    showPickerShadow: false,   //是否显示选择器阴影

    isFilter: true            //是否过滤已经选中的发票，默认过滤
}

const AddInvoiceReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.ADD_INVOICE_STATE:
            return {...state, ...action.state};
        default:
            return state;
    }
}

export default AddInvoiceReducer;