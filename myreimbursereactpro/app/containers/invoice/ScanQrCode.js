import React, {Component} from "react";
import {
    StyleSheet,
    Image,
    Text,
    View,
    Animated,
    TextInput,
    Dimensions,
    Alert,
    ScrollView,
    Navigator,
    TouchableOpacity,
    Easing,
    DeviceEventEmitter,
    Vibration,
    Modal,
    Platform,
    NativeModules,
    StatusBar,
    findNodeHandle,
    TouchableWithoutFeedback,
    AppState
} from "react-native";
import ScreenUtil, {deviceWidth, deviceHeight} from "../../utils/ScreenUtil";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Message from "../../constant/Message";
import {changeState, readQrCode, initData} from "../../redux/actions/invoice/ScanQrCode";
import {back, navigateNewInvoice} from "../../redux/actions/navigator/Navigator";
import ScanViewComponent from "../scanView/ScanViewComponent";
import ViewFinder from "./ViewFinder";
import Camera from "react-native-camera";
import Header from "../../containers/common/CommonHeader";
import Util from "../../utils/Util";
import Loading from "../common/Loading";
import SafeAreaView from "react-native-safe-area-view";

var QrCodeModule = NativeModules.QrCodeModule;
var RNBridgeModule = NativeModules.RNBridgeModule;
var navigationParam = {};
class ScanQrCode extends Component {
    static navigationOptions = ({navigation}) => ({
        header: null,
    })

    componentWillMount() {
        this.props.initData();
        this.props.changeState({fadeInOpacity:new Animated.Value(0)})
        navigationParam = this.props.navigation.state.params;
    }

    componentWillUnmount() {
        if(Platform.OS == 'android') {
            AppState.removeEventListener('change', this.handleAppStateChange);
        }
    }

    componentDidMount() {
        this.startAnimation();

        if(Platform.OS == 'android'){
            this.handleAppStateChange = this.handleAppStateChange.bind(this);
            AppState.addEventListener('change', this.handleAppStateChange);
        }
    }

    handleAppStateChange(nextAppState) {
        if (nextAppState === 'active') {
            //app切换至前台
            RNBridgeModule.openCameraPreview();
        } else if (nextAppState === 'background') {
            //由于不需要特殊处理，已通过原生activity监听关闭相机
        }
    }

    /**
     * 扫描线动画，循环播放
     */
    startAnimation() {
        this.props.scanQrCode.fadeInOpacity.resetAnimation();
        Animated.timing(this.props.scanQrCode.fadeInOpacity, {
            toValue: 1,
            duration: 3000,
        }).start(
            () => {
                this.props.scanQrCode.readQrCodeEnable && this.startAnimation()
            }
        );
    }

    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        component.props.changeState({readQrCodeEnable:false});
        component.props.back();
    }

    /**
     * 获取二维码数据
     * @param data 二维码数据
     */
    qrCodeResult(data) {

        if (this.props.scanQrCode.readQrCodeEnable) {
            this.props.changeState({readQrCodeEnable: false});
            var qrCodeArr = data.split(",");
            var that = this;

            if (qrCodeArr.length < 7) {
                //非发票二维码
                Util.showToast(Message.SCAN_QR_CODE_INVALID);
                setTimeout(
                    () => {
                        this.props.changeState({readQrCodeEnable: true});
                    },
                    200
                );
            }else{
                setTimeout(
                    () => {
                        this.props.readQrCode({scanResult: data},navigationParam);
                    },
                    200
                );
            }
        }
    }

    /**
     * 主渲染
     */
    render() {
        const previewHeight = deviceHeight;

        //扫描框，android专用
        const scanViewWidth = ScreenUtil.scaleSize(500);
        const scanViewHeight = scanViewWidth;
        const scanViewLeft = (deviceWidth - scanViewWidth) / 2;
        const scanViewTop = (deviceHeight - scanViewHeight) / 2 - ScreenUtil.scaleSize(100);

        return (
            <SafeAreaView style={[styles.container, {backgroundColor: 'white'}]}>
                <Header
                    titleText={Message.SCAN_QR_CODE_TITLE}
                    thisComponent={this}
                    backClick={this.onBack}
                />
                <Loading isShow={this.props.scanQrCode.isLoading}/>

                {
                    (Platform.OS === 'ios') ?
                        (
                            <View>
                                <View style={{height: previewHeight}}>

                                    <View style={[styles.centerContainer, {height: scanViewTop}]}/>
                                    <View style={{flexDirection: 'row'}}>
                                        <View style={[styles.fillView, {width: scanViewLeft, height: scanViewHeight}]}/>
                                        <View style={[styles.scan, {width: scanViewWidth, height: scanViewHeight}]}>
                                            <ViewFinder height={scanViewHeight} width={scanViewWidth}/>
                                            <Animated.View style={[styles.scanLine, {
                                                opacity: 1,
                                                transform: [{
                                                    translateY: this.props.scanQrCode.fadeInOpacity.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: [0, scanViewHeight-20]
                                                    })
                                                }]
                                            }]}>
                                                <Image source={require('../../img/invoice/scan_line.png')}/>
                                            </Animated.View>
                                        </View>
                                        <View style={[styles.fillView, {width: scanViewLeft, height: scanViewHeight}]}/>
                                    </View>
                                    <View style={styles.bottomContainer}>


                                    </View>
                                </View>
                                <Camera
                                    ref={(cam) => {
                                        this.camera = cam
                                    }}
                                    style={[styles.cameraStyle, {
                                        backgroundColor: 'black',
                                        height: previewHeight,
                                        position: 'absolute',
                                        zIndex: -1
                                    }]}
                                    aspect={Camera.constants.Aspect.fill}
                                    onBarCodeRead={(data)=>this.qrCodeResult(data.data)}>
                                </Camera>
                            </View>
                        ) :
                        (
                            <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)'}}>
                                <ScanViewComponent
                                    style={[styles.cameraStyle, {
                                        position: 'absolute',
                                        zIndex: -1, height: previewHeight
                                    }]}
                                    scanWidth={parseInt(scanViewWidth)}
                                    scanHeight={parseInt(scanViewHeight)}
                                    scanLeft={parseInt(scanViewLeft)}
                                    scanTop={parseInt(scanViewTop)}
                                    showTips={false}
                                    doScan={this.props.scanQrCode.readQrCodeEnable}
                                    doPreview={this.props.scanQrCode.readQrCodeEnable}
                                    onSelect={(data)=> {
                                        console.log("111");
                                    }}
                                    onResult={(data)=> {
                                        this.qrCodeResult(data.data)
                                    }}>
                                </ScanViewComponent>

                                <View style={[styles.centerContainer, {height: scanViewTop}]}/>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={[styles.fillView, {width: scanViewLeft, height: scanViewHeight}]}/>
                                    <View style={[styles.scan, {width: scanViewWidth, height: scanViewHeight}]}>
                                        <ViewFinder height={scanViewHeight} width={scanViewWidth}/>
                                        <Animated.View style={[styles.scanLine, {
                                            opacity: 1,
                                            transform: [{
                                                translateY: this.props.scanQrCode.fadeInOpacity.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, scanViewHeight-20]
                                                })
                                            }]
                                        }]}>
                                            <Image source={require('../../img/invoice/scan_line.png')}/>
                                        </Animated.View>
                                    </View>
                                    <View style={[styles.fillView, {width: scanViewLeft, height: scanViewHeight}]}/>
                                </View>
                                <View style={styles.bottomContainer}>


                                </View>
                            </View>

                        )
                }
            </SafeAreaView>
        );
    }
}
function mapStateToProps(state) {
    return {
        scanQrCode: state.ScanQrCode
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changeState: changeState,
        back: back,
        initData:initData,
        readQrCode: readQrCode,
        navigateNewInvoice: navigateNewInvoice,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ScanQrCode);

//样式
const styles = StyleSheet.create({
    bottomText: {
        color: '#ffffff',
        textAlign: 'center',
        marginTop: ScreenUtil.scaleSize(15),
        fontSize: ScreenUtil.scaleSize(13)
    },
    container: {
        ...Platform.select({
            ios: {
                flex: 1,
            },
            android: {
                flex: 1
            }
        }),
    },

    cameraStyle: {
        alignSelf: 'center',
        width: deviceWidth,
        height: deviceHeight,
    },
    scanLine: {
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        width: deviceWidth * 1 / 2,
    },
    centerContainer: {
        ...Platform.select({
            ios: {
                height: ScreenUtil.scaleSize(120),
            },
            android: {
                height: ScreenUtil.scaleSize(100),
            }
        }),
        width: deviceWidth,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    bottomContainer: {
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        flex: 1,
        width: deviceWidth,
        flexDirection: 'column',
    },
    fillView: {
        width: deviceWidth * 1 / 6,
        height: deviceWidth * 2 / 3,
        backgroundColor: 'black',
        opacity: 0.5,
    },
    scan: {
        width: deviceWidth * 2 / 3,
        height: deviceWidth * 2 / 3,
        alignSelf: 'center',
    },

    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBox: {
        position: 'absolute',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        width: deviceWidth * 0.7,
        left: deviceWidth * 0.15,
        paddingTop: ScreenUtil.scaleSize(10),
        borderRadius: ScreenUtil.scaleSize(5),
    },
    titleStyle: {
        fontSize: ScreenUtil.scaleSize(18),
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: ScreenUtil.scaleSize(20),
        marginRight: ScreenUtil.scaleSize(20),
        marginLeft: ScreenUtil.scaleSize(20),
    },
    contentStyle: {
        flex: 1,
        textAlign: 'center',
        fontSize: ScreenUtil.scaleSize(16),
        margin: ScreenUtil.scaleSize(20),
    },
    rowSeparator: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        marginTop: ScreenUtil.scaleSize(20),
        height: 1,
    },
    columnSeparator: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        width: 1,
    },
    buttonStyle: {
        textAlign: 'center',
        padding: ScreenUtil.scaleSize(20),
        color: '#FFAA00',
    },
    noticeIcon: {
        width: deviceWidth * 0.7 - ScreenUtil.scaleSize(40),
        height: (deviceWidth * 0.7 - ScreenUtil.scaleSize(40)) / 2,
        marginTop: ScreenUtil.scaleSize(20),
        marginLeft: ScreenUtil.scaleSize(20),
        resizeMode: 'stretch',
    },

    menuContainer: {
        flexDirection: 'row',
        paddingTop: Platform.OS === 'ios' ? 20 : 0,  // 处理iOS状态栏
        height: (Platform.OS === 'ios') ? ScreenUtil.scaleSize(70) : ScreenUtil.scaleSize(50),
        backgroundColor: 'rgba(0,0,0,0)',
        alignItems: 'center',
    },
    backIconBox: {
        width: ScreenUtil.scaleSize(50),
        height: (Platform.OS === 'ios') ? ScreenUtil.scaleSize(70) : ScreenUtil.scaleSize(50),
        justifyContent: 'center',
        paddingLeft: ScreenUtil.scaleSize(10),
    },
    rightIconBox: {
        width: ScreenUtil.scaleSize(50),
        height: (Platform.OS === 'ios') ? ScreenUtil.scaleSize(70) : ScreenUtil.scaleSize(50),
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: ScreenUtil.scaleSize(10),
    },
    iconImg: {
        width: ScreenUtil.scaleSize(12),
        height: ScreenUtil.scaleSize(20),
    },
    titleTxt: {
        flex: 1,
        fontSize: ScreenUtil.scaleSize(18),
        color: '#FFFFFF',
        textAlign: 'center',
    },
    moreTxt: {
        fontSize: ScreenUtil.scaleSize(16),
        color: '#FFAA00',
    },

    iconView: {//单个操作
        flex: 1,
        flexDirection: 'column',   // 垂直排布
        alignItems: 'center'
    },
    iconText: {//操作文字
        marginTop: ScreenUtil.scaleSize(5),
        fontSize: ScreenUtil.scaleSize(14),
        color: '#FFFFFF'
    },
    iconStyle: {
        height: ScreenUtil.scaleSize(30),
        width: ScreenUtil.scaleSize(30),
        resizeMode: 'contain',
    },
});