import * as types from '../../../constant/ActionTypes';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';

const initialState = {
    selectReimType: false,                  //报销类型选择器
    reimbursementTypeList: [],              //报销类型
    organizationList: [],                   //部门列表
    applyTypeName: '',                   //选中的报销类型
    expenseDepartmentName: '',              //选中的部门
    selectedStartDate: '',                  //开始日期
    selectedEndDate: '',                    //结束日期
    travelDays: '',                          //出差天数
    targetCity: '',                          //目的城市
    expenseDesc: '',                         //报销说明
    //expenseDescCommon: '',                   //通用报销单说明
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
        expenseCodeTwo: '',
        expenseNameTwo: '',
        textInputHeight: 80, //费用说明输入框高度
    }],
    bizExpenseAttachmentList: [],
    warningDialog: false,        //显示弹窗
    alertTitle: '',              //弹窗标题
    alertContent: '',            //弹窗内容
    expenseStateCode: '0',       //0保存，3提交
    showPrompt: false,          //保存结果提示
    promptType: '',             //提示类型
    promptMsg: '',              //提示内容
    expenseNo: '',              //报销单编号
    expenseDepartmentId: '',    //部门ID
    bizExpenseAttachmentIDList: [],     //删除的报销单附件ID集合
    bizExpenseAttachmentURLList: [],    //删除的报销单附件URL集合
    bizExpenseTypeIDList: [],           //删除的报销单明细ID集合
    bizExpenseBillIDList: [],           //删除的发票ID集合
    deleteInvoiceList: [],           //删除的发票集合
    saveModalVisible: false,            //是否保存提示框
    invoiceUUIDList: [],        //从编辑页传来的发票ID集合

    showDialog: false,           //点击添加发票弹出选择框

    isRecording: false,          //是否正在录音
    titleText: Message.NEW_REIMBURSEMENT,     //报销单标题
    attachmentCount: 0,     //附件数量
    reimbursementTypeOriginalList: [],
    expenseTypeOriginalList: [],
    expenseTypeOne: [],
    expenseTypeTwo: [],
    timeCount: 20,                          //倒计时文本
    text: "(20s)",
    timeEnd: false,  //录音时间结束标志，true-是，false-否
    expenseDescTextInputHeight: 80, //报销说明输入框高度

    dialogTitle: '',
    dialogContent: '',
    showNoPermissionDialog: false,
    isVoice: false,    //是否将麦克风设置为不可点击
    showPickerShadow: false,   //是否显示选择器阴影
    source: '',     //页面来源
    bizExpenseAttachmentListFromDetail: [],       //来自报销单详情
    bizExpenseTypeListFromDetail: [],

    isShowCalendar: true,   //是否显示日历列表，默认显示日历列表，不显示时分滚轮
    startDateSelected:'',   //开始时间选择日期(格式yyyy-mm-dd)
    endDateSelected:'',     //结束时间选择日期(格式yyyy-mm-dd)
    showStartDateSelected:'',//显示开始时间选择日期(格式：xxxx年x月x日)
    showEndDateSelected:'',  //显示结束时间选择日期(格式：xxxx年x月x日)
    defaultSelectedDate: '',//默认当前日期

    startTimeSelected: '',       //开始时间时分选择
    endTimeSelected:'',          //结束时间时分选择
    defaultSelectedTime: '',//默认当前时分

    isModalBoxOpen: false,
    isStartDateTimeFlag: false,
    isEndDateTimeFlag: false,
    startHour: '',  //开始时间小时数
    startMinute: '',//开始时间分钟数
    endHour: '',    //结束时间小时数
    endMinute: '',  //结束时间分钟数

    isCleanDate: false

}

const ReimbursementReducer = (state = initialState, action) => {
    switch (action.type) {

        case types.INIT_NEW_REIMBURSEMENT:
            return {
                ...initialState, bizExpenseTypeList: [{
                    expenseId: Util.randomStr(),
                    code: '',
                    name: '',
                    detail: '',
                    totalNum: '',
                    totalAmount: '',
                    bizExpenseBillList: [],
                    expenseCodeTwo: '',
                    expenseNameTwo: '',
                    textInputHeight: 80,
                }],
                bizExpenseAttachmentList: [],
            };
        case types.SELECT_REIM_TYPE:
            return {...state, applyTypeName: action.typeName}
        case types.NEW_REIMBURSEMENT_CHANGE_STATE:
            return {...state, ...action.state}
        case types.ADD_NEW_EXPENSE_DETAIL: {
            var bizExpenseTypeList = state.bizExpenseTypeList;
            bizExpenseTypeList.push({
                expenseId: Util.randomStr(),
                code: '',
                name: '',
                detail: '',
                totalNum: '',
                totalAmount: '',
                bizExpenseBillList: [],
                expenseCodeTwo: '',
                expenseNameTwo: '',
            })
            return {...state, bizExpenseTypeList: bizExpenseTypeList}
        }
        case types.DELETE_EXPENSE_DETAIL: {
            var bizExpenseTypeList = state.bizExpenseTypeList;
            var expenseTempList = [];
            for (var i = 0; i < bizExpenseTypeList.length; i++) {
                if (bizExpenseTypeList[i].expenseId != action.expenseId) {
                    expenseTempList.push(bizExpenseTypeList[i]);
                }
            }

            var totalNum = 0;
            var totalAmount = 0;
            for (var j = 0; j < expenseTempList.length; j++) {
                totalNum += parseInt(Util.checkIsEmptyString(expenseTempList[j].totalNum) ? 0 : expenseTempList[j].totalNum);
                totalAmount += parseFloat(Util.checkIsEmptyString(expenseTempList[j].totalAmount) ? 0 : expenseTempList[j].totalAmount);
            }
            totalAmount += parseFloat(state.travelBill ? state.travelBill : 0);
            return {
                ...state,
                bizExpenseTypeList: expenseTempList,
                totalNum: totalNum + '',
                totalAmount: totalAmount.toFixed(2) + '',
                bizExpenseTypeIDList: state.bizExpenseTypeIDList.concat(action.expenseId),
            }
        }
        case types.ADD_INVOICE:
            return {...state};
        case types.DELETE_INVOICE:
            return {...state};
        case types.SHOW_ALERT:
            return {...state, warningDialog: true, alertTitle: action.title, alertContent: action.content}
        case types.CLOSE_ALERT:
            return {...state, warningDialog: false, alertTitle: '', alertContent: ''};
        case types.SELECTED_INVOICE_LIST: {
            var selectedInvoice = [];
            var alreadySelectedInvoice = [];
            for (var z = 0; z < state.bizExpenseTypeList.length; z++) {
                alreadySelectedInvoice = alreadySelectedInvoice.concat(state.bizExpenseTypeList[z].bizExpenseBillList);
            }
            for (var y = 0; y < action.selectedInvoice.length; y++) {
                if (!Util.idContains(alreadySelectedInvoice, action.selectedInvoice[y])) {
                    selectedInvoice.push(action.selectedInvoice[y])
                }
            }
            const invoiceList = selectedInvoice.map((item) => {
                item.invoiceAmount = parseFloat(item.invoiceAmount).toFixed(2);
                return item;
            })
            var bizExpenseTypeList = state.bizExpenseTypeList;
            for (var i = 0; i < bizExpenseTypeList.length; i++) {
                if (bizExpenseTypeList[i].expenseId == action.expenseId) {
                    bizExpenseTypeList[i].bizExpenseBillList = bizExpenseTypeList[i].bizExpenseBillList.concat(invoiceList);

                    var totalAmount = 0;
                    var totalNum = 0;
                    for (var j = 0; j < bizExpenseTypeList[i].bizExpenseBillList.length; j++) {
                        totalAmount += parseFloat(bizExpenseTypeList[i].bizExpenseBillList[j].invoiceAmount);
                        totalNum += parseFloat(bizExpenseTypeList[i].bizExpenseBillList[j].invoiceNum);
                    }
                    bizExpenseTypeList[i].totalAmount = parseFloat(totalAmount).toFixed(2);
                    bizExpenseTypeList[i].totalNum = totalNum;
                }
            }
            var totalNum = 0;
            var totalAmount = 0;

            for (var j = 0; j < bizExpenseTypeList.length; j++) {
                var tempTotalNum = (Util.checkIsEmptyString(bizExpenseTypeList[j].totalNum)) ? 0 : parseInt(bizExpenseTypeList[j].totalNum);
                var tempTotalAmount = (Util.checkIsEmptyString(bizExpenseTypeList[j].totalAmount)) ? 0 : parseFloat(bizExpenseTypeList[j].totalAmount);
                totalNum += tempTotalNum;
                totalAmount += tempTotalAmount;
            }
            totalAmount += parseFloat(state.travelBill ? state.travelBill : 0);

            //跟新待删除发票ID数组
            /*const selectedInvoiceUUID = selectedInvoice.map(item => item.invoiceUUID);
             const deleteInvoiceList = [];
             for (let i = 0; i < state.deleteInvoiceList.length; i++) {
             if (!Util.contains(selectedInvoiceUUID, state.deleteInvoiceList[i].invoiceUUID)) {
             deleteInvoiceList.push(state.deleteInvoiceList[i]);
             }
             }

             const arr = deleteInvoiceList.map((item) => item.id);*/
            return {
                ...state,
                bizExpenseTypeList: bizExpenseTypeList,
                totalNum: totalNum + '',
                totalAmount: parseFloat(totalAmount).toFixed(2),
                //bizExpenseBillIDList: arr ? arr : [],
                //deleteInvoiceList: deleteInvoiceList ? deleteInvoiceList : [],
            }
        }
        case types.EDIT_TO_NEW_REIMBURSEMENT_WITH_SELECTED_INVOICE_LIST:
            var selectedInvoice = [];
            var alreadySelectedInvoice = [];
            for (var z = 0; z < state.bizExpenseTypeList.length; z++) {
                alreadySelectedInvoice = alreadySelectedInvoice.concat(state.bizExpenseTypeList[z].bizExpenseBillList);
            }
            var bizExpenseTypeList = state.bizExpenseTypeList;
            var tempBizExpenseTypeList = [].concat(bizExpenseTypeList);
            for (var i = 0; i < tempBizExpenseTypeList.length; i++) {
                if (tempBizExpenseTypeList[i].expenseId == action.expenseId) {
                    for (var k = 0; k < tempBizExpenseTypeList[i].bizExpenseBillList.length; k++) {
                        if (tempBizExpenseTypeList[i].bizExpenseBillList[k].invoiceUUID == action.selectedInvoice[0].invoiceUUID) {
                            tempBizExpenseTypeList[i].bizExpenseBillList[k] = action.selectedInvoice[0];
                        }
                    }

                    var totalAmount = 0;
                    var totalNum = 0;
                    for (var j = 0; j < tempBizExpenseTypeList[i].bizExpenseBillList.length; j++) {
                        totalAmount += parseFloat(tempBizExpenseTypeList[i].bizExpenseBillList[j].invoiceAmount);
                        totalNum += parseFloat(tempBizExpenseTypeList[i].bizExpenseBillList[j].invoiceNum);
                    }
                    tempBizExpenseTypeList[i].totalAmount = parseFloat(totalAmount).toFixed(2);
                    tempBizExpenseTypeList[i].totalNum = totalNum;
                }
            }
            var totalNum = 0;
            var totalAmount = 0;
            for (var j = 0; j < tempBizExpenseTypeList.length; j++) {
                totalNum += parseInt(tempBizExpenseTypeList[j].totalNum);
                totalAmount += parseFloat(tempBizExpenseTypeList[j].totalAmount);
            }
            totalAmount += parseFloat(state.travelBill ? state.travelBill : 0);

            //跟新待删除发票ID数组
            /*const selectedInvoiceUUID = selectedInvoice.map(item => item.invoiceUUID);
             const deleteInvoiceList = [];
             for (let i = 0; i < state.deleteInvoiceList.length; i++) {
             if (!Util.contains(selectedInvoiceUUID, state.deleteInvoiceList[i].invoiceUUID)) {
             deleteInvoiceList.push(state.deleteInvoiceList[i]);
             }
             }

             const arr = deleteInvoiceList.map((item) => item.id);*/
            return {
                ...state,
                bizExpenseTypeList: tempBizExpenseTypeList,
                totalNum: totalNum + '',
                totalAmount: parseFloat(totalAmount).toFixed(2),
                //bizExpenseBillIDList: arr ? arr : [],
                //deleteInvoiceList: deleteInvoiceList ? deleteInvoiceList : [],
            };
        default:
            return state;
    }
}

export default ReimbursementReducer;