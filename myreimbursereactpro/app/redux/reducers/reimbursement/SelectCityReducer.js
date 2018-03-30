import * as types from '../../../constant/ActionTypes';
import Message from '../../../constant/Message';

const initialState = {
    showSearchResult: false,                                         //是否展示搜索结果
    keyword: '',                                                       //搜索关键字
    searchResultList: [],                                             //搜索结果集
    allCityList: [],                                                   //全城市json数据
    value: '',                                                          //搜索框显示内容
    ds: '',                                                              //搜索结果数据源
    letters: ['热门','A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','W','X','Y','Z'],                                                         //右侧字母列表(含热门)
    isPress: Message.CHOOSE_CITY_HOY,                                 //选中的组头
    selectedCityNames: [],                                             //选中的城市的名称集合
    newJsonData: [],                                                    //转化格式后的城市数据
    isLoading: false                                                    //是否正在加载数据或者渲染视图
}

const selectCityReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.SELECT_CITY_CHANGE_STATE:
            return {...state, ...action.state};
        default:
            return state;
    }
}

export default selectCityReducer;