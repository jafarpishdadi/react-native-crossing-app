/**
 * Created by Vanessa.yan on 8/3/2017.
 */

import React, {Component} from "react";
import PropTypes from 'prop-types';
import {View, Text, Image, StyleSheet, StatusBar, Platform, Modal, TouchableOpacity} from "react-native";
import ScreenUtil from "../../utils/ScreenUtil";
import Base64Images from "../../utils/Base64Images";
import Message from "../../constant/Message";

var Dimensions = require('Dimensions');
var windowWidth = Dimensions.get('window').width;
var windowHeight = Dimensions.get('window').height;

var successImg = Base64Images.TICK;
var exclamatoryImg = Base64Images.EXCLAMATORY;
var failImg = Base64Images.CROSS;

export default class PromptDialog extends React.Component {
    static propTypes = {
        thisComponent: PropTypes.object,    // 当前Component
        modalVisible: PropTypes.bool,       //是否显示弹窗
        onClose: PropTypes.func,     //关闭弹窗的方法
        promptType: PropTypes.oneOf(['success', 'error', 'warn']).isRequired, //弹窗类型
        hint: PropTypes.string,      //提示语
    };

    static defaultProps = {
        modalVisible: false,
        top: windowHeight * 0.35,
    };

    constructor(props) {
        super(props);
        this._onClose = this._onClose.bind(this);
    }

    //关闭提示
    _onClose() {
        // 在设置了回调函数的情况下
        if (this.props.onClose) {
            this.props.onClose(this.props.thisComponent);
        }
    }

    //设置倒计时，用于动图展示次数
    _onCountTime() {
        var codeTime = 2;
        var that = this;
        if (Platform.OS == 'ios') {
            codeTime = 1;
        }

        this.interval = setInterval(() => {
            codeTime -= 1;
            if (codeTime === 0) {
                that._onClose();
                that.interval && clearInterval(that.interval);
            }
        }, 1000)
    }

    render() {
        const {promptType, hint} = this.props;
        var hintImg, hintStr;

        //根据提示类型，选择不同的提示语
        if (promptType == 'success') {
            hintImg = successImg;
            hintStr = hint || Message.ACTION_SUCCESS;
        } else if (promptType == 'error') {
            hintImg = failImg;
            hintStr = hint || Message.ACTION_FAIL;
        } else {
            hintImg = exclamatoryImg;
            hintStr = hint || Message.ACTION_FAIL;
        }
        return (
            <Modal
                visible={this.props.modalVisible}
                animationType={'none'}
                transparent={true}
                onShow={() => this._onCountTime()}
                onRequestClose={()=> this._onClose()}
            >
                <TouchableOpacity style={{flex: 1}} onPress={() => this._onClose()}>
                    <View style={styles.modalBackground}>
                        <View style={ [styles.modalBox]}>
                            <Image
                                source={{uri: hintImg}}
                                style={{
                                    height: ScreenUtil.scaleSize(38),
                                    width: ScreenUtil.scaleSize(38),
                                    alignSelf: 'center'
                                }}
                            />
                            <Text style={{
                                color: 'white',
                                textAlign: 'center',
                                marginTop: ScreenUtil.scaleSize(10)
                            }}>{hintStr}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalBox: {
        flexDirection: 'column',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: ScreenUtil.scaleSize(20),
        borderRadius: ScreenUtil.scaleSize(8),
        marginTop: ScreenUtil.scaleSize(28)
    }
});