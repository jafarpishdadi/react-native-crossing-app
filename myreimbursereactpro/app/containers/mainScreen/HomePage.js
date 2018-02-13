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
    Modal,
    NativeModules,
    ScrollView,
  	RefreshControl,
    PixelRatio,
} from "react-native";
import ScreenUtil, {deviceWidth} from "../../utils/ScreenUtil";
import Message from "../../constant/Message";
import {CustomStyles} from "../../css/CustomStyles";
import API from "../../utils/API";
import {changeState, loadData, refreshData, changeCompany,setMessageCount} from "../../redux/actions/homePage/HomePage";
import {changeState as changeMainScreenState} from "../../redux/actions/mainScreen/MainScreen";
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
} from '../../redux/actions/navigator/Navigator';
import Util from '../../utils/Util';
import Loading from '../common/Loading';
import Store from "react-native-simple-store";
import Dialog from "../../containers/common/Dialog";
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
        )
    }

    componentDidMount() {
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
    }

    //选择公司
    select() {
        if (this.props.state.companyOpen) {
            this.props.changeState({companyOpen: false})
        } else {
            this.props.changeState({companyOpen: true});
            /*this.props.changeMainScreenState({
                companyOpen: true,
                companyArr: this.props.state.companyArr,
                selectCompany: this.props.state.selectCompanyWholeName,
                selectHeightMax: this.props.state.selectHeightMax,
            })*/
        }
    }

    /**
     * 关闭版本提示弹框
     */
    closeModal(){
        this.props.changeState({showUpgrade: false})
    }

    /**
     * app版本更新
     */
    upgradeApp(){

        if(Platform.OS == 'ios'){
            UpdateAppModule.gotoAppstore();
        }else{
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

        return(
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
                                justifyContent: 'center'}}
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
                                              this.props.setMessageCount(this.props.state.unreadMessageCount+1);
                                              RNBridgeModule.updateBadge(this.props.state.unreadMessageCount+1)
                                              this.props.navigateMyNotices();
                                          }}
                        >
                            <Image
                                source={require('../../img/homePage/remind.png')}
                                style={styles.remindIcon}
                            />
                            {
                                (this.props.state.unreadMessageCount > 0) ? (
                                    <View style={styles.msgCountView}>
                                        <Text style={styles.msgCount}>{this.props.state.unreadMessageCount}</Text>
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
                    }} />
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
                                    }} style={{
                                        height: ScreenUtil.scaleSize(80),
                                        justifyContent: 'center',
                                    }}>
                                        <Text style={{
                                            color: this.props.state.selectCompanyWholeName == item.enterpriseName ? 'orange' : '#666666',
                                            fontSize: ScreenUtil.setSpText(9),
                                        }}>{item.enterpriseName}</Text>
                                    </TouchableOpacity>
                                    {
                                        (index + 1 == this.props.state.companyArr.length) ? (
                                            null
                                        ) : (
                                            <View style={CustomStyles.separatorLine} />
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
                        }} />
                    </TouchableWithoutFeedback>
                </Modal>
                <Dialog
                    titleText={Message.HOME_PAGE_FOUND_NEW_VERSION}
                    content={Message.MINE_UPDATE_VERSION_CONTENT}
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
                            justifyContent: 'center'}}
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

                            this.props.setMessageCount(this.props.state.unreadMessageCount+1);
                            RNBridgeModule.updateBadge(this.props.state.unreadMessageCount+1)
                            this.props.navigateMyNotices();
                        }}
                    >
                        <Image
                            source={require('../../img/homePage/remind.png')}
                            style={styles.remindIcon}
                        />
                        {
                            (this.props.state.unreadMessageCount > 0) ? (
                                <View style={styles.msgCountView}>
                                    <Text style={styles.msgCount}>{this.props.state.unreadMessageCount}</Text>
                                </View>
                            ) : (
                                null
                            )
                        }
                    </TouchableOpacity>
                </View>

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
                                        <Text style={styles.moduleTextSmall}>{Message.APPROVAL_ON + this.props.state.applicationCount + Message.TIAO + '    ' + Message.AMOUNT_TOTAL + this.props.state.applicationAmount + Message.YUAN}</Text>
                                    </View>
                                    <Image
                                        source={require('../../img/homePage/right.png')}
                                        style={styles.rightIcon}
                                    />
                                </View>
                            </TouchableWithoutFeedback>

                            <View style={CustomStyles.separatorLine} />

                            <TouchableWithoutFeedback onPress={this.props.navigateAuditList}>
                                <View style={styles.module}>
                                    <Image
                                        source={require('../../img/homePage/approval.png')}
                                        style={styles.moduleIcon}
                                    />
                                    <View style={styles.moduleTextView}>
                                        <Text style={styles.moduleTextBig}>{Message.APPROVAL}</Text>
                                        <Text style={styles.moduleTextSmall}>{Message.APPROVAL_WAIT + this.props.state.approvalCount + Message.TIAO + '    ' + Message.AMOUNT_TOTAL + this.props.state.approvalAmount + Message.YUAN}</Text>
                                    </View>
                                    <Image
                                        source={require('../../img/homePage/right.png')}
                                        style={styles.rightIcon}
                                    />
                                </View>
                            </TouchableWithoutFeedback>

                            <View style={CustomStyles.separatorLine} />

                            <TouchableWithoutFeedback onPress={this.props.navigateTravelApplyList}>
                                <View style={styles.module}>
                                    <Image
                                        source={require('../../img/homePage/travel.png')}
                                        style={styles.moduleIcon}
                                    />
                                    <View style={styles.moduleTextView}>
                                        <Text style={styles.moduleTextBig}>{Message.HOMEPAGE_TRAVEL}</Text>
                                        <Text style={styles.moduleTextSmall}>{Message.APPROVAL_ON  + 'X' + Message.TIAO + '    ' + Message.AMOUNT_TOTAL + 'X' + Message.YUAN}</Text>
                                    </View>
                                    <Image
                                        source={require('../../img/homePage/right.png')}
                                        style={styles.rightIcon}
                                    />
                                </View>
                            </TouchableWithoutFeedback>

                            <View style={CustomStyles.separatorLine} />

                            <TouchableWithoutFeedback onPress={this.props.navigateLoanOrderList}>
                                <View style={styles.module}>
                                    <Image
                                        source={require('../../img/homePage/loan.png')}
                                        style={styles.moduleIcon}
                                    />
                                    <View style={styles.moduleTextView}>
                                        <Text style={styles.moduleTextBig}>{Message.HOMEPAGE_LOAN}</Text>
                                        <Text style={styles.moduleTextSmall}>{Message.APPROVAL_ON + 'X' + Message.TIAO + '    ' + Message.AMOUNT_TOTAL + 'X' + Message.YUAN + '    ' + Message.NO_REPAY_AMOUNT + 'X' + Message.YUAN}</Text>
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
                                                <Text style={styles.reimbursementTextBig}>{Util.getReimbursementTitle(item)}</Text>
                                            </View>
                                            <View style={{
                                                height: ScreenUtil.scaleSize(33),
                                                justifyContent: 'center',
                                                marginTop: ScreenUtil.scaleSize(20),
                                            }}>
                                                <Text style={styles.reimbursementTextSmall}>{Util.getFormStateName(item.formState)}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity onPress={() => {
                                            this.props.navigateReimbursementDetail({
                                                formId: item.formId
                                            })
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
        navigateAuditList:navigateAuditList,
        navigateReimbursementDetail: navigateReimbursementDetail,
        loadData: loadData,
        setMessageCount:setMessageCount,
        changeMainScreenState: changeMainScreenState,
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
        height: ScreenUtil.scaleSize(30),
        position: 'absolute',
        right: ScreenUtil.scaleSize(10),
        bottom: ScreenUtil.scaleSize(30),
        backgroundColor:'red',
        borderRadius: ScreenUtil.scaleSize(15),
        alignItems: 'center',
        justifyContent: 'center',
    },
    msgCount: {
        fontSize:ScreenUtil.setSpText(7),
        color:'white',
        backgroundColor:'transparent',
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
        marginLeft:ScreenUtil.scaleSize(30),
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
});