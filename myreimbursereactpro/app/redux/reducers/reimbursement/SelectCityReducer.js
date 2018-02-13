import * as types from '../../../constant/ActionTypes';
import DATA_JSON from '../../../utils/city-list.json';

const initialState = {
    showSearchResult: false,                                         //是否展示搜索结果
    keyword: '',                                                        //搜索关键字
    searchResultList:[],                                               //搜索结果集
    allCityList:DATA_JSON.allCityList,                                //全城市json数据
    hotCityList:DATA_JSON.hotCityList,                                //热门城市json数据
    value:'',                                                           //搜索框显示内容
    ds:'',                                                               //搜索结果数据源
    dataSource:[],                                                      //全城市数据源
    letters:[],                                                         //右侧字母列表(含热门)
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