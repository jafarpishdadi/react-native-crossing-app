/**
 * Created by Louis.lu on 2018-01-16.
 */
import * as types from '../../../constant/ActionTypes';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';

const initialState = {
    searchValue: '',        //搜索内容
    isLoading: false,
    isRefreshing: false,
    selectedDepList: [],        //打开状态的部门
    selectedPersonList: [],     //选中的人
    selectedPersonIdList: [],
    searchPersonList: [],       //搜索结果
    loadMore: false,
    page: 1,
    showLoading: false,     //加载更多loading
    depTree: [
        {
            "organizationType": "org",
            "id": null,
            "childrenList": [
                {
                    "organizationType": "dep",
                    "id": null,
                    "childrenList": [
                        {
                            "organizationType": "dep",
                            "id": null,
                            "childrenList": [
                                {
                                    "organizationType": "dep",
                                    "id": null,
                                    "childrenList": null,
                                    "orgDepName": "财务一部",
                                    "user": [
                                        {
                                            "userNo": "20180106135329538b6e474bfad854911a0793e2a1a4687c9",
                                            "userName": "山青"
                                        },
                                        {
                                            "userNo": "20180106135448479f20b09398c914d75ad9d8efbc1b85186",
                                            "userName": "刘晶"
                                        }
                                    ],
                                    "parentId": "20180106131119006610069fc39814ce8b6c1f13637b294e0",
                                    "orgDepId": "201801101818075603cefc5f74084440892c2439c88109bf0"
                                }
                            ],
                            "orgDepName": "财务部",
                            "user": [
                                {
                                    "userNo": "20180106135215477b4215a534a1f490f930cba56ac9b6cb6",
                                    "userName": "财务部门经理(苏)"
                                }
                            ],
                            "parentId": "201801051430180871f809941bedc4a3f947ae97b948e50b9",
                            "orgDepId": "20180106131119006610069fc39814ce8b6c1f13637b294e0"
                        },
                        {
                            "organizationType": "dep",
                            "id": null,
                            "childrenList": [
                                {
                                    "organizationType": "dep",
                                    "id": null,
                                    "childrenList": null,
                                    "orgDepName": "产品创新部",
                                    "user": [
                                        {
                                            "userNo": "20180106135850293469d93196329421895afd10b8446d08f",
                                            "userName": "窦建军"
                                        },
                                        {
                                            "userNo": "20180106140025371d6e7e20e9dfa43eabb9ec10c537f4b86",
                                            "userName": "马利荭"
                                        }
                                    ],
                                    "parentId": "20180106131127914639157ee8c574e0e95dbe608d57cedb2",
                                    "orgDepId": "201801061312222978677d55042c6436080e5c69ea5233d9a"
                                },
                                {
                                    "organizationType": "dep",
                                    "id": null,
                                    "childrenList": null,
                                    "orgDepName": "测试部",
                                    "user": [
                                        {
                                            "userNo": "201801061403300244ee29c71f74f40faa6c9a5adf7cbe845",
                                            "userName": "吴欢欢"
                                        },
                                        {
                                            "userNo": "20180106140422025d5c61749dded4dffb2a3aaa30f37d68e",
                                            "userName": "郝成亮"
                                        }
                                    ],
                                    "parentId": "20180106131127914639157ee8c574e0e95dbe608d57cedb2",
                                    "orgDepId": "201801061312480153a43a323d0bf45e1afa2b56c553e62b4"
                                }
                            ],
                            "orgDepName": "研发部",
                            "user": [
                                {
                                    "userNo": "201801061356490568b13fa79f9af46a6ae9c2f2092103ce0",
                                    "userName": "何炼"
                                }
                            ],
                            "parentId": "201801051430180871f809941bedc4a3f947ae97b948e50b9",
                            "orgDepId": "20180106131127914639157ee8c574e0e95dbe608d57cedb2"
                        }
                    ],
                    "orgDepName": "大象(测试用)DX_Test测试用_总",
                    "user": [
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cfs",
                            "userName": "王登璐"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cgs",
                            "userName": "王登璐1"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cca",
                            "userName": "王登璐11"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cas",
                            "userName": "王登璐111"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248csa",
                            "userName": "王登璐12"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cda",
                            "userName": "王登璐13"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cqa",
                            "userName": "王登璐14"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cwa",
                            "userName": "王登璐15"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248ce",
                            "userName": "王登璐16"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cra",
                            "userName": "王登璐17"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cta",
                            "userName": "王登璐18"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cya",
                            "userName": "王登璐19"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cua",
                            "userName": "王登璐20"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cia",
                            "userName": "王登璐21"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248coa",
                            "userName": "王登璐22"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cpa",
                            "userName": "王登璐23"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cfa",
                            "userName": "王登璐24"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cga",
                            "userName": "王登璐25"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cca",
                            "userName": "王登璐2611"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248caa",
                            "userName": "王登璐27111"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248csa",
                            "userName": "王登璐2812"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cda",
                            "userName": "王登璐2913"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cq",
                            "userName": "王登璐3114"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cwa",
                            "userName": "王登璐3215"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cea",
                            "userName": "王登璐3316"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cra",
                            "userName": "王登璐3417"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cta",
                            "userName": "王登璐18"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cya",
                            "userName": "王登璐3519"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cua",
                            "userName": "王登璐3620"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cia",
                            "userName": "王登璐3721"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248coa",
                            "userName": "王登璐3822"
                        },
                        {
                            "userNo": "20180106163507640a9207f9d774745b3a8a4e2f1c53248cba",
                            "userName": "王登璐3923"
                        }
                    ],
                    "parentId": "1",
                    "orgDepId": "201801051430180871f809941bedc4a3f947ae97b948e50b9"
                }
            ],
            "orgDepName": "大象测试部门",
            "user": [

            ],
            "parentId": "0",
            "orgDepId": "1"
        }
    ]
    ,
    currentUserId: '',      //当前用户ID

}

const SelectCopyPersonReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.SELECT_COPY_PERSON_INIT_DATA:
            return initialState;
        case types.SELECT_COPY_PERSON_CHANGE_STATE:
            return {...state, ...action.state}
        default:
            return state;
    }
}

export default SelectCopyPersonReducer;