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
import {changeState,newEnterprise,openEnterpriseInit} from '../../redux/actions/users/OpenEnterprise';
import {back} from '../../redux/actions/navigator/Navigator';
import Header from "./../common/CommonHeader";
import Message from "../../constant/Message";
import ScreenUtil from "../../utils/ScreenUtil";
import Util from '../../utils/Util';
import Dialog from '../../containers/common/Dialog';
import Store from 'react-native-simple-store';
import {CustomStyles} from '../../css/CustomStyles';
import SafeAreaView from "react-native-safe-area-view";

class OpenEnterprise extends Component {
    static navigationOptions = ({navigation}) => ({
        header: null,
    })

    /**
     * 清空页面
     */
    componentWillMount() {
        this.props.openEnterpriseInit();
    }

    componentDidMount() {
        this.props.changeState(this.props.navigation.state.params);
        var that = this;
        Store.get('macAddress').then((macAddress) => {
            if (macAddress) {
                that.props.changeState({
                    macAddress: macAddress,
                });
            }
        })
    }

    /**
     * 检查提交数据
     */
    checkData() {
        const dismissKeyboard = require('dismissKeyboard');
        dismissKeyboard();
        if(Util.checkIsEmptyString(this.props.state.openEnterprisePerson) &&
            Util.checkIsEmptyString(this.props.state.openEnterpriseName)){
            this.props.changeState({
                showDialog1: true,
            })}
            else if(Util.checkIsEmptyString(this.props.state.openEnterprisePerson) &&
            !Util.checkIsEmptyString(this.props.state.openEnterpriseName)){
                this.props.changeState({
                    showDialog2: true,
                })
            }
            else if(!Util.checkIsEmptyString(this.props.state.openEnterprisePerson) &&
            Util.checkIsEmptyString(this.props.state.openEnterpriseName)){
            this.props.changeState({
                showDialog3: true,
            })
        }
         else {
            this.props.newEnterprise({
                enterpriseName: this.props.state.openEnterpriseName,
                contactPerson: this.props.state.openEnterprisePerson,
                mac : this.props.state.macAddress
            });
        }
    }

    /**
     * 关闭弹窗1
     * @param component 当前component
     */
    _closeModal1(component) {
        component.props.changeState({
            showDialog1: false,
        })
    }

    /**
     * 关闭弹窗2
     * @param component 当前component
     */
    _closeModal2(component) {
        component.props.changeState({
            showDialog2: false,
        })
    }

    /**
     * 关闭弹窗
     * @param component 当前component
     */
    _closeModal3(component) {
        component.props.changeState({
            showDialog3: false,
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
            <SafeAreaView style={styles.container}>
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={styles.container}>

                        <Header
                            titleText={Message.OPEN_ENTERPRISE}
                            thisComponent={this}
                            showBackIcon={this.props.state.whereComeFrom == 'Login'? true:false}
                            backClick={this.onBack}
                        />

                        <Dialog
                            content={Message.OPEN_ENTERPRISE_CHECK_MESSAGE}
                            type={'alert'}
                            alertBtnText={Message.CONFIRM}
                            modalVisible={this.props.state.showDialog1}
                            alertBtnStyle={{color: '#FFAA00',}}
                            onClose={this._closeModal1}
                            alertBtnClick={this._closeModal1}
                            thisComponent={this}
                        />
                        <Dialog
                            content={Message.INPUT_PERSONAL_NAME}
                            type={'alert'}
                            alertBtnText={Message.CONFIRM}
                            modalVisible={this.props.state.showDialog2}
                            alertBtnStyle={{color: '#FFAA00',}}
                            onClose={this._closeModal2}
                            alertBtnClick={this._closeModal2}
                            thisComponent={this}
                        />
                        <Dialog
                            content={Message.INPUT_ENTERPRISE_NAME}
                            type={'alert'}
                            alertBtnText={Message.CONFIRM}
                            modalVisible={this.props.state.showDialog3}
                            alertBtnStyle={{color: '#FFAA00',}}
                            onClose={this._closeModal3}
                            alertBtnClick={this._closeModal3}
                            thisComponent={this}
                        />
                        <View style={{paddingHorizontal: ScreenUtil.scaleSize(30)}}>
                            <View style={styles.inputRow}>
                                <Text style={styles.inputLabel}>{Message.ENTERPRISE_NAME}</Text>
                                <TextInput
                                    style={styles.inputText}
                                    placeholder={Message.INPUT_ENTERPRISE_NAME}
                                    maxLength={50}
                                    placeholderTextColor="#ABABAB"
                                    underlineColorAndroid="transparent"
                                    ref="phone"
                                    selectionColor="#FFAA00"
                                    value={this.props.state.openEnterpriseName}
                                    onChangeText={(text) => {this.props.changeState({openEnterpriseName: text})}}
                                    returnKeyType={'done'}/>
                            </View>
                            <View style={CustomStyles.separatorLine}/>
                            <View style={styles.inputRow}>
                                <Text style={styles.inputLabel}>{Message.PERSONAL_NAME}</Text>
                                <TextInput
                                    style={styles.inputText}
                                    placeholder={Message.INPUT_PERSONAL_NAME}
                                    maxLength={15}
                                    placeholderTextColor="#ABABAB"
                                    underlineColorAndroid="transparent"
                                    ref="code"
                                    selectionColor="#FFAA00"
                                    value={this.props.state.openEnterprisePerson}
                                    onChangeText={(text) => {this.props.changeState({openEnterprisePerson: text})}}
                                    returnKeyType={'done'}/>
                            </View>
                            <View style={CustomStyles.separatorLine}/>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                const dismissKeyboard = require('dismissKeyboard');
                                dismissKeyboard();
                                this.checkData();
                            }}>
                            <Image source={require('../../img/register/open_enterprise_btn.png')}
                                   style={{
                                       height: ScreenUtil.scaleSize(75),
                                       width: ScreenUtil.scaleSize(550),
                                       resizeMode: 'stretch',
                                       alignSelf: 'center',
                                       marginTop: ScreenUtil.scaleSize(180),
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
        state: state.OpenEnterprise
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changeState: changeState,
        back:back,
        newEnterprise: newEnterprise,
        openEnterpriseInit: openEnterpriseInit
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(OpenEnterprise);

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