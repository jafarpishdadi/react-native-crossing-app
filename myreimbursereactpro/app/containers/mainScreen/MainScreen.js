/**
 * 主界面
 * Created by sky.qian on 10/26/2017.
 */
import React, {Component} from "react";
import {TabNavigator} from "react-navigation";
import ScreenUtil, {deviceWidth, deviceHeight} from "../../utils/ScreenUtil";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
    navigateNewReimbursement,
    navigateNewLoanOrder,
    navigateNewTravelApply
} from "../../redux/actions/navigator/Navigator";
import {
    Platform,
    View,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    DeviceEventEmitter,
    Animated,
    FlatList,
    Text,
    StyleSheet,
    findNodeHandle
} from "react-native";
import HomePage from "./HomePage";
import Invoice from "./Invoice";
import Report from "./Report";
import Mine from "./Mine";
import Nothing from "./Nothing";
import {changeState as changeHomePageState, changeCompany} from "../../redux/actions/homePage/HomePage";
import CommonLoading from "../common/CommonLoading";
import Util from "../../utils/Util";
import {changeState, gotoNewReimbursement} from "../../redux/actions/mainScreen/MainScreen";
import Menu from "../common/Menu";
import {BlurView} from "react-native-blur";
var DeviceInfo = require('react-native-device-info');
import SafeAreaView from "react-native-safe-area-view";

const TabRouteConfigs = {
    HomePage: {
        screen: HomePage
    },
    Invoice: {
        screen: Invoice
    },
    nothing: {
        screen: Nothing
    },
    Report: {
        screen: Report
    },
    Mine: {
        screen: Mine
    }
};

const tabBarOptions = {
    showIcon: true,     //android默认false
    activeTintColor: '#FFAA00',
    inactiveTintColor: '#717171',
    indicatorStyle: {
        height: 0  // 如TabBar下面显示有一条线，可以设高度为0后隐藏
    },
    style: {
        height: ScreenUtil.scaleSize(96),
        backgroundColor: '#FFFFFF',
        border: 0,
        borderWidth: 0,
        shadowOffset: {width: 0, height: 0},
        shadowColor: 'rgba(145,145,145,0.3)',
        shadowOpacity: 1,
        shadowRadius: 2,
        elevation: 10,
    },
    labelStyle: {
        fontSize: ScreenUtil.setSpText(5.5),
        ...Platform.select({
            ios: {
                marginBottom: ScreenUtil.scaleSize(9),
                //marginTop: ScreenUtil.scaleSize(20),
            },
            android: {
                marginTop: ScreenUtil.scaleSize(5),
            }
        })
    },
    iconStyle: {
        width: ScreenUtil.scaleSize(55),
        height: ScreenUtil.scaleSize(50),
        ...Platform.select({
            android: {
                marginTop: ScreenUtil.scaleSize(-6),
            }
        })
    }
}

//底部tab选项
const HomeMain = TabNavigator(TabRouteConfigs, {
    initialRouteName: 'HomePage',
    tabBarOptions: tabBarOptions,
    animationEnabled: false, // 切换页面时是否有动画效果
    tabBarPosition: 'bottom',   //底部显示
    swipeEnabled: false,    //是否滑动切换tab
    backBehavior: 'none'
});
//底部tab选项
const InvoiceMain = TabNavigator(TabRouteConfigs, {
    initialRouteName: 'Invoice',
    tabBarOptions: tabBarOptions,
    animationEnabled: false, // 切换页面时是否有动画效果
    tabBarPosition: 'bottom',   //底部显示
    swipeEnabled: false,    //是否滑动切换tab
    backBehavior: 'none'
});
//底部tab选项
const ReportMain = TabNavigator(TabRouteConfigs, {
    initialRouteName: 'Report',
    tabBarOptions: tabBarOptions,
    animationEnabled: false, // 切换页面时是否有动画效果
    tabBarPosition: 'bottom',   //底部显示
    swipeEnabled: false,    //是否滑动切换tab
    backBehavior: 'none'
});
//底部tab选项
const MineMain = TabNavigator(TabRouteConfigs, {
    initialRouteName: 'Mine',
    tabBarOptions: tabBarOptions,
    animationEnabled: false, // 切换页面时是否有动画效果
    tabBarPosition: 'bottom',   //底部显示
    swipeEnabled: false,    //是否滑动切换tab
    backBehavior: 'none'
});


class MainScreen extends Component {
    static navigationOptions = {
        header: null,
    }

    renderMainTab(tab){
        var tabMain = <HomeMain ref="blurTab"/>
        if(tab){
            if("Invoice" == tab.tab){
                tabMain = <InvoiceMain ref="blurTab"/>
            } else if ("Report" == tab.tab) {
                tabMain = <ReportMain ref="blurTab"/>
            } else if ("Mine" == tab.tab) {
                tabMain = <MineMain ref="blurTab"/>
            }
        }
        return tabMain;
    }

    //第一次渲染结束，设置监听器
    componentDidMount() {
        //模糊隐藏监听器
        this.hideBlurSubscription = DeviceEventEmitter.addListener('hideBlurTabBar', ()=>this.blurAction('0'));
        //模糊显示监听器
        this.showBlurSubscription = DeviceEventEmitter.addListener('showBlurTabBar', ()=>this.blurAction('1'));
    }

    //页面销毁前
    componentWillUnmount() {
        //清除模糊相关监听
        this.hideBlurSubscription.remove();
        this.showBlurSubscription.remove();
    }

    /**
     * 首页阴影点击事件
     */
    homePageBackClick() {
        /*Animated.timing(                            // 随时间变化而执行的动画类型
         this.props.homePageState.selectHeightMin,                      // 动画中的变量值
         {
         toValue: 0,
         duration: 200,
         }
         ).start(() => this.props.changeHomePageState({companyOpen: false}));*/
        this.props.changeHomePageState({companyOpen: false});
        this.props.changeState({companyOpen: false})
    }

    renderSelectedCompany (item) {
        return this.props.state.selectCompany== item.enterpriseName ?
            styles.selectedCompanyName : styles.reimbursementTextBig;
    }

    onClose() {
        const that = this;
        this.props.changeAppState({
            menuShow: false,
        })

        setTimeout(() => {
            that.props.changeAppState({
                fromMenu: false,
            })
        }, 500)
    }

    //模糊相关操作
    blurAction(type) {
        if (type == '1') {
            this.props.changeState({viewRef: findNodeHandle(this.refs.blurTab)});
        } else {
            this.props.changeState({viewRef: null});
        }
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
                <CommonLoading isShow={this.props.state.isLoading}/>
                {/*{*/}
                    {/*(this.props.state.companyOpen) ? (*/}
                        {/*<View style={{*/}
                            {/*position: 'absolute',*/}
                            {/*top: ScreenUtil.scaleSize(Platform.OS == 'ios' ? 128 : 93),*/}
                            {/*width: deviceWidth,*/}
                            {/*zIndex: 999,*/}
                        {/*}}>*/}
                            {/*<TouchableWithoutFeedback onPress={this.homePageBackClick.bind(this)}>*/}
                                {/*<View style={{*/}
                                    {/*backgroundColor: '#000000',*/}
                                    {/*height: deviceHeight,*/}
                                    {/*opacity: 0.45,*/}
                                {/*}} />*/}
                            {/*</TouchableWithoutFeedback>*/}
                            {/*<Animated.View style={{*/}
                                {/*position: 'absolute',*/}
                                {/*height: ScreenUtil.scaleSize(this.props.state.selectHeightMax),*/}
                                {/*backgroundColor: '#F9F9F9',*/}
                                {/*width: deviceWidth,*/}
                                {/*paddingHorizontal: ScreenUtil.scaleSize(30),*/}
                            {/*}}>*/}
                                {/*<FlatList*/}
                                    {/*data={this.props.state.companyArr}*/}
                                    {/*showsVerticalScrollIndicator={false}*/}
                                    {/*renderItem={({item, index}) => (*/}
                                        {/*<View>*/}
                                            {/*<TouchableOpacity onPress={() => {*/}
                                                {/*this.props.changeCompany(item);*/}
                                            {/*}} style={{*/}
                                                {/*height: ScreenUtil.scaleSize(80),*/}
                                                {/*justifyContent: 'center',*/}
                                            {/*}}>*/}
                                                {/*<Text style={this.renderSelectedCompany(item)}>{item.enterpriseName}</Text>*/}
                                            {/*</TouchableOpacity>*/}
                                            {/*{*/}
                                                {/*(index + 1 == this.props.state.companyArr.length) ? (*/}
                                                    {/*null*/}
                                                {/*) : (*/}
                                                    {/*<View style={{*/}
                                                        {/*height: ScreenUtil.scaleSize(2),*/}
                                                        {/*backgroundColor: '#DEDEDE'*/}
                                                    {/*}} />*/}
                                                {/*)*/}
                                            {/*}*/}
                                        {/*</View>*/}
                                    {/*)}*/}
                                {/*/>*/}
                            {/*</Animated.View>*/}
                        {/*</View>*/}
                    {/*) : null*/}
                {/*}*/}
                <View style={{
                    position: 'absolute',
                    zIndex: 998,
                    width:deviceWidth/5,
                    justifyContent: 'center',
                    alignItems: 'center',
                    bottom: ScreenUtil.scaleSize(Util.isIphoneX() ? 68 : 0),
                    //paddingBottom: ScreenUtil.scaleSize(8),
                    left: deviceWidth/5*2,
                    height: ScreenUtil.scaleSize(96),
                }}>
                    <TouchableOpacity onPress={() => {
                        DeviceEventEmitter.emit('InvoiceList');
                        this.refs.menu.open(this.props.appState.currentTab);
                        if(Platform.OS != 'ios'){
                            if (this.props.appState.currentTab == 'HomePage') {
                                DeviceEventEmitter.emit('showBlurTabOne');
                            } else if (this.props.appState.currentTab == 'Invoice') {
                                DeviceEventEmitter.emit('showBlurTabTwo');
                            } else if (this.props.appState.currentTab == 'Report') {
                                DeviceEventEmitter.emit('showBlurTabThree');
                            } else if (this.props.appState.currentTab == 'Mine') {
                                DeviceEventEmitter.emit('showBlurTabFour');
                            }
                            DeviceEventEmitter.emit('showBlurTabBar');
                        }
                    }}>
                        <Image source={require('../../img/mainScreen/add.png')}
                               style={{
                                   width: ScreenUtil.scaleSize(80),
                                   height: ScreenUtil.scaleSize(80),
                               }}/>
                    </TouchableOpacity>
                </View>
                <Menu ref="menu"
                      gotoNewReimbursement={this.props.gotoNewReimbursement}
                      navigateNewLoanOrder={this.props.navigateNewLoanOrder}
                      navigateNewTravelApply={this.props.navigateNewTravelApply}
                />
                {
                    Platform.OS == 'ios' ? (
                        <View style={{
                            position: 'absolute',
                            zIndex: 997,
                            width:deviceWidth,
                            bottom: ScreenUtil.scaleSize(95),
                            height: 1,
                            backgroundColor: '#FFFFFF',
                        }}/>
                    ) : (
                        null
                    )
                }

                <BlurView
                    style={{
                        position: "absolute",
                        height: ScreenUtil.scaleSize(110), left: 0, bottom: 0, right: 0,
                        zIndex: (this.props.state.viewRef != null ? 999 : -2)
                    }}
                    viewRef={this.props.state.viewRef}
                    blurType="light"
                    blurAmount={10}/>

                {this.renderMainTab(this.props.navigation.state.params)}

            </SafeAreaView>
        )
    }
}

function mapStateToProps(state) {
    return {
        state: state.MainScreen,
        appState: state.App,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        navigateNewReimbursement: navigateNewReimbursement,
        changeHomePageState: changeHomePageState,
        changeState: changeState,
        changeCompany: changeCompany,
        gotoNewReimbursement: gotoNewReimbursement,
        navigateNewLoanOrder: navigateNewLoanOrder,
        navigateNewTravelApply: navigateNewTravelApply,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MainScreen);

const styles = StyleSheet.create({
    reimbursementTextBig: {
        color: '#666666',
        fontSize: ScreenUtil.setSpText(9),
    },
    selectedCompanyName: {
        color: 'orange',
        fontSize: ScreenUtil.setSpText(9),
    }
});