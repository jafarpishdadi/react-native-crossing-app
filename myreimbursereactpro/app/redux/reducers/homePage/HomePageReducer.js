/**
 * Created by sky.qian on 10/26/2017.
 */
import {
    Animated,
} from 'react-native';

import * as types from '../../../constant/ActionTypes';

const initialState = {
    isFirst: true,      //是否第一次进页面
    loadCount: 0,       //初始页面调用接口数量
    companyArr: [{
        "enterpriseNo": "DX100086",
        "scale": "80000",
        "phone": "8676546,98765778",
        "address": " 北京 ",
        "enterpriseName": "大象慧云信息技术有限公司-test1"
    },
        {
            "enterpriseNo": "DX100088",
            "scale": null,
            "phone": null,
            "address": null,
            "enterpriseName": "京东"
        }],     //公司列表
    companyOpen: false,     //公司列表展开开关
    reimbursementList: [],  //报销列表
    selectHeightMin: new Animated.Value(0),        //选择框初始高度
    selectHeightMax: 0,        //选择框高度
    selectCompany: '',      //选择的公司
    selectCompanyWholeName: '', //选择的公司的完整名称
    unreadMessageCount: 0,      //未读消息个数
    isLoading: false,       //正在加载
    applicationCount: 0,        //审批中个数
    applicationAmount: 0,       //审批中金额
    approvalCount: 0,       //待审批个数
    approvalAmount:0,      //待审批金额
    isRefreshing: false,        //正在刷新

    upgradeChecked:false,   //是否检查过版本，调完检查版本接口设成true，防止reset到首页又去检查版本
    showUpgrade: false,     //是否显示新版本提示
    versionData:{},         //版本数据
}

const homePageReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.HOME_PAGE_CHANGE_STATE:
            return {...state, ...action.state}
        case types.HOME_PAGE_LOAD_COUNT:
            return {...state, loadCount: state.loadCount + 1, isLoading: state.loadCount < 4}
        default:
            return state;
    }
}

export default homePageReducer;