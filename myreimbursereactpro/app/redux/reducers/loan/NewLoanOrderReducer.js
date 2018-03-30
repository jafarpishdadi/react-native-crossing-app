import * as types from '../../../constant/ActionTypes';

const initialState = {
    LoanReasonTextInputHeight:80, //借款事由输入框高度
    LoanReason: '',        //借款事由
    showPickerShadow: false,   //是否显示选择器阴影
    departmentName: '',              //选中的部门
    departmentId: '',    //部门ID
    organizationOriginalList:[],
    organizationList: [],
    dialogTitle: '',
    dialogContent: '',
    showNoPermissionDialog: false,

    isRecording:false,          //是否正在录音
    isVoice:false,    //是否将麦克风设置为不可点击
    timeCount: 20,                          //倒计时文本
    timeEnd:false,  //录音时间结束标志，true-是，false-否
    text: "(20s)",
    isLoading:false,  //是否正在加载或处理
    loanAmount:'',    //借款金额
    remarks:'',       //备注
    RemarksTextInputHeight: 80,  //备注输入框高度
    attachmentList:[],  //借款单附件列表
    loanOrderAttachmentIDList: [], //删除的借款单附件ID集合
    loanOrderAttachmentURLList: [],    //删除的借款单附件URL集合
    saveModalVisible: false,            //是否展示保存提示框
    showNoPermissionDialog: false,   //是否显示提示授予麦克风权限的对话框
    copyPersonList: [],
    borrowNo: '',       //借款单编号
    source: '',     //页面来源
    applyStatus: '',        //借款单状态

    selectionStart: 0,               //光标选择开始位置
    selectionEnd: 0,                  //光标选择结束
}

const  newLoanOrderReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.INIT_NEW_LOAN:
            return {...initialState, attachmentList: []};
        case types.NEW_LOAN_ORDER_CHANGE_STATE:
            return {...state, ...action.state};
        default:
            return state;
    }
}

export default newLoanOrderReducer;