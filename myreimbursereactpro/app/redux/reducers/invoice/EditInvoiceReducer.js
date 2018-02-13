import * as types from '../../../constant/ActionTypes';
import Message from '../../../constant/Message';

const initialState = {
    isLoading:false,
    reimburseState: '',
    uuid: '',
    invoiceNo: '',
    salerName: '',
    goodsName: '',


    invoiceType: '',        //发票类型, 用来最初决定使用哪个模板
    invoiceDate: '',        //发票日期
    showDateSelected: '',   //日历选中后显示的日期
    defaultSelectedDate: '',//日历默认显示的日期
    invoiceTypeList: [
        Message.INVOICE_TYPE_NAME_01,
        Message.INVOICE_TYPE_NAME_04,
        Message.INVOICE_TYPE_NAME_10,
        Message.INVOICE_TYPE_NAME_11,
        Message.INVOICE_TYPE_NAME_03,
        Message.INVOICE_TYPE_NAME_02,
        Message.INVOICE_TYPE_NAME_91,
        Message.INVOICE_TYPE_NAME_92,
        Message.INVOICE_TYPE_NAME_93,
        Message.INVOICE_TYPE_NAME_94,
        Message.INVOICE_TYPE_NAME_95,
        Message.INVOICE_TYPE_NAME_96,
        Message.INVOICE_TYPE_NAME_00,
        Message.INVOICE_TYPE_NAME_97,
        Message.INVOICE_TYPE_NAME_98
    ],  	//发票类型列表
    backDialogShow: false,      //背部阴影显示
    previewShow: false,     //预览图片
    invoiceTypeCode: '',        //发票类型code
    title: '',      //标题
    checkResult: false,     //查验结果
    invoiceCode: '',        //发票代码
    invoiceNumber: '',      //发票号码
    invoiceAmount: '',        //不含税价, 金额
    verifyCode: '',     //校验码
    departCity: '',     //出发城市
    arriveCity: '',     //到达城市
    trainNumber: '',        //车次
    invoiceCount: '',       //附件张数
    buyerName: '',      //购买方名称
    totalAmount: '',        //税价合计
    invoiceDetail: '',      //货物或应税劳务
    sellerName: '',      //销售方
    remark: '',     //备注

    dataSourceCode: '', //发票来源

    saveModalVisible: false,       //保存对话框
    reimbursementTypeList:[],		//报销类别

    showCollectBtn:false,       //是否显示立即归集按钮
    showReimbursementBtn:false, //是否显示立即报销按钮

    imageBase64:'',

    showDialog:false,
    isFocused: false,           //获得焦点为TRUE，失去焦点为FALSE
    dataSaved: false,			//数据是否保存，保存完了，点击立即报销/继续归集  应不执行保存操作

    oldInvoiceTotalAmount: '',  //发票修改前的税价合计
    oldInvoiceTotalCount: '',   //发票修改前的附件张数

    isFromNewReimbursement: false,  //判断是否是在新建报销单里面，点击的该张发票
    expenseId: '',                   //新建报销单，点击该张发票的标识id
    token: '',

    showNoPermissionDialog:false,

    isModalBoxOpen: false,      //是否打开modalBox
}

const editInvoiceReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.EDIT_INVOICE_STATE:
            return {...state, ...action.state}
        case types.EDIT_INVOICE_INIT_STATE:
            return initialState
        default:
            return state;
    }
}

export default editInvoiceReducer;