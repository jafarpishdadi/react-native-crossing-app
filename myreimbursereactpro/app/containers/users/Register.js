/**
 * Created by Richard.ji on 2017/10/30.
 */

import React, {Component} from 'react';
import {
    View,
    TextInput,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Text,
    CheckBox,
    Platform,
    StyleSheet
} from 'react-native';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {registerAction, changeState, getValidationCode, registerInit} from '../../redux/actions/users/Register';
import {registerAgreementAction} from '../../redux/actions/users/RegisterAgreement';
import {back} from '../../redux/actions/navigator/Navigator';
import Header from "./../common/CommonHeader";
import CommonLoading from '../../containers/common/CommonLoading';

import Message from "../../constant/Message";
import ScreenUtil from "../../utils/ScreenUtil";
import Util from '../../utils/Util';
import Dialog from '../../containers/common/Dialog';
import {CustomStyles} from '../../css/CustomStyles';

class Register extends Component {

    static navigationOptions = ({navigation}) => ({
        header: null,
    })

    /**
     * 清空页面
     */
    componentWillMount() {
        this.props.registerInit();
    }

    /**
     * 离开页面时，验证码倒计时初始化
     */
    componentWillUnmount(){
        this._clearCountTime();
    }

    /**
     * 检查提交数据
     */
    checkData() {
        const dismissKeyboard = require('dismissKeyboard');
        dismissKeyboard();
        if (Util.checkIsEmptyString(this.props.state.registerPhoneNumber) &&
            Util.checkIsEmptyString(this.props.state.registerVerificationCode) &&
            (!this.props.state.isHooked)) {
            this.props.changeState({
                showDialog1: true,
            })
        }//全未填写或勾选
        else if(!Util.checkIsEmptyString(this.props.state.registerPhoneNumber) &&
            Util.checkIsEmptyString(this.props.state.registerVerificationCode) &&
            (!this.props.state.isHooked)){
            this.props.changeState({
                showDialog2: true,
            })
        }//只有手机号码不为空
        else if(Util.checkIsEmptyString(this.props.state.registerPhoneNumber) &&
            !Util.checkIsEmptyString(this.props.state.registerVerificationCode) &&
            (!this.props.state.isHooked)){
            this.props.changeState({
                showDialog3: true,
            })
        }//只有验证码不为空
        else if(Util.checkIsEmptyString(this.props.state.registerPhoneNumber) &&
            Util.checkIsEmptyString(this.props.state.registerVerificationCode) &&
            (this.props.state.isHooked)){
            this.props.changeState({
                showDialog4: true,
            })
        }//只勾选了已同意用户协议
            else if(!Util.checkIsEmptyString(this.props.state.registerPhoneNumber) &&
            !Util.checkIsEmptyString(this.props.state.registerVerificationCode) &&
            (!this.props.state.isHooked)){
            this.props.changeState({
                showDialog5: true,
            })
        }//只有用户协议未勾选
            else if(Util.checkIsEmptyString(this.props.state.registerPhoneNumber) &&
                !Util.checkIsEmptyString(this.props.state.registerVerificationCode) &&
                (this.props.state.isHooked)){
            this.props.changeState({
                showDialog6: true,
            })
        }//只有手机号未填写
            else if (!Util.checkIsEmptyString(this.props.state.registerPhoneNumber) &&
            Util.checkIsEmptyString(this.props.state.registerVerificationCode) &&
            (this.props.state.isHooked)) {
            this.props.changeState({
                showDialog7: true,
            })
        }//只有验证码未填写
        else {
            this.props.registerAction({
                phoneNumber: this.props.state.registerPhoneNumber,
                verificationCode: this.props.state.registerVerificationCode,
                timeCount : this.props.state.timeCount
            });
        }
    }

    /**
     * 发送验证码，检查手机号格式
     */
    sendValidationCode() {
        var that = this;
        if (Util.checkPhone(that.props.state.registerPhoneNumber)) {
            that.props.getValidationCode(
                {
                    phoneNumber: that.props.state.registerPhoneNumber,
                    mark: "1"
                },
                function (data) {
                    if (data) {
                        //倒计时结束前不可点击
                        if (that.props.state.timeFlag) {
                            that.props.changeState({
                                timeFlag: false,
                                btnDisable1: true
                            });
                        } else {
                            return;
                        }
                        //发送验证码按钮显示倒计时
                        that._onCountTime();
                    }
                })
        } else {
            Util.showToast(Message.REGISTER_INVALID_PHONE);
        }
    }

    /**
     * 发送验证码按钮,显示倒计时
     * @private
     */
    _onCountTime() {
        var that = this;
        const now = Date.now()
        const overTimeStamp = now + 60 * 1000 + 100/*过期时间戳（毫秒） +100 毫秒容错*/
        //设置定时器，倒数60秒
        that.interval = setInterval(() => {
            const nowStamp = Date.now();
            if(nowStamp>=overTimeStamp){
                that._clearCountTime();
                that.props.changeState({
                    text: Message.GET_AGAIN,
                });
            }else{
                const leftTime = parseInt((overTimeStamp - nowStamp)/1000, 10)
                that.props.changeState({
                    timeCount: leftTime,
                    text: '(' + leftTime + 's)',
                    btnDisable1: true,
                });
            }
        }, 1000)
    }

    /**
     * 清除验证码按钮的倒计时
     * @private
     */
    _clearCountTime() {
        this.interval && clearInterval(this.interval);

        this.props.changeState({
            timeCount: 60,
            text:  Message.GET_VERIFICATION_CODE,
            btnDisable1: false,
            timeFlag: true,
        });
    }

    /**
     * 关闭弹窗1
     * @param component 当前component
     */
    _closeModal1(component) {
        component.props.changeState({showDialog1: false});
    }

    /**
     * 关闭弹窗2
     * @param component 当前component
     */
    _closeModal2(component) {
        component.props.changeState({showDialog2: false});
    }

    /**
     * 关闭弹窗3
     * @param component 当前component
     */
    _closeModal3(component) {
        component.props.changeState({showDialog3: false});
    }

    /**
     * 关闭弹窗4
     * @param component 当前component
     */
    _closeModal4(component) {
        component.props.changeState({showDialog4: false});
    }

    /**
     * 关闭弹窗5
     * @param component 当前component
     */
    _closeModal5(component) {
        component.props.changeState({showDialog5: false});
    }

    /**
     * 关闭弹窗6
     * @param component 当前component
     */
    _closeModal6(component) {
        component.props.changeState({showDialog6: false});
    }

    /**
     * 关闭弹窗7
     * @param component 当前component
     */
    _closeModal7(component) {
        component.props.changeState({showDialog7: false});
    }

    /**
     * 勾选复选框
     */
    selectHooked() {
        if (this.props.state.isHooked) {
            this.props.changeState({isHooked: false})
        } else {
            this.props.changeState({isHooked: true})
        }
    }

    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        component.props.back();
    }


    //验证码样式
    _choose_ver_code_style(){
        if(Util.checkIsEmptyString(this.props.state.registerPhoneNumber)){
            return styles.sendExTxt1}
        else{
            return styles.sendExTxt2
        }
    }

    //验证码外框样式
    _choose_code_View1_style(){
        if(Util.checkIsEmptyString(this.props.state.registerPhoneNumber)){
            if(!this.props.state.btnDisable1)
            {
                this.props.changeState({
                    btnDisable1: true,
                });
            }
            return styles.codeView1;
        }
        else{
            if(this.props.state.btnDisable1 && this.props.state.timeFlag){
                this.props.changeState({
                    btnDisable1: false,
                })}
            return styles.codeView2;
        }
    }

    //下一步背景样式
    _choose_next_style(){
        if((this.props.state.isHooked)){
            if(this.props.state.btnDisable2)
            {
                this.props.changeState({
                    btnDisable2: false,
                });
            }
            return styles.nextCodeView2;
        }
        else{
            if(!this.props.state.btnDisable2)
            {
                this.props.changeState({
                    btnDisable2: true,
                });
            }
            return styles.nextCodeView1;
        }
    }


    render() {
        const dismissKeyboard = require('dismissKeyboard');

        const selectIcon = this.props.state.isHooked ? (
            require('./../../img/register/hooked.png')
        ) : (
            require('./../../img/register/unhooked.png')
        );

        return (
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={styles.container}>
                    <Header
                        titleText={Message.REGISTER}
                        thisComponent={this}
                        backClick={this.onBack}
                    />
                    <Dialog
                        content={Message.REGISTER_CHECK_DATA_MESSAGE}
                        type={'alert'}
                        alertBtnText={Message.CONFIRM}
                        modalVisible={this.props.state.showDialog1}
                        alertBtnStyle={{color: '#FFAA00',}}
                        onClose={this._closeModal1}
                        alertBtnClick={this._closeModal1}
                        thisComponent={this}
                    />
                    <Dialog
                        content={Message.REGISTER_CHECK_USER_AGREEMENT_AND_VERIFICATION_CODE}
                        type={'alert'}
                        alertBtnText={Message.CONFIRM}
                        modalVisible={this.props.state.showDialog2}
                        alertBtnStyle={{color: '#FFAA00',}}
                        onClose={this._closeModal2}
                        alertBtnClick={this._closeModal2}
                        thisComponent={this}
                    />
                    <Dialog
                        content={Message.REGISTER_CHECK_PHONE_NUMBER_AND_USER_AGREEMENT}
                        type={'alert'}
                        alertBtnText={Message.CONFIRM}
                        modalVisible={this.props.state.showDialog3}
                        alertBtnStyle={{color: '#FFAA00',}}
                        onClose={this._closeModal3}
                        alertBtnClick={this._closeModal3}
                        thisComponent={this}
                    />
                    <Dialog
                        content={Message.REGISTER_CHECK_PHONE_NUMBER_AND_VALIDATION_CODE}
                        type={'alert'}
                        alertBtnText={Message.CONFIRM}
                        modalVisible={this.props.state.showDialog4}
                        alertBtnStyle={{color: '#FFAA00',}}
                        onClose={this._closeModal4}
                        alertBtnClick={this._closeModal4}
                        thisComponent={this}
                    />
                    <Dialog
                        content={Message.REGISTER_CHECK_USER_AGREEMENT}
                        type={'alert'}
                        alertBtnText={Message.CONFIRM}
                        modalVisible={this.props.state.showDialog5}
                        alertBtnStyle={{color: '#FFAA00',}}
                        onClose={this._closeModal5}
                        alertBtnClick={this._closeModal5}
                        thisComponent={this}
                    />
                    <Dialog
                        content={Message.REGISTER_EMPTY_PHONE}
                        type={'alert'}
                        alertBtnText={Message.CONFIRM}
                        modalVisible={this.props.state.showDialog6}
                        alertBtnStyle={{color: '#FFAA00',}}
                        onClose={this._closeModal6}
                        alertBtnClick={this._closeModal6}
                        thisComponent={this}
                    />
                    <Dialog
                        content={Message.REGISTER_INPUT_VERIFICATION_CODE}
                        type={'alert'}
                        alertBtnText={Message.CONFIRM}
                        modalVisible={this.props.state.showDialog7}
                        alertBtnStyle={{color: '#FFAA00',}}
                        onClose={this._closeModal7}
                        alertBtnClick={this._closeModal7}
                        thisComponent={this}
                    />

                    <CommonLoading isShow={this.props.state.isLoading}/>
                    <View style={{paddingHorizontal: ScreenUtil.scaleSize(30)}}>
                        <View style={styles.inputRow}>
                            <Text style={styles.inputLabel}>{Message.REGISTER_PHONE_NO}</Text>
                            <TextInput
                                style={styles.inputText}
                                placeholder={Message.REGISTER_INPUT_PHONE}
                                maxLength={11}
                                placeholderTextColor="#ABABAB"
                                underlineColorAndroid="transparent"
                                ref="phone"
                                selectionColor="#FFAA00"
                                keyboardType="numeric"
                                value={this.props.state.registerPhoneNumber}
                                onChangeText={(text) => {
                                    this.props.changeState({registerPhoneNumber: text})
                                }}
                                returnKeyType={'done'}/>
                        </View>
                        <View style={CustomStyles.separatorLine}/>
                        <View style={styles.inputRow}>
                            <Text style={styles.inputLabel}>{Message.REGISTER_VERIFICATION_CODE}</Text>
                            <TextInput
                                style={styles.inputText}
                                placeholder={Message.REGISTER_INPUT_VERIFICATION_CODE}
                                maxLength={6}
                                placeholderTextColor="#ABABAB"
                                underlineColorAndroid="transparent"
                                ref="code"
                                selectionColor="#FFAA00"
                                keyboardType="numeric"
                                value={this.props.state.registerVerificationCode}
                                onChangeText={(text) => {
                                    this.props.changeState({registerVerificationCode: text})
                                }}
                                returnKeyType={'done'}/>
                            <TouchableOpacity disabled={this.props.state.btnDisable1} onPress={() => {
                                this.sendValidationCode()
                            }}>
                                <View style={this._choose_code_View1_style()}>
                                    <Text style={this._choose_ver_code_style()}>{this.props.state.text}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={CustomStyles.separatorLine}/>
                    </View>
{/*                    <TouchableOpacity
                        style={{
                            marginTop: ScreenUtil.scaleSize(180),
                        }}
                        onPress={() => {
                            this.checkData()
                        }}>
                        <Image source={require('../../img/common/next.png')}
                               style={{
                                   height: ScreenUtil.scaleSize(75),
                                   width: ScreenUtil.scaleSize(550),
                                   resizeMode: 'stretch',
                                   alignSelf: 'center',
                               }}/>
                    </TouchableOpacity>*/}
                    <TouchableOpacity disabled={this.props.state.btnDisable2} style={{
                        marginTop: ScreenUtil.scaleSize(180),
                        height: ScreenUtil.scaleSize(75),
                        width: ScreenUtil.scaleSize(550),
                        resizeMode: 'stretch',
                        alignSelf: 'center',
                    }}
                                      onPress={() => {
                                          this.checkData()
                                      }}>
                        <View style={this._choose_next_style()}>
                            <Text style={styles.next}>{Message.REGISTER_NEXT_STEP}</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.bottomView}>
                        <TouchableOpacity onPress={this.selectHooked.bind(this)}>
                            <Image
                                style={styles.registerCheckBox}
                                source={selectIcon}/>
                        </TouchableOpacity>
                        <Text style={styles.agreementLabel}>
                            {Message.REGISTER_AGREEMENT_LABEL}
                        </Text>
                        <TouchableOpacity onPress={()=> {
                            this.props.registerAgreementAction()
                        }}>
                            <Text style={styles.userRegisterAgreement}>{Message.REGISTER_USER_AGREEMENT}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        )
    }
}

function mapStateToProps(state) {
    return {
        state: state.Register
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        registerAction: registerAction,
        changeState: changeState,
        back:back,
        getValidationCode: getValidationCode,
        registerAgreementAction: registerAgreementAction,
        registerInit: registerInit,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Register);

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
        fontSize: ScreenUtil.setSpText(9)
    },
    inputText: {
        marginLeft: ScreenUtil.scaleSize(30),
        fontSize: ScreenUtil.setSpText(9),
        padding: 0,
        flex: 1,
    },
    codeView1: {
        borderRadius: ScreenUtil.scaleSize(5),
        height: ScreenUtil.scaleSize(53),
        width: ScreenUtil.scaleSize(142),
        borderWidth: ScreenUtil.scaleSize(1),
        borderColor: '#ABABAB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    codeView2: {
        borderRadius: ScreenUtil.scaleSize(5),
        height: ScreenUtil.scaleSize(53),
        width: ScreenUtil.scaleSize(142),
        borderWidth: ScreenUtil.scaleSize(1),
        borderColor: '#FFAA00',
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextCodeView1:{
        borderRadius: ScreenUtil.scaleSize(5),
        height: ScreenUtil.scaleSize(68),
        width: ScreenUtil.scaleSize(550),
        borderWidth: ScreenUtil.scaleSize(1),
        borderColor: '#BBBBBB',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#BBBBBB',
    },
    nextCodeView2:{
        borderRadius: ScreenUtil.scaleSize(5),
        height: ScreenUtil.scaleSize(72),
        width: ScreenUtil.scaleSize(550),
        borderWidth: ScreenUtil.scaleSize(1),
        borderColor: '#FFAA00',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFAA00',
    },

    bottomView: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: ScreenUtil.scaleSize(100),
        height: ScreenUtil.scaleSize(33),
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    registerCheckBox: {
        width: ScreenUtil.scaleSize(29),
        height: ScreenUtil.scaleSize(29)
    },
    agreementLabel: {
        color: '#ABABAB',
        fontSize: ScreenUtil.setSpText(7),
        marginLeft: ScreenUtil.scaleSize(10)
    },
    userRegisterAgreement: {
        color: '#FFAA00',
        fontSize: ScreenUtil.setSpText(7)
    },
    next: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: ScreenUtil.scaleSize(34),
    },
    sendExTxt1: {
        color: '#ABABAB',
        textAlign: 'center',
        fontSize: ScreenUtil.scaleSize(20),
    },
    sendExTxt2: {
        color: '#FFAA00',
        textAlign: 'center',
        fontSize: ScreenUtil.scaleSize(20),
    },
});