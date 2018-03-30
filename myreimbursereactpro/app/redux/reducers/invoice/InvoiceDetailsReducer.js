import * as types from '../../../constant/ActionTypes';

const initialState = {
    checkState:'1',
    reimburseState:'',  //报销状态
    uuid:'',            //发票唯一标识
    invoiceCode:'',     //发票代码
    invoiceNo:'',       //发票号码
    invoiceDate:'',     //发票日期
    departCity:'',      //出发城市
    arriveCity:'',      //到达城市
    trainNumber:'',     //火车车次
    invoiceCount:'',    //附件张数
    invoiceTypeName:'', //发票类型名称
    invoiceTypeCode:'', //发票类型代码
    verifyCode: '',     //校验码
    buyerName: '',      //购买方名称
    salerName: '',      //销售方名称
    remark: '',         //备注说明
    goodsName: '',      //货物或应税劳务
    dataSourceCode:'',  //发票来源
    previewShow:false,
    showCollectBtn:false,       //是否显示立即归集按钮
    showReimbursementBtn:false, //是否显示立即报销按钮
    isLoading:false,
    imageBase64:'',
    reimbursementTypeList:[],
    totalAmount: '',

    showDialog:false,
    imagePreView:true,          //是否需要显示预览图

    alreadyInNewReimbursement:false,  //是否已经存在新建报销单中
    token: '',

    showNoPermissionDialog:false,

    backDialogShow: false,      //背部阴影显示
}

const invoiceReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.INVOICE_DETAIL_CHANGE_STATE:
            return {...state, ...action.state};
        case types.INIT_INVOICE_DETAIL:
            return initialState;
        default:
            return state;
    }
}

export default invoiceReducer;