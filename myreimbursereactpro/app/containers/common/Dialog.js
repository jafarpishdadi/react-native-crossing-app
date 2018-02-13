/**
 * Created by tom.jin on 6/16/2017.
 */


import React, {Component} from "react";
import PropTypes from 'prop-types';
import {
    View,
    Text,
    Image,
    StyleSheet,
    StatusBar,
    Platform,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback
} from "react-native";
import ScreenUtil from "../../utils/ScreenUtil";
import Message from "./../../constant/Message";

export default class Dialog extends React.Component {
    static propTypes = {
        showTitle: PropTypes.bool, //是否显示标题
        titleText: PropTypes.string,  // 标题名
        showContent: PropTypes.bool,  // 是否显示内容
        content: PropTypes.string, //内容
        contentCenter: PropTypes.bool,  // 显示内容是否居中
        rightBtnStyle: PropTypes.object,    //右侧按钮样式
        rightBtnText: PropTypes.string,  // 右侧按钮文字
        rightBtnClick: PropTypes.func,    // 右侧点击
        leftBtnStyle: PropTypes.object,    //左侧按钮样式
        leftBtnText: PropTypes.string,  // 左侧按钮文字
        leftBtnClick: PropTypes.func,    // 左侧点击
        alertBtnStyle: PropTypes.object,    //alert按钮样式
        alertBtnText: PropTypes.string,  // alert文字按钮
        alertBtnClick: PropTypes.func,    // alert按钮点击
        thisComponent: PropTypes.object,    // 当前Component
        modalVisible: PropTypes.bool,       //是否显示弹窗
        top: PropTypes.number,       //距离顶端高度
        type: PropTypes.string,      //弹窗类型
        onClose: PropTypes.func,     //关闭弹窗的方法
        canCloseOutSide: PropTypes.bool,       //是否可以点击弹框外关闭弹框
    };

    //参数默认值
    static defaultProps = {
        showTitle: true,                //是否显示标题(默认显示)
        showContent: true,              // 是否显示内容（默认显示）
        contentCenter: true,            // 是否居中显示内容（默认居中）
        //titleText: Message.TIP,         //标题名（默认）
        rightBtnText: Message.CONFIRM,  //右边按钮文字（默认）
        leftBtnText: Message.CANCEL,    //左边按钮文字（默认）
        alertBtnText: Message.CONFIRM,  //alert弹框按钮文字（默认）
        modalVisible: false,            //是否显示弹框（默认不显示）
        top: ScreenUtil.scaleSize(400),         //弹框距离窗口顶端的距离（默认）
        canCloseOutSide: true,           //是否可以点击弹框外关闭弹框(默认可以)
    };

    constructor(props) {
        super(props);

        //方法绑定上下文对象
        this._leftBtnClick = this._leftBtnClick.bind(this);
        this._rightBtnClick = this._rightBtnClick.bind(this);
        this._alertBtnClick = this._alertBtnClick.bind(this);
        this._onClose = this._onClose.bind(this);
    }

    //点击弹框左边按钮，触发传入的回调函数
    _leftBtnClick() {
        // 在设置了回调函数的情况下，触发传入的confirm弹框左边按钮点击事件的回调函数
        if (this.props.leftBtnClick) {
            this.props.leftBtnClick(this.props.thisComponent);
        }

        //关闭弹框
        this._onClose()
    }

    //点击弹框右边按钮，触发传入的confirm弹框右边按钮点击事件的回调函数
    _rightBtnClick() {
        //关闭弹框
        this._onClose()

        // 在设置了回调函数的情况下
        if (this.props.rightBtnClick) {
            this.props.rightBtnClick(this.props.thisComponent);
        }

    }

    //点击alert弹框按钮，触发传入的alert按钮点击事件回调函数
    _alertBtnClick() {
        // 在设置了回调函数的情况下
        if (this.props.alertBtnClick) {
            this.props.alertBtnClick(this.props.thisComponent);
        }

        //关闭弹框
        this._onClose()
    }

    //关闭弹框，触发传入的关闭回调事件
    _onClose() {
        // 在设置了回调函数的情况下
        if (this.props.onClose) {
            this.props.onClose(this.props.thisComponent);
        }
    }

    //点击弹框外关闭弹框，触发传入的关闭回调事件
    _onCloseOutSide() {
        // 在设置了回调函数的情况下
        if (this.props.canCloseOutSide && this.props.onClose) {
            this.props.onClose(this.props.thisComponent);
        }
    }

    //弹框标题渲染
    renderTitle() {
        if (this.props.showTitle && this.props.titleText != null && this.props.titleText != '') {
            if (this.props.showContent && this.props.content != null && this.props.content != '') {
                return (
                    <Text style={[styles.titleStyle]}>{this.props.titleText}</Text>
                )
            } else {
                return (
                    <Text
                        style={[styles.titleStyle, {marginBottom: ScreenUtil.scaleSize(30)}]}>{this.props.titleText}</Text>
                )
            }
        }
    }

    //弹框内容渲染
    renderContent() {
        if (this.props.showContent && this.props.content != null && this.props.content != '') {
            if (this.props.showTitle && this.props.titleText != null && this.props.titleText != '') {
                return (
                    <Text style={[styles.contentStyle]}>{this.props.content}</Text>
                )
            } else {
                const contentStyle = [styles.contentStyle, {marginBottom: ScreenUtil.scaleSize(30)}];
                if (!this.props.contentCenter) {
                    contentStyle.push({textAlign: 'left'});
                }
                return (
                    <Text style={contentStyle}>{this.props.content}</Text>
                )
            }
        }
    }

    //弹框按钮渲染
    renderButton() {
        if (this.props.type === 'confirm') {
            return (
                <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity style={{flex: 1, backgroundColor: 'transparent'}} onPress={this._leftBtnClick}>
                        <Text style={[styles.buttonStyle, this.props.leftBtnStyle]}>{this.props.leftBtnText}</Text>
                    </TouchableOpacity>
                    <View style={styles.columnSeparator}/>
                    <TouchableOpacity style={{flex: 1, backgroundColor: 'transparent'}} onPress={this._rightBtnClick}>
                        <Text style={[styles.buttonStyle, this.props.rightBtnStyle]}>{this.props.rightBtnText}</Text>
                    </TouchableOpacity>
                </View>
            )
        } else {
            return (
                <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity style={{flex: 1, backgroundColor: 'transparent'}} onPress={this._alertBtnClick}>
                        <Text style={[styles.buttonStyle, this.props.alertBtnStyle]}>{this.props.alertBtnText}</Text>
                    </TouchableOpacity>
                </View>
            )
        }
    }

    render() {
        return (
            <Modal
                visible={this.props.modalVisible}
                animationType={'none'}
                transparent={true}
                onRequestClose={()=> this._onClose()}
            >
                <TouchableWithoutFeedback style={{flex: 1}} onPress={() => this._onCloseOutSide()}>
                    <View style={styles.modalBackground}>
                        <View style={styles.modalBox}>
                            <View style={{
                                height: ScreenUtil.scaleSize(260),
                                justifyContent: 'center',
                                paddingHorizontal: ScreenUtil.scaleSize(30),
                            }}>
                                {
                                    (this.props.showTitle && this.props.titleText != null && this.props.titleText != '') ? (
                                        <Text style={[styles.titleStyle]}>{this.props.titleText}</Text>
                                    ) : (
                                        null
                                    )
                                }
                                {
                                    (this.props.showContent && this.props.content != null && this.props.content != '') ? (
                                        <Text style={[styles.contentStyle]}>{this.props.content}</Text>
                                    ) : (
                                        null
                                    )
                                }
                            </View>
                            <View style={styles.rowSeparator}/>
                            {this.renderButton()}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBox: {
        height: ScreenUtil.scaleSize(374),
        width: ScreenUtil.scaleSize(590),
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        borderRadius: ScreenUtil.scaleSize(8),
    },
    titleStyle: {
        fontSize: ScreenUtil.setSpText(9),
        textAlign: 'center',
        marginBottom: ScreenUtil.scaleSize(30),
        color: '#666666'
    },
    contentStyle: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(9),
        color: '#666666'
    },
    rowSeparator: {
        backgroundColor: '#E2E2E2',
        height: ScreenUtil.scaleSize(1),
    },
    columnSeparator: {
        backgroundColor: '#E2E2E2',
        width: ScreenUtil.scaleSize(1),
        marginTop: ScreenUtil.scaleSize(8),
        marginBottom: ScreenUtil.scaleSize(8),
    },
    buttonStyle: {
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(12),
        padding: ScreenUtil.scaleSize(30),
    },
});