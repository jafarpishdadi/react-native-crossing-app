/**
 * Created by Louis.lu on 2018-01-15.
 * 选择抄送人
 */
import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
    Image,
    StyleSheet,
    Text,
    View,
    TextInput,
    ScrollView,
    FlatList,
    Platform,
    NativeModules,
    TouchableOpacity,
    TouchableWithoutFeedback,
    BackHandler,
    PixelRatio
} from "react-native";
import ScreenUtil, {deviceWidth, deviceHeight} from "../../utils/ScreenUtil";
import Util from "../../utils/Util";
import Message from "../../constant/Message";
import Header from "../../containers/common/CommonHeader";
import CommonLoading from "../../containers/common/CommonLoading";
import Dialog from "./../common/Dialog";
import {
    back,
} from "../../redux/actions/navigator/Navigator";
import {changeState as changeAppState} from "../../redux/actions/App";
import {
    changeState,
    initData,
    loadData,
    selectCopyperson,
} from "./../../redux/actions/reimbursement/SelectCopyPerson"

var RNBridgeModule = NativeModules.RNBridgeModule;
var searchResult = [];
var selectData = [];
class SelectCopyPerson extends Component {
    static navigationOptions = ({navigation}) => ({
        header: null
    });

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.initData();
        if (this.props.navigation.state.params && !Util.checkListIsEmpty(this.props.navigation.state.params.selectCopyPerson)) {
            this.props.changeState({
                selectCopyPersonList: this.props.navigation.state.params.selectCopyPerson
            })
        }
        this.props.loadData();
    }

    //确定按钮
    confirmCopyPerson() {
        var data = this.props.state.firstList;
        this.selectData(data);
        if (Util.checkListIsEmpty(selectData)) {
            Util.showToast(Message.NEW_TRAVEL_APPLY_SELECT_COPY_PERSON);
        } else {
            this.props.state({selectData});
            selectData = [];
            this.props.back();
        }

    }

    //获取选择的人员
    selectData(data) {
        for (var i = 0, j = data.length; i < j; i++) {
            if (data[i].deptList && data[i].deptList.length > 0) {
                this.selectData(data[i].deptList);
            }
            if (data[i].personList && data[i].personList.length > 0) {
                var personList = data[i].personList;
                for (var x = 0, y = personList.length; x < y; x++) {
                    if (personList[x].isSelected) {
                        selectData.push(personList[x]);
                    }
                }
            }
        }
    }

    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        component.props.back();
    }

    /**
     * 关闭弹出框
     */
    _closeModal() {
        this.props.changeState({
            saveModalVisible: false,
        });
    }

    /**
     * 保存取消
     * @private
     */
    _cancelClick() {
        this.props.back();
    }

    /**
     * 确定保存
     * @private
     */
    _ensureSaveClick() {
        this.confirmCopyPerson();
    }

    //递归关闭子目录
    recursiveClose(item) {
        if (item.deptList && item.deptList.length > 0) {
            item.isOpen = false;
            for (var i = 0, j = item.deptList.length; i < j; i++) {
                item.deptList[i].isOpen = false;
                if (item.deptList[i].personList && item.deptList[i].personList.length > 0) {
                    item.deptList[i].isOpen = false;
                }
                if (item.deptList[i].deptList && item.deptList[i].deptList.length > 0) {
                    this.recursiveClose(item.deptList[i]);
                }
            }
        }
        if (item.personList && item.personList.length > 0) {
            item.isOpen = false;
        }
        return item;
    }

    //递归遍历部门
    recursiveData(item, list) {
        for (var i = 0, j = list.length; i < j; i++) {
            if (item.name == list[i].name) {
                list[i].isOpen = item.isOpen ? false : true;
                if (!list[i].isOpen) {
                    list[i] = this.recursiveClose(list[i]);
                }
            }

            if (list[i].deptList && list[i].deptList.length > 0) {
                var deptList = list[i].deptList;
                for (var x = 0, y = deptList.length; x < y; x++) {
                    if (item.name == deptList[x].name) {
                        deptList[x].isOpen = item.isOpen ? false : true;
                        if (!deptList[x].isOpen) {
                            deptList[x] = this.recursiveClose(deptList[x]);
                        }
                    } else {
                        if (deptList[x].deptList && deptList[x].deptList.length > 0) {
                            this.recursiveData(item, deptList[x].deptList);
                        } else {
                            if (deptList[x].personList && deptList[x].personList) {
                                var personList = deptList[x].personList;
                                for (var a = 0, b = personList.length; a < b; a++) {
                                    if (item.name == personList[a].name) {
                                        personList[a].isSelected = item.isSelected ? false : true;
                                    }
                                }
                                deptList[x].personList = personList;
                            }
                        }
                    }
                }
                list[i].deptList = deptList;
            }
            if (list[i].personList && list[i].personList.length > 0) {
                var personList = list[i].personList;
                for (var x = 0, y = personList.length; x < y; x++) {
                    if (item.name == personList[x].name) {
                        personList[x].isSelected = item.isSelected ? false : true;
                        list[i].personList = personList;
                    }
                }
            }
        }
        return list;
    }

    /**
     * 展开关闭一级目录
     * @param item
     */
    openAndCloseFirst(item) {
        var firstList = this.props.state.firstList;
        this.props.changeState({
            firstList: this.recursiveData(item, firstList)
        })
    }

    /**
     * 渲染一级目录
     * @param item   列表项
     * @param index  下标
     */
    renderFirstListItem(item, index) {
        return (
            <View style={{paddingHorizontal: ScreenUtil.scaleSize(30), marginTop: ScreenUtil.scaleSize(20)}}>
                <TouchableOpacity onPress={() => {
                    this.openAndCloseFirst(item);
                }}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        {item.isOpen ?
                            <Image source={require('./../../img/copyperson/down.png')} style={styles.rightDownImg}/>
                            :
                            <Image source={require('./../../img/copyperson/right.png')} style={styles.rightImg}/>
                        }
                        <Text style={styles.rowText}>{item.name}</Text>
                    </View>
                </TouchableOpacity>
                {
                    item.isOpen   //判断是否为展开状态
                        ?
                        (
                            item.deptList ?
                                (Util.checkListIsEmpty(item.deptList)
                                    ?
                                    null
                                    :
                                    item.deptList.map((sItem, sIndex) => this.renderFirstListItem(sItem, sIndex)))
                                :
                                (Util.checkListIsEmpty(item.personList)
                                    ?
                                    null
                                    :
                                    item.personList.map((sItem, sIndex) => this.renderPersonListItem(sItem, sIndex)))
                        )
                        :
                        null
                }
            </View>
        )
    }

    //
    selectPerson(item) {
        var firstList = this.props.state.firstList;
        this.props.changeState({
            firstList: this.recursiveData(item, firstList)
        })
    }

    /**
     * 渲染人员列表
     * @param item
     * @param index
     * @returns {XML}
     */
    renderPersonListItem(item, index) {
        return (
            <View style={{paddingHorizontal: ScreenUtil.scaleSize(30), marginTop: ScreenUtil.scaleSize(20)}}>
                <TouchableOpacity onPress={() => {
                    this.selectPerson(item);
                }}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        {item.isSelected ?
                            <Image source={require('./../../img/copyperson/selected.png')}
                                   style={styles.rightPersonImg}/>
                            :
                            <Image source={require('./../../img/copyperson/oval_unselected.png')}
                                   style={styles.rightPersonImg}/>}

                        <Text style={styles.rowPersonText}>{item.name}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    //搜索
    searchData(text) {
        Util.showToast(text);
    }

    render() {
        const dismissKeyboard = require('dismissKeyboard');
        return (
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={[styles.container]}>
                    <Header
                        titleText={Message.SELECT_COPY_PERSON_TITLE}
                        thisComponent={this}
                        backClick={this.onBack}
                        rightText={Message.CONFIRM}
                        rightClick={this.confirmCopyPerson.bind(this)}
                        rightTextStyle={{
                            fontSize: ScreenUtil.setSpText(9),
                            color: '#FFAA00',
                        }}
                        backControl={false}
                    />
                    <Dialog
                        content={Message.NEW_TRAVEL_IS_APPLY_COPY_PERSON}
                        type={'confirm'}
                        leftBtnText={Message.CANCEL}
                        rightBtnText={Message.CONFIRM}
                        modalVisible={this.props.state.saveModalVisible}
                        leftBtnStyle={{color: '#A5A5A5',}}
                        rightBtnStyle={{color: '#FFAA00',}}
                        onClose={this._closeModal.bind(this)}
                        leftBtnClick={this._cancelClick.bind(this)}
                        rightBtnClick={this._ensureSaveClick.bind(this)}
                        thisComponent={this}
                    />
                    <View style={{paddingHorizontal: ScreenUtil.scaleSize(30),}}>
                        <View style={styles.row}>
                            <Image source={require('./../../img/copyperson/search.png')} style={styles.selectImg}/>
                            <TextInput
                                editable={true}
                                placeholder={Message.SELECT_COPY_PERSON_SEARCH}
                                placeholderTextColor="#ABABAB"
                                underlineColorAndroid="transparent"
                                style={{
                                    flex: 1,
                                    textAlign: 'left',
                                    marginLeft: ScreenUtil.scaleSize(30),
                                    fontSize: ScreenUtil.setSpText(9),
                                    color: '#666666',
                                    textAlignVertical: 'center',
                                    padding: 0,
                                }}
                                onChangeText={(text) => {
                                    this.searchData(text);
                                }}
                            />
                        </View>
                        <View style={[styles.rowSeparator]}/>
                    </View>

                    <ScrollView ref="scroll" style={{flex: 1, paddingHorizontal: ScreenUtil.scaleSize(30)}}>
                        {Util.checkListIsEmpty(this.props.state.firstList) ?
                            null
                            :
                            this.props.state.firstList.map((item, index) => this.renderFirstListItem(item, index))}
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>

        )

    }
}

function mapStateToProps(state) {
    return {
        state: state.SelectCopyPerson,
        nav: state.nav,
        appState: state.App,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        back: back,
        initData: initData,
        changeState: changeState,
        loadData: loadData,
        selectCopyperson: selectCopyperson,
        changeAppState: changeAppState,
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectCopyPerson);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    rowSeparator: {
        backgroundColor: '#DEDEDE',
        height: 1 / PixelRatio.get(),
        paddingHorizontal: ScreenUtil.scaleSize(30)
    },
    row: {
        height: ScreenUtil.scaleSize(80),
        flexDirection: 'row',
        alignItems: 'center'
    },
    selectImg: {
        width: ScreenUtil.scaleSize(40),
        height: ScreenUtil.scaleSize(40),
        resizeMode: Image.resizeMode.contain,
        // marginLeft: ScreenUtil.scaleSize(30)
    },
    rightDownImg: {
        width: ScreenUtil.scaleSize(19),
        height: ScreenUtil.scaleSize(8),
        resizeMode: Image.resizeMode.contain,
    },
    rightImg: {
        width: ScreenUtil.scaleSize(8),
        height: ScreenUtil.scaleSize(19),
    },
    rowText: {
        color: '#666666',
        fontSize: ScreenUtil.setSpText(9),
        marginLeft: ScreenUtil.scaleSize(10)
    },
    rowPersonText: {
        color: '#ABABAB',
        fontSize: ScreenUtil.setSpText(9),
        marginLeft: ScreenUtil.scaleSize(10)
    },
    rightPersonImg: {
        width: ScreenUtil.scaleSize(40),
        height: ScreenUtil.scaleSize(40),
        resizeMode: Image.resizeMode.contain,
    }
})