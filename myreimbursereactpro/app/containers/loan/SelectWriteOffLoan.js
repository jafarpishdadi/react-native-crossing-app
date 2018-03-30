/**
 * Created by Louis.lu on 2018-01-22.
 * 选择核销借款
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
import CommonLoading from "../../containers/common/CommonLoading";
import {
    back,
    navigateLoanOrderDetail
} from "../../redux/actions/navigator/Navigator";
import {
    loadData,
    initData,
    changeState,
} from "../../redux/actions/loan/SelectWriteOffLoan"
import {changeState as changeAppState} from "../../redux/actions/App";
import Util from '../../utils/Util';
import SafeAreaView from "react-native-safe-area-view";

var RNBridgeModule = NativeModules.RNBridgeModule;
class SelectWriteOffLoan extends Component {

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

    //确定
    confirmSelect() {
        if (Util.checkIsEmptyString(this.props.state.selectItem.loanNo)) {
            Util.showToast(Message.SELECT_WRITE_OFF_LOAN);
        } else {
            Util.showToast(this.props.state.selectItem.loanNo);
        }

    }

    //刷新列表
    refreshData() {
        this.props.loadData();
    }

    //点击选项选择
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

    //渲染核销单列表
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
                        <Image source={img} style={styles.selectImg}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        this.props.navigateLoanOrderDetail();
                    }}>
                        <Text style={styles.rowText}>{item.loanNo}</Text>
                    </TouchableOpacity>
                </View>

            </View>
        )
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <CommonLoading isShow={this.props.state.isLoading}/>
                <Header
                    titleText={Message.SELECT_WRITE_OFF_LOAN_TITLE}
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
                <View style={{flex: 1}}>
                    <FlatList
                        style={{flex: 1}}
                        data={this.props.state.loanList}
                        onRefresh={() => {
                            this.refreshData();
                        }}
                        refreshing={this.props.state.isRefreshing}
                        onEndReachedThreshold={0.03}
                        renderItem={({item, index}) => this.renderDataItem(item, index)}
                    >

                    </FlatList>
                </View>
            </SafeAreaView>
        )
    }
}

function mapStateToProps(state) {
    return {
        state: state.SelectWriteOffLoan,
        nav: state.nav,
        appState: state.App,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        back: back,
        loadData: loadData,
        initData: initData,
        changeState: changeState,
        changeAppState: changeAppState,
        navigateLoanOrderDetail: navigateLoanOrderDetail,
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectWriteOffLoan);

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