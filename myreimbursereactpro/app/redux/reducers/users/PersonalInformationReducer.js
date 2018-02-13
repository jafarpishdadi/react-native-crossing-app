/**
 * Created by richard.ji on 2017/10/31.
 */

import * as types from '../../../constant/ActionTypes';

const initialState = {
    isLoading: false,       //加载中
    sex: null,      //性别
    sexStr: '',
    saveModalVisible: false,        //保存对话框
    genderArr: [
        '男',
        '女',
    ],
    selectedYear:'',
    selectedMonth:'',
    selectedDay:'',
    birthday: '',       //生日
    area: '',       //地区

    showPickerShadow: false,   //是否显示选择器阴影

}

const personalInformationReducer = (state = initialState, action) => {
    switch (action.type){
        case types.PERSONAL_INFORMATION_CHANGE_STATE:
            return {...state, ...action.state};
        default:
            return state;
    }
}

export default personalInformationReducer;