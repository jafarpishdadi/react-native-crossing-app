/**
 * Created by richard.ji on 2017/10/31.
 */

import React, {Component} from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Text,
    CheckBox,
    Platform,
    Image,
    StyleSheet,
    NativeModules
} from 'react-native';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {registerPasswordAction, changeState,registerPasswordInit} from '../../redux/actions/users/RegisterPassword';
import {back} from '../../redux/actions/navigator/Navigator';
import Header from "./../common/CommonHeader";
import Message from "../../constant/Message";
import ScreenUtil from "../../utils/ScreenUtil";
import Util from '../../utils/Util';
import Dialog from '../../containers/common/Dialog';
import Store from 'react-native-simple-store';
import {CustomStyles} from '../../css/CustomStyles';
import SafeAreaView from "react-native-safe-area-view";
var MyDeviceInfoModule = NativeModules.MyDeviceInfoModule;

class RegisterPassword extends Component {

    static navigationOptions = ({navigation}) => ({
        header: null,
    })

    /**
     * 清空页面
     */
    componentWillMount() {
        this.props.registerPasswordInit();
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
                })
            }
        })
    }

    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        component.props.back();
    }

    /**
     * 检查提交数据
     */
    checkData() {
        const dismissKeyboard = require('dismissKeyboard');
        dismissKeyboard();
        if(Util.checkIsEmptyString(this.props.state.registerPassword) &&
            Util.checkIsEmptyString(this.props.state.registerConfirmedPassword)) {
            this.props.changeState({
                showDialog: true,
                showContent: Message.REGISTER_CHECK_PW_DATA_MESSAGE
            })//都未输入
        }else if(!Util.checkIsEmptyString(this.props.state.registerPassword) &&
            !Util.checkIsEmptyString(this.props.state.registerConfirmedPassword)&&
            this.props.state.registerPassword != this.props.state.registerConfirmedPassword){
            this.props.changeState({
                showDialog: true,
                showContent: Message.REGISTER_CHECK_PW_DATA_MATCH
            })//都有输入但是不一致
        }else if( !Util.checkIsEmptyString(this.props.state.registerPassword)&& !Util.checkCorrectPassword(this.props.state.registerPassword)){
            this.props.changeState({
                showDialog: true,
                showContent: Message.PASSWORD_INPUT_RULE_LABEL
            })//输入了注册密码但是不符合要求
        } else if(!Util.checkIsEmptyString(this.props.state.registerPassword)&& Util.checkCorrectPassword(this.props.state.registerPassword) && Util.checkIsEmptyString(this.props.state.registerConfirmedPassword)){
            this.props.changeState({
                showDialog: true,
                showContent: Message.REGISTER_CHECK_PASSWORD_CONFIRM
            })//注册密码输入格式正确但是确认密码为空
        }else if(Util.checkIsEmptyString(this.props.state.registerPassword) &&
            !Util.checkIsEmptyString(this.props.state.registerConfirmedPassword)){
            this.props.changeState({
                showDialog: true,
                showContent: Message.REGISTER_CHECK_PASSWORD_REGISTER
            })
        }//确认密码不为空，但是注册密码为空
        else {
            this.props.registerAction({
                mac:this.props.state.macAddress,
                phoneNumber:this.props.state.registerPhone,
                password:this.props.state.registerPassword
            });
        }
    }

    /**
     * 关闭弹窗
     * @param component 当前component
     */
    _closeModal(component) {
        component.props.changeState({
            showDialog: false,
        })
    }

    render() {
        const dismissKeyboard = require('dismissKeyboard');
        return(
            <SafeAreaView style={styles.container}>
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={styles.container}>

                        <Header
                            titleText={Message.REGISTER}
                            thisComponent={this}
                            backClick={this.onBack}
                        />
                        <Dialog
                            content={this.props.state.showContent}
                            type={'alert'}
                            alertBtnText={Message.CONFIRM}
                            modalVisible={this.props.state.showDialog}
                            alertBtnStyle={{color: '#FFAA00',}}
                            onClose={this._closeModal}
                            alertBtnClick={this._closeModal}
                            thisComponent={this}
                        />
                        <View style={{paddingHorizontal: ScreenUtil.scaleSize(30)}}>
                            <View style={styles.inputRow}>
                                <Text style={styles.inputLabel}>{Message.REGISTER_PASSWORD_LABEL}</Text>
                                <TextInput
                                    style={styles.inputText}
                                    placeholder={Message.REGISTER_PASSWORD_INPUT_RULE_LABEL}
                                    maxLength={12}
                                    placeholderTextColor="#ABABAB"
                                    underlineColorAndroid="transparent"
                                    secureTextEntry={true}
                                    value={this.props.state.registerPassword}
                                    onChangeText={(text) => {this.props.changeState({registerPassword: text})}}
                                    returnKeyType={'done'}/>
                            </View>
                            <View style={CustomStyles.separatorLine}/>
                            <View style={styles.inputRow}>
                                <Text style={styles.inputLabel}>{Message.REGISTER_PASSWORD_CONFIRM}</Text>
                                <TextInput
                                    style={styles.inputText}
                                    placeholder={Message.REGISTER_PASSWORD_CONFIRM_INPUT_LABEL}
                                    maxLength={12}
                                    placeholderTextColor="#ABABAB"
                                    underlineColorAndroid="transparent"
                                    secureTextEntry={true}
                                    value={this.props.state.registerConfirmedPassword}
                                    onChangeText={(text) => {this.props.changeState({registerConfirmedPassword: text})}}
                                    returnKeyType={'done'}/>
                            </View>
                            <View style={CustomStyles.separatorLine}/>
                        </View>
                        <TouchableOpacity
                            style={{
                                marginTop: ScreenUtil.scaleSize(200),
                            }}
                            onPress={() => {
                                this.checkData()
                            }}>
                            <Image source={require('../../img/register/confirm_btn.png')}
                                   style={{
                                       height: ScreenUtil.scaleSize(75),
                                       width: ScreenUtil.scaleSize(550),
                                       resizeMode: 'stretch',
                                       alignSelf: 'center',
                                   }}/>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </SafeAreaView>
        )
    }
}

function mapStateToProps(state) {
    return {
        state:state.RegisterPassword
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        registerAction: registerPasswordAction,
        changeState: changeState,
        back:back,
        registerPasswordInit : registerPasswordInit
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RegisterPassword);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
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
    codeView: {
        borderRadius: ScreenUtil.scaleSize(5),
        height: ScreenUtil.scaleSize(53),
        width: ScreenUtil.scaleSize(142),
        borderWidth: ScreenUtil.scaleSize(1),
        borderColor: '#FFAA00',
        justifyContent: 'center',
        alignItems: 'center',
    }
});