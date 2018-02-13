/**
 * Created by Louis.lu on 2018-01-29.
 */
import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';
import {navigateNewTravelApply} from '../navigator/Navigator';

export const changeState = (state) => {
    return {
        type: types.TRAVEL_APPLY_DETAIL_CHANGE_STATE,
        state: state,
    }
}

export const initData = () => {
    return dispatch => {
        dispatch(changeState({
            applicationTitle: '',        //差旅申请单名称
            applyPeople: '',
            applyStatus: '0',     //审批状态 0：未提交 1：已撤销 2：已驳回 3：审批中 4：审批通过
            applyNo: '',     //申请单号
            applyTime: '',      //申请时间
            expenseDepartmentName: '',              //选中的部门
            expenseDepartmentId: '',    //部门ID
            targetCity: '',                          //目的城市
            cause: "",                              //出差事由
            applyStartDate: '',                  //开始日期
            applyEndDate: '',                    //结束日期
            travelDays: '',                          //出差天数
            expectedCostAmount: '',      //预计花费金额
            peerPerple: "",   //同行人
            attachmentList: [],     //附件列表
            token: '',
            createName: '',
            createUserId: '',
            currentUser: '',
            currentUserId: '',
            operateComment: '',     //驳回评论
            currentCommentItem: {},     //当前评论节点
            commentContent: '',     //评论内容
            email: '',      //邮箱地址
        }))
    }
}

export const loadData = (requestData) => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
        }))
        dispatch(loadTravelApplyDetail(requestData));
        dispatch(getEmail());
    }
}

export const loadTravelApplyDetail = (requestData) => {
    return dispatch => {
        const desc = JSON.parse(requestData.formDesc);
        var descMap = {};
        for (var item in desc) {
            descMap[item] = desc[item];
        }
        dispatch(changeState({
            isLoading: false,
            applicationTitle: requestData.formName,        //差旅申请单名称
            applyPeople: requestData.startName,
            applyStatus: requestData.formState,     //审批状态 0：未提交 1：已撤销 2：已驳回 3：审批中 4：审批通过
            applyNo: '20180129',     //申请单号
            applyTime: requestData.applyTimeStr,      //申请时间
            expenseDepartmentName: descMap.expenseDname,              //选中的部门
            expenseDepartmentId: '001',    //部门ID
            targetCity: descMap.expenseTargetCity,                          //目的城市
            cause: descMap.expenseDesc,                              //出差事由
            applyStartDate: '2018.01.27',                  //开始日期
            applyEndDate: '2018.01.29',                    //结束日期
            travelDays: '3',                          //出差天数
            expectedCostAmount: descMap.expectedCostAmount,      //预计花费金额
            peerPerple: "李四",   //同行人
            attachmentList: [],     //附件列表
        }))
    }
}

export const getEmail = () => {
    return dispatch => {
        return HttpUtil.postJson(API.GET_EMAIL, {}, dispatch, function (ret, status) {
            if (status) {
                if (ret.status) {
                    dispatch(changeState({
                        email: ret.data,
                    }));
                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}


export const editTravelApplyDetail = (requestData) => {
    return dispatch => {
        dispatch(navigateNewTravelApply({
            source: 'TravelApplyDetail',
            data: requestData
        }))
    }
}