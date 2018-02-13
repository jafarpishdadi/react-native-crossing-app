/**
 * Created by sky.qian on 11/3/2017.
 */
import React, {Component} from "react";
import PropTypes from 'prop-types';
import {View, Text, Image, StyleSheet, StatusBar, Platform, TouchableOpacity, PixelRatio} from "react-native";
import ScreenUtil, {deviceWidth} from "../../utils/ScreenUtil";

export default class CommonHeader extends React.Component {

    static propTypes = {
        backClick: PropTypes.func,   // 返回事件
        backIcon: PropTypes.number,  // 返回图标
        showBackIcon: PropTypes.bool, //是否显示左侧按钮
        titleText: PropTypes.string,  // 标题名
        rightIcon: PropTypes.number, //右侧按钮图标
        rightIconStyle: PropTypes.object,    //右侧按钮图标样式
        rightText: PropTypes.string,  // 右侧文字按钮
        rightTextStyle: PropTypes.object,    //右侧文字样式
        rightClick: PropTypes.func,    // 右侧点击
        thisComponent: PropTypes.object,    // 当前Component

        backControl:PropTypes.bool, //连续点击返回按钮的特殊处理，如果点击返回会弹弹出框的页面不需要该特殊处理
    };

    //参数默认值
    static defaultProps = {
        backIcon: require('./../../img/common/back.png'),
        showBackIcon: true,
        backControl:true,
    };

    constructor(props) {
        super(props);
        this.state = {
            backClickDisabled: false,
        }
    }

    //返回事件
    _backClick() {
        if(this.props.backControl){
            this.setState({
                backClickDisabled: true,
            })
        }
        if (this.props.backClick) {   // 在设置了回调函数的情况下
            this.props.backClick(this.props.thisComponent);
        }
    }

    //右侧图标/文字的点击事件
    _rightClick() {
        if (this.props.rightClick) {   // 在设置了回调函数的情况下
            this.props.rightClick(this.props.thisComponent);  // 回调Title和Tag
        }
    }

    render() {
        return (
            <View style={styles.header}>
                <View style={{
                    position: 'absolute',
                    height: ScreenUtil.scaleSize(93),
                    width: deviceWidth,
                    bottom: ScreenUtil.scaleSize(0),
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Text style={{
                        color: '#666666',
                        fontSize: ScreenUtil.setSpText(12),
                        width: deviceWidth - ScreenUtil.scaleSize(186),
                        textAlign: 'center',
                    }} numberOfLines={1}>{this.props.titleText}</Text>
                    {
                        this.props.showBackIcon ? (
                            <TouchableOpacity disabled={this.state.backClickDisabled} onPress={this._backClick.bind(this)}
                                              style={{
                                                  position: 'absolute',
                                                  height: ScreenUtil.scaleSize(93),
                                                  width: ScreenUtil.scaleSize(93),
                                                  left: 0,
                                                  justifyContent: 'center',
                                              }}>
                                <Image
                                    source={this.props.backIcon}
                                    style={styles.backIcon}
                                />
                            </TouchableOpacity>
                        ) : null
                    }
                    {
                        this.props.rightText ? (
                            <TouchableOpacity onPress={this._rightClick.bind(this)}
                                              style={{
                                                  position: 'absolute',
                                                  height: ScreenUtil.scaleSize(93),
                                                  right: ScreenUtil.scaleSize(0),
                                                  paddingRight: ScreenUtil.scaleSize(30),
                                                  justifyContent: 'center',
                                              }} dis>
                                <Text style={this.props.rightTextStyle}>{this.props.rightText}</Text>
                            </TouchableOpacity>
                        ) : (
                            null
                        )
                    }
                    {
                        this.props.rightIcon ? (
                            <TouchableOpacity onPress={this._rightClick.bind(this)}
                                              style={{
                                                  position: 'absolute',
                                                  height: ScreenUtil.scaleSize(93),
                                                  width: ScreenUtil.scaleSize(93),
                                                  right: ScreenUtil.scaleSize(0),
                                                  paddingRight: ScreenUtil.scaleSize(30),
                                                  alignItems: 'flex-end',
                                                  justifyContent: 'center',
                                              }}>
                                <Image
                                    source={this.props.rightIcon}
                                    style={this.props.rightIconStyle}
                                />
                            </TouchableOpacity>
                        ) : (
                            null
                        )
                    }
                </View>
            </View>
        )

    }
}

const styles = StyleSheet.create({
    header: {
        height: ScreenUtil.scaleSize(Platform.OS == 'ios' ? 128 : 93),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderBottomColor: 'rgba(167,167,167,0.3)',
        //borderBottomWidth: Platform.OS == 'ios' ? 1 / PixelRatio.get() : 0,

        shadowOffset: {width: 0, height: 0},
        shadowColor: 'rgba(167,167,167,0.3)',
        shadowOpacity: 1,
        shadowRadius: 2,
        elevation: 1.5,
        //marginBottom: Platform.OS == 'ios' ? 0.8 : 0,
        zIndex: 500,
    },
    backIcon: {
        width: ScreenUtil.scaleSize(24),
        height: ScreenUtil.scaleSize(40),
        resizeMode: 'stretch',
        marginLeft: ScreenUtil.scaleSize(30),
    }
});