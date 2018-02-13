/**
 * Created by caixiaowei on 17/10/24.
 */
import React, {Component} from 'react';
import {
    View,
    TextInput,
    Button,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Text,
    Platform,
    StyleSheet,
    NativeModules
} from 'react-native';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Store from 'react-native-simple-store';
import SplashScreen from "rn-splash-screen";
import {navigateRegister, navigateFindPassword} from '../../redux/actions/navigator/Navigator';
import {loginAction, changeState, loginInit} from '../../redux/actions/users/Login';

import CommonLoading from '../../containers/common/CommonLoading';
import Message from "../../constant/Message";
import ScreenUtil from "../../utils/ScreenUtil";
import Util from '../../utils/Util';
import {CustomStyles} from '../../css/CustomStyles';

var MyDeviceInfoModule = NativeModules.MyDeviceInfoModule;

class Login extends Component {
    static navigationOptions = {
        header: null
    }

    /**
     * 清空页面
     */
    componentWillMount() {
        if(Platform.OS != 'ios'){
            SplashScreen.hide();
        }
        this.props.changeState({
            password: '',
            passwordText: '',
            firstWord: '',
        });
        Store.get('userInfo').then((userInfo) => {
            //this.props.loginInit();
            if (userInfo != null) {
                this.props.changeState({
                    macAddress: userInfo.mac,
                    loginName: userInfo.phoneNumber,
                    password: userInfo.password
                });
                if (Util.checkIsEmptyString(userInfo)) {
                    Util.showToast(Message.MAC_ERROR)
                } else {
                    this.props.doLogin(userInfo);
                }
            }
        })
    }

    componentDidMount() {
        var that = this;
        Store.get('macAddress').then((macAddress) => {
            if (macAddress) {
                that.props.changeState({
                    macAddress: macAddress,
                });
            } else {
                MyDeviceInfoModule.getLocalMacAddressFromIp().then((macAddress) => {
                    that.props.changeState({
                        macAddress: macAddress
                    })
                    Store.save('macAddress', macAddress);
                })
            }
        })
    }

    /**
     * 手机号登录点击事件
     * @private
     */
    _onCheckPhone() {
        const that = this;
        const {loginName, password} = this.props.login;
        const dismissKeyboard = require('dismissKeyboard');
        dismissKeyboard();
        if (Util.checkIsEmptyString(loginName)) {
            Util.showToast(Message.REGISTER_EMPTY_PHONE)
        } else if (Util.checkIsEmptyString(password)) {
            Util.showToast(Message.LOGIN_EMPTY_PWD);
        } /*else if (!Util.checkPhone(loginName)) {
            Util.showToast(Message.FORMAT_ERROR_PHONE);
        }*/else {
            MyDeviceInfoModule.getLocalMacAddressFromIp().then((macAddress) => {
                if (macAddress) {
                    that.props.doLogin({
                        "mac": macAddress,
                        "phoneNumber": loginName,
                        "password": password
                    })
                } else {
                    Util.showToast(Message.MAC_ERROR);
                }
            })
        }
    }

    render() {
        const dismissKeyboard = require('dismissKeyboard');
        return (
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={styles.container}>

                    <CommonLoading isShow={this.props.login.isLoading}/>
                    <View style={{paddingHorizontal: ScreenUtil.scaleSize(120)}}>
                        <View style={styles.logoView}>
                            <Image source={require('./../../img/login/logo.png')} style={styles.logoIcon}/>
                            <Text style={styles.logoTxt}>{Message.APP_NAME}</Text>
                        </View>
                        <View style={[styles.inputRow, {marginTop: ScreenUtil.scaleSize(80)}]}>
                            <Text style={styles.inputLabel}>{Message.LOGIN_ACCOUNT}</Text>
                            <TextInput
                                style={styles.inputText}
                                placeholder={Message.REGISTER_INPUT_PHONE}
                                maxLength={11}
                                placeholderTextColor="#A5A5A5"
                                underlineColorAndroid="transparent"
                                ref="phone"
                                selectionColor="#FFAA00"
                                keyboardType="numeric"
                                value={this.props.login.loginName}
                                onChangeText={(text) => {
                                    this.props.changeState({loginName: text})
                                }}
                                returnKeyType={'done'}/>
                        </View>
                        <View style={CustomStyles.separatorLine}/>
                        <View style={styles.inputRow}>
                            <Text style={styles.inputLabel}>{Message.LOGIN_PASSWORD}</Text>
                            <TextInput
                                style={styles.inputText}
                                placeholder={Message.SET_PWD_INPUT}
                                maxLength={12}
                                placeholderTextColor="#A5A5A5"
                                underlineColorAndroid="transparent"
                                ref="password"
                                selectionColor="#FFAA00"
                                secureTextEntry={true}
                                value={this.props.login.passwordText}
                                onChangeText={(text) => {
                                    let textTemp = text.replace('•', this.props.login.firstWord);
                                    let password = textTemp;
                                    let first = password.substring(0, 1);
                                    textTemp = textTemp ? '•' + textTemp.substring(1) : '';
                                    this.props.changeState({
                                        password: password,
                                        passwordText: textTemp,
                                        firstWord: first,
                                    })
                                }}
                                returnKeyType={'done'}/>
                        </View>
                        <View style={CustomStyles.separatorLine}/>
                        <TouchableOpacity
                            style={styles.forgotView}
                            onPress={() => {
                                this.props.navigateFindPassword()
                            }}
                        >
                            <Text style={styles.forgotTxt}>{Message.LOGIN_FORGET_PWD}</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={{
                            marginTop: ScreenUtil.scaleSize(200),
                        }}
                        onPress={() => {
                            this._onCheckPhone()
                        }}>
                        <Image
                            style={styles.loginBtn}
                            source={require('./../../img/login/login.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.registerBtn]}
                        onPress={() => {
                            this.props.navigateToRegister()
                        }}>
                        <Text style={styles.registerBtnText}>{Message.LOGIN_REGISTER}</Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

function mapStateToProps(state) {
    return {
        login: state.Login,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        doLogin: loginAction,
        navigateFindPassword: navigateFindPassword,
        navigateToRegister: navigateRegister,
        changeState: changeState,
        loginInit: loginInit
    }, dispatch);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    logoView: {
        alignItems: 'center'
    },
    logoIcon: {
        width: ScreenUtil.scaleSize(146),
        height: ScreenUtil.scaleSize(151),
        marginTop: ScreenUtil.scaleSize(Platform.OS == 'ios' ? 120 : 100),
    },
    logoTxt: {
        marginTop: ScreenUtil.scaleSize(30),
        fontSize: ScreenUtil.setSpText(12),
        backgroundColor: 'transparent',
        color: 'gray'
    },
    forgotTxt: {
        fontSize: ScreenUtil.setSpText(7),
        color: '#A5A5A5',
        backgroundColor: 'transparent'
    },
    inputRow: {
        height: ScreenUtil.scaleSize(80),
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputLabel: {
        color: '#666666',
        fontSize: ScreenUtil.setSpText(9),
        width: ScreenUtil.scaleSize(120)
    },
    inputText: {
        marginLeft: ScreenUtil.scaleSize(30),
        fontSize: ScreenUtil.setSpText(9),
        padding: 0,
        flex: 1,
    },
    forgotView: {
        height: ScreenUtil.scaleSize(33),
        alignSelf: 'flex-end',
        marginTop: ScreenUtil.scaleSize(20)
    },
    loginBtn: {
        height: ScreenUtil.scaleSize(75),
        width: ScreenUtil.scaleSize(550),
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    registerBtn: {
        position: 'absolute',
        bottom: ScreenUtil.scaleSize(100),
        alignSelf: 'center',
    },
    registerBtnText: {
        color: '#ABABAB',
        fontSize: ScreenUtil.setSpText(7)
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);