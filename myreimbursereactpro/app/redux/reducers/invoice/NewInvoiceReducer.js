/**
 * Created by sky.qian on 11/7/2017.
 */
import * as types from "../../../constant/ActionTypes";
import Message from "../../../constant/Message";

const initialState = {
	isLoading:false,
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
	invoiceTypeCode: '00',        //发票类型code
	invoiceTypeName: Message.INVOICE_TYPE_NAME_00,     //发票类型名称
	title: '',      //标题
	checkResult: false,     //查验结果
	invoiceCode: '',        //发票代码
	invoiceNo: '',      //发票号码
	invoiceAmount: '',        //不含税价, 金额
	verifyCode: '',     //校验码
	departCity: '',     //出发城市
	arriveCity: '',     //到达城市
	trainNumber: '',        //车次
	invoiceCount: '1',       //附件张数
	buyerName: '',      //购买方名称
	totalAmount: '',        //税价合计
	invoiceDetail: '',      //货物或应税劳务
	sellerName: '',      //销售方
	remark: '',     //备注
	reimburseState: '',
	salerName: '',
	checkState: '',
	uuid: '',
	saveModalVisible: false,       //保存对话框
	reimbursementTypeList:[],		//报销类别

	imageBase64:'',

	showDialog:false,

	isFocused: false,           //获得焦点为TRUE，失去焦点为FALSE
	dataSaved: false,			//数据是否保存，保存完了，点击立即报销/继续归集  应不执行保存操作
	firstSaved: false,			//数据是否保存，如果保存过，那么第二次应该调用更新接口
	token: '',

	showNoPermissionDialog:false,
	isModalBoxOpen: false,      //是否打开modalBox
}

const newInvoiceReducer = (state = initialState, action) => {
	switch (action.type) {
		case types.NEW_INVOICE_CHANGE_STATE:
			return {...state, ...action.state}
		case types.NEW_INVOICE_INIT_STATE:
			return initialState
		default:
			return state;
	}
}

export default newInvoiceReducer;