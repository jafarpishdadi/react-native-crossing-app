/**
 * 请选择城市
 * Created by Jack.Fan on 15/1/2018.
 */
import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Header from "../../containers/common/CommonHeader";
import {
    back
} from "../../redux/actions/navigator/Navigator";
import Message from "../../constant/Message";
import ScreenUtil, {deviceHeight, deviceWidth} from "../../utils/ScreenUtil";
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    Image,
    TouchableOpacity,
    FlatList,
    Platform,
    ListView,
    Dimensions,
} from 'react-native';
import {changeState, getAllCityList} from '../../redux/actions/reimbursement/SelectCity';
import CommonLoading from "../../containers/common/CommonLoading";
import CitySectionList from './CitySectionList';

import Toast, {DURATION} from './ToastUtil'
import Util from "../../utils/Util";
import {CustomStyles} from "../../css/CustomStyles";
import SafeAreaView from "react-native-safe-area-view";

const ROW_HEIGHT = 40;                                                              //普通模块行高
const ROW_HEIGHT_BOX = 40;                                                          //热门模块行高
const {width, height} = Dimensions.get('window');

class SelectCity extends Component {

    static navigationOptions = ({navigation}) => ({
        header: null,
    })

    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        component.props.changeState({
            newJsonData: [],
            selectedCityNames: [],
            isPress: Message.CHOOSE_CITY_HOY
        });
        component.props.back();
    }

    componentWillMount() {
        this.props.changeState({
            selectedCityNames: []
        })
        if (this.props.navigation.state.params.targetCity == '') {

        } else {
            let selectCityNames = [];
            this.props.navigation.state.params.targetCity.split('/').map((city) => {
                selectCityNames.push(city);
            })
            this.props.changeState({
                selectedCityNames: selectCityNames
            });
        }
    }

    componentDidMount() {
        this.props.getAllCityList();
    }

    //找出符合搜索条件的城市集合
    filterCityData(searchedCity) {
        let resultList = [];
        for (let i = 0; i < this.props.state.allCityList.length; i++) {
            let temp1 = this.props.state.allCityList[i];
            for (let j = 0; j < temp1.citys.length; j++) {
                let temp2 = temp1.citys[j]
                if (temp2.cityName.indexOf(searchedCity) === 0 || temp2.initial.toUpperCase().indexOf(searchedCity.toUpperCase()) === 0) {
                    resultList.push(temp2);
                }
            }
        }
        return resultList;
    }


    //渲染符合搜索条件的城市列表
    renderRow(cityJson) {
        return (
            <TouchableOpacity
                key={'list_item_' + cityJson.id}
                style={styles.rowView}
                onPress={() => {
                    var selectedCityNames;
                    selectedCityNames = this.props.state.selectedCityNames;
                    var index = selectedCityNames.indexOf(cityJson.cityName)
                    if (index == (-1) && selectedCityNames.length < 20) {
                        selectedCityNames.push(cityJson.cityName)
                    } else if (index == (-1) && selectedCityNames.length >= 20) {
                        Util.showToast(Message.CHOOSE_CITY_CHECK_MOST);
                    } else {
                        selectedCityNames.splice(index, 1)
                    }
                    this.props.changeState({
                        selectedCityNames: selectedCityNames
                    })
                }}>
                <View style={styles.rowData}>
                    <Text style={{
                        color: this.props.state.selectedCityNames.indexOf(cityJson.cityName) != (-1) ? '#FFAA00' : '#666666',
                        width: width
                    }}>{cityJson.cityName}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    //根据搜索框内容在全城市列表集合中查询出符合搜索条件的结果集合并返回该集合
    onChangeTextKeyword(searchedCity) {
        this.props.changeState({value: searchedCity});
        if (searchedCity === '') {
            this.props.changeState({showSearchResult: false});
        } else {
            // 在这里过滤数据结果
            let resultList = this.filterCityData(searchedCity);

            this.props.changeState({keyword: searchedCity, showSearchResult: true, searchResultList: resultList});
        }
    }

    //渲染右侧组头列表
    _renderRightLetters(letter, index) {
        return (
            <TouchableOpacity key={'letter_idx_' + index} activeOpacity={0.6} onPress={() => {
                this.props.changeState({isPress: letter});
                this.flatListRef.scrollToIndex({animated: false, index: index});
                this.refs.toast.close();
                this.refs.toast.show(letter, DURATION.LENGTH_SHORT);
            }}>
                <View style={[styles.letter,{height: index == 0 ? 5 / 100 * height : 3 / 100 * height}]}>
                    <Text style={{
                        width: 6.5 / 100 * width,
                        textAlign: 'center',
                        fontSize: ScreenUtil.setSpText(8),
                        color: letter == this.props.state.isPress ? '#FFAA00' : '#ABABAB'
                    }}>{letter}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    /**
     * 确定
     */
    onConfirm() {
        if (this.props.state.selectedCityNames.length == 0) {
            Util.showToast(Message.CHOOSE_CITY_CHECK_LIST);
            return;
        }
        if (this.props.state.selectedCityNames.length > 20) {
            Util.showToast(Message.CHOOSE_CITY_CHECK_MOST);
            return;
        }
        let selectCities = this.props.state.selectedCityNames;
        let targetCity = selectCities[0] + '';
        for (let i = 1; i < selectCities.length; i++) {
            targetCity = targetCity + '/' + selectCities[i];
        }
        this.props.navigation.state.params.callback(targetCity);
        this.props.changeState({
            newJsonData: [],
            selectedCityNames: [],
            isPress: Message.CHOOSE_CITY_HOY,
        });
        this.props.back();

    }

    _onSectionSelect = (section, index) => {
        //跳转到某一项
        this.flatListRef.scrollToIndex({animated: false, index: index});
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#FFFFFF'}}>
                <CommonLoading isShow={this.props.state.isLoading}/>
                <Header
                    titleText={Message.CHOOSE_CITY_TITLE}
                    thisComponent={this}
                    backClick={this.onBack}
                    rightText={Message.CONFIRM}
                    rightTextStyle={{color: "#FFAA00"}}
                    rightClick={this.onConfirm.bind(this)}
                />
                <View style={{paddingHorizontal: ScreenUtil.scaleSize(30),}}>
                    <View style={styles.rowLO}>
                        <Image source={require('./../../img/reimbursement/search_icon.png')} style={styles.selectImg}/>
                        <TextInput ref={this.props.state.keyword}
                                   autoCapitalize="none"
                                   value={this.props.state.value}
                                   onChangeText={this.onChangeTextKeyword.bind(this)}
                                   returnKeyType="search"
                                   maxLength={20}
                                   style={{
                                       flex: 1,
                                       textAlign: 'left',
                                       marginLeft: ScreenUtil.scaleSize(30),
                                       fontSize: ScreenUtil.setSpText(9),
                                       color: '#666666',
                                       textAlignVertical: 'center',
                                       padding: 0,
                                   }}
                                   underlineColorAndroid="transparent"
                                   placeholder={Message.CHOOSE_CITY_SEARCH}
                                   placeholderTextColor="#ABABAB"
                        />
                    </View>
                </View>
                <View style={{
                    backgroundColor: '#DEDEDE',
                    height: ScreenUtil.scaleSize(1),
                    paddingHorizontal: ScreenUtil.scaleSize(30)
                }}/>
                <View style={{
                    backgroundColor: 'white',
                    alignItems: 'flex-end',
                    flex: 1
                }}>
                    {this.props.state.showSearchResult ? (
                        <View style={styles.containerResult}>
                            {this.props.state.searchResultList.length > 0 ?
                                <ListView
                                    enableEmptySections={true}
                                    contentContainer={styles.contentContainer}
                                    dataSource={this.props.state.ds.cloneWithRows(this.props.state.searchResultList)}
                                    renderRow={this.renderRow.bind(this)}/>
                                :
                                <View style={{
                                    flex: 1,
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    marginTop: ScreenUtil.scaleSize(280),
                                }}>
                                    <Text style={{
                                        color: '#ABABAB',
                                        fontSize: ScreenUtil.scaleSize(34),
                                    }}>未搜索到对应结果</Text>
                                </View>
                            }
                        </View>) : null
                    }

                    <View style={styles.container}>
                        <View style={styles.listContainer}>
                            <FlatList
                                initialNumToRender={30}
                                ref={(ref) => {
                                    this.flatListRef = ref;
                                }}
                                data={this.props.state.newJsonData}
                                extraData={this.props.state}
                                renderItem={({item, index}) => (
                                    <View>
                                        {item.name == Message.CHOOSE_CITY_HOY ?
                                            <View style={styles.contentContainer}>
                                                <View style={styles.rowSeparator}/>
                                                <View style={{
                                                    paddingTop: 5,
                                                    paddingBottom: 5,
                                                    height: 30,
                                                    paddingLeft: 10,
                                                    width: width,
                                                    backgroundColor: 'white'
                                                }}>
                                                    <Text style={styles.sectionText}>{item.name}</Text>
                                                </View>
                                                {
                                                    item.citys.map((city, index) => {
                                                        return (
                                                            <TouchableOpacity
                                                                key={'list_item_' + city.cityCode}
                                                                style={styles.rowViewBox} onPress={() => {
                                                                var selectedCityNames;
                                                                selectedCityNames = this.props.state.selectedCityNames;
                                                                var index = selectedCityNames.indexOf(city.cityName)
                                                                if (index == (-1) && selectedCityNames.length < 20) {
                                                                    selectedCityNames.push(city.cityName)
                                                                } else if ((index == (-1) && selectedCityNames.length >= 20)) {
                                                                    Util.showToast(Message.CHOOSE_CITY_CHECK_MOST);
                                                                } else {
                                                                    selectedCityNames.splice(index, 1)
                                                                }
                                                                this.props.changeState({
                                                                    selectedCityNames: selectedCityNames
                                                                })
                                                            }}>
                                                                <View
                                                                    style={[styles.rowDataBox, {borderColor: this.props.state.selectedCityNames.indexOf(city.cityName) != (-1) ? '#FFAA00' : '#A5A5A5'}]}>
                                                                    <Text style={{
                                                                        paddingTop: Platform.OS == 'ios' ? ScreenUtil.scaleSize(4) : 0,
                                                                        marginTop: 5,
                                                                        flex: 1,
                                                                        fontSize: ScreenUtil.setSpText(8),
                                                                        height: 20,
                                                                        color: this.props.state.selectedCityNames.indexOf(city.cityName) != (-1) ? '#FFAA00' : '#666666'
                                                                    }}>{city.cityName}</Text>
                                                                </View>
                                                            </TouchableOpacity>
                                                        )
                                                    })
                                                }
                                            </View>
                                            :
                                            <View style={styles.contentContainer}>
                                                <View style={styles.sectionView}>
                                                    <Text style={styles.sectionText}>{item.name}</Text>
                                                </View>
                                                {item.citys.map((city, index) => {
                                                        return (
                                                            <View style={{
                                                                paddingBottom: 2,
                                                                backgroundColor: 'white',
                                                                paddingLeft: 10,
                                                            }}>
                                                                <TouchableOpacity onPress={() => {
                                                                    var selectedCityNames;
                                                                    selectedCityNames = this.props.state.selectedCityNames;
                                                                    var index = selectedCityNames.indexOf(city.cityName)
                                                                    if (index == (-1) && selectedCityNames.length < 20) {
                                                                        selectedCityNames.push(city.cityName)
                                                                    } else if ((index == (-1) && selectedCityNames.length >= 20)) {
                                                                        Util.showToast(Message.CHOOSE_CITY_CHECK_MOST);
                                                                    } else {
                                                                        selectedCityNames.splice(index, 1)
                                                                    }
                                                                    this.props.changeState({
                                                                        selectedCityNames: selectedCityNames
                                                                    })
                                                                }}>
                                                                    <Text style={{
                                                                        paddingTop: 10,
                                                                        color: this.props.state.selectedCityNames.indexOf(city.cityName) != (-1) ? '#FFAA00' : '#666666',
                                                                        width: width,
                                                                        fontSize: ScreenUtil.setSpText(9),
                                                                        marginBottom: ScreenUtil.scaleSize(21),
                                                                    }}>{city.cityName}</Text>
                                                                </TouchableOpacity>
                                                                <View style={[CustomStyles.separatorLine,{
                                                                    backgroundColor: index == (item.citys.length - 1) ? 'white' : '#DEDEDE',
                                                                    marginRight: 9.5 / 100 * width,
                                                                }]}/>
                                                            </View>
                                                        )
                                                    }
                                                )
                                                }
                                            </View>}
                                    </View>
                                )}
                            />
{/*                            <View style={styles.letters}>
                                {this.props.state.letters.map((letter, index) => this._renderRightLetters(letter, index))}
                            </View>*/}

                            <CitySectionList
                                sections={this.props.state.letters}
                                onSectionSelect={this._onSectionSelect}/>

                        </View>
                        <Toast ref="toast" position='top' positionValue={200} fadeInDuration={750}
                               fadeOutDuration={1000}
                               opacity={0.8}/>
                    </View>
                </View>
            </SafeAreaView>
        )
    }
}

function mapStateToProps(state) {
    return {
        state: state.SelectCity,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        back: back,
        changeState: changeState,
        getAllCityList: getAllCityList,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectCity);

const styles = StyleSheet.create({
    souSuo: {
        height: ScreenUtil.scaleSize(80),
        flexDirection: 'row',
        alignItems: 'center'
    },
    reMen: {
        marginTop: ScreenUtil.scaleSize(20),
        borderWidth: ScreenUtil.scaleSize(1),
        borderColor: '#DEDEDE',
        borderRadius: ScreenUtil.scaleSize(8),
        backgroundColor: '#F9F9F9',
    },
    a: {
        marginTop: ScreenUtil.scaleSize(20),
        borderWidth: ScreenUtil.scaleSize(1),
        borderColor: '#DEDEDE',
        borderRadius: ScreenUtil.scaleSize(8),
        backgroundColor: '#F9F9F9',
    },
    rowSeparator: {
        backgroundColor: '#F3F3F3',
        height: ScreenUtil.scaleSize(20),
        paddingHorizontal: ScreenUtil.scaleSize(30),
        flex: 1
    },
    rowLabel: {
        fontSize: ScreenUtil.setSpText(10),
        textAlignVertical: 'center',
        color: '#666666'
    },
    inputLabel: {
        width: ScreenUtil.scaleSize(210),
        color: '#666666',
        fontSize: ScreenUtil.setSpText(9),
    },
    row1: {
        height: ScreenUtil.scaleSize(80),
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'white',
    },
    rowInput: {
        flex: 1,
        textAlign: 'left',
        fontSize: ScreenUtil.setSpText(10),
        backgroundColor: "transparent",
        color: '#666666',
    },
    firstRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: ScreenUtil.scaleSize(40),
        alignItems: 'center',
    },
    applicationView: {
        marginLeft: ScreenUtil.scaleSize(20),
        marginRight: ScreenUtil.scaleSize(0),
        marginTop: ScreenUtil.scaleSize(0),
        backgroundColor: '#FFFFFF',
        padding: ScreenUtil.scaleSize(0),
        borderRadius: ScreenUtil.scaleSize(8),
    },
    inputBox: {
        height: Dimensions.get('window').height * 5 / 100,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF'
    },
    inputText: {
        alignSelf: 'flex-end',
        marginTop: Platform.OS === 'ios'
            ? 0
            : 0,
        flex: 1,
        height: Platform.OS === 'ios'
            ? 30
            : 40,
        marginLeft: 2,
        marginRight: 5,
        fontSize: 12,
        lineHeight: 30,
        textAlignVertical: 'bottom',
        textDecorationLine: 'none'
    },
    contentContainer: {
        flexDirection: 'row',
        width: width,
        backgroundColor: 'white',
        justifyContent: 'flex-start',
        flexWrap: 'wrap'
    },
    containerResult: {
        flex: 1,
        zIndex: 999,
        position: 'absolute',
        backgroundColor: 'white',
        width: deviceWidth,
        height: Dimensions.get('window').height * 82 / 100,
        marginBottom: 10
    },
    rowView: {
        height: 40,
        paddingLeft: 10,
        paddingRight: 10,
        borderBottomColor: '#F4F4F4',
        borderBottomWidth: 0.5
    },
    rowView2: {
        height: ROW_HEIGHT,
        paddingLeft: 10,
        paddingRight: 10,
        borderBottomColor: '#F4F4F4',
        borderBottomWidth: 0.5
    },
    rowData: {
        paddingTop: 10,
        paddingBottom: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: width
    },
    rowDataText: {
        color: '#666666',
        width: width
    },
    containerIndexListView: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#F4F4F4',
    },
    contentContainerIndexListView: {
        flexDirection: 'row',
        width: width,
        backgroundColor: 'white',
        justifyContent: 'flex-start',
        flexWrap: 'wrap'
    },
    letters: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        width: 6.5 / 100 * width,
    },
    selectImg: {
        width: ScreenUtil.scaleSize(36),
        height: ScreenUtil.scaleSize(36),
        resizeMode: Image.resizeMode.contain,
    },
    rowLO: {
        height: ScreenUtil.scaleSize(80),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF'
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#F4F4F4',
    },
    listContainer: {
        height: Dimensions.get('window').height * 82 / 100,
        marginBottom: 10
    },
    rowViewBox: {
        height: ROW_HEIGHT_BOX,
        width: (width - 33) / 3,
        flexDirection: 'row',
        backgroundColor: '#ffffff'
    },
    rowDataBox: {
        borderWidth: ScreenUtil.scaleSize(1),
        marginTop: 5,
        marginBottom: 5,
        paddingBottom: 2,
        marginLeft: ScreenUtil.scaleSize(45),
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    rowDataTextBox: {
        marginTop: 5,
        flex: 1,
        height: 20,
        color: '#666666'
    },
    sectionView: {
        paddingTop: 5,
        paddingBottom: 5,
        height: 30,
        paddingLeft: 10,
        width: width,
        backgroundColor: '#F3F3F3'
    },
    sectionText: {
        color: '#666666',
        fontSize: ScreenUtil.setSpText(9)
    },
    letter: {
        height: height * 3.0 / 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
});