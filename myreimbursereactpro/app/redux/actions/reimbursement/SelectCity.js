/**
 * Created by Jack.Fan on 2018/1/15.
 */

import * as types from '../../../constant/ActionTypes';
import HttpUtil from "../../../network/HttpUtil";
import API from "../../../utils/API";
import Util from "../../../utils/Util";
import {ListView} from "react-native";
import Message from '../../../constant/Message';

const hot_city = Message.CHOOSE_CITY_HOY;
export const changeState = (state) => {
    return {
        type: types.SELECT_CITY_CHANGE_STATE,
        state: state,
    }
};

export const getAllCityList = () => {

    return dispatch => {
        dispatch(changeState({
            isLoading: true
        }));
        return HttpUtil.postJson(API.GET_ALL_CITY_LIST, {}, dispatch, function (ret, status) {
            if (status) {
                if (ret.status) {
                    let ALL_CITY_LIST = ret.data;                         //全城市数据
                    let HOT_CITY_LIST = [];                                                       //热门城市数据
                    let dataBlob = {};                                                            //定义数据团dataBlob
                    dataBlob[hot_city] = HOT_CITY_LIST;                                            //给数据团dataBlob加入热门城市数据 dataBlob[key_hot]

                    //按城市名称拼音的首字母分类 给数据团dataBlob加入分组城市数据
                    ALL_CITY_LIST.map((item) => {
                        item.citys.map((city) => {
                            if (city.isHot == 'Y') {
                                dataBlob[hot_city].push(city);
                            }
                            let key = city.initial.toUpperCase();
                            if (dataBlob[key]) {
                                let subList = dataBlob[key];
                                subList.push(city);
                            } else {
                                let subList = [];
                                subList.push(city);
                                dataBlob[key] = subList;
                            }
                        })
                    })

                    let sectionIDs = Object.keys(dataBlob);                                     //获取总列表数据的 分组ID的集合sectionIDs("热门"+字母列表)

                    var hotCity = []
                    let hotCityData = {}
                    hotCityData.name = Message.CHOOSE_CITY_HOY;
                    hotCityData.citys = dataBlob[hot_city];
                    hotCity.push(hotCityData);
                    let newJsonData = [];
                    newJsonData = hotCity.concat(ret.data);


                    var ds = new ListView.DataSource({                                           //搜索结果集的数据源ds
                        rowHasChanged: (r1, r2) => r1 !== r2
                    });

                    dispatch(changeState({
                        allCityList: ret.data,
                        showSearchResult: false,                                                //是否展示搜索结果标记
                        keyword: '',                                                              //搜索关键字
                        searchResultList: [],                                                    //搜索结果集合
                        value: '',                                                                  //搜索框显示的内容
                        ds: ds,                                                                    //结果集数据源
                        letters: sectionIDs,
                        //isLoading: true,
                    }));

                    setTimeout(() => {
                        dispatch(changeState({
                            newJsonData: newJsonData,
                        }));
                    }, 100)

                    setTimeout(() => {
                        dispatch(changeState({
                            isLoading: false,
                        }))
                    }, 500)

                } else {
                    Util.showToast(ret.message);
                }
            }
        })
    }
}