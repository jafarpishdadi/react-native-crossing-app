/**
 * Created by Louis.lu on 2018-01-23.
 */
import * as types from '../../../constant/ActionTypes';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';

const initialState = {
    isLoading: false,
    showLoading: false,
    showPickerShadow: false,  //是否显示选择器阴影
    saveModalVisible: false,            //是否保存提示框
    titleText: "",

    expenseDepartmentName: '',              //选中的部门
    expenseDepartmentId: '',    //部门ID
    organizationList: [],                   //部门列表
    targetCity: '',                          //目的城市
    cause: "",                              //出差事由
    selectedStartDate: '',                  //开始日期
    selectedEndDate: '',                    //结束日期
    travelDays: '',                          //出差天数
    expectedCostAmount: '',      //预计花费金额
    peerPerple: "",   //同行人
    copyPersonList: [],   //抄送人集合
    attachmentList: [],     //附件列表
    attachmentIDList: [],     //删除的申请单附件ID集合
    attachmentURLList: [],    //删除的申请单附件URL集合

    isRecording: false,          //是否正在录音
    showNoPermissionDialog: false,
    isVoice: false,    //是否将麦克风设置为不可点击
    timeCount: 20,                          //倒计时文本
    text: "(20s)",
    timeEnd: false,  //录音时间结束标志，true-是，false-否
    causeTextInputHeight: 80, //出差事由输入框高度
    personTextInputHeight: 80, //渲染抄送人高度
    peerPersonTextInputHeight: 80, //渲染抄送人高度

    saveModalVisible: false,            //是否保存提示框
    promptType: '',             //提示类型
    promptMsg: '',              //提示内容
    showPrompt: false,          //保存结果提示
}

const NewTravelApplyReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.NEW_TRAVEL_APPLY_CHANGE_STATE:
            return {...state, ...action.state}
        case types.NEW_TRAVEL_APPLY_INIT_DATA:
            return {...initialState};
        case types.SELECT_COPY_PERSON_LIST: {
            return {
                ...state,
                copyPersonList: action.copyPersonList.selectData
            }
        }
        default:
            return state;
    }
}

export default NewTravelApplyReducer;