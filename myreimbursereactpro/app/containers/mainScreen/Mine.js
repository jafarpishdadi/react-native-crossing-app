/**
 * Created by richard.ji on 2017/11/1.
 */
import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {Image, StyleSheet, Text, View, Platform, TouchableOpacity, TouchableWithoutFeedback,NativeModules} from "react-native";
import {
    navigatePersonalInformation,
    navigateModifyPasswordVerification,
    navigateSetUp,
    navigateAboutUs
} from "../../redux/actions/navigator/Navigator";
import {loadData,changeState,checkUpgrade} from "../../redux/actions/mine/Mine";
import Util from "../../utils/Util";
import ScreenUtil from "../../utils/ScreenUtil";
import Message from "../../constant/Message";
import Dialog from "../../containers/common/Dialog";
import {CustomStyles} from "../../css/CustomStyles";
import Header from "./../common/CommonHeader";
import API from '../../utils/API';
import Store from "react-native-simple-store";

var UpdateAppModule = NativeModules.UpdateAppModule;

class Mine extends Component {
    static navigationOptions = {
        tabBarLabel: Message.MINE,
        tabBarIcon: ({tintColor, focused}) => (
            <Image
                source={focused ? require('../../img/mainScreen/mine_selected.png') : require('../../img/mainScreen/mine_unselected.png')}
                style={CustomStyles.icon}
            />
        ),
    }

    componentDidMount() {
        this.props.loadData();
        const that = this;
        Store.get('token').then((tokenStr) => {
            if (tokenStr) {
                that.props.changeState({
                    token: tokenStr
                })
            }
        })
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
        return(
            <View style={{ flex:1, backgroundColor: '#F3F3F3'}}>
                <Header
                    titleText={Message.MINE}
                    thisComponent={this}
                    showBackIcon={false}
                    rightClick={this.props.navigateSetUp}
                    rightIcon={require('../../img/mine/set_up.png')}
                    rightIconStyle={{
                        width: ScreenUtil.scaleSize(42),
                        height: ScreenUtil.scaleSize(42),
                        resizeMode: 'stretch',
                    }}
                />
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
                <View style={styles.personalBaseInformationStyle}>
                    <View style={[styles.rowView, {marginTop: ScreenUtil.scaleSize(0)}]}>
                        <Text style={styles.nameLabel}>{this.props.state.userInfo.userName}</Text>
                    </View>
                    <View style={[CustomStyles.separatorLine, {marginTop: ScreenUtil.scaleSize(20)}]} />
                    <View style={styles.rowView}>
                        <Text style={styles.basicTextStyle}>{Message.COMPANY}</Text>
                        <Text Text numberOfLines={3}
                              style={[styles.TextViewInformation, {maxWidth: 300,}]}>{this.props.state.userInfo.enterpriseName}</Text>
                    </View>
                    <View style={styles.rowView}>
                        <Text style={styles.basicTextStyle}>{Message.PHONE}</Text>
                        <Text style={styles.TextViewInformation}>{this.props.state.userInfo.phone}</Text>
                    </View>
                    <View style={styles.rowView}>
                        <Text style={styles.basicTextStyle}>{Message.DEPARTMENT}</Text>
                        <Text style={styles.TextViewInformation}>{this.props.state.userInfo.orgDepName}</Text>
                    </View>
                    <View style={styles.rowView}>
                        <Text style={styles.basicTextStyle}>{Message.POSITION}</Text>
                        <Text style={styles.TextViewInformation}>{this.props.state.userInfo.positionName}</Text>
                    </View>
                </View>
                <View style={styles.touchableViewStyle}>
                    <TouchableOpacity onPress={() => {
                        this.props.navigatePersonalInformation({
                            sex: this.props.state.userInfo.sex,
                            birthday: this.props.state.userInfo.birthday,
                            area: this.props.state.userInfo.area,
                            areaId: this.props.state.userInfo.areaId,
                        })
                    }}>
                        <View style={styles.rowContainer}>
                            <Image
                                style={styles.labelImagesStyle}
                                source={require('./../../img/mine/personal_information.png')}/>
                            <Text style={styles.labelInformationStyle}>{Message.PERSONAL_INFORMATION}</Text>
                            <Image
                                style={styles.arrowIcon}
                                source={require('./../../img/common/arrow.png')}/>
                        </View>
                    </TouchableOpacity>
                    <View style={CustomStyles.separatorLine} />
                    <TouchableOpacity onPress={() => {
                        this.props.navigateModifyPasswordVerification()
                    }}>
                        <View style={styles.rowContainer}>
                            <Image
                                style={styles.labelImagesStyle}
                                source={require('./../../img/mine/modify_password.png')}/>
                            <Text style={styles.labelInformationStyle}>{Message.MODIFY_PASSWORD}</Text>
                            <Image
                                style={styles.arrowIcon}
                                source={require('./../../img/common/arrow.png')}/>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.touchableViewStyle}>
                    <TouchableOpacity onPress={() => {
                        if(Platform.OS == 'ios') {
                            UpdateAppModule.gotoAppstore();
                        }else{
                            this.props.checkUpgrade();
                        }
                    }}>
                        <View style={styles.rowContainer}>
                            <Image
                                style={styles.labelImagesStyle}
                                source={require('./../../img/mine/check_update.png')}/>
                            <Text
                                style={styles.labelInformationStyle}>{Platform.OS == 'ios' ? Message.POINT : Message.CHECK_UPDATE}</Text>
                            <Image
                                style={styles.arrowIcon}
                                source={require('./../../img/common/arrow.png')}/>
                        </View>
                    </TouchableOpacity>
                    <View style={CustomStyles.separatorLine}/>
                    <TouchableOpacity onPress={() => {
                        this.props.navigateAboutUs();
                    }}>
                        <View style={styles.rowContainer}>
                            <Image
                                style={styles.labelImagesStyle}
                                source={require('./../../img/mine/about_us.png')}/>
                            <Text style={styles.labelInformationStyle}>{Message.ABOUT_US}</Text>
                            <Image
                                style={styles.arrowIcon}
                                source={require('./../../img/common/arrow.png')}/>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

function mapStateToProps(state) {
    return {
        state: state.Mine,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        navigatePersonalInformation: navigatePersonalInformation,
        navigateModifyPasswordVerification: navigateModifyPasswordVerification,
        navigateSetUp: navigateSetUp,
        navigateAboutUs: navigateAboutUs,
        loadData: loadData,
        changeState:changeState,
        checkUpgrade:checkUpgrade
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Mine);

const styles = StyleSheet.create({
    rowView: {
        height: ScreenUtil.scaleSize(40),
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: ScreenUtil.scaleSize(30)
    },
    basicTextStyle: {
        fontSize: ScreenUtil.setSpText(9),
        color: '#ABABAB',
        width: ScreenUtil.scaleSize(206),
    },
    nameLabel: {
        color: '#666666',
        fontSize: ScreenUtil.setSpText(9)
    },
    TextViewInformation: {
        fontSize: ScreenUtil.setSpText(9),
        color: '#666666',
        flex: 1,
    },
    personalBaseInformationStyle: {
        height: ScreenUtil.scaleSize(382),
        marginHorizontal: ScreenUtil.scaleSize(20),
        borderRadius: ScreenUtil.scaleSize(8),
        backgroundColor: '#FFFFFF',
        marginTop: ScreenUtil.scaleSize(20),
        padding: ScreenUtil.scaleSize(20),

        shadowOffset: {width: 0, height: 1},
        shadowColor: 'rgba(0,0,0,0.3)',
        shadowOpacity: 1,
        shadowRadius: 2,

        elevation: 2,
    },
    separatorLine: {
        backgroundColor: '#DEDEDE',
        height: ScreenUtil.scaleSize(1)
    },
    touchableViewStyle: {
        marginTop: ScreenUtil.scaleSize(20),
        backgroundColor:'#FFFFFF',
        paddingHorizontal: ScreenUtil.scaleSize(30)
    },
    labelImagesStyle: {
        width: ScreenUtil.scaleSize(50),
        height: ScreenUtil.scaleSize(50),
    },
    labelInformationStyle: {
        flex:1,
        fontSize: ScreenUtil.setSpText(9),
        color: '#666666',
        marginLeft: ScreenUtil.scaleSize(20),
    },
    arrowIcon: {
        width: ScreenUtil.scaleSize(19),
        height: ScreenUtil.scaleSize(32),
        resizeMode: Image.resizeMode.contain,
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: ScreenUtil.scaleSize(80),
    }
});