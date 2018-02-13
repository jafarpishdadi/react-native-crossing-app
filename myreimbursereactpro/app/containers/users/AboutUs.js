import React, {Component} from "react";
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {StyleSheet, Image, Text, View, Platform, NativeModules, ScrollView, PixelRatio} from "react-native";
import Header from "./../common/CommonHeader";
import Message from "../../constant/Message";
import ScreenUtil from "../../utils/ScreenUtil";
import Util from "../../utils/Util";
import {back} from '../../redux/actions/navigator/Navigator';
var Linking = require('Linking');
import API from "../../utils/API";
var RNBridgeModule = NativeModules.RNBridgeModule;

class MenuItem extends React.Component {

    //item点击事件
    _performClick() {
        var onClick = this.props.onClick;
        if (onClick) {
            onClick();
        }
    }

    //组件渲染
    render() {

        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                height: ScreenUtil.scaleSizeNew(80),
            }}>
                <Text style={{flex: 1, color: '#666666', fontSize: ScreenUtil.scaleSize(28)}}
                      onPress={() => this._performClick()}>{this.props.title}</Text>
            </View>
        );
    }
}

class AboutUs extends React.Component {

    static navigationOptions = ({navigation}) => ({
        header: null,
    })

    constructor(props) {
        super(props);

    }

    //第一次渲染之前
    componentWillMount() {
    }

    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        component.props.back();
    }

    //长按电话调起手机拨号功能
    _phoneClick(phoneNo) {

        //ios与android分开
        if (Platform.OS === 'ios') {
            RNBridgeModule.call(phoneNo);
        } else {
            //android需先判断能否调起拨号
            Linking.canOpenURL('tel:' + phoneNo).then(supported => {
                if (supported) {
                    return Linking.openURL('tel:' + phoneNo);
                }
            }).catch(err => console.error('An error occurred', err));
        }
    }

    //页面渲染
    render() {
        return (
            <View style={styles.container}>
                <Header
                    titleText={Message.ABOUT_US}
                    thisComponent={this}
                    backClick={this.onBack}
                />
                <View style={{flex: 1}}>
                    <View style={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: "center",
                        marginTop: ScreenUtil.scaleSize(50)
                    }}>
                        <Image style={{height: ScreenUtil.scaleSize(180), width: ScreenUtil.scaleSize(180)}}
                               source={require('./../../img/mine/ele_logo.png')}/>
                        <Text style={{
                            marginTop: ScreenUtil.scaleSize(30),
                            color: '#4A4A4A',
                            fontSize: ScreenUtil.scaleSize(28)
                        }}>{Message.APP_NAME }</Text>
                        <Text style={{
                            marginTop: ScreenUtil.scaleSize(20),
                            color: '#ABABAB',
                            fontSize: ScreenUtil.scaleSize(24)
                        }}>{API.APP_VERSION}</Text>
                    </View>

                    <View style={[styles.rowSpace, {
                        marginTop: ScreenUtil.scaleSize(60),
                        alignItems: 'center',
                        justifyContent: "center",
                    }]}>
                        <Text style={{
                            fontSize: ScreenUtil.scaleSize(28),
                            color: '#666666'
                        }}>{Message.ABOUT_US_INFO}</Text>
                    </View>
                    <View style={[styles.rowSpace, {
                        marginTop: ScreenUtil.scaleSize(91),
                        marginLeft: ScreenUtil.scaleSize(30)
                    }]}>
                        <Text style={{
                            fontSize: ScreenUtil.scaleSize(20),
                            marginBottom: ScreenUtil.scaleSize(4),
                            color: '#A5A5A5'
                        }}>{Message.ABOUT_US_CONTACT_WAY}</Text>
                    </View>
                    <View style={[styles.menuBorder]}>
                        <MenuItem
                            title={Message.ABOUT_US_CONTACT_TEL}
                            onClick={ () => this._phoneClick(Message.ABOUT_US_CONTACT_TEL)}
                        />
                        <View style={styles.rowSeparator}/>
                        <MenuItem
                            title={Message.ABOUT_US_CONTACT_EMAIL}
                        />
                    </View>
                </View>
                <View style={[styles.rowSpace, {
                    paddingLeft: ScreenUtil.scaleSize(10),
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: "center",
                }]}>
                    <Text style={{
                        fontSize: ScreenUtil.scaleSize(20),
                        marginBottom: ScreenUtil.scaleSize(10),
                        color: '#666666'
                    }}>{Message.ABOUT_US_TIP_ONE}</Text>
                    <Text style={{
                        fontSize: ScreenUtil.scaleSize(20),
                        marginBottom: ScreenUtil.scaleSize(10),
                        color: '#666666'
                    }}>{Message.ABOUT_US_TIP_TWO}</Text>
                    <Text style={{
                        fontSize: ScreenUtil.scaleSize(20),
                        marginBottom: ScreenUtil.scaleSize(10),
                        color: '#666666'
                    }}>{Message.ABOUT_US_TIP_THREE}</Text>
                </View>
            </View>
        );
    }
}


function mapStateToProps(state) {
    return {}
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        back: back,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AboutUs);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F1F1'
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    marginSpace: {
        marginTop: ScreenUtil.scaleSize(5)
    },
    iconSize: {
        height: ScreenUtil.scaleSize(20),
        width: ScreenUtil.scaleSize(20),
        resizeMode: Image.resizeMode.contain,
    },
    bindIcon: {
        height: ScreenUtil.scaleSize(25),
        width: ScreenUtil.scaleSize(105),
        resizeMode: Image.resizeMode.contain,
    },
    arrowSize: {
        height: ScreenUtil.scaleSize(16),
        width: ScreenUtil.scaleSize(16),
        resizeMode: Image.resizeMode.contain,
    },
    menuBorder: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: ScreenUtil.scaleSize(30),
    },
    rowSpace: {
        marginTop: ScreenUtil.scaleSize(10)
    },
    rowSeparator: {
        backgroundColor: '#E2E2E2',
        height: 1 / PixelRatio.get()
    }
});