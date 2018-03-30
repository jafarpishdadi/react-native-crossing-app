/**
 * 首页
 * Created by sky.qian on 10/26/2017.
 */
import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
    Image,
    StyleSheet,
    Text,
    View,
    FlatList,
    Platform,
    Animated,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TouchableHighlight,
    Modal,
    NativeModules,
    ScrollView,
    RefreshControl,
    PixelRatio,
    findNodeHandle,
    DeviceEventEmitter,
    BackAndroid
} from "react-native";
import ScreenUtil, {deviceWidth} from "../../utils/ScreenUtil";
import Message from "../../constant/Message";
import {CustomStyles} from "../../css/CustomStyles";
import {
    changeState,
    loadData,
    refreshData,
    changeCompany,
    setMessageCount,
    uploadBPushData
} from "../../redux/actions/homePage/HomePage";
import {changeState as changeAppState} from "../../redux/actions/App";
import {
    navigateFindPassword,
    back,
    navigateApplicationList,
    navigateAuditList,
    navigateReimbursementReply,
    navigateMyNotices,
    navigateNewInvoice,
    navigateReimbursementDetail,
    navigateScanQrCodeError,
    navigateCostSharing,
    navigateSelectWriteOffLoan,
    navigateTravelApply,
    navigateNewTravelApply,
    navigateTravelApplyDetail,
    navigateTravelApplyList,
    navigateLoanOrderList,
    navigateLoanOrderDetail
} from "../../redux/actions/navigator/Navigator";
import Util from "../../utils/Util";
import Loading from "../common/Loading";
import Store from "react-native-simple-store";
import Dialog from "../../containers/common/Dialog";
import {BlurView} from "react-native-blur";
import PercentageCircle from "react-native-percentage-circle";
var UpdateAppModule = NativeModules.UpdateAppModule;
var RNBridgeModule = NativeModules.RNBridgeModule;

class HomePage extends Component {
    static navigationOptions = {
        tabBarLabel: Message.HOMEPAGE,
        tabBarIcon: ({tintColor, focused}) => (
            <Image
                source={focused ? require('../../img/mainScreen/home_selected.png') : require('../../img/mainScreen/home_unselected.png')}
                style={CustomStyles.icon}
            />
        ),
        tabBarOnPress: ({route, index}, jumpToIndex) => {
            DeviceEventEmitter.emit('setHomePageTab');
            jumpToIndex(index);
        }
    }

    componentDidMount() {
        this.upLoadBPushUserInfo();
        this.props.loadData(this.props.state.isFirst);
        //RNBridgeModule.updateBadge(10);
        const that = this;
        Store.get('token').then((tokenStr) => {
            if (tokenStr) {
                that.props.changeState({
                    token: tokenStr
                })
            }
        })

        this.hideBlurSubscription = DeviceEventEmitter.addListener('hideBlurTabOne', ()=>this.blurAction('0'));
        this.showBlurSubscription = DeviceEventEmitter.addListener('showBlurTabOne', ()=>this.blurAction('1'));
        this.updateSubscription = DeviceEventEmitter.addListener('updateProcess', (percent)=>this.updateProcess(percent));
        this.forceUpdateSubscription = DeviceEventEmitter.addListener('forceUpdateFail', ()=>this.forceUpdateFail());
        this.setHomePageTab = DeviceEventEmitter.addListener('setHomePageTab', ()=>this.setTab());
    }

    /**
     * 更新进度条
     * @param percent：进度条百分比
     */
    updateProcess(percent) {
        this.props.changeState({process: percent});
    }

    /**
     * 更新失败
     */
    forceUpdateFail() {
        Util.showToast(Message.LOGIN_DOWNLOAD_FAIL);
        this.timer = setInterval(
            () => {
                BackAndroid.exitApp();
            },
            1000
        );
    }

    /**
     * 组件卸载
     * 清除定时器，监听器
     */
    componentWillUnmount() {
        this.hideBlurSubscription.remove();
        this.showBlurSubscription.remove();
        this.updateSubscription.remove();
        this.forceUpdateSubscription.remove();
        this.setHomePageTab.remove();
    }

    setTab() {
        const that = this;
        setTimeout(() => {
            that.props.changeAppState({
                currentTab: 'HomePage'
            })
        }, 100);
    }

    /**
     * 上传在百度注册的推送服务相关数据
     */
    upLoadBPushUserInfo() {
        var thiz = this;

        if (Platform.OS === 'ios') {
            //上传在百度注册的推送服务相关数据
            RNBridgeModule.getBPushUserInfo((bPushUserInfo)=> {
                if (bPushUserInfo && !Util.checkIsEmptyString(bPushUserInfo.channel_id)) {
                    thiz.props.uploadBPushDataAction(bPushUserInfo.channel_id);
                }
            });

            //判断是否有推送消息的数据（是否是从推送消息进入应用的）
            RNBridgeModule.getBPushInfo((pushInfo) => {
                //若有数据，及是通过推送消息打开的app，则直接跳转详情页或列表页
                if (pushInfo) {
                    thiz.props.navigateMyNotices();
                }
            })
        } else {
            //上传在百度注册的推送服务相关数据
            RNBridgeModule.getBPushUserInfo((app_id, user_id, channel_id, request_id)=> {
                if (!Util.checkIsEmptyString(channel_id)) {
                    thiz.props.uploadBPushDataAction(channel_id);
                }
            });

            //判断是否有推送消息的数据（是否是从推送消息进入应用的）
            RNBridgeModule.getBPushInfo((data) => {
                //若有数据，及是通过推送消息打开的app，则直接跳转详情页或列表页
                data = Util.jsonParse(data);

                if (data != null) {
                    thiz.props.navigateMyNotices();
                }
            })
        }
    }

    //选择公司
    select() {
        if (this.props.state.companyOpen) {
            this.props.changeState({companyOpen: false})
        } else {
            this.props.changeState({companyOpen: true});
        }
    }

    /**
     * 关闭版本提示弹框
     */
    closeModal() {
        this.props.changeState({showUpgrade: false})
    }

    /**
     * 模糊相关操作
     */
    blurAction(type) {
        if (type == '1') {
            this.props.changeState({viewRef: findNodeHandle(this.refs.blurView)});
        } else {
            this.props.changeState({viewRef: null});
        }
    }

    /**
     * app版本更新
     */
    upgradeApp() {

        if (Platform.OS == 'ios') {
            UpdateAppModule.gotoAppstore();
        } else {
            Util.showToast(Message.APP_DOWNLOADING);
            UpdateAppModule.update(this.props.state.versionData.versionAddress, (resultCode)=> {
                if (resultCode == '0') {
                    Util.showToast(Message.IS_BEING_UPDATE);
                }
            });
        }
    }

    render() {
        const selectIcon = this.props.state.companyOpen ? (
            require('../../img/homePage/up.png')
        ) : (
            require('../../img/homePage/down.png')
        );

        return (
            <View style={{flex: 1, backgroundColor: '#F3F3F3'}}>

                <Loading isShow={this.props.state.isLoading}/>
                <Modal
                    transparent={true}
                    visible={this.props.state.companyOpen}
                    onRequestClose={() => {
                        this.props.changeState({
                            companyOpen: false
                        })
                    }}
                >
                    <View style={[styles.header, {
                        height: ScreenUtil.scaleSize(Platform.OS == 'ios' ? (Util.isIphoneX() ? 172 : 128) : 93),
                        paddingTop: ScreenUtil.scaleSize(Platform.OS == 'ios' ? (Util.isIphoneX() ? 79 : 35) : 0),
                    }]}>
                        <TouchableOpacity onPress={this.select.bind(this)}>
                            <Text
                                numberOfLines={1}
                                style={{
                                    color: '#666666',
                                    fontSize: ScreenUtil.setSpText(12),
                                }}>{this.props.state.selectCompany}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                height: ScreenUtil.scaleSize(93),
                                width: ScreenUtil.scaleSize(26),
                                justifyContent: 'center'
                            }}
                            onPress={this.select.bind(this)}>
                            <Image
                                source={selectIcon}
                                style={styles.companySelectIcon}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.myNoticeIcons}
                                          onPress={() => {
                                              this.props.changeState({
                                                  companyOpen: false,
                                              });
                                              this.props.navigateMyNotices();
                                          }}
                        >
                            <Image
                                source={require('../../img/homePage/remind.png')}
                                style={styles.remindIcon}
                            />
                            {
                                (this.props.state.unreadMessageCount > 0) ? (
                                    <View
                                        style={[styles.msgCountView, {width: this.props.state.unreadMessageCount > 99 ? ScreenUtil.scaleSize(40) : ScreenUtil.scaleSize(30)}]}>
                                        <Text
                                            style={styles.msgCount}>{this.props.state.unreadMessageCount > 99 ? 99 + '+' : this.props.state.unreadMessageCount}</Text>
                                    </View>
                                ) : (
                                    null
                                )
                            }
                        </TouchableOpacity>
                    </View>
                    <View style={{
                        height: ScreenUtil.scaleSize(1),
                        width: deviceWidth,
                        backgroundColor: '#DEDEDE',
                    }}/>
                    <View style={{
                        height: ScreenUtil.scaleSize(this.props.state.selectHeightMax),
                        backgroundColor: '#F9F9F9',
                        width: deviceWidth,
                        paddingHorizontal: ScreenUtil.scaleSize(30),
                    }}>
                        {
                            this.props.state.companyArr.map((item, index) => (
                                <View>
                                    <TouchableOpacity onPress={() => {
                                        this.props.changeState({
                                            companyOpen: false,
                                        });
                                        this.props.changeCompany(item);
                                    }}>
                                        <View style={{
                                            height: ScreenUtil.scaleSize(80),
                                            justifyContent: 'space-between',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}>
                                            <Text style={{
                                                color: this.props.state.selectCompanyWholeName == item.enterpriseName ? 'orange' : '#666666',
                                                fontSize: ScreenUtil.setSpText(9),
                                            }}>{item.enterpriseName}</Text>
                                            {
                                                item.messageCount > 0 ? (
                                                    <View style={{
                                                        height: ScreenUtil.scaleSize(40),
                                                        width: ScreenUtil.scaleSize(60),
                                                        borderRadius: ScreenUtil.scaleSize(20),
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        backgroundColor: 'red',
                                                    }}>
                                                        <Text style={{
                                                            fontSize: ScreenUtil.setSpText(7),
                                                            color: 'white',
                                                        }}>{item.messageCount > 99 ? '99+' : item.messageCount}</Text>
                                                    </View>
                                                ) : null
                                            }
                                        </View>
                                    </TouchableOpacity>
                                    {
                                        (index + 1 == this.props.state.companyArr.length) ? (
                                            null
                                        ) : (
                                            <View style={CustomStyles.separatorLine}/>
                                        )
                                    }
                                </View>
                            ))
                        }
                    </View>
                    <TouchableWithoutFeedback onPress={() => {
                        this.props.changeState({
                            companyOpen: false,
                        })
                    }}>
                        <View style={{
                            backgroundColor: '#000000',
                            flex: 1,
                            opacity: 0.45,
                        }}/>
                    </TouchableWithoutFeedback>
                </Modal>


                <Modal
                    transparent={true}
                    visible={this.props.state.forceUpgrade}
                    onRequestClose={() => {
                    }}
                >
                    <View style={[styles.containerProcess]}>
                        <View style={styles.downloading}>
                            <View style={{
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexWrap: 'nowrap',
                                width: ScreenUtil.scaleSize(220),
                                height: ScreenUtil.scaleSize(220)
                            }}>
                                <PercentageCircle radius={35} percent={this.props.state.process} color={"#3498db"}/>
                                <Text style={styles.loadingText}>
                                    {Message.LOGIN_DOWNLOADING}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Dialog
                    titleText={Message.HOME_PAGE_FOUND_NEW_VERSION}
                    content={this.props.state.versionData.content}
                    type={'confirm'}
                    leftBtnText={Message.MINE_UPDATE_VERSION_NEXT_TIME}
                    rightBtnText={Message.MINE_UPDATE_VERSION_NOW}
                    modalVisible={this.props.state.showUpgrade}
                    leftBtnStyle={{color: '#A5A5A5',}}
                    rightBtnStyle={{color: '#FFAA00',}}
                    onClose={this.closeModal.bind(this)}
                    leftBtnClick={this.closeModal.bind(this)}
                    rightBtnClick={this.upgradeApp.bind(this)}
                    thisComponent={this}
                />

                <Dialog
                    titleText={Message.HOME_PAGE_FOUND_NEW_VERSION}
                    content={this.props.state.versionData.content}
                    type={'alert'}
                    alertBtnText={Message.MINE_UPDATE_VERSION_NOW}
                    modalVisible={this.props.state.iosForceUpgrade}
                    alertBtnStyle={{color: '#FFAA00',}}
                    alertBtnClick={this.upgradeApp.bind(this)}
                    thisComponent={this}
                />

                <BlurView
                    style={{
                        position: "absolute",
                        top: 0, left: 0, bottom: 0, right: 0,
                        flex: 1,
                        zIndex: (this.props.state.viewRef != null ? 300 : -99)
                    }}
                    viewRef={this.props.state.viewRef}
                    blurType="light"
                    blurAmount={10}/>

                <View ref="blurView" style={{flex: 1, backgroundColor: '#FFFFFF'}}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={this.select.bind(this)}>
                            <Text
                                numberOfLines={1}
                                style={{
                                    color: '#666666',
                                    fontSize: ScreenUtil.setSpText(12),
                                }}>{this.props.state.selectCompany}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                height: ScreenUtil.scaleSize(93),
                                width: ScreenUtil.scaleSize(26),
                                justifyContent: 'center'
                            }}
                            onPress={this.select.bind(this)}>
                            <Image
                                source={selectIcon}
                                style={styles.companySelectIcon}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.myNoticeIcons}
                                          onPress={() => {
                                              this.props.changeState({
                                                  companyOpen: false,
                                              });

                                              this.props.navigateMyNotices();
                                          }}
                        >
                            <Image
                                source={require('../../img/homePage/remind.png')}
                                style={styles.remindIcon}
                            />
                            {
                                (this.props.state.unreadMessageCount > 0) ? (
                                    <View
                                        style={[styles.msgCountView, {width: this.props.state.unreadMessageCount > 99 ? ScreenUtil.scaleSize(40) : ScreenUtil.scaleSize(30)}]}>
                                        <Text
                                            style={styles.msgCount}>{this.props.state.unreadMessageCount > 99 ? 99 + '+' : this.props.state.unreadMessageCount}</Text>
                                    </View>
                                ) : (
                                    null
                                )
                            }
                        </TouchableOpacity>
                    </View>
                    {
                        (this.props.state.hasOtherMessage && this.props.state.showOtherMessage)  ? (
                            <View style={styles.noticeView}>
                                <Text style={[styles.noticeText]}
                                      onPress={this.select.bind(this)}>{Message.MORE_NOTICE}</Text>
                                <TouchableWithoutFeedback style={{
                                    height: ScreenUtil.scaleSize(40),
                                }} onPress={() => {
                                    this.props.changeState({
                                        hasOtherMessage: false,
                                        showOtherMessage: false,
                                    })
                                }}>
                                    <Image style={[styles.tipCloseIcon]}
                                           source={require('../../img/mainScreen/close.png')}/>
                                </TouchableWithoutFeedback>
                            </View>
                        ) : null
                    }

                    <View style={{
                        backgroundColor: '#F3F3F3',
                        flex: 1,
                    }}>
                        <ScrollView refreshControl={
                            <RefreshControl
                                refreshing={this.props.state.isRefreshing}
                                onRefresh={() => {
                                    this.props.refreshData()
                                }}
                            />
                        } showsVerticalScrollIndicator={false}>
                            <TouchableWithoutFeedback>
                                <Image
                                    source={require('../../img/homePage/banner.png')}
                                    style={styles.bannerIcon}
                                />
                            </TouchableWithoutFeedback>

                            <View style={{
                                paddingHorizontal: ScreenUtil.scaleSize(30),
                                backgroundColor: '#FFFFFF'
                            }}>
                                <TouchableWithoutFeedback onPress={this.props.navigateApplicationList}>
                                    <View style={styles.module}>
                                        <Image
                                            source={require('../../img/homePage/reimbursement.png')}
                                            style={styles.moduleIcon}
                                        />
                                        <View style={styles.moduleTextView}>
                                            <Text style={styles.moduleTextBig}>{Message.REIMBURSEMENT}</Text>
                                            <Text
                                                style={styles.moduleTextSmall}>{Message.APPROVAL_ON + this.props.state.applicationCount + Message.TIAO + '    ' + Message.AMOUNT_TOTAL + this.props.state.applicationAmount + Message.YUAN}</Text>
                                        </View>
                                        <Image
                                            source={require('../../img/homePage/right.png')}
                                            style={styles.rightIcon}
                                        />
                                    </View>
                                </TouchableWithoutFeedback>

                                <View style={CustomStyles.separatorLine}/>

                                <TouchableWithoutFeedback onPress={this.props.navigateAuditList}>
                                    <View style={styles.module}>
                                        <Image
                                            source={require('../../img/homePage/approval.png')}
                                            style={styles.moduleIcon}
                                        />
                                        <View style={styles.moduleTextView}>
                                            <Text style={styles.moduleTextBig}>{Message.APPROVAL}</Text>
                                            <Text
                                                style={styles.moduleTextSmall}>{Message.APPROVAL_WAIT + this.props.state.approvalCount + Message.TIAO}</Text>
                                        </View>
                                        <Image
                                            source={require('../../img/homePage/right.png')}
                                            style={styles.rightIcon}
                                        />
                                    </View>
                                </TouchableWithoutFeedback>

                                <View style={CustomStyles.separatorLine}/>

                                <TouchableWithoutFeedback onPress={this.props.navigateTravelApplyList}>
                                    <View style={styles.module}>
                                        <Image
                                            source={require('../../img/homePage/travel.png')}
                                            style={styles.moduleIcon}
                                        />
                                        <View style={styles.moduleTextView}>
                                            <Text style={styles.moduleTextBig}>{Message.HOMEPAGE_TRAVEL}</Text>
                                            <Text
                                                style={styles.moduleTextSmall}>{Message.APPROVAL_ON + this.props.state.travelCount + Message.TIAO}</Text>
                                        </View>
                                        <Image
                                            source={require('../../img/homePage/right.png')}
                                            style={styles.rightIcon}
                                        />
                                    </View>
                                </TouchableWithoutFeedback>

                                <View style={CustomStyles.separatorLine}/>

                                <TouchableWithoutFeedback onPress={this.props.navigateLoanOrderList}>
                                    <View style={styles.module}>
                                        <Image
                                            source={require('../../img/homePage/loan.png')}
                                            style={styles.moduleIcon}
                                        />
                                        <View style={styles.moduleTextView}>
                                            <Text style={styles.moduleTextBig}>{Message.HOMEPAGE_LOAN}</Text>
                                            <Text style={styles.moduleTextSmall} ellipsizeMode='tail' numberOfLines={1}>
                                                {Message.APPROVAL_ON + this.props.state.loanCount + Message.TIAO + '    ' + Message.AMOUNT_TOTAL + this.props.state.loanAmount + Message.YUAN + '    ' + Message.NO_REPAY_AMOUNT + this.props.state.loanNoPayAmount + Message.YUAN}
                                            </Text>
                                        </View>
                                        <Image
                                            source={require('../../img/homePage/right.png')}
                                            style={styles.rightIcon}
                                        />
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>

                            {
                                this.props.state.reimbursementList.map((item, index) => (
                                    <View style={{
                                        paddingHorizontal: ScreenUtil.scaleSize(30),
                                        backgroundColor: '#FFFFFF',
                                        marginTop: ScreenUtil.scaleSize(index == 0 ? 20 : 0),
                                    }}>
                                        <View style={styles.reimbursement}>
                                            <View>
                                                <View style={{
                                                    height: ScreenUtil.scaleSize(40),
                                                    justifyContent: 'center',
                                                    marginTop: ScreenUtil.scaleSize(20),
                                                }}>
                                                    <Text
                                                        style={styles.reimbursementTextBig}>{Util.getReimbursementTitle(item)}</Text>
                                                </View>
                                                <View style={{
                                                    height: ScreenUtil.scaleSize(33),
                                                    justifyContent: 'center',
                                                    marginTop: ScreenUtil.scaleSize(20),
                                                }}>
                                                    <Text
                                                        style={styles.reimbursementTextSmall}>{Util.getFormStateName(item.formState)}</Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity onPress={() => {
                                                if (item.formTypeCode == '1' || item.formTypeCode == '100001') {
                                                    this.props.navigateReimbursementDetail({
                                                        formId: item.formId
                                                    })
                                                } else if (item.formTypeCode == '100003') {
                                                    this.props.navigateLoanOrderDetail({
                                                        formId: item.formId,
                                                        source: 'homePage'
                                                    })
                                                } else if (item.formTypeCode == '100004') {
                                                    this.props.navigateTravelApplyDetail({
                                                        travelApplyDetail: item.formId,
                                                        source: 'homePage'
                                                    })
                                                }
                                            }} style={{
                                                alignSelf: 'center'
                                            }}>
                                                <Image
                                                    source={require('../../img/homePage/look.png')}
                                                    style={styles.lookIcon}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        {
                                            index + 1 == this.props.state.reimbursementList.length ? (
                                                null
                                            ) : (
                                                <View style={{
                                                    height: 1 / PixelRatio.get(),
                                                    backgroundColor: '#DEDEDE',
                                                }}/>
                                            )
                                        }
                                    </View>
                                ))
                            }
                        </ScrollView>
                    </View>
                </View>
            </View>
        )
    }
}

function mapStateToProps(state) {
    return {
        state: state.HomePage,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changeState: changeState,
        navigateFindPassword: navigateFindPassword,
        back: back,
        navigateApplicationList: navigateApplicationList,
        navigateReimbursementReply: navigateReimbursementReply,
        navigateMyNotices: navigateMyNotices,
        navigateNewInvoice: navigateNewInvoice,
        navigateAuditList: navigateAuditList,
        navigateReimbursementDetail: navigateReimbursementDetail,
        loadData: loadData,
        setMessageCount: setMessageCount,
        navigateScanQrCodeError: navigateScanQrCodeError,
        refreshData: refreshData,
        changeCompany: changeCompany,
        navigateCostSharing: navigateCostSharing,   //成本中心--费用分摊页面
        navigateSelectWriteOffLoan: navigateSelectWriteOffLoan, //选择核销借款
        navigateTravelApply: navigateTravelApply, //选择出差申请
        navigateNewTravelApply: navigateNewTravelApply, //新建差旅申请单
        navigateTravelApplyDetail: navigateTravelApplyDetail, //差旅申请单详情
        navigateTravelApplyList: navigateTravelApplyList, //差旅申请列表
        navigateLoanOrderList: navigateLoanOrderList,
        uploadBPushDataAction: uploadBPushData,
        navigateLoanOrderDetail: navigateLoanOrderDetail,
        changeAppState: changeAppState,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);

const styles = StyleSheet.create({
    header: {
        height: ScreenUtil.scaleSize(Platform.OS == 'ios' ? 128 : 93),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: ScreenUtil.scaleSize(Platform.OS == 'ios' ? 35 : 0),
        backgroundColor: '#FFFFFF',

        shadowOffset: {width: 0, height: 0},
        shadowColor: 'rgba(167,167,167,0.3)',
        shadowOpacity: 1,
        shadowRadius: 2,
        elevation: 1,
        zIndex: 500,
    },
    companySelectIcon: {
        width: ScreenUtil.scaleSize(16),
        height: ScreenUtil.scaleSize(8),
        resizeMode: 'contain',
        alignSelf: 'flex-start',
        marginLeft: ScreenUtil.scaleSize(10),
    },
    myNoticeIcons: {
        width: ScreenUtil.scaleSize(90),
        height: ScreenUtil.scaleSize(90),
        position: 'absolute',
        right: 0,
        bottom: ScreenUtil.scaleSize(24)
    },
    remindIcon: {
        width: ScreenUtil.scaleSize(29),
        height: ScreenUtil.scaleSize(40),
        resizeMode: 'contain',
        position: 'absolute',
        right: ScreenUtil.scaleSize(30),
        bottom: ScreenUtil.scaleSize(1),
    },
    dotIcon: {
        width: ScreenUtil.scaleSize(8),
        height: ScreenUtil.scaleSize(8),
        resizeMode: 'contain',
        position: 'absolute',
        right: ScreenUtil.scaleSize(26),
        bottom: ScreenUtil.scaleSize(36),
    },

    msgCountView: {
        width: ScreenUtil.scaleSize(30),
        height: ScreenUtil.scaleSize(24),
        position: 'absolute',
        right: ScreenUtil.scaleSize(10),
        bottom: ScreenUtil.scaleSize(30),
        backgroundColor: 'red',
        borderRadius: ScreenUtil.scaleSize(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    msgCount: {
        fontSize: ScreenUtil.setSpText(6),
        color: 'white',
        backgroundColor: 'transparent',
    },
    bannerIcon: {
        width: deviceWidth,
        height: ScreenUtil.scaleSize(240),
        resizeMode: 'stretch',
    },
    module: {
        flexDirection: 'row',
        alignItems: 'center',
        height: ScreenUtil.scaleSize(130),
    },
    moduleIcon: {
        width: ScreenUtil.scaleSize(70),
        height: ScreenUtil.scaleSize(70),
        resizeMode: 'contain',
    },
    moduleTextView: {
        flex: 1,
        marginLeft: ScreenUtil.scaleSize(30),
    },
    moduleTextBig: {
        fontWeight: 'bold',
        color: '#666666',
        fontSize: ScreenUtil.setSpText(9),
    },
    moduleTextSmall: {
        color: '#ABABAB',
        fontSize: ScreenUtil.setSpText(7),
        marginTop: ScreenUtil.scaleSize(15),
    },
    rightIcon: {
        width: ScreenUtil.scaleSize(19),
        height: ScreenUtil.scaleSize(32),
        resizeMode: 'contain',
    },
    reimbursement: {
        height: ScreenUtil.scaleSizeNew(133),
        flexDirection: 'row',
        paddingRight: ScreenUtil.scaleSize(1),
        justifyContent: 'space-between',
    },
    reimbursementTextBig: {
        color: '#666666',
        fontSize: ScreenUtil.setSpText(9),
    },
    reimbursementTextSmall: {
        color: '#ABABAB',
        fontSize: ScreenUtil.setSpText(7),
    },
    lookIcon: {
        width: ScreenUtil.scaleSize(117),
        height: ScreenUtil.scaleSize(53),
        resizeMode: 'contain',
    },
    noticeView: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        width: deviceWidth,
        height: ScreenUtil.scaleSize(40),
        paddingLeft: ScreenUtil.scaleSize(15),
        top: ScreenUtil.scaleSize(Platform.OS == 'ios' ? 128 : 93),
        zIndex: 20,
        justifyContent: 'center',
        backgroundColor: '#FB6458',
        opacity: 0.6
    },

    noticeText: {
        flex: 1,
        color: '#fff',
        textAlign: 'center',
        includeFontPadding: false,
        fontSize: ScreenUtil.scaleSize(24)
    },


    tipCloseIcon: {
        height: ScreenUtil.scaleSize(15),
        width: ScreenUtil.scaleSize(50),
        resizeMode: Image.resizeMode.contain,
    },

    containerProcess: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    downloading: {
        backgroundColor: '#000000',
        opacity: 0.8,
        borderRadius: ScreenUtil.scaleSize(8),
        padding: ScreenUtil.scaleSize(20),
    },
    loadingText: {
        color: '#ffffff',
        fontSize: ScreenUtil.scaleSize(20),
        marginTop: ScreenUtil.scaleSize(20),
        textAlign: 'center',
    },
});