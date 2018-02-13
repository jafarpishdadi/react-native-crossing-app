/**
 * Created by Louis.lu on 2018-01-22.
 * 选择出差申请
 */

import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    View,
    Platform,
    TouchableOpacity,
    NativeModules,
    TouchableWithoutFeedback,
    FlatList,
    ActivityIndicator,
    PixelRatio,
    ScrollView,
    BackHandler,
} from "react-native";
import ScreenUtil, {deviceHeight, deviceWidth} from "../../utils/ScreenUtil";
import Message from "../../constant/Message";
import Header from "../common/CommonHeader";
import CommonLoading from "../common/CommonLoading";
import {
    back,
    navigateTravelApplyDetail
} from "../../redux/actions/navigator/Navigator";
import {
    initData,
    loadData,
    changeState,
} from "../../redux/actions/travelApply/SelectTravelApply"
import {changeState as changeAppState} from "../../redux/actions/App";
import Util from '../../utils/Util';

var RNBridgeModule = NativeModules.RNBridgeModule;

class SelectTravelApply extends Component {
    static navigationOptions = ({navigation}) => ({
        header: null
    });

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.initData();
        this.props.loadData();
    }


    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        component.props.back();
    }

    //刷新列表
    refreshData() {
        this.props.loadData();
    }

    selectItem(item) {
        var selectItem = this.props.state.selectItem;
        if (item.id == selectItem.id) {
            this.props.changeState({
                selectItem: {},
            })
        } else {
            this.props.changeState({
                selectItem: item,
            })
        }
    }

    //渲染出差申请列表
    renderDataItem(item, index) {
        let img = item.id == this.props.state.selectItem.id ?
            (require('./../../img/copyperson/selected.png'))
            : (require('./../../img/copyperson/oval_unselected.png'));
        return (
            <View style={{marginTop: ScreenUtil.scaleSize(40), paddingHorizontal: ScreenUtil.scaleSize(40)}}>

                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <TouchableOpacity onPress={() => {
                        this.selectItem(item);
                    }}>
                        <Image source={img}
                               style={styles.selectImg}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        this.props.navigateTravelApplyDetail();
                    }}>
                        <Text style={styles.rowText}>{item.applyNo}</Text>
                    </TouchableOpacity>

                </View>

            </View>
        )
    }

    confirmSelect() {
        if (Util.checkIsEmptyString(this.props.state.selectItem.applyNo)) {
            Util.showToast(Message.SELECT_TRAVEL_APPLY);
        } else {
            Util.showToast(this.props.state.selectItem.applyNo);
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <CommonLoading isShow={this.props.state.isLoading}/>
                <Header
                    titleText={Message.SELECT_TRAVEL_APPLY_TITLE}
                    thisComponent={this}
                    backClick={this.onBack}
                    rightText={Message.CONFIRM}
                    rightClick={this.confirmSelect.bind(this)}
                    rightTextStyle={{
                        fontSize: ScreenUtil.setSpText(9),
                        color: '#FFAA00',
                    }}
                    backControl={false}
                />
                <View style={{flex: 1,}}>
                    <FlatList
                        style={{flex: 1,}}
                        data={this.props.state.travelApplyList}
                        onRefresh={() => {
                            this.refreshData();
                        }}
                        refreshing={this.props.state.isRefreshing}
                        onEndReachedThreshold={0.03}
                        renderItem={({item, index}) => this.renderDataItem(item, index)}
                    >

                    </FlatList>
                </View>
            </View>
        )
    }
}

function mapStateToProps(state) {
    return {
        state: state.SelectTravelApply,
        nav: state.nav,
        appState: state.App,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        back: back,
        changeState: changeState,
        initData: initData,
        loadData: loadData,
        changeAppState: changeAppState,
        navigateTravelApplyDetail: navigateTravelApplyDetail,
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectTravelApply);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    selectImg: {
        width: ScreenUtil.scaleSize(40),
        height: ScreenUtil.scaleSize(40),
        resizeMode: Image.resizeMode.contain,
    },
    rowText: {
        color: '#666666',
        fontSize: ScreenUtil.setSpText(9),
        marginLeft: ScreenUtil.scaleSize(40)
    },
})