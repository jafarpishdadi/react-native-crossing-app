/**
 * Created by Louis.lu on 2018-01-16.
 */
import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';
import {back} from '../../../redux/actions/navigator/Navigator';

const firstList = [
    {
        name: "大象1",
        isOpen: false,
        deptList: [
            {
                name: "大象总部1.1",
                isOpen: false,
                deptList: [
                    {
                        name: '总裁办1.1',
                        isOpen: false,
                        deptList: [
                            {
                                name: '研发开发部门1.1.1',
                                isOpen: false,
                                personList: [{name: "张三1", isSelected: false}, {
                                    name: "张三2",
                                    isSelected: false
                                }, {name: "张三3", isSelected: false}]
                            },
                            {
                                name: '市场部1.1.2',
                                isOpen: false,
                                personList: [{name: "李四1", isSelected: false}, {
                                    name: "李四2",
                                    isSelected: false
                                }, {name: "李四3", isSelected: false}]
                            },
                            {
                                name: '运营管理部1.1.3',
                                isOpen: false,
                                personList: [{name: "王五1", isSelected: false}, {
                                    name: "王五2",
                                    isSelected: false
                                }, {name: "王五3", isSelected: false}]
                            }]
                    },
                    {
                        name: '总裁办1.2',
                        isOpen: false,
                        personList: [{name: "张三12", isSelected: false}, {
                            name: "张三22",
                            isSelected: false
                        }, {name: "张三33", isSelected: false}]
                    }
                ]
            },
            {
                name: "大象总部2",
                isOpen: false,
                deptList: [
                    {
                        name: '总裁办2.1',
                        isOpen: false,
                        deptList: [
                            {
                                name: '研发开发部门2.1.1',
                                isOpen: false,
                                personList: [{name: "张三111", isSelected: false}, {
                                    name: "张三222",
                                    isSelected: false
                                }, {name: "张三333", isSelected: false}]
                            },
                            {
                                name: '市场部2.1.2',
                                isOpen: false,
                                personList: [{name: "李四111", isSelected: false}, {
                                    name: "李四222",
                                    isSelected: false
                                }, {name: "李四333", isSelected: false}]
                            },
                            {
                                name: '运营管理部2.1.3',
                                isOpen: false,
                                personList: [{name: "王五111", isSelected: false}, {
                                    name: "王五222",
                                    isSelected: false
                                }, {name: "王五333", isSelected: false}]
                            }]
                    }
                ]
            }
        ]
    },
    {
        name: "大象2",
        isOpen: false,
        deptList: [
            {
                name: "部门2.1",
                isOpen: false,
                personList: [{name: "张三211", isSelected: false}, {
                    name: "张三212",
                    isSelected: false
                }, {name: "张三213", isSelected: false}]
            }
        ],
    },
    {
        name: "大象3",
        isOpen: false,
        personList: [{name: "张三311", isSelected: false}, {
            name: "张三312",
            isSelected: false
        }, {name: "张三313", isSelected: false}]
    },
    {name: "大象4", isOpen: false,},
];

export const changeState = (state) => {
    return {
        type: types.SELECT_COPY_PERSON_CHANGE_STATE,
        state: state,
    }
}

export const initData = () => {
    return dispatch => {
        /*type: types.SELECT_COPY_PERSON_INIT_DATA,*/
        return dispatch(changeState({
            firstList: [],
            dataList: [],
            selectCopyPersonList: [],
        }))
    }
}

export const loadData = () => {
    return (dispatch, getState) => {
        /* dispatch(changeState({
         firstList: firstList,
         dataList: firstList,
         }))*/
        var list = [];
        var selectCopyPersonList = getState().SelectCopyPerson.selectCopyPersonList;
        if (!Util.checkListIsEmpty(selectCopyPersonList)) {
            for (var i = 0, j = selectCopyPersonList.length; i < j; i++) {
                list = recursiveData(selectCopyPersonList[i], firstList);
            }
            return dispatch(changeState({
                firstList: list,
                dataList: firstList,
            }))
        } else {
            return dispatch(changeState({
                firstList: firstList,
                dataList: firstList,
            }))
        }

    }
}


const recursiveData = (item, list) => {
    for (var i = 0, j = list.length; i < j; i++) {
        if (item.name == list[i].name) {
            list[i].isSelected = true;
        }

        if (list[i].deptList && list[i].deptList.length > 0) {
            var deptList = list[i].deptList;
            for (var x = 0, y = deptList.length; x < y; x++) {
                if (deptList[x].deptList && deptList[x].deptList.length > 0) {
                    /*deptList[x].isOpen = true;
                     list[i].isOpen = true;*/
                    recursiveData(item, deptList[x].deptList);
                } else {
                    if (deptList[x].personList && deptList[x].personList) {
                        var personList = deptList[x].personList;
                        for (var a = 0, b = personList.length; a < b; a++) {
                            if (item.name == personList[a].name) {
                                personList[a].isSelected = true;
                                deptList[x].isOpen = true;
                                list[i].isOpen = true;
                            }
                        }
                    }
                }

            }
        }

        if (list[i].personList && list[i].personList.length > 0) {
            var personList = list[i].personList;
            for (var x = 0, y = personList.length; x < y; x++) {
                if (item.name == personList[x].name) {
                    personList[x].isSelected = true;
                    list[i].isOpen = true;
                }
            }
        }
    }
    return list;
}

export const selectCopyperson = (selectData) => {
    return {
        type: types.SELECT_COPY_PERSON_LIST,
        copyPersonList: selectData
    }
}