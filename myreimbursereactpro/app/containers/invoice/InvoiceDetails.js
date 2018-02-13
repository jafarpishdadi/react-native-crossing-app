/**
 * 发票详情
 * Created by loki.cai on 11/3/2017.
 */
import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
    Alert,
    Image,
    ImageBackground,
    NativeModules,
    StyleSheet,
    Text,
    View,
    ScrollView,
    FlatList,
    Platform,
    TouchableOpacity,
    TouchableWithoutFeedback,
    BackHandler,
} from "react-native";
import Message from "../../constant/Message";
import Dialog from "../../containers/common/Dialog";
import Header from "../../containers/common/CommonHeader";
import ScreenUtil, {deviceWidth, deviceHeight} from "../../utils/ScreenUtil";
import {changeState, loadData, initData, invoiceCheck} from "../../redux/actions/invoice/InvoiceDetails";
import {changeState as changeScanQrCodeState} from "../../redux/actions/invoice/ScanQrCode";
import {changeState as changeAppState} from "../../redux/actions/App";
import {
    back,
    resetNewReimbursement,
    navigateEditInvoice,
    navigateNewReimbursement,
    navigateScanQrCode,
    backToInvoiceList
} from "../../redux/actions/navigator/Navigator";
import {selectInvoice} from "../../redux/actions/invoice/AddInvoice";
import {ocrValidation} from "../../redux/actions/invoice/Invoice";
import API from "../../utils/API";
import Picker from "react-native-picker";
import PopDialog from "./../common/PopDialog";
import Util from "../../utils/Util";
import Store from "react-native-simple-store";
import CommonLoading from "../../containers/common/CommonLoading";

const Permissions = require('react-native-permissions');
var RNBridgeModule = NativeModules.RNBridgeModule;

class InvoiceDetails extends Component {
    static navigationOptions = ({navigation}) => ({
        header: null
    });

    /**
     * 设置scrollView高度
     */
    setMinHeight(contentHeight) {
        this.props.changeState({
            minHeight: contentHeight + ScreenUtil.scaleSize(8),
        })
    }

    componentWillMount() {
        this.props.initData();
        const that = this;
        Store.get('token').then((tokenStr) => {
            if (tokenStr) {
                that.props.changeState({
                    token: tokenStr,
                })
            }
        })
    }

    componentDidMount() {
        const that = this;
        if (this.props.navigation.state.params.showCollectBtn) {
            this.props.changeState({showCollectBtn: this.props.navigation.state.params.showCollectBtn});
        }
        if (this.props.navigation.state.params.showReimbursementBtn) {
            this.props.changeState({showReimbursementBtn: this.props.navigation.state.params.showReimbursementBtn});
        }
        this.props.changeState(this.props.navigation.state.params);
        this.props.loadData(this.props.navigation.state.params.uuid,this.props.navigation.state.params.fromNew);

        if (Platform.OS != 'ios' && this.props.navigation.state.params.uuid) {
            setTimeout(() => {
                RNBridgeModule.loadImage(API.GET_INVOICE_IMAGE, that.props.invoiceDetails.token, JSON.stringify({uuid: that.props.navigation.state.params.uuid}), (result)=> {
                    that.props.changeState({
                        imageBase64: result
                    })
                })
            }, 500)
        }
    }

    /**
     * 对不同的票规整统一入口
     * @param invoiceType
     * @returns {*}
     */
    collectInvoiceTypeCode(invoiceType) {

        switch (invoiceType) {
            case '01':
                return '1000';
            case '02':
                return '1000';
            case '04':
                return '1000';
            case '10':
                return '1000';
            case '11':
                return '1000';
            case '92':
                return '1001';
            case '93':
                return '1001';
            default:
                return invoiceType;
        }
    }

    /**
     * 根据发票类型代码，显示对应的发票名称
     * @param invoiceType 发票类型代码
     * @returns {*}
     */
    invoiceTypeName(invoiceType) {
        switch (invoiceType) {
            case '01':
                return Message.INVOICE_TYPE_NAME_01;
            case '02':
                return Message.INVOICE_TYPE_NAME_02;
            case '03':
                return Message.INVOICE_TYPE_NAME_03;
            case '04':
                return Message.INVOICE_TYPE_NAME_04;
            case '10':
                return Message.INVOICE_TYPE_NAME_10;
            case '11':
                return Message.INVOICE_TYPE_NAME_11;
            case '91':
                return Message.INVOICE_TYPE_NAME_91;
            case '92':
                return Message.INVOICE_TYPE_NAME_92;
            case '93':
                return Message.INVOICE_TYPE_NAME_93;
            case '94':
                return Message.INVOICE_TYPE_NAME_94;
            case '95':
                return Message.INVOICE_TYPE_NAME_95;
            case '96':
                return Message.INVOICE_TYPE_NAME_96;
            case '97':
                return Message.INVOICE_TYPE_NAME_97;
            case '98':
                return Message.INVOICE_TYPE_NAME_98;
            case '00':
                return Message.INVOICE_TYPE_NAME_00;
        }
    }

    /**
     * 处理日期格式
     * @param invoiceDate 发票日期
     * @returns {string|*}
     */
    handleDateFormat(invoiceDate) {
        var date = '';
        if(invoiceDate){
            date = invoiceDate.substring(0, 4) + Message.YEAR + invoiceDate.substring(4, 6) + Message.MONTH + invoiceDate.substring(6) + Message.DAY;
        }
        return date;
    }

    /**
     * 处理金额保留小数位数
     * @returns {string}
     */
    handleAmount () {
        var money;
        if(this.props.invoiceDetails.totalAmount && this.props.invoiceDetails.totalAmount != ''){
             money = parseFloat(this.props.invoiceDetails.totalAmount).toFixed(2);
        }
        return money;
    }

    /**
     * ios图片加载出错，不显示图片
     */
    imageLoadError() {
        this.props.changeState({
            //imagePreView: false,
        })
    }

    /**
     * 渲染发票图片
     */
    renderImage() {
        var token = this.props.invoiceDetails.token;
        if ((Platform.OS === 'android')) {
            if (!Util.checkIsEmptyString(this.props.invoiceDetails.imageBase64)) {
                return (
                    <Image
                        style={styles.invoiceImg}
                        source={{uri: this.props.invoiceDetails.imageBase64}}
                    />)
            }
        } else {
            if (this.props.invoiceDetails.imagePreView) {
                return (
                    <Image source={{
                        uri: API.GET_INVOICE_IMAGE,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'token': token
                        },
                        body: JSON.stringify({uuid: this.props.navigation.state.params.uuid})
                    }} style={styles.invoiceImg} onError={()=>this.imageLoadError()}/>
                );
            }
        }
    }

    /**
     * 根据发票类型代码，使用对应的模板
     * @returns {XML}
     */
    selectTemplate() {
        var invoiceTypeCode = this.props.invoiceDetails.invoiceTypeCode;
        switch (this.collectInvoiceTypeCode(invoiceTypeCode)) {
            case '1000':
                return (<View style={styles.imageInnerView}>
                    <View style={styles.invoiceHeader}>
                        <Image source={require('../../img/invoice/red_circle.png')} style={styles.circleBg}/>
                        <View style={styles.invoiceType}>
                            <Text style={styles.invoiceTypeText}>{this.invoiceTypeName(invoiceTypeCode)}</Text>
                        </View>
                        {(Util.contains(['01', '02', '04', '10', '11'], this.props.invoiceDetails.invoiceTypeCode) && this.props.invoiceDetails.checkState == '0') ? (
                            <View style={styles.invoiceCheckViewOut}>
                                <TouchableOpacity onPress={() => {
                                    var requestData = {
                                        uuid: this.props.invoiceDetails.uuid,
                                        invoiceTypeCode: this.props.invoiceDetails.invoiceTypeCode,
                                        invoiceCode: this.props.invoiceDetails.invoiceCode,
                                        invoiceNo: this.props.invoiceDetails.invoiceNo,
                                        invoiceDate: this.props.invoiceDetails.invoiceDate.replace(/-/g, ''),
                                        verifyCode: this.props.invoiceDetails.verifyCode,
                                        buyerName: this.props.invoiceDetails.buyerName,
                                        invoiceDetail: this.props.invoiceDetails.goodsName,
                                        totalAmount: this.props.invoiceDetails.totalAmount,
                                        invoiceAmount: this.props.invoiceDetails.invoiceAmount,
                                        salerName: this.props.invoiceDetails.salerName,
                                        remark: this.props.invoiceDetails.remark,
                                        departCity: this.props.invoiceDetails.departCity,
                                        arriveCity: this.props.invoiceDetails.arriveCity,
                                        trainNumber: this.props.invoiceDetails.trainNumber,
                                        invoiceCount: this.props.invoiceDetails.invoiceCount,
                                        isCheck: 'Y'
                                    }
                                    this.props.invoiceCheck(requestData);
                                }}>
                                    <View style={styles.invoiceCheckView}>
                                        <Image source={require('../../img/invoice/invoice_check.png')}
                                               style={styles.checkImg}/>
                                        <Text style={styles.invoiceCheckText}>{Message.CHECK}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View/>
                        )}


                    </View>
                    <View style={[styles.row, {marginTop: ScreenUtil.scaleSize(110)}]}>
                        <Text style={styles.rowLabel}>{Message.INVOICE_DETAIL_INVOICE_CODE + ':'}</Text>
                        <Text
                            style={styles.rowInput}>{this.props.invoiceDetails.invoiceCode}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{Message.INVOICE_DETAIL_INVOICE_NUMBER + ':'}</Text>
                        <Text
                            style={styles.rowInput}>{this.props.invoiceDetails.invoiceNo}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{Message.INVOICE_DETAIL_CREATE_DATE + ':'}</Text>
                        <Text
                            style={styles.rowInput}>{this.handleDateFormat(this.props.invoiceDetails.invoiceDate)}</Text>
                    </View>
                    {Util.contains(['04', '10','11'], this.props.invoiceDetails.invoiceTypeCode)?(
                        <View style={styles.row}>
                        <Text style={styles.rowLabel}>{Message.INVOICE_DETAIL_VALIDATION_CODE + ':'}</Text>
                        <Text
                            style={styles.rowInput}>{this.props.invoiceDetails.verifyCode}</Text>
                    </View>):(<View/>)}
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{Message.INVOICE_DETAIL_BUYER + ':'}</Text>
                        <Text
                            style={styles.rowInput}>{this.props.invoiceDetails.buyerName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{Message.INVOICE_DETAIL_DETAIL + ':'}</Text>
                        <Text
                            style={styles.rowInput}>{this.props.invoiceDetails.goodsName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{Message.INVOICE_DETAIL_AMOUNT + ':'}</Text>
                        <Text
                            style={styles.rowInput}>{this.handleAmount()}</Text>
                    </View>
                    {Util.contains(['01', '02'], this.props.invoiceDetails.invoiceTypeCode) ? (
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>{Message.NEW_INVOICE_BHSJ + ':'}</Text>
                            <Text
                                style={styles.rowInput}>{this.props.invoiceDetails.invoiceAmount == '' ? '' : parseFloat(this.props.invoiceDetails.invoiceAmount).toFixed(2)}</Text>
                        </View>
                    ) : (
                    <View/>
                    )}
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{Message.INVOICE_DETAIL_SELLER + ':'}</Text>
                        <Text
                            style={styles.rowInput}>{this.props.invoiceDetails.salerName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{Message.INVOICE_DETAIL_MOME + ':'}</Text>
                        <Text
                            style={styles.rowInput}>{this.props.invoiceDetails.remark}</Text>
                    </View>
                    {(this.props.invoiceDetails.dataSourceCode == '103' || this.props.invoiceDetails.dataSourceCode == '102') ? (
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>{Message.INVOICE_DETAIL_IMAGE}</Text>
                            <Text
                                style={styles.rowInput}>{''}</Text>
                        </View>
                    ) : (
                        <View/>
                    )}

                    {(this.props.invoiceDetails.dataSourceCode == '103' || this.props.invoiceDetails.dataSourceCode == '102') ? (
                        <View style={[styles.row, {marginBottom: ScreenUtil.scaleSize(20)}]}>
                            <TouchableOpacity onPress={() => {
                                this.props.changeState({
                                    previewShow: true,
                                })
                            }}>
                                {this.renderImage()}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View/>
                    )}
                </View>);
            case '1001':
                return (<View style={styles.imageInnerView}>
                    <View style={styles.invoiceHeader}>
                        <Image source={require('../../img/invoice/red_circle.png')} style={styles.circleBg}/>
                        <View style={styles.invoiceType}>
                            <Text style={styles.invoiceTypeText}>{this.invoiceTypeName(invoiceTypeCode)}</Text>
                        </View>
                    </View>
                    <View style={[styles.row, {marginTop: ScreenUtil.scaleSize(110)}]}>
                        <Text style={styles.rowLabel}>{Message.TRAIN_OR_PLANE_INVOICE_DETAIL_FROM + ':'}</Text>
                        <Text
                            style={styles.rowInput}>{this.props.invoiceDetails.departCity}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{Message.TRAIN_OR_PLANE_INVOICE_DETAIL_TO + ':'}</Text>
                        <Text
                            style={styles.rowInput}>{this.props.invoiceDetails.arriveCity}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{Message.TRAIN_OR_PLANE_INVOICE_DETAIL_NUMBER + ':'}</Text>
                        <Text
                            style={styles.rowInput}>{this.props.invoiceDetails.trainNumber}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{Message.TRAIN_OR_PLANE_INVOICE_DETAIL_DATE + ':'}</Text>
                        <Text
                            style={styles.rowInput}>{this.handleDateFormat(this.props.invoiceDetails.invoiceDate)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{Message.TRAIN_OR_PLANE_INVOICE_DETAIL_AMOUNT + ':'}</Text>
                        <Text
                            style={styles.rowInput}>{this.handleAmount()}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{Message.TRAIN_OR_PLANE_INVOICE_DETAIL_IMAGE}</Text>
                        <Text
                            style={styles.rowInput}>{''}</Text>
                    </View>
                    <View style={[styles.row, {marginBottom: ScreenUtil.scaleSize(20)}]}>
                        <TouchableOpacity onPress={() => {
                            this.props.changeState({
                                previewShow: true,
                            })
                        }}>
                            {this.renderImage()}
                        </TouchableOpacity>
                    </View>
                </View>);
            default:
                return (<View style={styles.imageInnerView}>
                    <View style={styles.invoiceHeader}>
                        <Image source={require('../../img/invoice/red_circle.png')} style={styles.circleBg}/>
                        <View style={styles.invoiceType}>
                            <Text style={styles.invoiceTypeText}>{this.invoiceTypeName(invoiceTypeCode)}</Text>
                        </View>
                    </View>
                    <View style={[styles.row, {marginTop: ScreenUtil.scaleSize(110)}]}>
                        <Text style={styles.rowLabel}>{Message.OTHER_INVOICE_DETAIL_CATEGORY + ':'}</Text>
                        <Text
                            style={styles.rowInput}>{this.invoiceTypeName(invoiceTypeCode)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{Message.OTHER_INVOICE_DETAIL_DATE + ':'}</Text>
                        <Text
                            style={styles.rowInput}>{this.handleDateFormat(this.props.invoiceDetails.invoiceDate)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{Message.OTHER_INVOICE_DETAIL_AMOUNT + ':'}</Text>
                        <Text
                            style={styles.rowInput}>{this.handleAmount()}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{Message.OTHER_INVOICE_DETAIL_ATTACH + ':'}</Text>
                        <Text
                            style={styles.rowInput}>{this.props.invoiceDetails.invoiceCount}</Text>
                    </View>
                    {(this.props.invoiceDetails.dataSourceCode == '103' || this.props.invoiceDetails.dataSourceCode == '102') ? (
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>{Message.OTHER_INVOICE_DETAIL_IMAGE + ':'}</Text>
                            <Text
                                style={styles.rowInput}>{''}</Text>
                        </View>
                    ) : (
                        <View/>
                    )}

                    {(this.props.invoiceDetails.dataSourceCode == '103' || this.props.invoiceDetails.dataSourceCode == '102') ? (
                        <View style={[styles.row, {marginBottom: ScreenUtil.scaleSize(20)}]}>
                            <TouchableOpacity onPress={() => {
                                this.props.changeState({
                                    previewShow: true,
                                })
                            }}>
                                {this.renderImage()}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View/>
                    )}
                </View>);
        }
    }

    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        setTimeout(
            () => {
                component.props.changeScanQrCodeState({readQrCodeEnable: true});
            },
            20
        );
        component.props.back();
    }

    /**
     * 继续归集点击取消
     */
    returnToInvoiceList(){
        this.props.changeState({
            showDialog: false,
        });
        this.props.backToInvoiceList();
    }

    /**
     * 返回上一个页面并激活扫码
     */
    backToPrevious(){
        this.props.changeState({alreadyInNewReimbursement:false});
        this.onBack(this);
    }

    /**
     * 新增弹窗
     */
    popDialog() {
        this.props.changeState({showDialog: true});
    }

    /**
     * 关闭相机权限弹框
     */
    onCloseCamera() {
        this.props.changeState({showNoPermissionDialog:false});
    }

    /**
     * ocr拍照识别
     */
    ocrValidationFromCamera() {
        Permissions.checkMultiplePermissions(['camera', 'photo'])
            .then(response => {

                //判断是否具有相机权限，相册权限
                if (!Util.checkPermission(response.camera) || !Util.checkPermission(response.photo)) {
                    this.props.changeState({
                        dialogTitle: Message.AUTHORITY_SETTING,
                        dialogContent: Message.AUTHORIZE_CAMERA_AND_PHOTO_ALBUM,
                        showNoPermissionDialog: true,
                    });
                    return;
                }

                var ImagePicker = require('react-native-image-picker');
                var options = {
                    maxWidth: 1600,
                    maxHeight: 1600,
                    quality:0.6
                };
                ImagePicker.launchCamera(options, (response) => {
                    if (response.didCancel || response.error || response.customButton) {
                        //取消 异常 自定义按钮
                    }
                    else {

                        this.props.changeState({
                            isLoading: true,
                        });
                        this.props.ocrValidation({picture: response.data},{});
                    }
                });
            });

    }

    /**
     * ocr相册识别
     */
    ocrValidationFromImageLibrary() {
        Permissions.checkMultiplePermissions(['camera', 'photo'])
            .then(response => {

                //判断是否具有相机权限，相册权限
                if (!Util.checkPermission(response.camera) || !Util.checkPermission(response.photo)) {
                    this.props.changeState({
                        dialogTitle: Message.AUTHORITY_SETTING,
                        dialogContent: Message.AUTHORIZE_CAMERA_AND_PHOTO_ALBUM,
                        showNoPermissionDialog: true,
                    });
                    return;
                }

                var ImagePicker = require('react-native-image-picker');
                var options = {
                    maxWidth: 1600,
                    maxHeight: 1600,
                    quality:0.6
                };
                ImagePicker.launchImageLibrary(options, (response) => {
                    if (response.didCancel || response.error || response.customButton) {
                        //取消 异常 自定义按钮
                    }
                    else {

                        this.props.changeState({
                            isLoading: true,
                        });
                        this.props.ocrValidation({picture: response.data},{});
                    }
                });
            });

    }


    renderImgPreview() {
        return (
            (this.props.invoiceDetails.previewShow) ? (
                <View style={{
                    position: 'absolute',
                    height: deviceHeight,
                    width: deviceWidth,
                    left: 0,
                    top: 0,
                    zIndex: 10000,
                    elevation: 4,
                }}>
                    <TouchableWithoutFeedback onPress={() => {
                        this.props.changeState({
                            previewShow: false,
                        })
                    }}>
                        <View style={{
                            flex: 1,
                            position: 'absolute',
                            width: deviceWidth,
                            height: deviceHeight,
                            zIndex: 999,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <View style={{
                                position: 'absolute',
                                width: deviceWidth,
                                height: deviceHeight,
                                backgroundColor: '#000000',
                                opacity: 0.45,
                            }}/>
                            { Platform.OS === 'android' ? (
                                <Image
                                    style={{
                                        width: deviceWidth,
                                        height: deviceHeight,
                                        resizeMode: 'contain',
                                    }}
                                    source={{uri: this.props.invoiceDetails.imageBase64}}
                                />
                            ) : (
                                <Image source={{
                                    uri: API.GET_INVOICE_IMAGE,
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'token': this.props.invoiceDetails.token
                                    },
                                    body: JSON.stringify({uuid: this.props.navigation.state.params.uuid})
                                }} style={{
                                    width: deviceWidth,
                                    height: deviceHeight,
                                    resizeMode: 'contain',
                                }}/>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            ) : (
                null
            )
        )
    }

    /**
     * 获取选中的发票，转换成新建报销单页面可用的数据格式
     * @returns 选中的发票列表
     */
    getSelectedInvoiceListToNewReimbursement() {
        var selectInvoiceList = [];
        var targetInvoiceItem = {};
        var invoiceItem = this.props.invoiceDetails;
        targetInvoiceItem.invoiceType = invoiceItem.invoiceTypeCode;
        targetInvoiceItem.invoiceNum = invoiceItem.invoiceCount == '' ? '1' : invoiceItem.invoiceCount;;
        targetInvoiceItem.invoiceDetail = invoiceItem.goodsName;
        targetInvoiceItem.invoiceUUID = invoiceItem.uuid;
        targetInvoiceItem.invoiceDateStr = Util.formatDate(invoiceItem.invoiceDate);
        targetInvoiceItem.invoiceAmount = invoiceItem.totalAmount;
        targetInvoiceItem.imageAddress = '';
        selectInvoiceList.push(targetInvoiceItem);
        return selectInvoiceList;
    }

    /**
     * 报销类型选择器
     */
    createReimbursementPicker() {

        Picker.init({
            pickerData: this.props.invoiceDetails.reimbursementTypeList,
            selectedValue: [this.props.invoiceDetails.reimbursementType],
            pickerConfirmBtnText: Message.COMPLETE,
            pickerCancelBtnText: Message.CANCEL,
            pickerConfirmBtnColor: [255, 170, 0, 1],
            pickerCancelBtnColor: [255, 170, 0, 1],
            pickerToolBarBg: [255, 255, 255, 1],
            pickerBg: [255, 255, 255, 1],
            pickerFontColor: [171, 171, 171, 1],
            pickerTitleText: '',
            onPickerConfirm: data => {

                var areaStr = '';

                for (var i = 0; i < data.length; i++) {
                    if (data[i] == "" || data[i] == '<null>') {
                        areaStr = this.props.invoiceDetails.reimbursementTypeList[0];
                    } else {
                        areaStr += data[i];
                    }
                }

                var selectedList = this.getSelectedInvoiceListToNewReimbursement();
                this.props.resetNewReimbursement({applyTypeName: areaStr, selectedList: selectedList});
            }
        });
    }

    /**
     * 点击立即报销
     */
    reimbursementNow() {
        if (Util.contains(['01', '02', '04', '10', '11'], this.props.invoiceDetails.invoiceTypeCode)) {
            if (this.props.invoiceDetails.checkState == '1' && this.props.invoiceDetails.reimburseState == '0') {

                if (this.props.navigation.state.params.fromNew) {
                    //新建报销单进入详情，直接跳转新建报销单页面
                    var selectedList = this.getSelectedInvoiceListToNewReimbursement();
                    this.props.selectInvoice(this.props.navigation.state.params.expenseId, selectedList);
                    this.props.resetNewReimbursement({noInit:true});
                    return;
                }
                if (Platform.OS === 'android') {
                    RNBridgeModule.checkFloatWindowOpAllowed((result)=> {
                        this.createReimbursementPicker();
                        Picker.show();
                    });
                } else {
                    this.createReimbursementPicker();
                    Picker.show();
                }
            } else {
                if (this.props.invoiceDetails.checkState == '0') {
                    Util.showToast(Message.INVOICE_CHECK_FAILED);
                } else if (this.props.invoiceDetails.reimburseState != '0') {
                    Util.showToast(Message.INVOICE_REIMBURSED);
                }
            }
        } else {
            if (Platform.OS === 'android') {
                RNBridgeModule.checkFloatWindowOpAllowed((result)=> {
                    this.createReimbursementPicker();
                    Picker.show();
                });
            } else {
                this.createReimbursementPicker();
                Picker.show();
            }
        }
    }

    /**
     * 渲染底部按钮
     */
    renderBottomView() {
        if (this.props.invoiceDetails.showCollectBtn || this.props.invoiceDetails.showReimbursementBtn) {
            if (this.props.invoiceDetails.showCollectBtn && this.props.invoiceDetails.showReimbursementBtn && !this.props.navigation.state.params.fromNew) {
                return (
                    <View style={styles.bottomView}>
                        <TouchableOpacity onPress={()=> {
                            //this.props.changeScanQrCodeState({readQrCodeEnable: true});
                            this.popDialog();
                        }
                        }>
                            <Image source={require('../../img/invoice/collection.png')} style={[styles.actionBtn]}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=> this.reimbursementNow()}>
                            <Image source={require('../../img/invoice/reimbursement.png')} style={[styles.actionBtn]}/>
                        </TouchableOpacity>
                    </View>
                )
            } else if (this.props.invoiceDetails.showCollectBtn && !this.props.navigation.state.params.fromNew) {
                return (
                    <View style={styles.bottomView}>
                        <TouchableOpacity onPress={()=> {
                            //this.props.changeScanQrCodeState({readQrCodeEnable: true});
                            this.popDialog();
                        }
                        }>
                            <Image source={require('../../img/invoice/collection.png')} style={[styles.actionBtn]}/>
                        </TouchableOpacity>
                    </View>
                )
            } else if(this.props.invoiceDetails.showReimbursementBtn){
                return (
                    <View style={styles.bottomView}>
                        <TouchableOpacity onPress={()=> this.reimbursementNow()}>
                            <Image source={require('../../img/invoice/reimbursement.png')} style={[styles.actionBtn]}/>
                        </TouchableOpacity>
                    </View>
                )
            }
        } else {
            return (<View/>)
        }

    }

    render() {
        let bottomHeight = 0;
        if (this.props.invoiceDetails.showCollectBtn || this.props.invoiceDetails.showReimbursementBtn) {
            bottomHeight = 120;
        }
        return (
            <View style={styles.container}>
                {(this.props.invoiceDetails.checkState == '0' && this.props.invoiceDetails.reimburseState != '2' && this.props.invoiceDetails.reimburseState != '3' && !this.props.navigation.state.params.fromReDetail) ?
                    (<Header
                        titleText={Message.INVOICE_DETAIL_TITLE}
                        thisComponent={this}
                        backClick={this.onBack}
                        rightText={Message.EDIT}
                        rightClick={()=> {
                            this.props.navigateEditInvoice({
                                invoiceTypeCode: this.props.invoiceDetails.invoiceTypeCode,
                                uuid: this.props.invoiceDetails.uuid,
                                isFromNewReimbursement: this.props.invoiceDetails.isFromNewReimbursement,
                                expenseId: this.props.invoiceDetails.expenseId
                            })
                        }}
                        rightIconStyle={{
                            width: ScreenUtil.scaleSize(42),
                            height: ScreenUtil.scaleSize(42),
                            resizeMode: 'stretch',
                        }}
                    />) : (
                    <Header
                        titleText={Message.INVOICE_DETAIL_TITLE}
                        thisComponent={this}
                        backClick={this.onBack}
                    />
                )
                }

                <CommonLoading isShow={this.props.invoiceDetails.isLoading}/>
                <Dialog
                    content={Message.NEW_RE_ALREADY_IN_REIMBURSEMENT}
                    type={'alert'}
                    alertBtnText={Message.CONFIRM}
                    modalVisible={this.props.invoiceDetails.alreadyInNewReimbursement}
                    alertBtnStyle={{color: '#FFAA00',}}
                    alertBtnClick={this.backToPrevious.bind(this)}
                    thisComponent={this}
                />
                <Dialog
                    titleText={this.props.invoiceDetails.dialogTitle}
                    content={this.props.invoiceDetails.dialogContent}
                    type={'confirm'}
                    leftBtnText={Message.CANCEL}
                    rightBtnText={Message.AUTHORIZE_SET_PERMISSIONS}
                    modalVisible={this.props.invoiceDetails.showNoPermissionDialog}
                    leftBtnStyle={{color: '#A5A5A5',}}
                    rightBtnStyle={{color: '#FFAA00',}}
                    rightBtnClick={Permissions.openSettings}
                    thisComponent={this}
                    onClose={this.onCloseCamera.bind(this)}
                />
                <PopDialog
                    showVisible={this.props.invoiceDetails.showDialog}
                    thisComponent={this}
                    scanClick={()=> {
                        this.props.changeState({showDialog: false});
                        Permissions.checkMultiplePermissions(['camera', 'photo'])
                            .then(response => {

                                //判断是否具有相机权限，相册权限
                                if (!Util.checkPermission(response.camera) || !Util.checkPermission(response.photo)) {
                                    this.props.changeState({
                                        dialogTitle: Message.AUTHORITY_SETTING,
                                        dialogContent: Message.AUTHORIZE_CAMERA_AND_PHOTO_ALBUM,
                                        showNoPermissionDialog: true,
                                    });
                                    return;
                                }

                                if (this.props.navigation.state.params.isFromScan) {
                                    setTimeout(
                                        () => {
                                            this.props.changeScanQrCodeState({readQrCodeEnable: true});
                                        },
                                        20
                                    );
                                    this.props.back()
                                } else {
                                    this.props.navigateScanQrCode()
                                }
                            });

                    }}
                    photoClick={()=> {
                        this.props.changeState({showDialog: false});
                        setTimeout(
                            () => {
                                this.ocrValidationFromCamera()
                            },
                            100
                        );

                    }}
                    albumClick={()=> {
                        this.props.changeState({showDialog: false});
                        setTimeout(
                            () => {
                                this.ocrValidationFromImageLibrary()
                            },
                            100
                        );
                    }}
                    cancelClick={
                        this.returnToInvoiceList.bind(this)
                    }
                />
                {this.renderImgPreview()}

                <ScrollView style={styles.sclView}>
                    <ImageBackground source={require('./../../img/invoice/invoice_detail_bg.png')}
                                 resizeMode='stretch'
                                 style={{
                                     width: deviceWidth - ScreenUtil.scaleSize(20),
                                     height: deviceHeight - ScreenUtil.scaleSize(bottomHeight) - ScreenUtil.scaleSize(20) - ScreenUtil.scaleSize(Platform.OS == 'ios' ? 128 : 93),
                                 }}>
                        {this.selectTemplate()}
                    </ImageBackground>
                </ScrollView>

                {this.renderBottomView()}
            </View>
        )
    }
}

function mapStateToProps(state) {
    return {
        invoiceDetails: state.InvoiceDetails,
        nav: state.nav,
        appState: state.App,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        back: back,
        selectInvoice:selectInvoice,
        resetNewReimbursement:resetNewReimbursement,
        navigateNewReimbursement: navigateNewReimbursement,
        navigateEditInvoice: navigateEditInvoice,
        backToInvoiceList:backToInvoiceList,
        changeScanQrCodeState: changeScanQrCodeState,
        ocrValidation: ocrValidation,
        invoiceCheck:invoiceCheck,
        navigateScanQrCode: navigateScanQrCode,
        initData: initData,
        changeState: changeState,
        loadData: loadData,
        changeAppState: changeAppState,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(InvoiceDetails);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F3F3'
    },
    sclView: {
        paddingVertical: ScreenUtil.scaleSize(10),
        marginHorizontal:ScreenUtil.scaleSize(10),
    },
    imageBg: {
        width: ScreenUtil.scaleSize(730),
        height: ScreenUtil.scaleSize(1250),
        alignSelf: 'center',
    },
    imageInnerView: {
        margin: ScreenUtil.scaleSize(3),
        borderRadius: ScreenUtil.scaleSize(5),
        paddingHorizontal: ScreenUtil.scaleSize(20),
    },
    invoiceHeader: {
        alignItems: 'center', flex: 1
    },
    checkImg: {
        height: ScreenUtil.scaleSize(27),
        width: ScreenUtil.scaleSize(27),
        resizeMode: Image.resizeMode.contain,
    },
    circleBg: {
        height: ScreenUtil.scaleSize(71),
        width: ScreenUtil.scaleSize(110),
        resizeMode: Image.resizeMode.contain,
        marginTop: ScreenUtil.scaleSize(14),
    },
    invoiceType: {
        width: deviceWidth - ScreenUtil.scaleSize(20),
        height: ScreenUtil.scaleSize(40),
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: ScreenUtil.scaleSize(30),
    },
    invoiceTypeText: {
        backgroundColor: 'rgba(255,255,255,0)',
        fontSize: ScreenUtil.setSpText(9),
        fontWeight: 'bold',
        color: '#666666'
    },

    invoiceCheckText: {
        backgroundColor: 'transparent',
        paddingLeft: ScreenUtil.scaleSize(10),
        fontSize: ScreenUtil.setSpText(8),
        textAlign: 'right',
        color: '#ABABAB'
    },

    invoiceCheckViewOut: {
        position: 'absolute',
        top: ScreenUtil.scaleSize(10),
        right: ScreenUtil.scaleSize(0),
    },
    invoiceCheckView: {
        flexDirection: 'row',
        height: ScreenUtil.scaleSize(35),
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: ScreenUtil.scaleSize(20),
    },
    rowLabel: {
        width: ScreenUtil.scaleSize(210),
        fontSize: ScreenUtil.setSpText(8),
        color: '#ABABAB',
        backgroundColor: "transparent",
        //height: ScreenUtil.scaleSize(33),
    },
    rowInput: {
        flex: 1,
        textAlign: 'left',
        fontSize: ScreenUtil.setSpText(8),
        backgroundColor: "transparent",
        color: '#666666',
    },
    invoiceImg: {
        height: ScreenUtil.scaleSize(420),
        width: ScreenUtil.scaleSize(690),
        resizeMode: Image.resizeMode.contain,
    },
    bottomView: {
        flexDirection: 'row',
        alignItems: 'center',
        width: deviceWidth,
        height: ScreenUtil.scaleSize(120),
        position: 'absolute',
        backgroundColor: "white",
        bottom: 0,
        justifyContent: 'space-around',
        // borderTopWidth:ScreenUtil.scaleSize(1),
        // borderTopColor:'#F5F5F5'
    },
    actionBtn: {
        height: ScreenUtil.scaleSize(74),
        width: ScreenUtil.scaleSize(311),
        resizeMode: Image.resizeMode.contain,
    }
});