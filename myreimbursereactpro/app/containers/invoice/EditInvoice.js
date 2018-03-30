/**
 * 编辑发票
 * Created by sky.qian on 11/14/2017.
 */
import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
    Text,
    View,
    Alert,
    TouchableWithoutFeedback,
    ScrollView,
    Image,
    TouchableOpacity,
    NativeModules,
    StyleSheet,
    TextInput,
    Platform,
    BackHandler,
    Modal
} from "react-native";
import Picker from "react-native-picker";
import Message from "../../constant/Message";
import ScreenUtil, {deviceWidth, deviceHeight} from "../../utils/ScreenUtil";
import {
    back,
    navigateNewReimbursement,
    navigateScanQrCode,
    backToInvoiceList,
    resetNewReimbursement
} from "../../redux/actions/navigator/Navigator";
import Header from "../../containers/common/CommonHeader";
import Util from "../../utils/Util";
import {
    initData,
    changeState,
    loadInvoiceDetail,
    saveInvoice,
    invoiceDelete,
    editToReimbursementSelectedInvoiceList
} from "../../redux/actions/invoice/EditInvoice";
import {ocrValidation, selectInvoice} from "../../redux/actions/invoice/Invoice";
import {changeState as changeScanQrCodeState} from "../../redux/actions/invoice/ScanQrCode";
import BackDialog from "../../containers/common/BackDialog";
import Dialog from "../../containers/common/Dialog";
import PopDialog from "./../common/PopDialog";
import Store from "react-native-simple-store";
import API from "../../utils/API";
import CommonLoading from "../../containers/common/CommonLoading";
import InputScrollView from "react-native-input-scroll-view";
import {changeState as changeAppState} from "../../redux/actions/App";
import {CustomStyles} from "../../css/CustomStyles";
import {CalendarList, LocaleConfig} from "react-native-calendars";

const Permissions = require('react-native-permissions');
import SafeAreaView from "react-native-safe-area-view";
var RNBridgeModule = NativeModules.RNBridgeModule;

class EditInvoice extends Component {
    static navigationOptions = ({navigation}) => ({
        header: null,
    })

    componentWillMount() {
        //初始化页面
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
        this.props.loadInvoiceDetail(this.props.navigation.state.params.uuid);
        if (Platform.OS != 'ios' && this.props.navigation.state.params.uuid) {
            setTimeout(() => {
                RNBridgeModule.loadImage(API.GET_INVOICE_IMAGE, that.props.state.token, JSON.stringify({uuid: that.props.navigation.state.params.uuid}), (result)=> {
                    that.props.changeState({
                        imageBase64: result
                    })
                })
            }, 500)
        }

        //设置当前默认时间
        const d = new Date();
        const year = d.getFullYear() + '年';
        let month = (d.getMonth() + 1);
        let day = d.getDate();
        if (month < 10) {
            month = '0' + (d.getMonth() + 1) + '月';
        } else {
            (d.getMonth() + 1) + '月'
        }
        if (day < 10) {
            day = '0' + d.getDate() + '日';
        } else {
            day = d.getDate() + '日';
        }

        const defaultSelectedDate = year + month + day;
        this.props.changeState({
            defaultSelectedDate: defaultSelectedDate
        });
    }

    constructor(props) {
        super(props);
        LocaleConfig.locales['zh'] = {
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            dayNames: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        };

        LocaleConfig.defaultLocale = 'zh';
    }

    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        component.cancelKeyboardEvent();
        if (component.props.state.dataSaved) {
            setTimeout(
                () => {
                    component.props.changeScanQrCodeState({readQrCodeEnable: true});
                },
                20
            );
            component.props.back();
        } else {
            component.props.changeState({
                saveModalVisible: true,
            });
        }
    }

    /**
     * 保存取消
     * @private
     */
    _cancelClick() {
        setTimeout(
            () => {
                this.props.changeScanQrCodeState({readQrCodeEnable: true});
            },
            20
        );

        if (this.props.navigation.state.params.returnDelete) {
            this.props.invoiceDelete(this.props.navigation.state.params.uuid);
            this.props.back();
        } else {
            this.props.back();
        }
    }

    /**
     * 关闭弹出框
     */
    _closeModal() {
        this.props.changeState({
            showDialog: false,
            saveModalVisible: false,
        });
    }

    /**
     * 检查必填项
     * @private
     */
    _checkData() {
        if (Util.contains(['01', '02', '04', '10', '11'], this.props.state.invoiceTypeCode)) {
            if (!Util.checkIsEmptyString(this.props.state.totalAmount) && this.props.state.totalAmount == 0) {
                Util.showToast(Message.NEW_INVOICE_SJHJ_PLACEHOLDER_MORE_THAN_ZERO);
                return false;
            }

            if (this.props.state.totalAmount < 0) {
                Util.showToast(Message.NEW_INVOICE_SJHJ_PLACEHOLDER_MORE_THAN_ZERO);
                return false
            }

            if (Util.checkIsEmptyString(this.props.state.invoiceCode)) {
                Util.showToast(Message.NEW_INVOICE_CODE_PLACEHOLDER);
                return false;
            }
            if (!Util.checkNumber(this.props.state.invoiceCode)) {
                Util.showToast(Message.NEW_INVOICE_INVALID_INVOICE_CODE);
                return false;
            }

            if (this.props.state.invoiceCode.length != 10 && this.props.state.invoiceCode.length != 12) {
                Util.showToast(Message.NEW_INVOICE_INVALID_INVOICE_CODE_LENGTH);
                return false;
            }
            if (Util.checkIsEmptyString(this.props.state.invoiceNo)) {
                Util.showToast(Message.NEW_INVOICE_NUMBER_PLACEHOLDER);
                return false;
            }
            if (!Util.checkNumber(this.props.state.invoiceNo)) {
                Util.showToast(Message.NEW_INVOICE_INVALID_INVOICE_NUMBER);
                return false;
            }

            if (this.props.state.invoiceNo.length != 8) {
                Util.showToast(Message.NEW_INVOICE_INVALID_INVOICE_NUMBER_LENGTH);
                return false;
            }
            if (Util.contains(['01', '02'], this.props.state.invoiceTypeCode)) {
                if (Util.checkIsEmptyString(this.props.state.invoiceAmount)) {
                    Util.showToast(Message.NEW_INVOICE_BHSJ_PLACEHOLDER);
                    return false;
                }
                if (!Util.checkIsEmptyString(this.props.state.invoiceAmount) && this.props.state.invoiceAmount == 0) {
                    Util.showToast(Message.NEW_INVOICE_BHSJ_PLACEHOLDER_MORE_THAN_ZERO);
                    return false;
                }

                if (this.props.state.invoiceAmount < 0) {
                    Util.showToast(Message.NEW_INVOICE_BHSJ_PLACEHOLDER_MORE_THAN_ZERO);
                    return false
                }

                if (!Util.checkFloatNumber(this.props.state.invoiceAmount)) {
                    Util.showToast(Message.NEW_INVOICE_INVALID_MONEY);
                    return false;
                }
            } else {
                if (Util.checkIsEmptyString(this.props.state.verifyCode)) {
                    Util.showToast(Message.NEW_INVOICE_VALIDATION_CODE_PLACEHOLDER);
                    return false;
                }
                if (!Util.checkNumber(this.props.state.verifyCode)) {
                    Util.showToast(Message.NEW_INVOICE_INVALID_VERIFY_CODE);
                    return false;
                }
                if (this.props.state.verifyCode.length != 6 && this.props.state.verifyCode.length != 20) {
                    Util.showToast(Message.NEW_INVOICE_INVALID_VERIFY_CODE_LENGTH);
                    return false;
                }
            }
            if (!Util.checkIsEmptyString(this.props.state.totalAmount) && !Util.checkFloatNumber(this.props.state.totalAmount)) {
                Util.showToast(Message.NEW_INVOICE_SJHJ_PLACEHOLDER);
                return false;
            }

            if (Util.checkIsEmptyString(this.props.state.invoiceDate)) {
                Util.showToast(Message.NEW_INVOICE_OPEN_DATE_PLACEHOLDER);
                return false;
            }

            var vYear = parseInt(this.props.state.invoiceDate.substr(0, 4));
            if (vYear < Util.YEAR_START || vYear >= Util.YEAR_END) {
                Util.showToast(Message.NEW_INVOICE_OPEN_DATE_INVALID);
                return false;
            }


        } else if (Util.contains(['92', '93'], this.props.state.invoiceTypeCode)) {

            if (Util.checkIsEmptyString(this.props.state.invoiceDate)) {
                Util.showToast(Message.NEW_INVOICE_OPEN_DATE_PLACEHOLDER);
                return false;
            }
            var vYear = parseInt(this.props.state.invoiceDate.substr(0, 4));
            if (vYear < Util.YEAR_START || vYear >= Util.YEAR_END) {
                Util.showToast(Message.NEW_INVOICE_OPEN_DATE_INVALID);
                return false;
            }
            if (Util.checkIsEmptyString(this.props.state.totalAmount)) {
                Util.showToast(Message.NEW_INVOICE_AMOUNT_PLACEHOLDER);
                return false;
            }

            if (this.props.state.totalAmount == 0) {
                Util.showToast(Message.NEW_INVOICE_MONEY_MORE_THAN_ZERO);
                return false;
            }

            if (this.props.state.totalAmount < 0) {
                Util.showToast(Message.NEW_INVOICE_MONEY_MORE_THAN_ZERO);
                return false
            }

            if (!Util.checkFloatNumber(this.props.state.totalAmount)) {
                Util.showToast(Message.NEW_INVOICE_INVALID_MONEY);
                return false;
            }

            if (!Util.checkIsEmptyString(this.props.state.trainNumber) && !Util.checkString(this.props.state.trainNumber)) {
                Util.showToast(Message.NEW_INVOICE_INVALID_TRAIN_NUMBER);
                return false;
            }
        } else {
            if (Util.checkIsEmptyString(this.props.state.invoiceDate)) {
                Util.showToast(Message.NEW_INVOICE_DATE_PLACEHOLDER);
                return false;
            }
            var vYear = parseInt(this.props.state.invoiceDate.substr(0, 4));
            if (vYear < Util.YEAR_START || vYear >= Util.YEAR_END) {
                Util.showToast(Message.NEW_INVOICE_OPEN_DATE_INVALID);
                return false;
            }
            if (Util.checkIsEmptyString(this.props.state.totalAmount)) {
                Util.showToast(Message.NEW_INVOICE_AMOUNT_PLACEHOLDER);
                return false;
            }

            if (this.props.state.totalAmount == 0) {
                Util.showToast(Message.NEW_INVOICE_MONEY_MORE_THAN_ZERO);
                return false;
            }

            if (this.props.state.totalAmount < 0) {
                Util.showToast(Message.NEW_INVOICE_MONEY_MORE_THAN_ZERO);
                return false
            }

            if (!Util.checkFloatNumber(this.props.state.totalAmount)) {
                Util.showToast(Message.NEW_INVOICE_INVALID_MONEY);
                return false;
            }
            if (Util.checkIsEmptyString(this.props.state.invoiceCount)) {
                Util.showToast(Message.NEW_INVOICE_INVALID_ATTACHMENT_NUMBER_TO_INPUT);
                return false;
            }
            if (this.props.state.invoiceCount == 0) {
                Util.showToast(Message.NEW_INVOICE_INVALID_ATTACHMENT_NUMBER);
                return false;
            }
        }
        return true;
    }

    /**
     * 保存发票前校验必填项
     * @param returnCallBack bool  是否需要返回进行回调，继续归集和立即报销需要回调
     * @param callBack  回调方法
     */
    preSaveAction(returnCallBack, callBack) {
        this.cancelKeyboardEvent();
        if (this._checkData()) {
            if (this.props.state.isFromNewReimbursement) {
                var selectInvoiceList = [];
                var targetInvoiceItem = {};
                var data = this.props.state;
                var goodsName = this.props.state.invoiceDetail;
                if (Util.contains(['01', '02', '04', '10', '11'], data.invoiceTypeCode)) {
                    targetInvoiceItem.invoiceNum = 1;
                } else {
                    targetInvoiceItem.invoiceNum = data.invoiceCount;
                }
                targetInvoiceItem.invoiceType = data.invoiceTypeCode;
                targetInvoiceItem.invoiceDetail = goodsName;
                targetInvoiceItem.invoiceUUID = data.uuid;
                targetInvoiceItem.invoiceDateStr = Util.formatDate(data.invoiceDate);
                targetInvoiceItem.invoiceAmount = data.totalAmount;
                targetInvoiceItem.imageAddress = '';
                targetInvoiceItem.checkStatusCode = data.checkState;
                targetInvoiceItem.invoiceTypeName = Util.getInvoiceTypeName(data.invoiceTypeCode);
                selectInvoiceList.push(targetInvoiceItem);
                this.props.editToReimbursementSelectedInvoiceList(this.props.navigation.state.params.expenseId, selectInvoiceList);
                this.props.changeState({isFromNewReimbursement: false});
            }
            this.saveAction(returnCallBack, callBack);
        }
    }

    /**
     * 保存发票
     * @param returnCallBack bool  是否需要返回进行回调，继续归集和立即报销需要回调
     * @param callBack  回调方法
     */
    saveAction(returnCallBack, callBack) {
        var requestData = {
            uuid: this.props.state.uuid,
            invoiceTypeCode: this.props.state.invoiceTypeCode,
            invoiceCode: this.props.state.invoiceCode,
            invoiceNo: this.props.state.invoiceNo,
            invoiceDate: this.props.state.invoiceDate.replace(/-/g, ''),
            verifyCode: this.props.state.verifyCode,
            buyerName: this.props.state.buyerName,
            invoiceDetail: this.props.state.invoiceDetail,
            totalAmount: this.props.state.totalAmount,
            invoiceAmount: this.props.state.invoiceAmount,
            salerName: this.props.state.salerName,
            remark: this.props.state.remark,
            departCity: this.props.state.departCity,
            arriveCity: this.props.state.arriveCity,
            trainNumber: this.props.state.trainNumber,
            invoiceCount: this.props.state.invoiceCount == '' ? '1' : this.props.state.invoiceCount,
            isCheck: 'Y'
        };
        this.props.saveInvoice(requestData, returnCallBack, callBack);
    }

    /**
     * 获取选中的发票，转换成新建报销单页面可用的数据格式
     * @returns 选中的发票列表
     */
    getSelectedInvoiceListToNewReimbursement() {
        var selectInvoiceList = [];
        var targetInvoiceItem = {};
        var invoiceItem = this.props.state;
        targetInvoiceItem.invoiceType = invoiceItem.invoiceTypeCode;
        targetInvoiceItem.invoiceNum = invoiceItem.invoiceCount == '' ? '1' : invoiceItem.invoiceCount;
        targetInvoiceItem.invoiceDetail = invoiceItem.invoiceDetail;
        targetInvoiceItem.invoiceUUID = invoiceItem.uuid;
        targetInvoiceItem.invoiceDateStr = Util.formatDate(invoiceItem.invoiceDate);
        targetInvoiceItem.invoiceAmount = invoiceItem.totalAmount;
        targetInvoiceItem.imageAddress = '';
        targetInvoiceItem.checkStatusCode = invoiceItem.checkState;
        targetInvoiceItem.invoiceTypeName = Util.getInvoiceTypeName(invoiceItem.invoiceTypeCode);
        targetInvoiceItem.invoiceTaxamount = invoiceItem.taxAmount;
        selectInvoiceList.push(targetInvoiceItem);
        return selectInvoiceList;
    }

    /**
     * 渲染底部按钮
     */
    renderBottomView() {
        if (this.props.state.showCollectBtn || this.props.state.showCollectBtn) {
            if (this.props.state.showCollectBtn && this.props.state.showCollectBtn && !this.props.navigation.state.params.fromNew) {
                return (
                    <View style={styles.bottom}>
                        <TouchableOpacity onPress={()=> {
                            if (this.props.state.dataSaved) {
                                this.popDialog();
                                return;
                            }
                            var thiz = this;
                            this.preSaveAction(true, function (data, goodsName) {
                                thiz.popDialog();
                            })
                        }}>
                            <Image source={require('../../img/invoice/collection.png')} style={[styles.actionBtn]}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>this.reimbursementNow()}>
                            <Image source={require('../../img/invoice/reimbursement.png')} style={[styles.actionBtn]}/>
                        </TouchableOpacity>
                    </View>
                )
            } else if (this.props.state.showCollectBtn && !this.props.navigation.state.params.fromNew) {
                return (
                    <View style={styles.bottom}>
                        <TouchableOpacity onPress={()=> {
                            if (this.props.state.dataSaved) {
                                this.popDialog();
                                return;
                            }
                            var thiz = this;
                            this.preSaveAction(true, function (data, goodsName) {
                                thiz.popDialog();
                            })
                        }}>
                            <Image source={require('../../img/invoice/collection.png')} style={[styles.actionBtn]}/>
                        </TouchableOpacity>
                    </View>
                )
            } else if (this.props.state.showReimbursementBtn) {
                return (
                    <View style={styles.bottom}>
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

    renderImgPreview() {
        return (
            (this.props.state.previewShow) ? (
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
                            {Platform.OS === 'android' ? (
                                <Image
                                    style={{
                                        width: deviceWidth,
                                        height: deviceHeight,
                                        resizeMode: 'contain',
                                    }}
                                    source={{uri: this.props.state.imageBase64}}
                                />
                            ) : (
                                <Image source={{
                                    uri: API.GET_INVOICE_IMAGE,
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'token': this.props.state.token
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
     * 选择发票种类
     */
    createInvoiceTypePicker() {
        const dismissKeyboard = require('dismissKeyboard');
        dismissKeyboard();
        Picker.init({
            pickerData: this.props.state.invoiceTypeList,
            selectedValue: [this.props.state.invoiceTypeName],
            pickerConfirmBtnText: Message.COMPLETE,
            pickerCancelBtnText: Message.CANCEL,
            pickerConfirmBtnColor: [255, 170, 0, 1],
            pickerCancelBtnColor: [255, 170, 0, 1],
            pickerToolBarBg: [255, 255, 255, 1],
            pickerToolBarFontSize: 15,
            pickerBg: [255, 255, 255, 1],
            pickerFontSize: 15,
            pickerFontColor: [102, 102, 102, 1],
            pickerTitleText: '',
            pickerFontSize: 17,
            onPickerConfirm: data => {
                var str = '';
                for (var i = 0; i < data.length; i++) {
                    str += data[i];
                }
                this.props.changeState({
                    dataSaved: false,
                    invoiceTypeName: str,
                    backDialogShow: false,
                    invoiceTypeCode: Util.getInvoiceTypeCode(str),
                });
            },
            onPickerCancel: () => {
                this.props.changeState({backDialogShow: false});
            }
        });
    }

    /**
     * 报销类型选择器
     */
    createReimbursementPicker() {
        const dismissKeyboard = require('dismissKeyboard');
        dismissKeyboard();
        Picker.init({
            pickerData: this.props.state.reimbursementTypeList,
            selectedValue: [this.props.state.reimbursementType],
            pickerConfirmBtnText: Message.COMPLETE,
            pickerCancelBtnText: Message.CANCEL,
            pickerConfirmBtnColor: [255, 170, 0, 1],
            pickerCancelBtnColor: [255, 170, 0, 1],
            pickerToolBarBg: [255, 255, 255, 1],
            pickerBg: [255, 255, 255, 1],
            pickerFontColor: [171, 171, 171, 1],
            pickerTitleText: '',
            pickerFontSize: 17,
            onPickerConfirm: data => {

                var areaStr = '';

                for (var i = 0; i < data.length; i++) {
                    if (data[i] == "" || data[i] == '<null>') {
                        areaStr = this.props.state.reimbursementTypeList[0];
                    } else {
                        areaStr += data[i];
                    }
                }

                var selectedList = this.getSelectedInvoiceListToNewReimbursement();
                this.props.navigateNewReimbursement({
                    applyTypeName: areaStr,
                    selectedList: selectedList
                })
                this.props.changeState({backDialogShow: false});
            },
            onPickerCancel: data => {
                this.props.changeState({backDialogShow: false});
            }
        });
    }

    /**
     * 取消键盘
     */
    cancelKeyboardEvent() {
        const dismissKeyboard = require('dismissKeyboard');
        dismissKeyboard();
    }

    //输入获得焦点
    inputOnFocus(component) {
        component.props.changeState({isFocused: true});
        Picker.hide();
    }

    //输入失去焦点
    inputOnBlur(component) {
        component.props.changeState({
            isFocused: false,
            dataSaved: false,
            totalAmount: this.moneyFormat(this.props.state.totalAmount, 2),
            invoiceAmount: this.moneyFormat(this.props.state.invoiceAmount, 2),
            invoiceCount: this.moneyFormat(this.props.state.invoiceCount, 3)
        });
    }

    /**
     * 渲染输入金额时的输入限制
     * @param value 输入的数字
     * @param flag  0表示totalAmount，1表示invoiceAmount
     */
    renderMoneyFormat(value, flag) {
        if (this.props.state.isFocused) {

            const arr = value.split('.');


            //判断输入是否是数字
            if (!Util.checkFloatNumber(value)) {
                Util.showToast(Message.EDIT_INVOICE_AMOUNT_FORMAT_CHECK);
                return;
            }
            //整数最大7位
            if (parseFloat(value) >= 10000000) {
                return;
            }
            //最多2位小数
            if (arr.length == 2 && arr[1].length > 2) {
                return;
            }

            if (flag == 0) {
                this.props.changeState({
                    dataSaved: false,
                    totalAmount: value
                })
            } else if (flag == 1) {
                this.props.changeState({
                    dataSaved: false,
                    invoiceAmount: value
                })
            }
        }
    }

    /**
     * 渲染输入不含祱价时的输入限制
     * @param value 输入的数字
     */
    renderMoneyFormat2(value) {
        if (this.props.state.isFocused) {

            const arr = value.split('.');


            //判断输入是否是数字
            if (!Util.checkFloatNumber(value)) {
                Util.showToast(Message.EDIT_INVOICE_AMOUNT_FORMAT_CHECK);
                return;
            }
            //整数最大12位
            if (parseFloat(value) >= 10000000) {
                return;
            }
            //最多2位小数
            if (arr.length == 2 && arr[1].length > 2) {
                return;
            }

            this.props.changeState({
                dataSaved: false,
                invoiceAmount: value
            })
        }
    }

    /**
     * 金额保留2位小数
     * @returns {string}
     */
    moneyFormat(money, flag) {
        if (Util.checkIsEmptyString(money)) {
            money = '';
        }
        var result = '';
        switch (flag) {
            case 1:
                result = (parseFloat(this.props.state.totalAmount) + '') == 'NaN' ? '' : parseFloat(this.props.state.totalAmount).toFixed(2) + '';
                return result;
            case 2:
                result = ((parseFloat(money) + '') == 'NaN') ? '' : (parseFloat(money).toFixed(2) + '');
                return result;
            case 3:
                result = ((parseFloat(money) + '') == 'NaN') ? '' : (parseFloat(money).toFixed(0) + '');
                return result;

            default:
        }
    }

    invoiceDateFormat() {
        var result = this.props.state.invoiceDate;
        var year = result.substring(0, 4);
        var month = result.substring(4, 6);
        var day = result.substring(6);
        return year + '-' + month + '-' + day;
    }

    /**
     * 渲染输入副附件张数的输入限制
     * @param value 输入的数字
     */
    renderInvoiceCount(value) {
        if (this.props.state.isFocused) {
            if (Util.checkIsEmptyString(value)) {
                this.props.changeState({
                    dataSaved: false,
                    invoiceCount: value
                })
                return;
            }
            //判断输入是否是数字
            if (!Util.checkFloatNumber(value)) {
                Util.showToast(Message.NEW_INVOICE_INVALID_ATTACHMENT_NUMBER);
                return;
            }
            //判断是否包含小数点
            if (value.indexOf('.') > -1) {
                Util.showToast(Message.NEW_INVOICE_INVALID_ATTACHMENT_NUMBER);
                return;
            }
            //整数最大12位
            if (parseFloat(value) >= 1000) {
                return;
            }
            if (value == 0) {
                Util.showToast(Message.NEW_INVOICE_INVALID_ATTACHMENT_NUMBER);
                return;
            }
            this.props.changeState({
                dataSaved: false,
                invoiceCount: value
            })
        }
    }

    /**
     * 渲染汽车、其他票模板
     */
    renderTemplateOne() {
        const dismissKeyboard = require('dismissKeyboard');
        let template = (
            <View>
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={styles.row}>
                        <Text style={styles.inputLabel}>{Message.NEW_INVOICE_DATE}<Text
                            style={{color: '#D60000'}}>*</Text></Text>
                        <TouchableOpacity style={styles.selectBtn} onPress={() => {
                            dismissKeyboard();
                            Picker.hide();
                            this.props.changeState({isModalBoxOpen: true});
                        }}>
                            {
                                Util.checkIsEmptyString(this.props.state.invoiceDate) ? (
                                    <Text style={[styles.inputText, {color: '#ABABAB'}]}>
                                        {Message.NEW_INVOICE_DATE_PLACEHOLDER}
                                    </Text>
                                ) : (
                                    <Text style={styles.inputText}>
                                        {this.invoiceDateFormat()}
                                    </Text>
                                )
                            }
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
                <View style={CustomStyles.separatorLine}/>
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={styles.row}>
                        <Text style={styles.inputLabel}>{Message.NEW_INVOICE_AMOUNT}<Text
                            style={{color: '#D60000'}}>*</Text></Text>
                        <TextInput
                            style={[styles.inputText, {flex: 1}]}
                            underlineColorAndroid="transparent"
                            selectionColor="#FFAA00"
                            placeholder={Message.NEW_INVOICE_AMOUNT_PLACEHOLDER}
                            placeholderTextColor='#ABABAB'
                            onChangeText={(text) => {
                                this.renderMoneyFormat(text, 0);
                            }}
                            value={this.props.state.totalAmount + ''}
                            onBlur={() => {
                                this.inputOnBlur(this)
                            }}
                            onFocus={() => {
                                this.inputOnFocus(this)
                            }}
                            keyboardType="numeric"
                            returnKeyType={'done'}/>
                    </View>
                </TouchableWithoutFeedback>
                <View style={CustomStyles.separatorLine}/>
                <View>
                    <TouchableWithoutFeedback onPress={dismissKeyboard}>
                        <View style={styles.row}>
                            <Text style={styles.inputLabel}>{Message.NEW_INVOICE_ATTACHMENT_COUNT}<Text
                                style={{color: '#D60000'}}>*</Text></Text>
                            <TextInput
                                style={[styles.inputText, {flex: 1}]}
                                placeholder={Message.NEW_INVOICE_ATTACHMENT_COUNT_PLACEHOLDER}
                                placeholderTextColor="#ABABAB"
                                underlineColorAndroid="transparent"
                                selectionColor="#FFAA00"
                                onChangeText={(text) => {
                                    this.renderInvoiceCount(text);
                                }}
                                value={this.props.state.invoiceCount + ''}
                                onBlur={() => {
                                    this.inputOnBlur(this)
                                }}
                                onFocus={() => {
                                    this.inputOnFocus(this)
                                }}
                                keyboardType="numeric"
                                returnKeyType={'done'}/>
                        </View>
                    </TouchableWithoutFeedback>
                    <View style={CustomStyles.separatorLine}/>
                </View>
            </View>
        )
        return (
            <View>
                {template}
            </View>
        )
    }


    //火车票通用字段
    renderCommon() {
        const dismissKeyboard = require('dismissKeyboard');
        return (
            <View>
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={styles.row}>
                        <Text style={styles.inputLabel}>{Message.NEW_INVOICE_FROM_CITY}</Text>
                        <TextInput
                            style={[styles.inputText, {flex: 1}]}
                            placeholder={Message.NEW_INVOICE_FROM_CITY_PLACEHOLDER}
                            placeholderTextColor="#ABABAB"
                            underlineColorAndroid="transparent"
                            selectionColor="#FFAA00"
                            onChangeText={(text) => {
                                this.props.changeState({
                                    dataSaved: false,
                                    departCity: text
                                })
                            }}
                            onFocus={() => {
                                this.inputOnFocus(this)
                            }}
                            maxLength={10}
                            value={this.props.state.departCity}
                            returnKeyType={'done'}/>
                    </View>
                </TouchableWithoutFeedback>
                <View style={CustomStyles.separatorLine}/>
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={styles.row}>
                        <Text style={styles.inputLabel}>{Message.NEW_INVOICE_TO_CITY}</Text>
                        <TextInput
                            style={[styles.inputText, {flex: 1}]}
                            placeholder={Message.NEW_INVOICE_TO_CITY_PLACEHOLDER}
                            placeholderTextColor="#ABABAB"
                            underlineColorAndroid="transparent"
                            selectionColor="#FFAA00"
                            onChangeText={(text) => {
                                this.props.changeState({
                                    dataSaved: false,
                                    arriveCity: text
                                })
                            }}
                            onFocus={() => {
                                this.inputOnFocus(this)
                            }}
                            maxLength={10}
                            value={this.props.state.arriveCity}
                            returnKeyType={'done'}/>
                    </View>
                </TouchableWithoutFeedback>
                <View style={CustomStyles.separatorLine}/>
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={styles.row}>
                        <Text style={styles.inputLabel}>{Message.NEW_INVOICE_TRAIN_NUMBER}</Text>
                        <TextInput
                            style={[styles.inputText, {flex: 1}]}
                            placeholder={Message.NEW_INVOICE_TRAIN_NUMBER_PLACEHOLDER}
                            placeholderTextColor="#ABABAB"
                            underlineColorAndroid="transparent"
                            selectionColor="#FFAA00"
                            onChangeText={(text) => {
                                this.props.changeState({
                                    dataSaved: false,
                                    trainNumber: text
                                })
                            }}
                            onFocus={() => {
                                this.inputOnFocus(this)
                            }}
                            maxLength={10}
                            value={this.props.state.trainNumber}
                            returnKeyType={'done'}/>
                    </View>
                </TouchableWithoutFeedback>
                <View style={CustomStyles.separatorLine}/>
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={styles.row}>
                        <Text style={styles.inputLabel}>{Message.TRAIN_OR_PLANE_INVOICE_DETAIL_DATE}<Text
                            style={{color: '#D60000'}}>*</Text></Text>
                        <TouchableOpacity style={styles.selectBtn} onPress={() => {
                            dismissKeyboard();
                            Picker.hide();
                            this.props.changeState({isModalBoxOpen: true});
                        }}>
                            {
                                Util.checkIsEmptyString(this.props.state.invoiceDate) ? (
                                    <Text style={[styles.inputText, {color: '#ABABAB'}]}>
                                        {Message.NEW_INVOICE_DATE_PLACEHOLDER}
                                    </Text>
                                ) : (
                                    <Text style={styles.inputText}>
                                        {this.invoiceDateFormat()}
                                    </Text>
                                )
                            }
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
                <View style={CustomStyles.separatorLine}/>
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={styles.row}>
                        <Text style={styles.inputLabel}>{Message.NEW_INVOICE_AMOUNT}<Text
                            style={{color: '#D60000'}}>*</Text></Text>
                        <TextInput
                            style={[styles.inputText, {flex: 1}]}
                            underlineColorAndroid="transparent"
                            selectionColor="#FFAA00"
                            placeholder={Message.NEW_INVOICE_AMOUNT_PLACEHOLDER}
                            placeholderTextColor='#ABABAB'
                            onChangeText={(text) => {
                                this.renderMoneyFormat(text, 0);
                            }}
                            value={Util.checkIsEmptyString(this.props.state.totalAmount) ? '' : this.props.state.totalAmount + ''}
                            onBlur={() => {
                                this.inputOnBlur(this)
                            }}
                            onFocus={() => {
                                this.inputOnFocus(this)
                            }}
                            keyboardType="numeric"
                            returnKeyType={'done'}/>
                    </View>
                </TouchableWithoutFeedback>
                <View style={CustomStyles.separatorLine}/>
            </View>
        )
    }

    /**
     * 渲染火车、飞机票模板
     */
    renderTemplateTwo() {
        return (
            <View>
                {this.renderCommon()}
            </View>
        )
    }

    /**
     * 增票
     * @returns {XML}
     */
    renderTemplateThree() {
        const dismissKeyboard = require('dismissKeyboard');
        return (
            <View>
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={styles.row}>
                        <Text style={styles.inputLabel}>{Message.INVOICE_DETAIL_INVOICE_CODE}<Text
                            style={{color: '#D60000'}}>*</Text></Text>
                        <TextInput
                            style={[styles.inputText, {flex: 1}]}
                            placeholder={Message.NEW_INVOICE_CODE_PLACEHOLDER}
                            placeholderTextColor="#ABABAB"
                            underlineColorAndroid="transparent"
                            selectionColor="#FFAA00"
                            value={this.props.state.invoiceCode}
                            onChangeText={(text) => {
                                this.props.changeState({
                                    dataSaved: false, invoiceCode: text
                                })
                            }}
                            onFocus={() => {
                                this.inputOnFocus(this)
                            }}
                            maxLength={12}
                            keyboardType="numeric"
                            returnKeyType={'done'}/>
                    </View>
                </TouchableWithoutFeedback>
                <View style={CustomStyles.separatorLine}/>
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={styles.row}>
                        <Text style={styles.inputLabel}>{Message.INVOICE_DETAIL_INVOICE_NUMBER}<Text
                            style={{color: '#D60000'}}>*</Text></Text>
                        <TextInput
                            style={[styles.inputText, {flex: 1}]}
                            placeholder={Message.NEW_INVOICE_NUMBER_PLACEHOLDER}
                            placeholderTextColor="#ABABAB"
                            underlineColorAndroid="transparent"
                            selectionColor="#FFAA00"
                            value={this.props.state.invoiceNo}
                            onChangeText={(text) => {
                                this.props.changeState({
                                    dataSaved: false, invoiceNo: text
                                })
                            }}
                            onFocus={() => {
                                this.inputOnFocus(this)
                            }}
                            keyboardType="numeric"
                            maxLength={8}
                            returnKeyType={'done'}/>
                    </View>
                </TouchableWithoutFeedback>
                <View style={CustomStyles.separatorLine}/>
                <TouchableOpacity onPress={() => {
                    dismissKeyboard();
                    Picker.hide();
                    this.props.changeState({isModalBoxOpen: true});
                }}>
                    <View style={styles.row}>
                        <Text style={styles.inputLabel}>
                            {Message.INVOICE_DETAIL_CREATE_DATE}
                            <Text style={{color: '#D60000'}}>*</Text>
                        </Text>
                        {
                            Util.checkIsEmptyString(this.props.state.invoiceDate) ? (
                                <Text style={[styles.inputText, {flex: 1, color: '#ABABAB'}]}
                                      numberOfLines={1}>{Message.NEW_RE_SELECT_END_DATE}</Text>
                            ) : (
                                <Text style={[styles.inputText, {flex: 1, color: '#666666'}]}
                                      numberOfLines={1}>{Util.formatDate(this.props.state.invoiceDate)}</Text>
                            )
                        }
                    </View>
                </TouchableOpacity>
                <View style={CustomStyles.separatorLine}/>
                {Util.contains(['01', '02'], this.props.state.invoiceTypeCode) ? (null) : (
                    <TouchableWithoutFeedback onPress={dismissKeyboard}>
                        <View style={styles.row}>
                            <Text style={styles.inputLabel}>{Message.INVOICE_DETAIL_VALIDATION_CODE}<Text
                                style={{color: '#D60000'}}>*</Text></Text>
                            <TextInput
                                style={[styles.inputText, {flex: 1}]}
                                placeholder={Message.NEW_INVOICE_VALIDATION_CODE_PLACEHOLDER}
                                placeholderTextColor="#ABABAB"
                                underlineColorAndroid="transparent"
                                selectionColor="#FFAA00"
                                value={this.props.state.verifyCode}
                                onChangeText={(text) => {
                                    this.props.changeState({
                                        dataSaved: false, verifyCode: text
                                    })
                                }}
                                onFocus={() => {
                                    this.inputOnFocus(this)
                                }}
                                keyboardType="numeric"
                                maxLength={20}
                                returnKeyType={'done'}/>
                        </View>
                    </TouchableWithoutFeedback>
                )}
                {Util.contains(['01', '02'], this.props.state.invoiceTypeCode) ? (null) : (
                    <View style={CustomStyles.separatorLine}/>
                )}
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={styles.row}>
                        <Text style={styles.inputLabel}>{Message.INVOICE_DETAIL_BUYER}</Text>
                        <TextInput
                            style={[styles.inputText, {flex: 1}]}
                            placeholder={Message.NEW_INVOICE_BUYER_PLACEHOLDER}
                            placeholderTextColor="#ABABAB"
                            underlineColorAndroid="transparent"
                            selectionColor="#FFAA00"
                            value={this.props.state.buyerName}
                            onChangeText={(text) => {
                                this.props.changeState({
                                    dataSaved: false, buyerName: text
                                })
                            }}
                            onFocus={() => {
                                this.inputOnFocus(this)
                            }}
                            maxLength={50}
                            keyboardType={'default'}
                            returnKeyType={'done'}/>
                    </View>
                </TouchableWithoutFeedback>
                <View style={CustomStyles.separatorLine}/>
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={styles.row}>
                        <Text style={styles.inputLabel}>{Message.INVOICE_DETAIL_DETAIL}</Text>
                        <TextInput
                            style={[styles.inputText, {flex: 1}]}
                            placeholder={Message.NEW_INVOICE_DETAIL_PLACEHOLDER}
                            placeholderTextColor="#ABABAB"
                            underlineColorAndroid="transparent"
                            selectionColor="#FFAA00"
                            value={this.props.state.invoiceDetail}
                            onChangeText={(text) => {
                                this.props.changeState({
                                    dataSaved: false, invoiceDetail: text
                                })
                            }}
                            onFocus={() => {
                                this.inputOnFocus(this)
                            }}
                            maxLength={50}
                            keyboardType={'default'}
                            returnKeyType={'done'}/>
                    </View>
                </TouchableWithoutFeedback>
                <View style={CustomStyles.separatorLine}/>
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={styles.row}>
                        <Text style={styles.inputLabel}>{Message.INVOICE_DETAIL_AMOUNT}</Text>
                        <TextInput
                            style={[styles.inputText, {flex: 1}]}
                            underlineColorAndroid="transparent"
                            placeholder={Message.NEW_INVOICE_SJHJ_PLACEHOLDER}
                            placeholderTextColor="#ABABAB"
                            selectionColor="#FFAA00"
                            value={Util.checkIsEmptyString(this.props.state.totalAmount) ? '' : this.props.state.totalAmount + ''}
                            onChangeText={(text) => {
                                this.renderMoneyFormat(text, 0);
                            }}
                            onBlur={() => {
                                this.inputOnBlur(this)
                            }}
                            onFocus={() => {
                                this.inputOnFocus(this)
                            }}
                            keyboardType="numeric"
                            returnKeyType={'done'}/>
                    </View>
                </TouchableWithoutFeedback>
                <View style={CustomStyles.separatorLine}/>
                {(Util.contains(['01', '02'], this.props.state.invoiceTypeCode)) ?
                    (<TouchableWithoutFeedback onPress={dismissKeyboard}>
                        <View style={styles.row}>
                            <Text style={styles.inputLabel}>
                                {Message.NEW_INVOICE_BHSJ}
                                {
                                    Util.contains(['01', '02'], this.props.state.invoiceTypeCode) ? (
                                        <Text style={{color: '#D60000'}}>*</Text>) : (
                                        null
                                    )
                                }
                            </Text>
                            <TextInput
                                style={[styles.inputText, {flex: 1}]}
                                underlineColorAndroid="transparent"
                                selectionColor="#FFAA00"
                                placeholder={Message.NEW_INVOICE_BHSJ_PLACEHOLDER}
                                placeholderTextColor="#ABABAB"
                                onChangeText={(text) => {
                                    if (this.props.state.isFocused) {
                                        this.renderMoneyFormat2(text);
                                    }
                                }}
                                value={Util.checkIsEmptyString(this.props.state.invoiceAmount) ? '' : this.props.state.invoiceAmount + ''}
                                onBlur={() => {
                                    this.inputOnBlur(this)
                                }}
                                onFocus={() => {
                                    this.inputOnFocus(this)
                                }}
                                keyboardType="numeric"
                                returnKeyType={'done'}/>
                        </View>
                    </TouchableWithoutFeedback>) : (null)}
                {(Util.contains(['01', '02'], this.props.state.invoiceTypeCode)) ?
                    (<View style={CustomStyles.separatorLine}/>) : (null)}
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={styles.row}>
                        <Text style={styles.inputLabel}>{Message.INVOICE_DETAIL_SELLER}</Text>
                        <TextInput
                            style={[styles.inputText, {flex: 1}]}
                            placeholder={Message.NEW_INVOICE_SELLER_PLACEHOLDER}
                            placeholderTextColor="#ABABAB"
                            underlineColorAndroid="transparent"
                            selectionColor="#FFAA00"
                            value={this.props.state.salerName}
                            onChangeText={(text) => {
                                this.props.changeState({
                                    dataSaved: false, salerName: text
                                })
                            }}
                            onFocus={() => {
                                this.inputOnFocus(this)
                            }}
                            maxLength={50}
                            returnKeyType={'done'}/>
                    </View>
                </TouchableWithoutFeedback>
                <View style={CustomStyles.separatorLine}/>
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={styles.row}>
                        <Text style={styles.inputLabel}>{Message.NEW_INVOICE_ATTACHMENT_REMARK}</Text>
                        <TextInput
                            style={[styles.inputText, {flex: 1}]}
                            placeholder={Message.NEW_INVOICE_ATTACHMENT_REMARK_PLACEHOLDER}
                            placeholderTextColor="#ABABAB"
                            underlineColorAndroid="transparent"
                            selectionColor="#FFAA00"
                            value={this.props.state.remark}
                            onChangeText={(text) => {
                                this.props.changeState({
                                    dataSaved: false, remark: text
                                })
                            }}
                            onFocus={() => {
                                this.inputOnFocus(this)
                            }}
                            maxLength={50}
                            returnKeyType={'done'}/>
                    </View>
                </TouchableWithoutFeedback>
                <View style={CustomStyles.separatorLine}/>
            </View>
        )
    }

    /**
     * 新增弹窗
     */
    popDialog() {
        this.props.changeState({showDialog: true});
    }

    /**
     * 点击立即报销
     */
    reimbursementNow() {
        var thiz = this;
        if (this.props.state.dataSaved) {
            thiz.doReimbursement(thiz, this.props.state, this.props.state.invoiceDetail);
            return;
        }
        this.preSaveAction(true, function (data, goodsName) {
            thiz.doReimbursement(thiz, data, goodsName)
        })
    }

    /**
     * 立即报销
     */
    doReimbursement(thiz, data, goodsName) {
        if (Util.contains(['01', '02', '04', '10', '11'], data.invoiceTypeCode)) {
            if (data.checkState == '1' && data.reimburseState == '0') {

                if (thiz.props.navigation.state.params.fromNew) {
                    //新建报销单进入详情，直接跳转新建报销单页面
                    var selectInvoiceList = [];
                    var targetInvoiceItem = {};
                    targetInvoiceItem.invoiceType = data.invoiceTypeCode;
                    targetInvoiceItem.invoiceNum = 1;
                    targetInvoiceItem.invoiceDetail = goodsName;
                    targetInvoiceItem.invoiceUUID = data.uuid;
                    targetInvoiceItem.invoiceDateStr = Util.formatDate(data.invoiceDate);
                    targetInvoiceItem.invoiceAmount = data.totalAmount;
                    targetInvoiceItem.imageAddress = '';
                    selectInvoiceList.push(targetInvoiceItem);
                    thiz.props.selectInvoice(thiz.props.navigation.state.params.expenseId, selectInvoiceList);
                    thiz.props.resetNewReimbursement({noInit: true});
                    return;
                }
                if (Platform.OS === 'android') {
                    RNBridgeModule.checkFloatWindowOpAllowed((result)=> {
                        this.props.changeState({backDialogShow: true});
                        thiz.createReimbursementPicker();
                        Picker.show();
                    });
                } else {
                    this.props.changeState({backDialogShow: true});
                    thiz.createReimbursementPicker();
                    Picker.show();
                }
            } else {
                if (data.checkState == '0') {
                    Util.showToast(Message.INVOICE_CHECK_FAILED);
                } else if (data.reimburseState != '0') {
                    Util.showToast(Message.INVOICE_REIMBURSED);
                }
            }
        } else {
            if (thiz.props.navigation.state.params.fromNew) {
                //新建报销单进入详情，直接跳转新建报销单页面
                var selectInvoiceList = [];
                var targetInvoiceItem = {};
                targetInvoiceItem.invoiceType = data.invoiceTypeCode;
                targetInvoiceItem.invoiceNum = data.invoiceCount;
                targetInvoiceItem.invoiceDetail = goodsName;
                targetInvoiceItem.invoiceUUID = data.uuid;
                targetInvoiceItem.invoiceDateStr = Util.formatDate(data.invoiceDate);
                targetInvoiceItem.invoiceAmount = data.totalAmount;
                targetInvoiceItem.imageAddress = '';
                selectInvoiceList.push(targetInvoiceItem);
                thiz.props.selectInvoice(thiz.props.navigation.state.params.expenseId, selectInvoiceList);
                thiz.props.resetNewReimbursement({noInit: true});
                return;
            }
            if (Platform.OS === 'android') {
                RNBridgeModule.checkFloatWindowOpAllowed((result)=> {
                    this.props.changeState({backDialogShow: true});
                    thiz.createReimbursementPicker();
                    Picker.show();
                });
            } else {
                this.props.changeState({backDialogShow: true});
                thiz.createReimbursementPicker();
                Picker.show();
            }
        }
    }

    /**
     * 关闭相机权限弹框
     */
    onCloseCamera() {
        this.props.changeState({showNoPermissionDialog: false});
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
                    quality: 0.6
                };
                ImagePicker.launchCamera(options, (response) => {
                    if (response.didCancel || response.error || response.customButton) {
                        //取消 异常 自定义按钮
                    }
                    else {
                        this.props.changeState({
                            isLoading: true,
                        });
                        this.props.ocrValidation({picture: response.data}, {});
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
                    quality: 0.6
                };
                ImagePicker.launchImageLibrary(options, (response) => {
                    if (response.didCancel || response.error || response.customButton) {
                        //取消 异常 自定义按钮
                    }
                    else {
                        this.props.changeState({
                            isLoading: true,
                        });
                        this.props.ocrValidation({picture: response.data}, {});
                    }
                });
            });

    }

    /**
     * 继续归集点击取消
     */
    returnToInvoiceList() {
        this.props.changeState({
            showDialog: false,
        });
        this.props.backToInvoiceList();
    }

    /**
     * 打开弹窗初始日期（年月日）
     * @returns {*}
     */
    getInitialDate() {
        if (this.props.state.showDateSelected == '') {
            if (this.props.state.invoiceDate == '') {
                return this.props.state.defaultSelectedDate;
            } else {
                return Util.formatDate1(this.props.state.invoiceDate);
            }
        } else {
            return this.props.state.showDateSelected;
        }
    }

    /**
     * 日期确认触发
     */
    calendarConfirmPress() {
        let invoiceDate = this.props.state.invoiceDate;
        const d = new Date();
        const year = d.getFullYear() + '-';
        let month = d.getMonth() + 1;
        let day = d.getDate();
        if (month < 10) {
            month = '0' + month + '-';
        } else {
            month = month + '-';
        }
        if (day < 10) {
            day = '0' + day;
        } else {
            day = day + '';
        }

        if (invoiceDate == '') {
            invoiceDate = year + month + day;
        }

        this.props.changeState({
            isShowCalendar: true,
            isModalBoxOpen: false,
            dataSaved: false,
            invoiceDate: invoiceDate
        });
    }

    /**
     * 日历选择日触发事件
     */
    calendarDayPress(day) {
        let year = day.year;
        let month = day.month;
        let selectedDay = day.day;
        if (month < 10) {
            month = '0' + month;
        }
        if (selectedDay < 10) {
            selectedDay = '0' + selectedDay;
        }
        const showDateSelected = year + '年' + month + '月' + selectedDay + '日';
        this.props.changeState({
            invoiceDate: day.dateString.replace(/-/g, ''),
            showDateSelected: showDateSelected
        })
    }

    render() {
        const dismissKeyboard = require('dismissKeyboard');
        var input = null;
        var title = '';
        var token = this.props.state.token;
        if (Util.contains(['01', '04', '10', '11', '02'], this.props.state.invoiceTypeCode)) {
            input = this.renderTemplateThree();
            title = Util.getInvoiceTypeName(this.props.state.invoiceTypeCode);
        } else if (Util.contains(['92', '93'], this.props.state.invoiceTypeCode)) {
            input = this.renderTemplateTwo();
            title = Util.getInvoiceTypeName(this.props.state.invoiceTypeCode);
        } else {
            input = this.renderTemplateOne();
            title = Util.getInvoiceTypeName(this.props.state.invoiceTypeCode);
        }
        return (
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <SafeAreaView style={styles.container}>
                    <View style={{flex: 1, backgroundColor: '#F3F3F3'}}>
                        <CommonLoading isShow={this.props.state.isLoading}/>
                        {
                            this.props.state.isModalBoxOpen ? (

                                <View style={styles.parentView}>
                                    <TouchableWithoutFeedback onPress={() => {
                                        this.props.changeState({
                                            isModalBoxOpen: false,
                                        })
                                    }} style={styles.touchableStyle}>
                                        <View style={styles.touchableChildView}/>
                                    </TouchableWithoutFeedback>
                                    <View style={styles.childView}>
                                        <View style={styles.calendarShowView}>
                                            <View style={styles.dateView}>
                                                <TouchableWithoutFeedback
                                                    onPress={() => {
                                                        this.props.changeState({isShowCalendar: true});
                                                    }}
                                                >
                                                    <View style={styles.wrappedDateView}>
                                                        <Text style={styles.wrappedDateText}>
                                                            {
                                                                this.getInitialDate()
                                                            }
                                                        </Text>
                                                    </View>
                                                </TouchableWithoutFeedback>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    this.calendarConfirmPress();
                                                }}
                                            >
                                                <View style={styles.confirmView}>
                                                    <Text style={styles.confirmText}>
                                                        {Message.CONFIRM}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={[CustomStyles.separatorLine, {width: deviceWidth}]}/>
                                        {
                                            <CalendarList
                                                current={this.props.state.invoiceDate ? new Date(this.props.state.invoiceDate.substring(0, 4), this.props.state.invoiceDate.substring(4, 6) - 1, this.props.state.invoiceDate.substring(6)) : null}
                                                // Callback which gets executed when visible months change in scroll view. Default = undefined
                                                onVisibleMonthsChange={(months) => {
                                                    console.log('now these months are visible', months);
                                                }}
                                                // Max amount of months allowed to scroll to the past. Default = 50
                                                pastScrollRange={500}
                                                // Max amount of months allowed to scroll to the future. Default = 50
                                                futureScrollRange={500}
                                                // Enable or disable scrolling of calendar list
                                                scrollEnabled={true}
                                                // Enable or disable vertical scroll indicator. Default = false
                                                showScrollIndicator={true}
                                                showWeekNumbers={true}
                                                onDayPress={(day) => {
                                                    this.calendarDayPress(day);
                                                }}
                                                markedDates={{
                                                    [Util.formatDate(this.props.state.invoiceDate)]: {selected: true}
                                                }}
                                                theme={{
                                                    selectedDayBackgroundColor: 'orange',
                                                    selectedDayTextColor: '#ffffff',
                                                    todayTextColor: 'orange',
                                                }}
                                            />
                                        }
                                    </View>
                                </View>
                            ) : null
                        }
                        <Dialog
                            content={Message.NEW_INVOICE_BACK_SAVE}
                            type={'confirm'}
                            leftBtnText={Message.CANCEL}
                            rightBtnText={Message.CONFIRM}
                            modalVisible={this.props.state.saveModalVisible}
                            leftBtnStyle={{color: '#A5A5A5',}}
                            rightBtnStyle={{color: '#FFAA00',}}
                            onClose={this._closeModal.bind(this)}
                            leftBtnClick={this._cancelClick.bind(this)}
                            rightBtnClick={this.preSaveAction.bind(this, false, null)}
                            thisComponent={this}
                        />

                        <Dialog
                            titleText={this.props.state.dialogTitle}
                            content={this.props.state.dialogContent}
                            type={'confirm'}
                            leftBtnText={Message.CANCEL}
                            rightBtnText={Message.AUTHORIZE_SET_PERMISSIONS}
                            modalVisible={this.props.state.showNoPermissionDialog}
                            leftBtnStyle={{color: '#A5A5A5',}}
                            rightBtnStyle={{color: '#FFAA00',}}
                            rightBtnClick={Permissions.openSettings}
                            thisComponent={this}
                            onClose={this.onCloseCamera.bind(this)}
                        />

                        <PopDialog
                            showVisible={this.props.state.showDialog}
                            thisComponent={this}
                            scanClick={()=> {
                                this.props.changeState({showDialog: false});
                                Permissions.checkMultiplePermissions(['camera', 'photo'])
                                    .then(response => {
                                        //判断是否具有相机权限，相册权限
                                        if (!Util.checkPermission(response.camera)) {
                                            this.props.changeState({
                                                dialogTitle: Message.AUTHORITY_SETTING,
                                                dialogContent: Message.AUTHORIZE_CAMERA_AND_PHOTO_ALBUM,
                                                showNoPermissionDialog: true,
                                            });
                                            return;
                                        }
                                        this.props.navigateScanQrCode()
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
                            backClick={() => this.props.changeState({showDialog: false})}
                        />

                        <BackDialog
                            backgroundClick={(component) => {
                                Picker.hide();
                                component.props.changeState({backDialogShow: false});
                            }}
                            isShow={this.props.state.backDialogShow}
                            thisComponent={this}/>
                        {this.renderImgPreview()}
                        {
                            this.props.navigation.state.params.hideSave ? (
                                <Header
                                    titleText={title}
                                    thisComponent={this}
                                    backClick={this.onBack}
                                    backControl={false}
                                />
                            ) : (
                                <Header
                                    titleText={title}
                                    thisComponent={this}
                                    backClick={this.onBack}
                                    rightText={Message.SAVE}
                                    rightClick={this.preSaveAction.bind(this, false, null)}
                                    backControl={false}
                                />
                            )
                        }


                        <InputScrollView style={styles.content} keyboardOffset={80}
                                         keyboardShouldPersistTaps={'handled'}>
                            <TouchableOpacity style={{flex: 1}} onPress={() => {
                                this.props.changeState({backDialogShow: true});

                                if (Platform.OS === 'android') {
                                    RNBridgeModule.checkFloatWindowOpAllowed((result)=> {
                                        this.createInvoiceTypePicker();
                                        Picker.show();
                                    });
                                } else {
                                    this.createInvoiceTypePicker();
                                    Picker.show();
                                }

                            }}>
                                <View style={styles.selectBtn}>
                                    <Text style={styles.inputLabel}>
                                        {Message.NEW_INVOICE_TYPE}
                                    </Text>
                                    {
                                        Util.checkIsEmptyString(this.props.state.invoiceTypeName) ? (
                                            <Text style={[styles.inputText, {color: '#ABABAB'}]}>
                                                {Message.NEW_INVOICE_TYPE_PLACEHOLDER}
                                            </Text>
                                        ) : (
                                            <Text style={styles.inputText}>
                                                {this.props.state.invoiceTypeName}
                                            </Text>
                                        )
                                    }
                                    <Image source={require('./../../img/common/arrow.png')} style={styles.arrowIcon}/>
                                </View>
                            </TouchableOpacity>

                            <View style={CustomStyles.separatorLine}/>
                            {input}
                            {(this.props.state.dataSourceCode == '102' || this.props.state.dataSourceCode == '103') ?
                                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                    <View style={styles.row}>
                                        <Text style={styles.inputLabel}>{Message.PICTURE}</Text>
                                    </View>
                                </TouchableWithoutFeedback> : <View/>}

                            {(this.props.state.dataSourceCode == '102' || this.props.state.dataSourceCode == '103') ?
                                (<TouchableOpacity onPress={() => {
                                        this.cancelKeyboardEvent();
                                        this.props.changeState({
                                            previewShow: true,
                                        })
                                    }}>
                                        { Platform.OS === 'android' ? (
                                            <Image
                                                style={{
                                                    height: ScreenUtil.scaleSize(437),
                                                    width: ScreenUtil.scaleSize(690),
                                                    resizeMode: 'contain',
                                                }}
                                                source={{uri: this.props.state.imageBase64}}
                                            />
                                        ) : (
                                            <Image source={{
                                                uri: API.GET_INVOICE_IMAGE,
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'token': token
                                                },
                                                body: JSON.stringify({uuid: this.props.navigation.state.params.uuid})
                                            }} style={{
                                                height: ScreenUtil.scaleSize(437),
                                                width: ScreenUtil.scaleSize(690),
                                                resizeMode: 'contain',
                                            }}/>
                                        )}
                                    </TouchableOpacity>
                                ) : (<View/>)}
                            <View style={{
                                height: ScreenUtil.scaleSize(240)
                            }}/>
                        </InputScrollView>
                        {this.renderBottomView()}
                    </View>
                </SafeAreaView>
            </TouchableWithoutFeedback>
        )
    }
}

function mapStateToProps(state) {
    return {
        state: state.EditInvoice,
        nav: state.nav,
        appState: state.App,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        back: back,
        initData: initData,
        ocrValidation: ocrValidation,
        navigateScanQrCode: navigateScanQrCode,
        backToInvoiceList: backToInvoiceList,
        navigateNewReimbursement: navigateNewReimbursement,
        changeScanQrCodeState: changeScanQrCodeState,
        invoiceDelete: invoiceDelete,
        saveInvoice: saveInvoice,
        changeState: changeState,
        loadInvoiceDetail: loadInvoiceDetail,
        selectInvoice: selectInvoice,
        resetNewReimbursement: resetNewReimbursement,
        editToReimbursementSelectedInvoiceList: editToReimbursementSelectedInvoiceList,
        changeAppState: changeAppState,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(EditInvoice);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    info: {
        height: ScreenUtil.scaleSize(70),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFE9E9',
    },
    content: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: ScreenUtil.scaleSize(30),
        paddingBottom: ScreenUtil.scaleSize(20),
    },
    row: {
        height: ScreenUtil.scaleSize(80),
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputLabel: {
        width: ScreenUtil.scaleSize(210),
        color: '#666666',
        fontSize: ScreenUtil.setSpText(9),
    },
    inputText: {
        color: '#666666',
        fontSize: ScreenUtil.setSpText(9),
        padding: 0,
        flex: 1,
    },
    bottom: {
        height: ScreenUtil.scaleSize(120),
        width: deviceWidth,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        justifyContent: 'space-around',
        alignItems: 'center',
        // borderTopColor: '#DEDEDE',
        // borderTopWidth: ScreenUtil.scaleSize(1),
        position: 'absolute',
        bottom: 0,
    },
    selectBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: ScreenUtil.scaleSize(80),
    },
    actionBtn: {
        height: ScreenUtil.scaleSize(74),
        width: ScreenUtil.scaleSize(311),
        resizeMode: Image.resizeMode.contain,
    },

    arrowIcon: {
        width: ScreenUtil.scaleSize(19),
        height: ScreenUtil.scaleSize(32),
        resizeMode: Image.resizeMode.contain,
    },
    parentView: {
        position: 'absolute',
        height: deviceHeight,
        width: deviceWidth,
        left: 0,
        top: 0,
        zIndex: 1000,
        elevation: 4
    },
    touchableStyle: {
        position: 'absolute',
        left: 0,
        top: 0
    },
    touchableChildView: {
        height: deviceHeight,
        width: deviceWidth,
        backgroundColor: '#000000',
        opacity: 0.45
    },
    childView: {
        height: Platform.OS == 'ios' ? deviceHeight / 2 : deviceHeight / 3 * 2,
        width: deviceWidth,
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#FFFFFF'
    },
    calendarShowView: {
        flexDirection: 'row', alignItems: 'center',
        height: ScreenUtil.scaleSize(90),
        width: deviceWidth
    },
    dateView: {
        flexDirection: 'row', alignItems: 'center',
        height: ScreenUtil.scaleSize(90),
        flex: 1, marginLeft: ScreenUtil.scaleSize(30)
    },
    wrappedDateView: {
        height: ScreenUtil.scaleSize(90),
        borderColor: 'orange',
        borderBottomWidth: ScreenUtil.scaleSize(4),
        alignItems: 'center',
        justifyContent: 'center'
    },
    wrappedDateText: {
        fontSize: ScreenUtil.setSpText(12),
        color: '#666666',
        fontWeight: 'bold'
    },
    confirmView: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: ScreenUtil.scaleSize(30)
    },
    confirmText: {
        fontSize: ScreenUtil.setSpText(12),
        color: 'orange',
        fontWeight: 'bold'
    },
});