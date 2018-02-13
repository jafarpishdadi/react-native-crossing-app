/**
 * Created by Louis.lu on 2018-01-19.
 */
import * as types from '../../../constant/ActionTypes';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';

const initialState = {
    isLoading:false,
    showLoading: false,
    costCenterTypeCode: "0",   //0：部门；1：项目
    deptList: [
        {
            id: 'D1',
            name: '部门1'
        },{
            id: 'D2',
            name: '部门2'
        },{
            id: 'D3',
            name: '部门3'
        },{
            id: 'D4',
            name: '部门4'
        },{
            id: 'D5',
            name: '部门5'
        },{
            id: 'D6',
            name: '部门6'
        },{
            id: 'D7',
            name: '部门7'
        },
    ],        //部门列表
    projectList: [
        {
            id: 'P1',
            name: '项目1'
        },{
            id: 'P2',
            name: '项目2'
        },{
            id: 'P3',
            name: '项目3'
        },{
            id: 'P4',
            name: '项目4'
        },{
            id: 'P5',
            name: '项目5'
        },{
            id: 'P6',
            name: '项目6'
        },
    ],      //项目列表
    isRefreshing: false,        //刷新中
    selectedDept: {},       //选中的部门
    selectedProject: {},        //选中的项目
}


const CostSharingReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.COST_SHARING_INIT_DATA:
            return initialState;
        case types.COST_SHARING_CHANGE_STATE:
            return {...state, ...action.state}
        default:
            return state;
    }
}

export default CostSharingReducer;