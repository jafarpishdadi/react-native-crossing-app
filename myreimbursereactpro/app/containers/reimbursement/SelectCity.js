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
    ScrollView,
    Image,
    TouchableOpacity,
    FlatList,
    Platform,
    ListView,
    Dimensions,
} from 'react-native';
import {changeState} from '../../redux/actions/reimbursement/SelectCity';

import Toast, {DURATION} from './ToastUtil'
const SECTIONHEIGHT = 30;                                                          //组头字母(或者"热门")行高
const ROWHEIGHT = 40;                                                              //普通模块行高
const ROWHEIGHT_BOX = 40;                                                          //热门模块行高
var totalheight = [];                                                              //每个组头及其所对应的数据总行的高度总和  的集合
const key_hot = '热门';
var dataSource = [];                                                               //全城市列表的数据源dataSource
var letters =[];                                                                   //右侧字母列表(含"热门")
const {width, height} = Dimensions.get('window');
var that;
const OPACITY=0.6;                                                                 //右侧点击时小弹框的透明度
class SelectCity extends Component {

    static navigationOptions = ({navigation}) => ({
        header: null,
    })

    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        component.props.back();
    }

    componentWillMount() {
        //初始化页面

        var getSectionData = (dataBlob, sectionID) => {
            return sectionID;                                                        //获取组头数据(字母+"热门")
        };
        var getRowData = (dataBlob, sectionID, rowID) => {                            //获取行数据
            return dataBlob[sectionID][rowID];
        };

        let ALL_CITY_LIST = this.props.state.allCityList;                         //全城市数据
        let HOT_CITY_LIST = this.props.state.hotCityList;                         //热门城市数据
        let dataBlob = {};                                                            //定义数据团dataBlob
        dataBlob[key_hot] = HOT_CITY_LIST;                                            //给数据团dataBlob加入热门城市数据 dataBlob[key_hot]

        ALL_CITY_LIST.map(cityJson => {                                               //按城市名称拼音的首字母分类 给数据团dataBlob加入分组城市数据(不含"热门")
            let key = cityJson.sortLetters.toUpperCase();

            if (dataBlob[key]) {
                let subList = dataBlob[key];
                subList.push(cityJson);
            } else {
                let subList = [];
                subList.push(cityJson);
                dataBlob[key] = subList;
            }
        });

        let sectionIDs = Object.keys(dataBlob);                                     //获取总列表数据的 分组ID的集合sectionIDs("热门"+字母列表)

        let rowIDs = sectionIDs.map(sectionID => {                                   //rowIDs 为 sectionIDs中 每个元素(也就是组头)对应的城市数据的个数个的数字的数组(从0开始，最后一个数组元素为改组数据个数-1)  的集合
            let thisRow = [];
            let count = dataBlob[sectionID].length;
            for (let ii = 0; ii < count; ii++) {
                thisRow.push(ii);
            }

            let eachheight = SECTIONHEIGHT + ROWHEIGHT * thisRow.length;              //eachheight为每组 组头及其所对应的数据总行的高度总和
            if (sectionID === key_hot) {
                let rowNum = (thisRow.length % 3 === 0)
                    ? (thisRow.length / 3)
                    : parseInt(thisRow.length / 3) + 1;
                eachheight = SECTIONHEIGHT + ROWHEIGHT_BOX * rowNum;
            }

            totalheight.push(eachheight);
            return thisRow;
        });                                                                           //该方法在获取rowsID的同时也同时给 totalheight 加入后了数据
        var ds = new ListView.DataSource({                                           //搜索结果集的数据源ds
            rowHasChanged: (r1, r2) => r1 !== r2
        });

        let ds2 = new ListView.DataSource({                                            //全城市数据的数据源(含"热门")ds2
            getRowData: getRowData,                                                     //获取行数据
            getSectionHeaderData: getSectionData,                                       //获取组头数据
            rowHasChanged: (row1, row2) => row1 !== row2,                               //行发生变化
            sectionHeaderHasChanged: (s1, s2) => s1 !== s2                              //组头发生变化
        });

        dataSource = ds2.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs);        //全城市列表数据源
        letters = sectionIDs;                                                           //右侧字母列表（含热门）

        this.props.changeState({
            showSearchResult: false,                                                //是否展示搜索结果标记
            keyword: '',                                                              //搜索关键字
            searchResultList: [],                                                    //搜索结果集合
            value:'',                                                                  //搜索框显示的内容
            ds: ds,                                                                     //结果集数据源
            //dataSource: ds2.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs),
            //letters: sectionIDs
        })

        that = this;
    }

    //找出符合搜索条件的城市集合
    filterCityData(searchedCity) {
        let resultList = [];
        for (let i = 0; i < this.props.state.allCityList.length; i++) {
            let item = this.props.state.allCityList[i];
            if (item.name.indexOf(searchedCity) === 0 || item.spellName.indexOf(searchedCity) === 0) {
                resultList.push(item);
            }
        }
        return resultList;
    }

    //渲染符合搜索条件的城市列表
    renderRow(cityJson) {
        let keyword = this.props.state.keyword;
        let searchedCity = (
            <Text style={{
                color: 'red'
            }}>{keyword}</Text>
        );

        let Name1 = '';
        if (cityJson.name.indexOf(keyword) === 0) {
            Name1 = (<Text>{searchedCity}{cityJson.name.replace(keyword,'')}</Text>);
        } else {
            Name1 = (<Text>{cityJson.name}</Text>);
        }

        let Name2 = '';
        if (cityJson.spellName.indexOf(keyword) === 0) {
            Name2 = (<Text>{searchedCity}{cityJson.spellName.replace(keyword,'')}</Text>);
        } else {
            Name2 = (
                <Text>{cityJson.spellName}</Text>
            );
        }

        return (
            <TouchableOpacity
                key={'list_item_' + cityJson.id}
                style={styles.rowView}
                onPress={() => {
                    this.onSelectCity(cityJson)
                }}>
                <View style={styles.rowData}>
                    <Text style={styles.rowDataText}>{Name1} / {Name2}</Text>
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

     //当点击单个城市(即选择城市)时调用
    onSelectCity(cityJson) {
/*        if (this.props.state.showSearchResult) {
            this.props.changeState({showSearchResult: false, keyword: ''});
        }*/

        alert('你选择了城市====》' + cityJson.id + '#####' + cityJson.name);
    }


    //点击组头列表中某一组头选项时列表数据的展示跳转至改组数据
    _scrollTo(index, letter) {
        this.refs.toast.close();
        let position = 0;
        for (let i = 0; i < index; i++) {
            position += totalheight[i]
        }
        this._listView.scrollTo({y: position});
        this.refs.toast.show(letter, DURATION.LENGTH_SHORT);
    }


    //渲染右侧组头列表
    _renderRightLetters(letter, index) {
        return (
            <TouchableOpacity key={'letter_idx_' + index} activeOpacity={0.6} onPress={() => {
                this._scrollTo(index, letter)
            }}>
                <View style={styles.letter}>
                    <Text style={styles.letterText}>{letter}</Text>
                </View>
            </TouchableOpacity>
        );
    }


    //渲染热门模块
    _renderListBox(cityJson, rowId) {
        return (
            <TouchableOpacity key={'list_item_' + cityJson.id} style={styles.rowViewBox} onPress={() => {
                that.onSelectCity(cityJson)
            }}>
                <View style={styles.rowDataBox}>
                    <Text style={styles.rowDataTextBox}>{cityJson.name}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    //渲染总城市数据模块
    _renderListRow(cityJson, rowId) {
        console.log('rowId===>' + rowId + ", cityJson====>" + JSON.stringify(cityJson));
        if (rowId === key_hot) {
            return that._renderListBox(cityJson, rowId);
        }

        return (
            <TouchableOpacity key={'list_item_' + cityJson.id} style={styles.rowView2} onPress={() => {
                that.onSelectCity(cityJson)
            }}>
                <View style={styles.rowData}>
                    <Text style={styles.rowDataText}>{cityJson.name}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    //渲染组头的UI
    _renderListSectionHeader(sectionData, sectionID) {
        return (
            <View style={styles.sectionView}>
                <Text style={styles.sectionText}>
                    {sectionData}
                </Text>
            </View>
        );
    }


    render(){
        return(
            <View style={{ flex:1,backgroundColor:'#F6F6F6'}}>
                <Header
                    titleText={Message.CHOOSE_CITY_TITLE}
                    thisComponent={this}
                    backClick={this.onBack}
                    rightText={Message.CONFIRM}
                    rightTextStyle={{color:"#FFAA00"}}
                />
                <View style={{paddingHorizontal: ScreenUtil.scaleSize(30),}}>
                    <View style={styles.rowLO}>
                        <Image source={require('./../../img/reimbursement/search_icon.png')} style={styles.selectImg} />
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
                <View style={styles.rowSeparator}/>
                <View style={{
                    backgroundColor: 'white',
                    alignItems:'flex-end',
                    flex:1
                }}>
                    {this.props.state.showSearchResult
                        ? (
                            <View style={styles.containerResult}>
                                <ListView
                                    enableEmptySections={true}
                                    contentContainer={styles.contentContainer}
                                    dataSource={this.props.state.ds.cloneWithRows(this.props.state.searchResultList)}
                                    renderRow={this.renderRow.bind(this)}/>
                            </View>
                        ) : null}
                                                <View style={styles.container}>
                            <View style={styles.listContainer}>
                                <ListView ref={listView => this._listView = listView}
                                          contentContainerStyle={styles.contentContainer}
                                          dataSource={dataSource}
                                          renderRow={this._renderListRow}
                                          renderSectionHeader={this._renderListSectionHeader}
                                          enableEmptySections={true}
                                          initialListSize={1500}/>
                                <View style={styles.letters}>
                                    {letters.map((letter, index) => this._renderRightLetters(letter, index))}
                                </View>
                            </View>
                            <Toast ref="toast" position='top' positionValue={200} fadeInDuration={750} fadeOutDuration={1000}
                                   opacity={0.8}/>
                        </View>
                </View>
            </View>

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
        changeState:changeState,
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
        backgroundColor: '#DEDEDE',
        height: ScreenUtil.scaleSize(25),
        paddingHorizontal: ScreenUtil.scaleSize(30)
    },
    rowSeparator2: {
        backgroundColor: '#DEDEDE',
        height: ScreenUtil.scaleSize(50),
        paddingHorizontal: ScreenUtil.scaleSize(30)
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
        //height: Platform.OS === 'ios'
        //? 30
        //: 40,
        //marginLeft: 5,
        //marginRight: 5,
        height: Dimensions.get('window').height * 5/100,
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
        height: deviceHeight,
    },
    rowView: {
        height: 40,
        paddingLeft: 10,
        paddingRight: 10,
        borderBottomColor: '#F4F4F4',
        borderBottomWidth: 0.5
    },
    rowView2: {
        height: ROWHEIGHT,
        paddingLeft: 10,
        paddingRight: 10,
        borderBottomColor: '#F4F4F4',
        borderBottomWidth: 0.5
    },
    rowData: {
        paddingTop: 10,
        paddingBottom: 2
    },
    rowDataText: {
        color: 'gray',
        width: width
    },
    containerIndexListView: {
        // paddingTop: 50,
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
        height: height,
        top: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'transparent',
        // justifyContent: 'flex-start',
        // alignItems: 'flex-start'
        alignItems: 'center',
        justifyContent: 'center'
    },
    selectImg: {
        width: ScreenUtil.scaleSize(36),
        height: ScreenUtil.scaleSize(36),
        resizeMode: Image.resizeMode.contain,
        // marginLeft: ScreenUtil.scaleSize(30)
    },
    rowLO: {
        height: ScreenUtil.scaleSize(80),
        flexDirection: 'row',
        alignItems: 'center'
    },
    container: {
        // paddingTop: 50,
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#F4F4F4',
    },
    listContainer: {
        height: Dimensions.get('window').height * 80/100,
        marginBottom: 10
    },
    rowViewBox: {
        height: ROWHEIGHT_BOX,
        width: (width - 30) / 3,
        flexDirection: 'row',
        backgroundColor: '#ffffff'
    },
    rowDataBox: {
        borderWidth: 1,
        borderColor: '#DBDBDB',
        marginTop: 5,
        marginBottom: 5,
        paddingBottom: 2,
        marginLeft: 10,
        marginRight: 10,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    rowDataTextBox: {
        marginTop: 5,
        flex: 1,
        height: 20
    },
    sectionView: {
        paddingTop: 5,
        paddingBottom: 5,
        height: 30,
        paddingLeft: 10,
        width: width,
        backgroundColor: '#F4F4F4'
    },
    sectionText: {
        color: '#666666',
        fontWeight: 'bold'
    },
    letter: {
        height: height * 2 / 100,
        width: width * 4 / 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    letterText: {
        textAlign: 'center',
        fontSize: height * 1.1 / 50,
        color: '#000000'
    },
});