/**
 * Created by Richard.ji on 2017/11/7.
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
    StyleSheet
} from 'react-native';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {changeState,createNewPasswordPost,createPasswordInit} from '../../redux/actions/users/CreateNewPassword';
import {back} from '../../redux/actions/navigator/Navigator';
import Header from "./../common/CommonHeader";
import Message from "../../constant/Message";
import ScreenUtil from "../../utils/ScreenUtil";
import Util from '../../utils/Util';
import Dialog from '../../containers/common/Dialog';
import {CustomStyles} from '../../css/CustomStyles';

class CreateNewPassword extends Component {

    static navigationOptions = ({navigation}) => ({
        header: null,
    })

    /**
     * 清空页面
     */
    componentWillMount() {
        this.props.createPasswordInit();
    }

    /**
     * 检查提交数据
     */
    checkData() {
        const dismissKeyboard = require('dismissKeyboard');
        dismissKeyboard();
        if(Util.checkIsEmptyString(this.props.state.createNewPassword) &&
            Util.checkIsEmptyString(this.props.state.createConfirmedPassword)) {
            this.props.changeState({
                showDialog: true,
                showContent: Message.FIND_PASSWORD_CHECK_DATA_TIP
            })
        }else if(!Util.checkIsEmptyString(this.props.state.createNewPassword) &&
            !Util.checkIsEmptyString(this.props.state.createConfirmedPassword) && this.props.state.createNewPassword != this.props.state.createConfirmedPassword){
            this.props.changeState({
                showDialog: true,
                showContent: Message.REGISTER_CHECK_PW_DATA_MATCH
            })
        }else if(!Util.checkIsEmptyString(this.props.state.createNewPassword) &&
            Util.checkIsEmptyString(this.props.state.createConfirmedPassword)){
            this.props.changeState({
                showDialog: true,
                showContent: Message.FIND_PASSWORD_CHECK_CHECK_PASSWORD
            })
        }else if(Util.checkIsEmptyString(this.props.state.createNewPassword) &&
            !Util.checkIsEmptyString(this.props.state.createConfirmedPassword)){
            this.props.changeState({
                showDialog: true,
                showContent: Message.FIND_PASSWORD_CHECK_NEW_PASSWORD
            })
        }else if(!Util.checkIsEmptyString(this.props.state.createNewPassword) &&
            !Util.checkIsEmptyString(this.props.state.createConfirmedPassword) &&
            this.props.state.createNewPassword == this.props.state.createConfirmedPassword&&
            !Util.checkCorrectPassword(this.props.state.createNewPassword)){
            this.props.changeState({
                showDialog: true,
                showContent: Message.PASSWORD_INPUT_RULE_LABEL
            })
        }
        else {
            this.props.createNewPasswordPost({
                phoneNumber : this.props.navigation.state.params.findPasswordPhone,
                password : this.props.state.createConfirmedPassword
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

    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        component.props.back();
    }

    render() {
        const dismissKeyboard = require('dismissKeyboard');
        return(
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={styles.container}>
                    <Header
                        titleText={Message.FIND_PASSWORD}
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
                            <Text style={styles.inputLabel}>{Message.NEW_PASSWORD}</Text>
                            <TextInput
                                style={styles.inputText}
                                placeholder={Message.REGISTER_PASSWORD_INPUT_RULE_LABEL}
                                maxLength={12}
                                placeholderTextColor="#ABABAB"
                                secureTextEntry={true}
                                underlineColorAndroid="transparent"
                                selectionColor="#FFAA00"
                                value={this.props.state.createNewPassword}
                                onChangeText={(text) => {this.props.changeState({createNewPassword: text})}}
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
                                secureTextEntry={true}
                                underlineColorAndroid="transparent"
                                selectionColor="#FFAA00"
                                value={this.props.state.createConfirmedPassword}
                                onChangeText={(text) => {this.props.changeState({createConfirmedPassword: text})}}
                                returnKeyType={'done'}/>
                        </View>
                        <View style={CustomStyles.separatorLine}/>
                    </View>
                    <TouchableOpacity
                        style={{
                            marginTop: ScreenUtil.scaleSize(200),
                        }}
                        onPress={() => {
                            this.checkData();
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
        )
    }
}

function mapStateToProps(state) {
    return {
        state:state.CreateNewPassword
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changeState: changeState,
        back:back,
        createNewPasswordPost: createNewPasswordPost,
        createPasswordInit : createPasswordInit
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateNewPassword);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
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