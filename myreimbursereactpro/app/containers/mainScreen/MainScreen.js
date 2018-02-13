/**
 * 主界面
 * Created by sky.qian on 10/26/2017.
 */
import React, {Component} from "react";
import {TabNavigator} from 'react-navigation';
import ScreenUtil, {deviceWidth, deviceHeight} from '../../utils/ScreenUtil';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {navigateNewReimbursement, navigateNewLoanOrder, navigateNewTravelApply} from '../../redux/actions/navigator/Navigator';
import {
    Platform,
    View,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated,
    FlatList,
    Text,
    StyleSheet,
} from 'react-native';

import HomePage from './HomePage';
import Invoice from './Invoice';
import Report from './Report';
import Mine from './Mine';
import Nothing from './Nothing';
import {changeState as changeHomePageState, changeCompany} from '../../redux/actions/homePage/HomePage';
import CommonLoading from '../common/CommonLoading';
import {changeState, gotoNewReimbursement} from '../../redux/actions/mainScreen/MainScreen';
var DeviceInfo = require('react-native-device-info');
import Menu from '../common/Menu';


class MainScreen extends Component {
    static navigationOptions = {
        header: null
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

    render() {
        const phoneName = DeviceInfo.getModel();
        //底部tab选项
        const Main = TabNavigator({
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
        }, {
            initialRouteName: this.props.navigation.state.params ? this.props.navigation.state.params.tab : 'HomePage',
            animationEnabled: false, // 切换页面时是否有动画效果
            tabBarPosition: 'bottom',   //底部显示
            swipeEnabled: false,    //是否滑动切换tab
            tabBarOptions: {
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
            },
            backBehavior: 'none'
        });

        return (
            <View style={{flex: 1, backgroundColor: '#F3F3F3'}}>
                <CommonLoading isShow={this.props.state.isLoading}/>
                {
                    (this.props.state.companyOpen) ? (
                        <View style={{
                            position: 'absolute',
                            top: ScreenUtil.scaleSize(Platform.OS == 'ios' ? 128 : 93),
                            width: deviceWidth,
                            zIndex: 999,
                        }}>
                            <TouchableWithoutFeedback onPress={this.homePageBackClick.bind(this)}>
                                <View style={{
                                    backgroundColor: '#000000',
                                    height: deviceHeight,
                                    opacity: 0.45,
                                }} />
                            </TouchableWithoutFeedback>
                            <Animated.View style={{
                                position: 'absolute',
                                height: ScreenUtil.scaleSize(this.props.state.selectHeightMax),
                                backgroundColor: '#F9F9F9',
                                width: deviceWidth,
                                paddingHorizontal: ScreenUtil.scaleSize(30),
                            }}>
                                <FlatList
                                    data={this.props.state.companyArr}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({item, index}) => (
                                        <View>
                                            <TouchableOpacity onPress={() => {
                                                this.props.changeCompany(item);
                                            }} style={{
                                                height: ScreenUtil.scaleSize(80),
                                                justifyContent: 'center',
                                            }}>
                                                <Text style={this.renderSelectedCompany(item)}>{item.enterpriseName}</Text>
                                            </TouchableOpacity>
                                            {
                                                (index + 1 == this.props.state.companyArr.length) ? (
                                                    null
                                                ) : (
                                                    <View style={{
                                                        height: ScreenUtil.scaleSize(2),
                                                        backgroundColor: '#DEDEDE'
                                                    }} />
                                                )
                                            }
                                        </View>
                                    )}
                                />
                            </Animated.View>
                        </View>
                    ) : null
                }
                <View style={{
                    position: 'absolute',
                    zIndex: 998,
                    width:deviceWidth/5,
                    justifyContent: 'center',
                    alignItems: 'center',
                    bottom: 0,
                    paddingBottom: ScreenUtil.scaleSize(8),
                    left: deviceWidth/5*2,
                }}>
                    <TouchableOpacity onPress={() => {
                        //this.props.gotoNewReimbursement()
                        this.refs.menu.open();
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
                <Main/>
            </View>
        )
    }
}

function mapStateToProps(state) {
    return {
        state: state.MainScreen,
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