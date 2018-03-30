import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
    Image,
    StyleSheet,
    Text,
    View,
    TextInput,
    ScrollView,
    FlatList,
    Platform,
    NativeModules,
    TouchableOpacity,
    TouchableWithoutFeedback,
    BackHandler,
    DatePickerIOS,
    ToastAndroid
} from "react-native";
import ScreenUtil, {deviceWidth, deviceHeight} from "../../utils/ScreenUtil";
import InputScrollView from "react-native-input-scroll-view";
import Util from "../../utils/Util";
import API from "../../utils/API";
import Message from "../../constant/Message";
import Header from "../../containers/common/CommonHeader";
import CommonLoading from "../../containers/common/CommonLoading";
import Dialog from "./../common/Dialog";
import Picker from "react-native-picker";
import Store from "react-native-simple-store";
import {
    initData,
    selectReimType,
    uploadAttachment,
    deleteInvoice,
    deleteExpenseDetail,
    showAlert,
    closeAlert,
    changeState,
    loadData,
    saveReimbursement,
    addNewExpenseDetails,
    getExpenseType,
    editReimbursement,
    initReimbursement,
    deleteReimbursement,
    recogniseVoiceRecord,
    changeType
} from "../../redux/actions/reimbursement/Reimbursement";
import {ocrValidation} from "../../redux/actions/invoice/Invoice";
import Permissions from "react-native-permissions";
import PopDialog from "./../common/PopDialog";
import BackDialog from "./../common/BackDialog";
import PromptDialog from "../../containers/common/PromptDialog";
import {changeState as invoiceDetailsChangeState} from "../../redux/actions/invoice/InvoiceDetails";
import {
    navigateInvoiceList,
    back,
    navigateInvoiceDetails,
    navigateAddInvoice,
    navigateScanQrCode,
    navigateSelectCity
} from "../../redux/actions/navigator/Navigator";
import {changeState as changeAppState} from "../../redux/actions/App";
import {CustomStyles} from "../../css/CustomStyles";
import {CalendarList, LocaleConfig} from "react-native-calendars";
import {TimePicker} from "react-native-wheel-picker-android";
import SafeAreaView from "react-native-safe-area-view";
import Base64Images from "../../utils/Base64Images";

var RNBridgeModule = NativeModules.RNBridgeModule;
var VoiceRecordModule = NativeModules.VoiceRecordModule;
var OpenFileSystemModule = NativeModules.OpenFileSystem;
var PreviewModule = NativeModules.PreviewModule;
let lastRecordPressed = null;
const pickerConfirmBtnColor = [255, 170, 0, 1];
const pickerCancelBtnColor = [255, 170, 0, 1];
const pickerToolBarBg = [255, 255, 255, 1];
const pickerBg = [255, 255, 255, 1];
const pickerFontColor = [102, 102, 102, 1];

class NewReimbursement extends Component {

    static navigationOptions = ({navigation}) => ({
        header: null
    });

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

    componentWillMount() {
        //初始化页面
        if (!(this.props.navigation.state.params && this.props.navigation.state.params.noInit)) {
            this.props.initData();
        }
    }

    componentDidMount() {
        const that = this;
        Store.get('token').then((tokenStr) => {
            if (tokenStr) {
                that.props.changeState({
                    token: tokenStr
                })
            }
        })
        Store.get('user').then((user) => {
            if (user) {
                if (Util.checkIsEmptyString(that.props.newReimbursement.expenseDepartmentName) ||
                    Util.checkIsEmptyString(that.props.newReimbursement.expenseDepartmentId)) {
                    that.props.changeState({
                        expenseDepartmentName: user.orgDepName,
                        expenseDepartmentId: user.orgDepId,
                    })
                }
            }
        })

        //新建报销单到扫一扫在立即报销，不需要loadData
        if (!(this.props.navigation.state.params && this.props.navigation.state.params.noInit)) {
            setTimeout(() => {
                this.props.loadData(this.props.navigation.state.params, this.props.newReimbursement.bizExpenseTypeList);
            }, 200)
        }
    }

    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        Picker.hide();
        component.props.changeState({
            saveModalVisible: true,
        });
    }

    /**
     * 关闭弹出框
     */
    _closeModal() {
        this.props.changeState({
            showDialog: false,
            saveModalVisible: false,
            showNoPermissionDialog: false,
        });
    }

    /**
     * 保存取消
     * @private
     */
    _cancelClick() {
        this.props.back();
    }

    /**
     * 确定保存
     * @private
     */
    _ensureSaveClick() {
        this.submitReimbursement(0);
    }

    /**
     * 提示窗关闭事件
     * @private
     */
    _onClose() {
        this.props.changeState({
            showPrompt: false,
        });
        //操作成功后，立即返回上一页，否则留在当前页
        if (this.props.newReimbursement.promptType == 'success') {
            this.props.back();
        }
    }

    /**
     * 获取光标位置
     */
    getSelectIndex(event, inputStr) {
        this.props.changeState({
            selectionStart: Util.checkIsEmptyString(event.nativeEvent.selection.start) ? inputStr.length : event.nativeEvent.selection.start,
            selectionEnd: Util.checkIsEmptyString(event.nativeEvent.selection.end) ? inputStr.length : event.nativeEvent.selection.end,
        });
    }

    /**
     * 预览文件
     */
    previewDocument(item) {
        this.props.changeState({isLoading: true});
        setTimeout(
            () => {
                PreviewModule.previewDocument(API.DOWNLOAD_ATTACHMENT_BY_DIR, this.props.newReimbursement.token, JSON.stringify({fileDir: item.fileAddress}), item.fileAddress, item.fileName, (value)=> {
                    this.props.changeState({isLoading: false});
                })
            },
            500
        );

    }

    /**
     * 类型选择器
     */
    createTypePicker() {
        if (Util.checkIsEmptyString(this.props.newReimbursement.reimbursementTypeList) ||
            this.props.newReimbursement.reimbursementTypeList.length == 0) {
            Util.showToast(Message.NO_DATA);
            return;
        }
        const dismissKeyboard = require('dismissKeyboard');
        dismissKeyboard();
        Picker.init({
            pickerData: this.props.newReimbursement.reimbursementTypeList,
            selectedValue: [this.props.newReimbursement.applyTypeName],
            pickerConfirmBtnText: Message.COMPLETE,
            pickerCancelBtnText: Message.CANCEL,
            pickerConfirmBtnColor: pickerConfirmBtnColor,
            pickerCancelBtnColor: pickerCancelBtnColor,
            pickerToolBarBg: pickerToolBarBg,
            pickerBg: pickerBg,
            pickerFontColor: pickerFontColor,
            pickerTitleText: '',
            pickerFontSize: 17,
            onPickerConfirm: data => {
                var areaStr = '';
                for (var i = 0; i < data.length; i++) {
                    if (data[i] == "" || data[i] == '<null>') {
                        areaStr = this.props.newReimbursement.reimbursementTypeList[0];
                    } else {
                        areaStr += data[i];
                    }
                }
                /*let bizExpenseAttachmentIDList = [];
                let bizExpenseAttachmentURLList = [];
                let bizExpenseTypeIDList = [];
                let bizExpenseBillIDList = [];
                let deleteInvoiceList = [];
                if (this.props.newReimbursement.source == 'ReimbursementDetail') {
                    //获取附件id 地址集合
                    if (this.props.newReimbursement.bizExpenseAttachmentListFromDetail && this.props.newReimbursement.bizExpenseAttachmentListFromDetail.length > 0) {
                        bizExpenseAttachmentIDList = this.props.newReimbursement.bizExpenseAttachmentListFromDetail.map(item => item.id);
                        bizExpenseAttachmentURLList = this.props.newReimbursement.bizExpenseAttachmentListFromDetail.map(item => item.fileAddress);
                    }
                    //获取明细ID集合
                    if (this.props.newReimbursement.bizExpenseTypeListFromDetail && this.props.newReimbursement.bizExpenseTypeListFromDetail.length > 0) {
                        bizExpenseTypeIDList = this.props.newReimbursement.bizExpenseTypeListFromDetail.map(item => item.id);
                    }

                    //获取发票ID集合
                    if (this.props.newReimbursement.bizExpenseTypeListFromDetail && this.props.newReimbursement.bizExpenseTypeListFromDetail > 0) {
                        const bizExpenseTypeList = this.props.newReimbursement.bizExpenseTypeListFromDetail;
                        for (let i = 0; i < bizExpenseTypeList.length; i++) {
                            const bizExpenseBillList = bizExpenseTypeList[i].bizExpenseBillList;
                            if (bizExpenseBillList && bizExpenseBillList.length > 0) {
                                for (let j = 0; j < bizExpenseBillList.length; j++) {
                                    bizExpenseBillIDList.push(bizExpenseBillList[j].id);
                                    deleteInvoiceList.push(bizExpenseBillList[j]);
                                }
                            }
                        }
                    }
                }

                //切换报销类型时，初始化数据, 传对象待表这些都删除
                this.props.initReimbursement({
                    bizExpenseAttachmentIDList: bizExpenseAttachmentIDList,
                    bizExpenseAttachmentURLList: bizExpenseAttachmentURLList,
                    bizExpenseTypeIDList: bizExpenseTypeIDList,
                    bizExpenseBillIDList: bizExpenseBillIDList,
                    deleteInvoiceList: deleteInvoiceList,
                });*/
                if (areaStr != this.props.newReimbursement.applyTypeName) {
                    this.props.newReimbursement.bizExpenseTypeList.map(item => {
                        item.code = '';
                        item.name = '';
                        item.expenseCodeTwo = '';
                        item.expenseNameTwo = '';
                        return item;
                    })

                    this.props.changeState({
                        totalAmount: (parseFloat(this.props.newReimbursement.totalAmount) - parseFloat(this.props.newReimbursement.travelBill ? this.props.newReimbursement.travelBill : 0)).toFixed(2),
                    })

                    this.props.changeType();

                    var reimbursementDetail = this.props.newReimbursement.reimbursementTypeOriginalList.find(function (reimbursementType) {
                        return reimbursementType.name === areaStr;
                    });
                    this.props.changeState({
                        applyTypeCode: reimbursementDetail.templatNo,
                    })
                    this.props.selectReimType(areaStr);
                    this.props.getExpenseType({
                        templatNo: reimbursementDetail.templatNo,
                        expenseRange: reimbursementDetail.expenseRange
                    })
                }
                this.props.changeState({
                    showPickerShadow: false,
                })
            },
            onPickerCancel: () => {
                this.props.changeState({showPickerShadow: false});
            }
        });
        Picker.show();
    }

    /**
     * 部门选择器
     */
    createDepartmentPicker() {
        if (Util.checkIsEmptyString(this.props.newReimbursement.organizationList) ||
            this.props.newReimbursement.organizationList.length == 0) {
            Util.showToast(Message.NO_DATA);
            return;
        }
        const dismissKeyboard = require('dismissKeyboard');
        dismissKeyboard();
        Picker.init({
            pickerData: this.props.newReimbursement.organizationList,
            selectedValue: [this.props.newReimbursement.expenseDepartmentName],
            pickerConfirmBtnText: Message.COMPLETE,
            pickerCancelBtnText: Message.CANCEL,
            pickerConfirmBtnColor: pickerConfirmBtnColor,
            pickerCancelBtnColor: pickerCancelBtnColor,
            pickerToolBarBg: pickerToolBarBg,
            pickerBg: pickerBg,
            pickerFontColor: pickerFontColor,
            pickerTitleText: '',
            pickerFontSize: 17,
            onPickerConfirm: data => {
                var departmentStr = '';
                for (var i = 0; i < data.length; i++) {
                    if (data[i] == "" || data[i] == '<null>') {
                        departmentStr = this.props.newReimbursement.organizationList[0];
                    } else {
                        departmentStr += data[i];
                    }
                }
                var organizationDetail = this.props.newReimbursement.organizationOriginalList.find(function (organizationType) {
                    return organizationType.orgDepName === departmentStr;
                });
                this.props.changeState({
                    expenseDepartmentName: departmentStr,
                    expenseDepartmentId: organizationDetail.id,
                    showPickerShadow: false
                })
            },
            onPickerCancel: () => {
                this.props.changeState({showPickerShadow: false});
            }
        });
        Picker.show();
    }

    /**
     * 消费类型选择器
     * @param item 消费明细详情
     */
    createExpenseTypePicker(item) {
        if (Util.checkIsEmptyString(this.props.newReimbursement.expenseTypeList) ||
            this.props.newReimbursement.expenseTypeList.length == 0) {
            Util.showToast(Message.NO_DATA);
            return;
        }
        const dismissKeyboard = require('dismissKeyboard');
        dismissKeyboard();
        Picker.init({
            pickerData: this.props.newReimbursement.expenseTypeList,
            selectedValue: [item.name, item.expenseNameTwo],
            pickerConfirmBtnText: Message.COMPLETE,
            pickerCancelBtnText: Message.CANCEL,
            pickerConfirmBtnColor: pickerConfirmBtnColor,
            pickerCancelBtnColor: pickerCancelBtnColor,
            pickerToolBarBg: pickerToolBarBg,
            pickerBg: pickerBg,
            pickerFontColor: pickerFontColor,
            pickerTitleText: '',
            pickerFontSize: 17,
            onPickerConfirm: data => {
                var expenseTypeOneStr = '';
                var expenseTypeTwoStr = '';
                //一级
                if (data[0] == "" || data[0] == '<null>') {
                    expenseTypeOneStr = this.props.newReimbursement.expenseTypeOne[0].name;
                } else {
                    expenseTypeOneStr = data[0];
                }
                //二级
                if (data[1] == "" || data[1] == '<null>') {
                    expenseTypeTwoStr = this.props.newReimbursement.expenseTypeTwo[0].name;
                } else {
                    expenseTypeTwoStr = data[1];
                }
                var bizExpenseTypeList = this.props.newReimbursement.bizExpenseTypeList;
                for (var j = 0; j < bizExpenseTypeList.length; j++) {
                    if (item.expenseId == bizExpenseTypeList[j].expenseId) {
                        bizExpenseTypeList[j].name = expenseTypeOneStr;
                        var expenseTypeDetail = this.props.newReimbursement.expenseTypeOne.find(function (expenseType) {
                            return expenseType.name === expenseTypeOneStr;
                        });
                        bizExpenseTypeList[j].code = expenseTypeDetail.expenseCode;
                        bizExpenseTypeList[j].expenseNameTwo = expenseTypeTwoStr;
                        //根据一级code生成对应的二级数组
                        const arrTwo = this.props.newReimbursement.expenseTypeTwo.filter(item => item.pcode == expenseTypeDetail.expenseCode);
                        let expenseTypeDetailTwo;
                        if (arrTwo.length === 0) {
                            expenseTypeDetailTwo = expenseTypeDetail;
                        } else {
                            expenseTypeDetailTwo = arrTwo.find(function (expenseType) {
                                return expenseType.name === expenseTypeTwoStr;
                            });
                        }

                        bizExpenseTypeList[j].expenseCodeTwo = expenseTypeDetailTwo.expenseCode;
                        break;
                    }
                }

                this.props.changeState({
                    bizExpenseTypeList: bizExpenseTypeList,
                    showPickerShadow: false
                })
            },
            onPickerCancel: () => {
                this.props.changeState({showPickerShadow: false});
            }
        });
        Picker.show();
    }

    /**
     * 地区选择器
     */
    createAreaPicker() {
        const dismissKeyboard = require('dismissKeyboard');
        dismissKeyboard();
        Picker.init({
            pickerData: Util.createAreaData(),
            selectedValue: this.props.newReimbursement.targetCity.split(' '),
            pickerConfirmBtnText: Message.COMPLETE,
            pickerCancelBtnText: Message.CANCEL,
            pickerConfirmBtnColor: [255, 170, 0, 1],
            pickerCancelBtnColor: [255, 170, 0, 1],
            pickerToolBarBg: [255, 255, 255, 1],
            pickerBg: [255, 255, 255, 1],
            pickerFontColor: [102, 102, 102, 1],
            pickerTitleText: '',
            pickerFontSize: 17,
            onPickerConfirm: data => {
                var areaStr = '';
                for (var i = 0; i < data.length; i++) {
                    areaStr += data[i];
                    if (i < data.length - 1) {
                        areaStr += ' ';
                    }
                }
                this.props.changeState({
                    targetCity: areaStr,
                    showPickerShadow: false
                });
            },
            onPickerCancel: () => {
                this.props.changeState({showPickerShadow: false});
            }
        });

        Picker.show();
    }

    /**
     * ocr拍照识别
     */
    ocrValidationFromCamera() {//检查相机，相册权限是否打开，没有则弹框提示
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
                        this.props.changeState({isLoading: true});
                        this.props.ocrValidation({picture: response.data}, {
                            fromNew: true,
                            expenseId: this.props.newReimbursement.selectItem.expenseId
                        });
                    }
                });
            });

    }


    /**
     * 提交或保存报销单
     */
    submitReimbursement(expenseStateCode) {
        this.closePicker();
        const dismissKeyboard = require('dismissKeyboard');
        dismissKeyboard();
        var state = this.props.newReimbursement;
        var requestData = {
            applyTypeCode: state.applyTypeCode == undefined ? "" : state.applyTypeCode,
            applyTypeName: state.applyTypeName,
            expenseDesc: state.expenseDesc,
            beginDateStr: state.selectedStartDate,
            endDateStr: state.selectedEndDate,
            targetCity: state.targetCity,
            travelDays: state.travelDays,
            totalNum: state.totalNum,
            travelBill: state.travelBill,
            totalAmount: state.totalAmount,
            expenseDepartmentId: Util.checkIsEmptyString(state.expenseDepartmentId) ? "" : state.expenseDepartmentId,
            expenseDepartmentName: state.expenseDepartmentName,
            expenseStateCode: expenseStateCode,
            bizExpenseTypeList: state.bizExpenseTypeList,
            bizExpenseAttachmentList: state.bizExpenseAttachmentList,
        };
        var result = true;
        if (requestData.expenseStateCode == '3') {
            //判断报销金额是否大于0
            if (parseFloat(requestData.totalAmount) <= 0) {
                Util.showToast(Message.NEW_RE_TOTAL_AMOUNT_CHECK);
                return;
            }

            for (var i = 0; i < requestData.bizExpenseTypeList.length; i++) {
                var bizExpenseType = requestData.bizExpenseTypeList[i];
                if (Util.checkIsEmptyString(bizExpenseType.code)) {
                    result = false;
                    break;
                } else if (Util.checkIsEmptyString(bizExpenseType.totalAmount)) {
                    result = false;
                    break;
                } else if (Util.checkIsEmptyString(bizExpenseType.totalNum)) {
                    result = false;
                    break;
                }
            }
            if (Util.checkIsEmptyString(requestData.applyTypeCode) || Util.checkIsEmptyString(requestData.applyTypeName)) {
                result = false;
            } else if (Util.checkIsEmptyString(requestData.expenseDepartmentId) || Util.checkIsEmptyString(requestData.expenseDepartmentName)) {
                result = false;
            } else if (requestData.applyTypeCode == "1") {
                //报销类型--差旅费
                if (Util.checkIsEmptyString(requestData.beginDateStr)) {
                    result = false;
                } else if (Util.checkIsEmptyString(requestData.endDateStr)) {
                    result = false;
                } else if (Util.checkIsEmptyString(requestData.targetCity)) {
                    result = false;
                }
            }
        }

        if (result) {
            this.validateData(requestData);
        } else {
            Util.showToast(Message.NEW_RE_PLEASE_REQUIRED);
        }
    }

    /**
     * 判断字段合法性
     */
    validateData(requestData) {
        if (requestData.applyTypeCode == "1") {
            //判断结束时间是否大于开始时间
            if (requestData.beginDateStr && requestData.endDateStr) {
                const startTime = new Date(Util.formateDate3(requestData.beginDateStr));
                const endTime = new Date(Util.formateDate3(requestData.endDateStr));
                if (endTime <= startTime) {
                    Util.showToast(Message.NEW_RE_TIME_CHECK);
                    return;
                }
            }

            //判断出差补助是否大于0
            if (requestData.travelBill && requestData.travelBill <= 0) {
                Util.showToast(Message.NEW_RE_TRAVEL_BILL_CHECK);
                return;
            }
        }

        this.saveOrCommitReimbursement(requestData);
    }


    /**
     * 新建报销单，提交or保存
     */
    saveOrCommitReimbursement(requestData) {
        if (this.props.newReimbursement.source == 'ReimbursementDetail' && !Util.checkIsEmptyString(this.props.newReimbursement.expenseNo)) {
            requestData.expenseNo = this.props.newReimbursement.expenseNo;
            requestData.bizExpenseAttachmentIDList = this.props.newReimbursement.bizExpenseAttachmentIDList;
            requestData.bizExpenseAttachmentURLList = this.props.newReimbursement.bizExpenseAttachmentURLList;
            requestData.bizExpenseTypeIDList = this.props.newReimbursement.bizExpenseTypeIDList;
            requestData.bizExpenseBillIDList = this.props.newReimbursement.bizExpenseBillIDList;
            if (this.props.newReimbursement.applyStatus === '1' || this.props.newReimbursement.applyStatus === '2') {
                //清空报销单号
                requestData.expenseNo = '';
                //提交保存数据，生成新的报销单号
                this.props.saveReimbursement(requestData);
            } else {
                this.props.editReimbursement(requestData);
            }

        } else {
            this.props.saveReimbursement(requestData);
        }
    }

    /**
     * 打开图片选择器
     */
    openImagePicker() {
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

                //选择器的配置
                var options = {
                    title: Message.CHOOSE_PHOTO,
                    cancelButtonTitle: Message.CANCEL,
                    takePhotoButtonTitle: Message.TAKE_PHOTO,
                    maxWidth: 1600,
                    maxHeight: 1600,
                    quality: 0.6,
                    allowsEditing: false,
                    chooseFromLibraryButtonTitle: Message.CHOOSE_FROM_PHOTO_ALBUM,
                    // storageOptions: {
                    //     skipBackup: true,
                    //     path: 'images'
                    // }
                };

                /**
                 * The first arg is the options object for customization (it can also be null or omitted for default options),
                 * The second arg is the callback which sends object: response (more info below in README)
                 */
                ImagePicker.showImagePicker(options, (response) => {
                    if (response.didCancel) {
                        //点击取消按钮触发的操作
                    }
                    else if (response.error) {
                        //选则照片出错触发的操作
                    }
                    else if (response.customButton) {
                        //选择了常用按钮
                    }
                    else {
                        if (response.fileSize > 10 * 1024 * 1000) {
                            Util.showToast(Message.NEW_RE_FILE_MAX);
                            return;
                        }
                        const source = {
                            uri: response.uri,
                            fileName: response.fileName,
                            fileSize: response.fileSize,
                            fileType: response.type,
                            isStatic: true
                        };
                        this.props.uploadAttachment(this.props.newReimbursement.bizExpenseAttachmentList, source);
                    }
                });
            });
    }

    /**
     * 关闭选择器，处理6P机型报错的问题
     */
    closePicker() {
        try {
            Picker.hide();
        } catch (e) {
            //do nothing
        }
    }

    /**
     * 当前月、日、时、分为1位数时十位加0显示
     * @param object
     * @returns {*}
     * @constructor
     */
    ObjectFormat(object) {
        if (parseInt(object) < 10) {
            return '0' + object;
        } else {
            return object;
        }
    }

    /**
     * 日期选择器
     * @param dateType 0:开始时间  1：结束时间
     */
    createDatePicker(dateType) {
        const selectedStartDate = this.props.newReimbursement.selectedStartDate;
        const selectedEndDate = this.props.newReimbursement.selectedEndDate;
        const d = new Date();
        var year = d.getFullYear() + Message.YEAR;
        var month = this.ObjectFormat(d.getMonth() + 1) + Message.MONTH;
        var day = this.ObjectFormat(d.getDate()) + Message.DAY;
        var hour = this.ObjectFormat(d.getHours()) + Message.HOUR;
        var minute = this.ObjectFormat(d.getMinutes()) + Message.MINUTE;

        if (dateType == 0) {
            if (selectedStartDate !== '' && selectedStartDate !== null) {
                year = selectedStartDate.substring(0, 4) + Message.YEAR;
                month = selectedStartDate.substring(5, 7) + Message.MONTH;
                day = selectedStartDate.substring(8, 10) + Message.DAY;
                hour = selectedStartDate.substring(11, 13) + Message.HOUR;
                minute = selectedStartDate.substring(14) + Message.MINUTE;
            }
        } else {
            if (selectedEndDate !== '' && selectedEndDate !== null) {
                year = selectedEndDate.substring(0, 4) + Message.YEAR;
                month = selectedEndDate.substring(5, 7) + Message.MONTH;
                day = selectedEndDate.substring(8, 10) + Message.DAY;
                hour = selectedEndDate.substring(11, 13) + Message.HOUR;
                minute = selectedEndDate.substring(14) + Message.MINUTE;
            }
        }
        const dismissKeyboard = require('dismissKeyboard');
        dismissKeyboard();
        Picker.init({
            wheelFlex: [1, 1, 1, 1, 1],
            pickerData: Util.createTime(),
            selectedValue: [year, month, day, hour, minute],
            pickerConfirmBtnText: Message.COMPLETE,
            pickerCancelBtnText: Message.CANCEL,
            pickerConfirmBtnColor: pickerConfirmBtnColor,
            pickerCancelBtnColor: pickerCancelBtnColor,
            pickerToolBarBg: pickerToolBarBg,
            pickerBg: pickerBg,
            pickerFontColor: pickerFontColor,
            pickerTitleText: '',
            pickerFontSize: 17,
            onPickerConfirm: (pickedValue, pickedIndex) => {
                var selectedDateStr = pickedValue[0] +
                    (pickedValue[1].length > 2 ? pickedValue[1] : ('0' + pickedValue[1])) +
                    (pickedValue[2].length > 2 ? pickedValue[2] : ('0' + pickedValue[2])) + ' ' +
                    (pickedValue[3].length > 1 ? pickedValue[3] : '0' + pickedValue[3]) + ':' +
                    (pickedValue[4].length > 1 ? pickedValue[4] : '0' + pickedValue[4]);

                if (dateType == 0) {
                    this.props.changeState({
                        selectedStartDate: selectedDateStr.replace("年", "-").replace("月", "-").replace("日", "").replace("时", "").replace("分", ""),
                        showPickerShadow: false
                    })
                } else {
                    this.props.changeState({
                        selectedEndDate: selectedDateStr.replace("年", "-").replace("月", "-").replace("日", "").replace("时", "").replace("分", ""),
                        showPickerShadow: false
                    })
                }
            },
            onPickerCancel: () => {
                this.props.changeState({showPickerShadow: false});
            },
            onPickerSelect: (pickedValue, pickedIndex) => {
                let targetValue = [...pickedValue];
                if (parseInt(targetValue[1]) === 2) {
                    if (targetValue[0] % 4 === 0 && targetValue[2] > 29) {
                        targetValue[2] = 29;
                    }
                    else if (targetValue[0] % 4 !== 0 && targetValue[2] > 28) {
                        targetValue[2] = 28;
                    }
                }
                else if (targetValue[1] in {4: 1, 6: 1, 9: 1, 11: 1} && targetValue[2] > 30) {
                    targetValue[2] = 30;

                }
                // forbidden some value such as some 2.29, 4.31, 6.31...
                if (JSON.stringify(targetValue) !== JSON.stringify(pickedValue)) {
                    // android will return String all the time，but we put Number into picker at first
                    // so we need to convert them to Number again
                    targetValue.map((v, k) => {
                        if (k !== 3) {
                            targetValue[k] = parseInt(v);
                        }
                    });
                    Picker.select(targetValue);
                    pickedValue = targetValue;
                }
            }
        });
        Picker.show();
    }

    /**
     * 删除明细中的发票
     * @param expenseId 明细Id
     * @param invoiceUUID 发票UUID
     * @param invoiceId 发票Id
     */
    deleteInvoice(expenseId, invoiceUUID, invoiceId, invoiceItem) {
        var bizExpenseTypeList = this.props.newReimbursement.bizExpenseTypeList;
        for (var j = 0; j < bizExpenseTypeList.length; j++) {
            if (expenseId == bizExpenseTypeList[j].expenseId) {
                var invoiceTempList = [];
                var bizExpenseBillList = bizExpenseTypeList[j].bizExpenseBillList;
                for (var i = 0; i < bizExpenseBillList.length; i++) {
                    if (invoiceUUID != bizExpenseBillList[i].invoiceUUID) {
                        invoiceTempList.push(bizExpenseBillList[i]);
                    }
                }
                bizExpenseTypeList[j].bizExpenseBillList = invoiceTempList;
                let totalNum = 0;
                var totalAmount = 0;
                for (var i = 0; i < invoiceTempList.length; i++) {
                    totalAmount += parseFloat(invoiceTempList[i].invoiceAmount);
                    totalNum += parseInt(invoiceTempList[i].invoiceNum);
                }
                bizExpenseTypeList[j].totalAmount = totalAmount;
                bizExpenseTypeList[j].totalNum = totalNum;
                break;
            }
        }
        var totalNum = 0;
        var totalAmount = 0;
        for (var j = 0; j < bizExpenseTypeList.length; j++) {
            totalNum += parseInt(bizExpenseTypeList[j].totalNum);
            totalAmount += parseFloat(bizExpenseTypeList[j].totalAmount);
        }
        totalAmount += parseFloat(this.props.newReimbursement.travelBill ? this.props.newReimbursement.travelBill : 0);

        this.props.changeState({
            bizExpenseTypeList: bizExpenseTypeList,
            totalNum: totalNum + '',
            totalAmount: totalAmount + '',
            bizExpenseBillIDList: Util.contains(this.props.newReimbursement.invoiceUUIDList, invoiceUUID) ?
                this.props.newReimbursement.bizExpenseBillIDList.concat(invoiceId) : this.props.newReimbursement.bizExpenseBillIDList,
            deleteInvoiceList: Util.contains(this.props.newReimbursement.invoiceUUIDList, invoiceUUID) ?
                this.props.newReimbursement.deleteInvoiceList.concat(invoiceItem) : this.props.newReimbursement.deleteInvoiceList,
        })
    }

    /**
     * 输入某条明细中的费用说明
     * @param expenseDetail 费用说明
     * @param expenseId 明细Id
     */
    updateExpenseDetail(expenseDetail, expenseId) {
        var bizExpenseTypeList = this.props.newReimbursement.bizExpenseTypeList;
        for (var j = 0; j < bizExpenseTypeList.length; j++) {
            if (expenseId == bizExpenseTypeList[j].expenseId) {
                if (expenseDetail.length > 300) {
                    expenseDetail = expenseDetail.substring(0, 300);
                }
                bizExpenseTypeList[j].detail = expenseDetail;
                break;
            }
        }

        this.props.changeState({bizExpenseTypeList: bizExpenseTypeList})
    }

    /**
     * 输入某条明细中的总张数
     * @param num 总张数
     * @param expenseId 明细Id
     */
    updateTotalNum(num, expenseId) {
        if (!Util.checkIsEmptyString(num)) {
            if (!Util.checkNumber(num) || parseFloat(num) >= 1000) {
                Util.showToast(Message.NEW_RE_TOTAL_NUM_MAX_CHECK)
                return;
            }
        }

        var bizExpenseTypeList = this.props.newReimbursement.bizExpenseTypeList;
        for (var j = 0; j < bizExpenseTypeList.length; j++) {
            if (expenseId == bizExpenseTypeList[j].expenseId) {
                bizExpenseTypeList[j].totalNum = num;
                break;
            }
        }
        var totalNum = 0;
        for (var j = 0; j < bizExpenseTypeList.length; j++) {
            totalNum += parseInt(bizExpenseTypeList[j].totalNum == 0 ? 0 : bizExpenseTypeList[j].totalNum);
        }
        this.props.changeState({
            bizExpenseTypeList: bizExpenseTypeList,
            totalNum: totalNum + '',
        })
    }

    /**
     * 输入某条明细中的总金额
     * @param amount 总金额
     * @param expenseId 明细Id
     */
    updateTotalAmount(amount, expenseId) {

        const arr = amount.split('.');

        //判断输入是否是数字
        if (!Util.checkFloatNumber(amount)) {
            Util.showToast(Message.NEW_RE_OVER_ZERO_AMOUNT);
            return;
        }

        //整数最大7位
        if (parseFloat(amount) >= 10000000) {
            return;
        }

        //最多2位小数
        if (arr.length == 2 && arr[1].length > 2) {
            return;
        }

        var bizExpenseTypeList = this.props.newReimbursement.bizExpenseTypeList;
        for (var j = 0; j < bizExpenseTypeList.length; j++) {
            if (expenseId == bizExpenseTypeList[j].expenseId) {
                if (amount === '-') {
                    bizExpenseTypeList[j].totalAmount = 0;
                } else {
                    bizExpenseTypeList[j].totalAmount = amount;
                }
                break;
            }
        }

        let totalNum = 0;
        let totalAmount = 0;
        for (var j = 0; j < bizExpenseTypeList.length; j++) {
            totalNum += parseInt(bizExpenseTypeList[j].totalNum == 0 ? 0 : bizExpenseTypeList[j].totalNum);
            totalAmount += parseFloat(bizExpenseTypeList[j].totalAmount == 0 ? 0 : bizExpenseTypeList[j].totalAmount);
        }

        if (this.props.newReimbursement.applyTypeCode == '1') {
            totalAmount = (totalAmount + parseFloat(this.props.newReimbursement.travelBill ? this.props.newReimbursement.travelBill : 0)).toFixed(2);
        } else {
            totalAmount = totalAmount.toFixed(2);
        }

        this.props.changeState({
            bizExpenseTypeList: bizExpenseTypeList,
            totalNum: totalNum + '',
            totalAmount: totalAmount + ''
        })
    }

    /**
     * 明细中的总金额保留两位小数
     * @param expenseId 明细Id
     */
    totalAmountFixTwo(expenseId) {
        var bizExpenseTypeList = this.props.newReimbursement.bizExpenseTypeList;
        for (var j = 0; j < bizExpenseTypeList.length; j++) {
            if (expenseId == bizExpenseTypeList[j].expenseId && bizExpenseTypeList[j].totalAmount) {
                bizExpenseTypeList[j].totalAmount = parseFloat(bizExpenseTypeList[j].totalAmount).toFixed(2);
                break;
            }
        }
        let totalAmount = 0;
        for (var j = 0; j < bizExpenseTypeList.length; j++) {
            totalAmount += parseFloat(bizExpenseTypeList[j].totalAmount == 0 ? 0 : bizExpenseTypeList[j].totalAmount);
        }
        if (this.props.newReimbursement.applyTypeCode == '1') {
            totalAmount = totalAmount + parseFloat(this.props.newReimbursement.travelBill ? this.props.newReimbursement.travelBill : 0);
        }
        this.props.changeState({
            bizExpenseTypeList: bizExpenseTypeList,
            totalAmount: parseFloat(totalAmount).toFixed(2) + ''
        })
    }

    /**
     *
     * 输入差旅明细中的出差补助
     *
     * @param travelBillValue
     */
    updatetravelBillTotalAmount(travelBillValue) {

        const arr = travelBillValue.split('.');

        //判断输入是否是数字
        if (!Util.checkFloatNumber(travelBillValue)) {
            Util.showToast(Message.NEW_RE_TRAVEL_BILL_CHECK);
            return;
        }
        //整数最大12位
        if (parseFloat(travelBillValue) >= 10000000) {
            return;
        }

        //最多2位小数
        if (arr.length == 2 && arr[1].length > 2) {
            return;
        }

        if (this.props.newReimbursement.applyTypeCode == '1') {
            var totalAmount = 0;
            var bizExpenseTypeList = this.props.newReimbursement.bizExpenseTypeList;
            var bill = isNaN(parseFloat(travelBillValue)) ? '' : parseFloat(travelBillValue) + '';
            for (var j = 0; j < bizExpenseTypeList.length; j++) {
                totalAmount += parseFloat(bizExpenseTypeList[j].totalAmount == 0 ? 0 : bizExpenseTypeList[j].totalAmount);
            }
            totalAmount = (parseFloat(totalAmount) + parseFloat(bill ? bill : 0)).toFixed(2);
            this.props.changeState({
                travelBill: travelBillValue,
                totalAmount: totalAmount + ''
            })
        }

    }

    /**
     * 差旅明细中的出差补助保留小数两位
     */
    travelBillFixTwo() {
        if (this.props.newReimbursement.applyTypeCode == '1') {
            var totalAmount = 0;
            var bizExpenseTypeList = this.props.newReimbursement.bizExpenseTypeList;
            for (var j = 0; j < bizExpenseTypeList.length; j++) {
                totalAmount += parseFloat(bizExpenseTypeList[j].totalAmount == 0 ? 0 : bizExpenseTypeList[j].totalAmount);
            }
            if (this.props.newReimbursement.travelBill) {
                totalAmount = totalAmount + parseFloat(parseFloat(this.props.newReimbursement.travelBill).toFixed(2));
            }
            this.props.changeState({
                travelBill: this.props.newReimbursement.travelBill ? parseFloat(this.props.newReimbursement.travelBill).toFixed(2) : '',
                totalAmount: parseFloat(totalAmount).toFixed(2)
            })
        }
    }

    /**
     * 录音开始
     */
    startRecord(type, expenseId) {
        const dismissKeyboard = require('dismissKeyboard');
        dismissKeyboard();
        Permissions.checkMultiplePermissions(['microphone']).then(response => {
            // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
            if ((response.microphone != 'authorized' && response.microphone != 'undetermined')) {
                this.props.changeState({
                    dialogTitle: Message.AUTHORITY_SETTING,
                    dialogContent: Message.AUTHORIZE_MICROPHONE,
                    showNoPermissionDialog: true,
                });
                return;
            }
            var dateNow = (new Date()).valueOf();
            lastRecordPressed = dateNow;
            this.props.changeState({isRecording: true, isVoice: true});
            VoiceRecordModule.start();
            this._onCountTime(type, expenseId);
        })
    }

    /**
     * 录音结束，松开按钮
     * @param type 0:报销事由  1:费用说明
     * @param expenseId 费用明细id 当type为1的时候需要
     */
    endRecord(type, expenseId) {
        var dateNow = (new Date()).valueOf();
        if (lastRecordPressed && lastRecordPressed + 300 > dateNow) {
            this.props.changeState({
                isRecording: false,
                isVoice: false
            })
            Util.showToast(Message.NEW_RE_RECORDING_SHORT);
            this._clearCountTime();
            return;
        }
        if (lastRecordPressed && lastRecordPressed + 20 * 1000 > dateNow) {
            this.props.changeState({
                isRecording: false,
            });
            VoiceRecordModule.stop((recordData)=> {
                if (recordData && recordData != '') {
                    this.props.recogniseVoiceRecord(type, expenseId, {
                        voice: recordData.recordData,
                        length: recordData.recordData.length
                    })
                }
                //console.log(recordPath);
            });

            this._clearCountTime();
        }

    }

    /**
     * 录音结束，时间结束
     * @param type 0:报销事由  1:费用说明
     * @param expenseId 费用明细id 当type为1的时候需要
     */
    endTimeRecord(type, expenseId) {
        this.props.changeState({
            isRecording: false,
        });
        var dateNow = (new Date()).valueOf();
        if (lastRecordPressed && lastRecordPressed + 300 > dateNow) {
            this.props.changeState({
                isRecording: false,
                isVoice: false
            });
            Util.showToast(Message.NEW_RE_RECORDING_SHORT);
            this._clearCountTime();
            return;
        }
        VoiceRecordModule.stop((recordData)=> {
            this.props.recogniseVoiceRecord(type, expenseId, {
                voice: recordData.recordData,
                length: recordData.recordData.length
            })
        });

        this._clearCountTime();
    }

    /**
     * 语音倒计时
     * @private
     */
    _onCountTime(type, expenseId) {
        var that = this;

        //设置定时器，倒数60秒
        that.interval = setInterval(() => {
            const timer = that.props.newReimbursement.timeCount - 1;

            //倒数到0，重置文案
            if (timer < 1) {
                that.props.changeState({
                    timeEnd: true,
                });
                that.endTimeRecord(type, expenseId);
            } else {
                that.props.changeState({
                    timeCount: timer,
                    text: '(' + timer + 's)',
                });
            }
        }, 1000)
    }

    /**
     * 清除语音倒计时
     * @private
     */
    _clearCountTime() {
        this.interval && clearInterval(this.interval);

        this.props.changeState({
            timeCount: 20,
            text: "(20s)",
        });
    }

    /**
     * 报销说明
     * @param text
     */
    changeExpenseDesc(text) {
        var expenseDesc = "";
        if (text.length > 300) {
            expenseDesc = text.substring(0, 300);
        } else {
            expenseDesc = text;
        }
        this.props.changeState({expenseDesc: expenseDesc})
    }

    /**
     * 报销说明输入框高度变化
     * @param event
     * @private
     */
    _expenseDescTextInputOnChange(event) {
        let height = event.nativeEvent.contentSize.height;
        if (height < ScreenUtil.scaleSize(40)) {
            height = ScreenUtil.scaleSize(40);
        } else if (height > ScreenUtil.scaleSize(333)) {
            height = ScreenUtil.scaleSize(333);
        }
        this.props.changeState({
            expenseDescTextInputHeight: height,
        })
    }

    /**
     * 渲染差旅费报销单
     */
    renderTravelLabels() {
        const dismissKeyboard = require('dismissKeyboard');
        return (
            <View>
                <TouchableOpacity onPress={() => {
                    dismissKeyboard();
                    this.props.changeState({
                        isModalBoxOpen: true,
                        isStartDateTimeFlag: true,
                        isEndDateTimeFlag: false,
                        calendarDate: this.getInitialDate(true),
                        calendarTime: this.getInitialTime(true),
                    });
                }}>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{Message.NEW_RE_START_DATE}<Text
                            style={styles.requiredWord}>*</Text></Text>
                        {
                            Util.checkIsEmptyString(this.props.newReimbursement.selectedStartDate) ? (
                                <Text style={[styles.placeholderText]}
                                      numberOfLines={1}>{Message.NEW_RE_SELECT_START_DATE}</Text>
                            ) : (
                                <Text style={[styles.placeholderText, {color: '#666666'}]}
                                      numberOfLines={1}>{this.props.newReimbursement.selectedStartDate}</Text>
                            )
                        }

                        <Image source={require('./../../img/common/arrow.png')} style={styles.arrowIcon}/>
                    </View>
                </TouchableOpacity>

                <View style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>

                <TouchableOpacity onPress={() => {
                    dismissKeyboard();
                    this.props.changeState({
                        isModalBoxOpen: true,
                        isStartDateTimeFlag: false,
                        isEndDateTimeFlag: true,
                        calendarDate: this.getInitialDate(false),
                        calendarTime: this.getInitialTime(false),
                    });
                }}>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>{Message.NEW_RE_END_DATE}<Text
                            style={styles.requiredWord}>*</Text></Text>
                        {
                            Util.checkIsEmptyString(this.props.newReimbursement.selectedEndDate) ? (
                                <Text style={[styles.placeholderText]}
                                      numberOfLines={1}>{Message.NEW_RE_SELECT_END_DATE}</Text>
                            ) : (
                                <Text style={[styles.placeholderText, {color: '#666666'}]}
                                      numberOfLines={1}>{this.props.newReimbursement.selectedEndDate}</Text>
                            )
                        }
                        <Image source={require('./../../img/common/arrow.png')} style={styles.arrowIcon}/>
                    </View>
                </TouchableOpacity>
                <View style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>

                <View style={[styles.row]}>
                    <TextInput editable={false} style={[styles.rowLabel, {padding: 0}]}
                               underlineColorAndroid="transparent"
                               value={Message.NEW_RE_OUT_BUSINESS}/>
                    <TextInput
                        editable={true}
                        placeholder={Message.NEW_RE_ENTER_OUT_BUSINESS}
                        placeholderTextColor="#ABABAB"
                        underlineColorAndroid="transparent"
                        keyboardType="numeric"
                        maxLength={16}
                        style={[styles.rowInput]}
                        value={this.props.newReimbursement.travelDays ? this.props.newReimbursement.travelDays + '' : ''}
                        onChangeText={(text) => {
                            //数字判断
                            if (!Util.checkFloatNumber(text)) {
                                Util.showToast(Message.ONLY_INPUT_NUMBER);
                                return;
                            }
                            //整数最多3位数
                            if (parseFloat(text) >= 1000) {
                                return;
                            }
                            //小数最多两位
                            const arr = text.split('.');
                            if (arr.length == 2 && arr[1].length > 2) {
                                return;
                            }
                            this.props.changeState({travelDays: text})
                        }}
                        onFocus={() => {
                            this.inputOnFocus(this)
                        }}
                        returnKeyType={'done'}/>
                </View>
                <View style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>

                <TouchableOpacity onPress={() => {
                    if (Platform.OS === 'android') {
                        RNBridgeModule.checkFloatWindowOpAllowed((result)=> {
                            /*this.props.changeState({showPickerShadow: true});
                             this.createAreaPicker();*/
                            dismissKeyboard();
                            this.props.navigateSelectCity({
                                targetCity: this.props.newReimbursement.targetCity,
                                callback: (item) => {
                                    this.props.changeState({
                                        targetCity: item
                                    })
                                }
                            });
                        });
                    } else {
                        /*this.props.changeState({showPickerShadow: true});
                         this.createAreaPicker();*/
                        dismissKeyboard();
                        this.props.navigateSelectCity({
                            targetCity: this.props.newReimbursement.targetCity,
                            callback: (item) => {
                                this.props.changeState({
                                    targetCity: item
                                })
                            }
                        });
                    }
                }}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                        <Text style={styles.rowLabel}>{Message.NEW_RE_BUSINESS_CITY}<Text
                            style={styles.requiredWord}>*</Text></Text>
                        <Text style={{
                            fontSize: ScreenUtil.setSpText(9),
                            //marginLeft: ScreenUtil.scaleSize(90),
                            color: this.props.newReimbursement.targetCity ? '#666666' : '#ABABAB',
                            width: ScreenUtil.scaleSize(410),
                            marginTop: ScreenUtil.scaleSize(20),
                            marginBottom: ScreenUtil.scaleSize(20),
                        }}>{this.props.newReimbursement.targetCity ? this.props.newReimbursement.targetCity : Message.NEW_RE_ENTER_BUSINESS_CITY}</Text>
                        <View style={{
                            flex: 1,
                            height: ScreenUtil.scaleSize(80),
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                        }}>
                            <Image source={require('./../../img/common/arrow.png')}
                                   style={{
                                       width: ScreenUtil.scaleSize(19),
                                       height: ScreenUtil.scaleSize(30),
                                       resizeMode: 'stretch',
                                   }}/>
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>

                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <TextInput editable={false} style={[styles.rowLabel, {padding: 0}]}
                               underlineColorAndroid="transparent"
                               value={Message.NEW_RE_REIMBURSEMENT_EVENT}/>
                    <View style={{
                        marginTop: ScreenUtil.scaleSize(Platform.OS == 'ios' ? 24 : 20),
                        marginBottom: ScreenUtil.scaleSize(Platform.OS == 'ios' ? 16 : 20),
                        width: ScreenUtil.scaleSize(450),
                    }}>
                        <TextInput
                            editable={true}
                            placeholder={Message.NEW_RE_ENTER_REIMBURSEMENT_DETAIL}
                            placeholderTextColor="#ABABAB"
                            underlineColorAndroid="transparent"
                            onSelectionChange={(event)=> this.getSelectIndex(event, this.props.newReimbursement.expenseDesc)}
                            maxLength={300}
                            multiline={true}
                            style={{
                                height: this.props.newReimbursement.expenseDescTextInputHeight,
                                textAlign: 'left',
                                alignItems: 'center',
                                justifyContent: 'center',
                                //marginLeft: ScreenUtil.scaleSize(90),
                                fontSize: ScreenUtil.setSpText(9),
                                color: '#666666',
                                textAlignVertical: 'center',
                                paddingTop: 0,
                                paddingBottom: 0,
                                paddingLeft: 0,
                            }}
                            value={this.props.newReimbursement.expenseDesc}
                            onContentSizeChange={this._expenseDescTextInputOnChange.bind(this)}
                            onChangeText={(text) => {
                                this.changeExpenseDesc(text);
                            }}
                            onFocus={() => {
                                this.inputOnFocus(this)
                            }}/>
                    </View>
                    <TouchableOpacity style={{
                        flex: 1,
                        height: ScreenUtil.scaleSize(80),
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        marginRight: ScreenUtil.scaleSize(-30),
                        paddingRight: ScreenUtil.scaleSize(30),
                    }}
                                      delayPressOut={150}
                                      disabled={this.props.newReimbursement.isVoice}
                                      onPressIn={this.startRecord.bind(this, 0, '')}
                                      onPressOut={this.endRecord.bind(this, 0, '')}>
                        <View style={{
                            width: ScreenUtil.scaleSize(80),
                            height: ScreenUtil.scaleSize(80),
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                        }}>
                            <Image source={require('../../img/reimbursement/voice.png')}
                                   style={{
                                       width: ScreenUtil.scaleSize(19),
                                       height: ScreenUtil.scaleSize(30),
                                       resizeMode: 'stretch',
                                   }}/>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>
            </View>
        )
    }

    /**
     * 渲染通用费报销单
     */
    renderCommonLabels() {
        return (
            <View>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <TextInput editable={false} style={[styles.rowLabel, {padding: 0}]}
                               underlineColorAndroid="transparent"
                               value={Message.NEW_RE_REIMBURSEMENT_EVENT}/>
                    <View style={{
                        marginTop: ScreenUtil.scaleSize(Platform.OS == 'ios' ? 24 : 20),
                        marginBottom: ScreenUtil.scaleSize(Platform.OS == 'ios' ? 16 : 20),
                        width: ScreenUtil.scaleSize(450),
                    }}>
                        <TextInput
                            editable={true}
                            placeholder={Message.NEW_RE_ENTER_REIMBURSEMENT_DETAIL}
                            placeholderTextColor="#ABABAB"
                            underlineColorAndroid="transparent"
                            onSelectionChange={(event)=> this.getSelectIndex(event, this.props.newReimbursement.expenseDesc)}
                            style={{
                                textAlign: 'left',
                                //marginLeft: ScreenUtil.scaleSize(90),
                                fontSize: ScreenUtil.setSpText(9),
                                color: '#666666',
                                textAlignVertical: 'center',
                                paddingTop: 0,
                                paddingBottom: 0,
                                paddingLeft: 0,
                                height: this.props.newReimbursement.expenseDescTextInputHeight
                            }}
                            maxLength={300}
                            multiline={true}
                            value={this.props.newReimbursement.expenseDesc}
                            onChangeText={(text) => {
                                this.props.changeState({expenseDesc: text})
                            }}
                            onContentSizeChange={this._expenseDescTextInputOnChange.bind(this)}
                            onFocus={() => {
                                this.inputOnFocus(this)
                            }}/>
                    </View>
                    <TouchableOpacity style={{
                        flex: 1,
                        height: ScreenUtil.scaleSize(80),
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        marginRight: ScreenUtil.scaleSize(-30),
                        paddingRight: ScreenUtil.scaleSize(30),
                    }}
                                      delayPressOut={150}
                                      disabled={this.props.newReimbursement.isVoice}
                                      onPressIn={this.startRecord.bind(this, 0, '')}
                                      onPressOut={this.endRecord.bind(this, 0, '')}>
                        <View style={{
                            width: ScreenUtil.scaleSize(80),
                            height: ScreenUtil.scaleSize(80),
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                        }}>
                            <Image source={require('../../img/reimbursement/voice.png')}
                                   style={{
                                       width: ScreenUtil.scaleSize(19),
                                       height: ScreenUtil.scaleSize(30),
                                       resizeMode: 'stretch',
                                   }}/>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>
            </View>
        )
    }

    /**
     * 渲染单个附件
     * @param item  附件数据
     */
    renderAttachItem(item,index) {
        var fileTypeIcon;
        switch (item.fileType.toLowerCase()) {
            case 'docx':
                fileTypeIcon = require('./../../img/reimbursement/file_word.png');
                break;
            case 'doc':
                fileTypeIcon = require('./../../img/reimbursement/file_word.png');
                break;
            case 'ppt':
                fileTypeIcon = require('./../../img/reimbursement/file_ppt.png');
                break;
            case 'pdf':
                fileTypeIcon = require('./../../img/reimbursement/file_pdf.png');
                break;
            case 'xls':
                fileTypeIcon = require('./../../img/reimbursement/file_excel.png');
                break
            case 'xlsx':
                fileTypeIcon = require('./../../img/reimbursement/file_excel.png');
                break;
            case 'png':
                fileTypeIcon = require('./../../img/reimbursement/file_pic.png');
                break;
            case 'img':
                fileTypeIcon = require('./../../img/reimbursement/file_pic.png');
                break;
            case 'jpg':
                fileTypeIcon = require('./../../img/reimbursement/file_pic.png');
                break;
            case 'bmp':
                fileTypeIcon = require('./../../img/reimbursement/file_pic.png');
                break;
            default:
                fileTypeIcon = require('./../../img/reimbursement/file_word.png');
        }
        return (
            <View style={styles.deleteIconTouchView}>
                <TouchableOpacity style={styles.deleteIconTouchAttach} onPress={() => {
                    var attachList = this.props.newReimbursement.bizExpenseAttachmentList;
                    attachList.splice(index,1)
                    this.props.changeState({
                        bizExpenseAttachmentList: attachList,
                        bizExpenseAttachmentIDList: item.id ? this.props.newReimbursement.bizExpenseAttachmentIDList.concat(item.id)
                            : this.props.newReimbursement.bizExpenseAttachmentIDList,
                        bizExpenseAttachmentURLList: item.fileAddress ? this.props.newReimbursement.bizExpenseAttachmentURLList.concat(item.fileAddress)
                            : this.props.newReimbursement.bizExpenseAttachmentURLList,
                    });
                }}>
                    <Image source={require('./../../img/common/delete.png')}
                           style={styles.deleteIcon}/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.attachItem}
                                  onPress={() => {
                                      this.previewDocument(item);
                                  }}>

                    <Image source={fileTypeIcon}
                           style={styles.fileIcon}/>
                    <View style={styles.attachDetail}>
                        <Text style={styles.attachDetailText}
                              numberOfLines={1}>{item.fileName}</Text>
                        <Text style={styles.attachDetailText} numberOfLines={1}>{item.fileSize + 'KB'}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    /**
     * 费用说明选择框高度变化
     * @param item
     * @param event
     * @returns {*}
     * @private
     */
    _textInputOnChange(item, event) {
        var bizExpenseTypeList = this.props.newReimbursement.bizExpenseTypeList;
        for (var i = 0; i < bizExpenseTypeList.length; i++) {
            if (item.expenseId == bizExpenseTypeList[i].expenseId) {
                let height = event.nativeEvent.contentSize.height;
                if (height < ScreenUtil.scaleSize(40)) {
                    height = ScreenUtil.scaleSize(40);
                } else if (height > ScreenUtil.scaleSize(333)) {
                    height = ScreenUtil.scaleSize(333);
                }
                bizExpenseTypeList[i].textInputHeight = height;

            }
        }
        this.props.changeState({
            bizExpenseTypeList: bizExpenseTypeList
        })
    }

    /**
     * 渲染单个明细
     * @param item  附件数据
     * @param index 明细下标
     */
    renderExpenseDetailItem(item, index) {
        const dismissKeyboard = require('dismissKeyboard');
        return (
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={styles.detail}>
                    <View style={{
                        paddingHorizontal: ScreenUtil.scaleSize(20),
                    }}>
                        <View style={styles.rowHeader}>
                            <Text style={[styles.rowLabel, {
                                fontSize: ScreenUtil.setSpText(7),
                                color: '#ABABAB'
                            }]}>{Message.NEW_RE_DETAIL + '(' + (index + 1) + ')'}</Text>
                            {
                                this.props.newReimbursement.bizExpenseTypeList.length > 1 ? (
                                    <TouchableOpacity onPress={() => {
                                        this.props.deleteExpenseDetail(item.expenseId);
                                    }}>
                                        <View style={{
                                            height: ScreenUtil.scaleSize(60),
                                            width: ScreenUtil.scaleSize(60),
                                            justifyContent: 'center',
                                            alignItems: 'flex-end',
                                        }}>
                                            <Image source={require('./../../img/common/trash.png')}
                                                   style={styles.trashIcon}/>
                                        </View>
                                    </TouchableOpacity>
                                ) : (
                                    <View/>
                                )
                            }

                        </View>
                        <TouchableOpacity style={{flex: 1}}
                                          onPress={() => {
                                              if (Util.checkIsEmptyString(this.props.newReimbursement.applyTypeCode)) {
                                                  Util.showToast(Message.NEW_RE_COST_TYPE_MSG);
                                              } else {
                                                  if (Platform.OS === 'android') {
                                                      RNBridgeModule.checkFloatWindowOpAllowed((result)=> {
                                                          if (Util.checkIsEmptyString(this.props.newReimbursement.expenseTypeList) ||
                                                              this.props.newReimbursement.expenseTypeList.length == 0) {
                                                              this.props.changeState({showPickerShadow: false});
                                                          } else {
                                                              this.props.changeState({showPickerShadow: true});
                                                          }
                                                          this.createExpenseTypePicker(item);
                                                      });
                                                  } else {
                                                      if (Util.checkIsEmptyString(this.props.newReimbursement.expenseTypeList) ||
                                                          this.props.newReimbursement.expenseTypeList.length == 0) {
                                                          this.props.changeState({showPickerShadow: false});
                                                      } else {
                                                          this.props.changeState({showPickerShadow: true});
                                                      }
                                                      this.createExpenseTypePicker(item);
                                                  }

                                              }
                                          }}>
                            <View style={styles.row}>
                                <Text style={styles.rowLabelDetail}>{Message.NEW_RE_COST_TYPE}<Text
                                    style={styles.requiredWord}>*</Text></Text>
                                <View style={styles.selectBtn}>
                                    {
                                        Util.checkIsEmptyString(item.expenseCodeTwo) ? (
                                            <Text style={[styles.selectBtnPlaceholderText, {flex: 1}]}
                                                  numberOfLines={1}>{Message.NEW_RE_SELECT_COST_TYPE}</Text>
                                        ) : (
                                            <Text style={[styles.selectBtnPlaceholderText, {color: '#666666', flex: 1}]}
                                                  numberOfLines={1}>{item.expenseNameTwo}</Text>
                                        )
                                    }
                                    <Image source={require('./../../img/common/arrow.png')} style={styles.arrowIcon}/>
                                </View>
                            </View>
                        </TouchableOpacity>
                        <View style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>

                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <TextInput editable={false} style={[styles.rowLabelDetail, {padding: 0}]}
                                       underlineColorAndroid="transparent" value={Message.NEW_RE_COST_DETAIL}/>
                            <View style={{
                                marginTop: ScreenUtil.scaleSize(Platform.OS == 'ios' ? 24 : 20),
                                marginBottom: ScreenUtil.scaleSize(Platform.OS == 'ios' ? 16 : 20),
                                width: ScreenUtil.scaleSize(430),
                            }}>
                                <TextInput
                                    editable={true}
                                    placeholder={Message.NEW_RE_ENTER_COST_DETAIL}
                                    placeholderTextColor="#ABABAB"
                                    underlineColorAndroid="transparent"
                                    onSelectionChange={(event)=> this.getSelectIndex(event, item.detail)}
                                    maxLength={300}
                                    multiline={true}
                                    style={{
                                        textAlign: 'left',
                                        fontSize: ScreenUtil.setSpText(9),
                                        color: '#666666',
                                        textAlignVertical: 'center',
                                        paddingTop: 0,
                                        paddingBottom: 0,
                                        paddingLeft: 0,
                                        height: item.textInputHeight
                                    }}
                                    value={item.detail}
                                    onChangeText={(text) => {
                                        this.updateExpenseDetail(text, item.expenseId)
                                    }}
                                    onContentSizeChange={this._textInputOnChange.bind(this, item)}
                                    onFocus={() => {
                                        this.inputOnFocus(this)
                                    }}/>
                            </View>
                            <TouchableOpacity style={{
                                flex: 1,
                                height: ScreenUtil.scaleSize(80),
                                justifyContent: 'center',
                                alignItems: 'flex-end',
                                marginRight: ScreenUtil.scaleSize(-20),
                                paddingRight: ScreenUtil.scaleSize(20),
                            }}
                                              delayPressOut={150}
                                              disabled={this.props.newReimbursement.isVoice}
                                              onPressIn={this.startRecord.bind(this, 1, item.expenseId)}
                                              onPressOut={this.endRecord.bind(this, 1, item.expenseId)}>
                                <View style={{
                                    width: ScreenUtil.scaleSize(80),
                                    height: ScreenUtil.scaleSize(80),
                                    justifyContent: 'center',
                                    alignItems: 'flex-end',
                                }}>
                                    <Image source={require('../../img/reimbursement/voice.png')}
                                           style={{
                                               width: ScreenUtil.scaleSize(19),
                                               height: ScreenUtil.scaleSize(30),
                                               resizeMode: 'stretch',
                                           }}/>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>

                        <View style={[styles.rowHeader, {height: ScreenUtil.scaleSize(80)}]}>
                            <TextInput editable={false} style={[styles.rowLabel, {padding: 0}]}
                                       underlineColorAndroid="transparent" value={Message.NEW_RE_INVOICE_DETAIL}/>
                            <TouchableOpacity onPress={() => {
                                this.props.changeState({
                                    selectItem: item,
                                    showDialog: true
                                });
                            }}>
                                <View style={styles.row}>
                                    <Image source={require('./../../img/reimbursement/add.png')}
                                           style={styles.addIcon}/>
                                    <Text
                                        style={{
                                            color: '#ABABAB',
                                            textAlignVertical: 'center',
                                            fontSize: ScreenUtil.setSpText(9),
                                            marginLeft: ScreenUtil.scaleSize(5)
                                        }}>{Message.NEW_RE_ADD_INVOICE}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {item.bizExpenseBillList.map((invoiceItem, index) => this.renderInvoiceItem(index, invoiceItem, item.expenseId))}

                        <View style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>

                        <View style={styles.row}>
                            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                <Text style={styles.rowLabelDetail}>{Message.NEW_RE_INVOICE_DETAIL_AMOUNT}<Text
                                    style={styles.requiredWord}>*</Text></Text>
                            </TouchableWithoutFeedback>

                            <TextInput
                                editable={true}
                                style={styles.rowInput}
                                maxLength={15}
                                placeholderTextColor="#ABABAB"
                                underlineColorAndroid="transparent"
                                keyboardType={'numeric'}
                                value={item.totalAmount + ''}
                                onChangeText={(text) => {
                                    this.updateTotalAmount(text, item.expenseId)
                                }}
                                onBlur={() => {
                                    this.totalAmountFixTwo(item.expenseId)
                                }}
                                returnKeyType={'done'}
                                onFocus={() => {
                                    this.inputOnFocus(this)
                                }}/>
                        </View>
                        <View style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>
                        <View style={styles.row}>
                            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                <Text style={styles.rowLabelDetail}>{Message.NEW_RE_INVOICE_ACCOUNT}<Text
                                    style={styles.requiredWord}>*</Text></Text>
                            </TouchableWithoutFeedback>

                            <TextInput
                                editable={true}
                                style={styles.rowInput}
                                placeholderTextColor="#ABABAB"
                                underlineColorAndroid="transparent"
                                keyboardType={'numeric'}
                                value={item.totalNum + ''}
                                onChangeText={(text) => {
                                    this.updateTotalNum(text, item.expenseId)
                                }}
                                onFocus={() => {
                                    this.inputOnFocus(this)
                                }}
                                returnKeyType={'done'}/>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        )
    }

    invoiceDescription(object) {
        if (object) {
            if (object.length > 20) {
                return object.substring(0, 21) + '...';
            } else {
                return object;
            }
        } else {
            return '';
        }
    }

    /**
     * 根据发票种类code获取名称
     * @param invoiceItem 发票item
     * @returns {string} 发票种类名称
     */
    getInvoiceTypeName(invoiceItem) {
        let name = '';
        switch (invoiceItem.invoiceType) {
            case '01':
                name = Message.INVOICE_TYPE_NAME_01;
                break;
            case '04':
                name = Message.INVOICE_TYPE_NAME_04;
                break;
            case '10':
                name = Message.INVOICE_TYPE_NAME_10;
                break;
            case '11':
                name = Message.INVOICE_TYPE_NAME_11;
                break;
            case '03':
                name = Message.INVOICE_TYPE_NAME_03;
                break;
            case '02':
                name = Message.INVOICE_TYPE_NAME_02;
                break;
            case '91':
                name = Message.INVOICE_TYPE_NAME_91;
                break;
            case '92':
                name = Message.INVOICE_TYPE_NAME_92;
                break;
            case '93':
                name = Message.INVOICE_TYPE_NAME_93;
                break;
            case '94':
                name = Message.INVOICE_TYPE_NAME_94;
                break;
            case '95':
                name = Message.INVOICE_TYPE_NAME_95;
                break;
            case '96':
                name = Message.INVOICE_TYPE_NAME_96;
                break;
            case '00':
                name = Message.INVOICE_TYPE_NAME_00;
                break;
            case '97':
                name = Message.INVOICE_TYPE_NAME_97;
                break;
            case '98':
                name = Message.INVOICE_TYPE_NAME_98;
                break;
            default:
        }
        invoiceItem.invoiceDetail = name;
        return name;
    }

    /**
     * 渲染明细中的单个发票item
     * @param index 发票下标
     * @param invoiceItem 发票数据
     * @param expenseId 明细id
     */
    renderInvoiceItem(index, invoiceItem, expenseId) {
        const dismissKeyboard = require('dismissKeyboard');
        return (
            <View style={styles.deleteIconTouchView}>
                <TouchableOpacity style={[styles.deleteIconTouch, {top: 0}]} onPress={() => {
                    this.deleteInvoice(expenseId, invoiceItem.invoiceUUID, invoiceItem.id, invoiceItem);
                }}>
                    <Image source={require('./../../img/common/delete.png')}
                           style={styles.deleteIcon}/>
                </TouchableOpacity>
                <View style={styles.invoiceItemBg}>

                    <TouchableOpacity onPress={() => {
                        dismissKeyboard();
                        this.props.navigateInvoiceDetails({
                            invoiceTypeCode: invoiceItem.invoiceType,
                            uuid: invoiceItem.invoiceUUID,
                            expenseId: expenseId,
                            isFromNewReimbursement: true
                        });
                    }}>
                        <View style={styles.invoiceItem}>
                            <View style={styles.invoiceItemRow}>
                                <View style={{
                                    flexDirection: 'row',
                                    height: ScreenUtil.scaleSize(40),
                                    alignItems: 'center',
                                    flex: 1,
                                }}>
                                    <Text
                                        style={styles.invoiceItemDetailLabel}>{Message.NEW_RE_INVOICE_DATE + ':'}</Text>
                                    <Text
                                        style={styles.invoiceItemDetailValue}>{invoiceItem.invoiceDateStr}</Text>
                                </View>
                                <View style={{
                                    flexDirection: 'row',
                                    height: ScreenUtil.scaleSize(40),
                                    alignItems: 'center',
                                    flex: 1,
                                }}>
                                    <Text
                                        style={[styles.invoiceItemDetailLabel]}>{Message.NEW_RE_INVOICE_AMOUNT + ':'}</Text>
                                    <Text
                                        style={[styles.invoiceItemDetailValue]}>{parseFloat(invoiceItem.invoiceAmount).toFixed(2) + ''}</Text>
                                </View>
                            </View>
                            <View style={{
                                marginTop: ScreenUtil.scaleSize(20),
                                flexDirection: 'row',
                            }}>
                                <Text
                                    style={styles.invoiceItemDetailLabel}>{Message.NEW_RE_DETAIL + ':'}</Text>
                                {
                                    Util.contains(['01', '02', '04', '10', '11'], invoiceItem.invoiceType) ? (
                                        <Text numberOfLines={1}
                                              style={[styles.invoiceItemDetailValue, {maxWidth: 400,}]}>{this.invoiceDescription(invoiceItem.invoiceDetail)}</Text>
                                    ) : (
                                        <Text numberOfLines={1}
                                              style={[styles.invoiceItemDetailValue, {maxWidth: 400,}]}>{this.invoiceDescription(this.getInvoiceTypeName(invoiceItem))}</Text>
                                    )
                                }

                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{height: ScreenUtil.scaleSize(30)}}/>
            </View>
        )
    }

//输入获得焦点
    inputOnFocus(component) {
        Picker.hide();
    }

    getCurrentCalendarColor() {
        if (this.props.newReimbursement.isShowCalendar) {
            return {
                fontSize: ScreenUtil.setSpText(12),
                color: '#666666', fontWeight: 'bold'
            }
        } else {
            return {
                fontSize: ScreenUtil.setSpText(12),
                color: '#A4A4A4', fontWeight: 'bold'
            }
        }
    }

    getCurrentTimeColor() {
        if (!this.props.newReimbursement.isShowCalendar) {
            return {
                fontSize: ScreenUtil.setSpText(12),
                color: '#666666', fontWeight: 'bold'
            }
        } else {
            return {
                fontSize: ScreenUtil.setSpText(12),
                color: '#A4A4A4', fontWeight: 'bold'
            }
        }
    }

    /**
     * 返回当前年月日
     */
    getNowDate() {
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

        return year + month + day;
    }

    /**
     * 返回当前时分
     */
    getNowTime(isStart) {
        const d = new Date();
        let hour = d.getHours();
        let minute = d.getMinutes();
        if (hour < 10) {
            hour = '0' + hour;
        }
        if (minute < 10) {
            minute = '0' + minute;
        }
        if (isStart) {
            this.props.changeState({
                startHour: hour,
                startMinute: minute
            });
        } else {
            this.props.changeState({
                endHour: hour,
                endMinute: minute
            });
        }
        return hour + ':' + minute;
    }

    /**
     * 打开弹窗初始日期（年月日）
     * @param isStart 是否是开始时间
     * @returns {*}
     */
    getInitialDate(isStart) {
        var calendarDate = "";
        if (isStart) {
            if (!this.props.newReimbursement.showStartDateSelected) {
                if (!this.props.newReimbursement.selectedStartDate) {
                    calendarDate = this.getNowDate();
                } else {
                    this.props.changeState({startDateSelected: this.props.newReimbursement.selectedStartDate.substring(0, 10)})
                    calendarDate = Util.formatDate1((this.props.newReimbursement.selectedStartDate.substring(0, 10)).replace(/-/g, ''));
                }
            } else {
                calendarDate = this.props.newReimbursement.showStartDateSelected;
            }
        } else {
            if (!this.props.newReimbursement.showEndDateSelected) {
                if (!this.props.newReimbursement.selectedEndDate) {
                    calendarDate = this.getNowDate();
                } else {
                    this.props.changeState({endDateSelected: this.props.newReimbursement.selectedEndDate.substring(0, 10)})
                    calendarDate = Util.formatDate1((this.props.newReimbursement.selectedEndDate.substring(0, 10)).replace(/-/g, ''));
                }
            } else {
                calendarDate = this.props.newReimbursement.showEndDateSelected;
            }
        }
        return calendarDate;
    }

    /**
     * 打开弹窗初始时间（时分）
     * @param isStart 是否是开始时间
     */
    getInitialTime(isStart) {
        var calendarTime = "";
        if (isStart) {
            if (!this.props.newReimbursement.startTimeSelected) {
                if (!this.props.newReimbursement.selectedStartDate) {
                    calendarTime = this.getNowTime(true);
                } else {
                    calendarTime = this.props.newReimbursement.selectedStartDate.substring(11, 16);
                }
            } else {
                calendarTime = this.props.newReimbursement.startTimeSelected;
            }
            this.props.changeState({
                startTimeSelected: calendarTime
            });
        } else {
            if (!this.props.newReimbursement.endTimeSelected) {
                if (!this.props.newReimbursement.selectedEndDate) {
                    calendarTime = this.getNowTime(false);
                } else {
                    calendarTime = this.props.newReimbursement.selectedEndDate.substring(11, 16);
                }
            } else {
                calendarTime = this.props.newReimbursement.endTimeSelected;
            }
            this.props.changeState({
                endTimeSelected: calendarTime
            });
        }
        return calendarTime;
    }

    /**
     * 根据返回的日期，设置即将显示的时分
     * @param date
     */
    onTimeSelected(date) {
        let hour = '';
        let minute = '';

        if (date.getHours() < 10) {
            hour = '0' + date.getHours();
        } else {
            hour = date.getHours();
        }
        if (date.getMinutes() < 10) {
            minute = '0' + date.getMinutes();
        } else {
            minute = date.getMinutes();
        }

        const selectedTime = hour + ':' + minute;
        if (this.props.newReimbursement.isStartDateTimeFlag) {
            this.props.changeState({
                startTimeSelected: selectedTime,
                calendarTime: selectedTime,
                startHour: hour,
                startMinute: minute
            });
        }
        if (this.props.newReimbursement.isEndDateTimeFlag) {
            this.props.changeState({
                endTimeSelected: selectedTime,
                calendarTime: selectedTime,
                endHour: hour,
                endMinute: minute
            });
        }
    }

    /**
     * 根据手机的操作系统区分ios和Android分别使用的时间组件
     * @returns {XML}
     */
    getTimeComponent() {
        let now = new Date();
        if (this.props.newReimbursement.isStartDateTimeFlag) {
            if (this.props.newReimbursement.startHour != '') {
                now.setHours(this.props.newReimbursement.startHour);
            }
            if (this.props.newReimbursement.startMinute != '') {
                now.setMinutes(this.props.newReimbursement.startMinute);
            }
        }
        if (this.props.newReimbursement.isEndDateTimeFlag) {
            if (this.props.newReimbursement.endHour != '') {
                now.setHours(this.props.newReimbursement.endHour);
            }
            if (this.props.newReimbursement.endMinute != '') {
                now.setMinutes(this.props.newReimbursement.endMinute);
            }
        }
        if (Platform.OS == 'ios') {
            return (<View style={{
                flex: 1,
                justifyContent: 'center',
                width: deviceWidth,
            }}>
                <DatePickerIOS date={now} mode='time' onDateChange={(date)=>this.onTimeSelected(date)}/>
            </View>)

        } else {
            return <TimePicker
                initDate={now.toISOString()}
                onTimeSelected={(date)=>this.onTimeSelected(date)}/>
        }
    }

    /**
     * 差旅报销单点击事件
     */
    startOrEndDatePress() {
        let startDateSelected = this.props.newReimbursement.startDateSelected;
        let endDateSelected = this.props.newReimbursement.endDateSelected;
        let startTimeSelected = this.props.newReimbursement.startTimeSelected;
        let endTimeSelected = this.props.newReimbursement.endTimeSelected;
        let startDateTimeSelected = startDateSelected + ' ' + startTimeSelected;
        let endDateTimeSelected = endDateSelected + ' ' + endTimeSelected;
        const d = new Date();
        const year = d.getFullYear() + '-';
        let month = d.getMonth() + 1;
        let day = d.getDate();
        let hour = d.getHours();
        let minute = d.getMinutes();
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

        if (hour < 10) {
            hour = '0' + hour;
        }
        if (minute < 10) {
            minute = '0' + minute;
        }

        if (this.props.newReimbursement.isStartDateTimeFlag) {
            if (startDateSelected == '' && startTimeSelected == '') {
                startDateTimeSelected = year + month + day + ' ' + hour + ':' + minute;
            }
            if (startDateSelected == '' && startTimeSelected != '') {
                startDateTimeSelected = year + month + day + ' ' + startTimeSelected;
            }
            if (startDateSelected != '' && startTimeSelected == '') {
                startDateTimeSelected = startDateSelected + ' ' + hour + ':' + minute;
            }
        }

        if (this.props.newReimbursement.isEndDateTimeFlag) {
            if (endDateSelected == '' && endTimeSelected == '') {
                endDateTimeSelected = year + month + day + ' ' + hour + ':' + minute;
            }
            if (endDateSelected == '' && endTimeSelected != '') {
                endDateTimeSelected = year + month + day + ' ' + endTimeSelected;
            }
            if (endDateSelected != '' && endTimeSelected == '') {
                endDateTimeSelected = endDateSelected + ' ' + hour + ':' + minute;
            }
        }

        this.props.changeState({
            isShowCalendar: true,
            selectedTempDate: null,
        });

        if (this.props.newReimbursement.isStartDateTimeFlag) {
            this.props.changeState({
                isModalBoxOpen: false,
                selectedStartDate: startDateTimeSelected
            });
        }
        if (this.props.newReimbursement.isEndDateTimeFlag) {
            this.props.changeState({
                isModalBoxOpen: false,
                selectedEndDate: endDateTimeSelected
            });
        }
    }

    /**
     * 日历选中天触发事件
     * @param day
     */
    calendarListDayPress(day) {
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
            selectedTempDate: day.dateString,
        })
        if (this.props.newReimbursement.isStartDateTimeFlag) {
            this.props.changeState({
                startDateSelected: day.dateString,
                calendarDate: showDateSelected,
                showStartDateSelected: showDateSelected,
                isShowCalendar: false
            })
        }
        if (this.props.newReimbursement.isEndDateTimeFlag) {
            this.props.changeState({
                endDateSelected: day.dateString,
                calendarDate: showDateSelected,
                showEndDateSelected: showDateSelected,
                isShowCalendar: false
            })
        }
    }

    /**
     * 触发类型选择器
     * @constructor
     */
    typePickerPress() {
        if (Platform.OS === 'android') {
            RNBridgeModule.checkFloatWindowOpAllowed((result)=> {
                if (Util.checkIsEmptyString(this.props.newReimbursement.reimbursementTypeList) ||
                    this.props.newReimbursement.reimbursementTypeList.length == 0) {
                    this.props.changeState({
                        showPickerShadow: false
                    });
                } else {
                    this.props.changeState({
                        showPickerShadow: true
                    });
                }
                this.createTypePicker();
            });
        } else {
            if (Util.checkIsEmptyString(this.props.newReimbursement.reimbursementTypeList) ||
                this.props.newReimbursement.reimbursementTypeList.length == 0) {
                this.props.changeState({
                    showPickerShadow: false
                });
            } else {
                this.props.changeState({
                    showPickerShadow: true
                });
            }
            this.createTypePicker();
        }
    }

    /**
     * 触发部门选择器
     */
    departmentPickerPress() {
        if (Platform.OS === 'android') {
            RNBridgeModule.checkFloatWindowOpAllowed((result)=> {
                if (Util.checkIsEmptyString(this.props.newReimbursement.organizationList) ||
                    this.props.newReimbursement.organizationList.length == 0) {
                    this.props.changeState({showPickerShadow: false});
                } else {
                    this.props.changeState({showPickerShadow: true});
                }
                this.createDepartmentPicker();
            });
        } else {
            if (Util.checkIsEmptyString(this.props.newReimbursement.organizationList) ||
                this.props.newReimbursement.organizationList.length == 0) {
                this.props.changeState({showPickerShadow: false});
            } else {
                this.props.changeState({showPickerShadow: true});
            }
            this.createDepartmentPicker();
        }
    }

    render() {
        const dismissKeyboard = require('dismissKeyboard');
        let current;
        let tempDate;
        if (this.props.newReimbursement.isStartDateTimeFlag) {
            tempDate = this.props.newReimbursement.selectedStartDate;
        }
        if (this.props.newReimbursement.isEndDateTimeFlag) {
            tempDate = this.props.newReimbursement.selectedEndDate;
        }
        current = tempDate ? new Date(tempDate.substring(0, 4), tempDate.substring(5, 7) - 1, tempDate.substring(8, 10)) : null;
        if (this.props.newReimbursement.selectedTempDate) {
            current = this.props.newReimbursement.selectedTempDate;
        }
        return (
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <SafeAreaView style={styles.container}>
                    <BackDialog
                        thisComponent={this}
                        isShow={this.props.newReimbursement.showPickerShadow}
                        backgroundClick={
                            (component) => {
                                Picker.hide();
                                component.props.changeState({showPickerShadow: false});
                            }
                        }/>
                    <CommonLoading isShow={this.props.newReimbursement.isLoading}/>
                    <Dialog
                        content={Message.NEW_INVOICE_BACK_SAVE}
                        type={'confirm'}
                        leftBtnText={Message.CANCEL}
                        rightBtnText={Message.CONFIRM}
                        modalVisible={this.props.newReimbursement.saveModalVisible}
                        leftBtnStyle={{color: '#A5A5A5',}}
                        rightBtnStyle={{color: '#FFAA00',}}
                        onClose={this._closeModal.bind(this)}
                        leftBtnClick={this._cancelClick.bind(this)}
                        rightBtnClick={this._ensureSaveClick.bind(this)}
                        thisComponent={this}
                    />
                    <Dialog
                        titleText={this.props.newReimbursement.dialogTitle}
                        content={this.props.newReimbursement.dialogContent}
                        type={'confirm'}
                        leftBtnText={Message.CANCEL}
                        rightBtnText={Message.AUTHORITY_SETTING}
                        modalVisible={this.props.newReimbursement.showNoPermissionDialog}
                        leftBtnStyle={{color: '#A5A5A5'}}
                        rightBtnStyle={{color: '#FFAA00'}}
                        rightBtnClick={Permissions.openSettings}
                        thisComponent={this}
                        onClose={this._closeModal.bind(this)}
                    />
                    <PromptDialog
                        modalVisible={this.props.newReimbursement.showPrompt}
                        thisComponent={this}
                        onClose={this._onClose.bind(this)}
                        promptType={this.props.newReimbursement.promptType}
                        hint={this.props.newReimbursement.promptMsg}
                    />

                    <PopDialog
                        showVisible={this.props.newReimbursement.showDialog}
                        thisComponent={this}
                        thirdItemName={Message.NEW_RE_ADD_INVOICE_FROM_LIST}
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

                                    this.props.navigateScanQrCode({
                                        fromNew: true,
                                        expenseId: this.props.newReimbursement.selectItem.expenseId
                                    })
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

                            //当前报销单的发票集合
                            var selectedInvoice = [];
                            var bizExpenseTypeList = this.props.newReimbursement.bizExpenseTypeList;
                            for (var j = 0; j < bizExpenseTypeList.length; j++) {
                                var bizExpenseBillList = bizExpenseTypeList[j].bizExpenseBillList;
                                for (var i = 0; i < bizExpenseBillList.length; i++) {
                                    selectedInvoice.push(bizExpenseBillList[i].invoiceUUID);
                                }
                            }
                            this.props.addInvoice({
                                expenseId: this.props.newReimbursement.selectItem.expenseId,
                                selectedInvoice: selectedInvoice
                            });
                        }}
                        cancelClick={this._closeModal.bind(this)}
                        backClick={() => this.props.changeState({showDialog: false})}
                    />


                    {
                        this.props.newReimbursement.isModalBoxOpen ? (

                            <View style={{
                                position: 'absolute',
                                height: deviceHeight,
                                width: deviceWidth,
                                left: 0,
                                top: 0,
                                zIndex: 1000,
                                elevation: 4,
                            }}>
                                <TouchableWithoutFeedback onPress={() => {
                                    this.props.changeState({
                                        isModalBoxOpen: false,
                                        selectedTempDate: null,
                                        calendarDate: '',
                                        startDateSelected: '',
                                        showStartDateSelected: '',
                                        endDateSelected: '',
                                        showEndDateSelected: '',
                                        isShowCalendar: true,
                                    })
                                }} style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                }}>
                                    <View style={{
                                        height: deviceHeight,
                                        width: deviceWidth,
                                        backgroundColor: '#000000',
                                        opacity: 0.45,
                                    }}/>
                                </TouchableWithoutFeedback>
                                <View
                                    style={{
                                        height: Platform.OS == 'ios' ? deviceHeight / 2 : deviceHeight / 3 * 2,
                                        width: deviceWidth,
                                        position: 'absolute',
                                        bottom: 0,
                                        backgroundColor: '#FFFFFF',
                                    }}>
                                    <View style={{
                                        flexDirection: 'row', alignItems: 'center',
                                        height: ScreenUtil.scaleSize(90),
                                        width: deviceWidth,
                                        backgroundColor: '#FFFFFF'
                                    }}>
                                        <View style={{
                                            flexDirection: 'row', alignItems: 'center',
                                            height: ScreenUtil.scaleSize(90),
                                            flex: 1, marginLeft: ScreenUtil.scaleSize(30)
                                        }}>
                                            <TouchableWithoutFeedback
                                                onPress={() => {
                                                    this.props.changeState({isShowCalendar: true});
                                                }}
                                            >
                                                <View style={{
                                                    height: ScreenUtil.scaleSize(90),
                                                    borderColor: 'orange',
                                                    borderBottomWidth: this.props.newReimbursement.isShowCalendar ? ScreenUtil.scaleSize(4) : 0,
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Text style={
                                                        this.getCurrentCalendarColor()
                                                    }>
                                                        {
                                                            this.props.newReimbursement.calendarDate
                                                        }
                                                    </Text>
                                                </View>
                                            </TouchableWithoutFeedback>
                                            <TouchableWithoutFeedback
                                                onPress={() => {
                                                    this.props.changeState({isShowCalendar: false});
                                                }}
                                            >
                                                <View style={{
                                                    marginLeft: ScreenUtil.scaleSize(40),
                                                    height: ScreenUtil.scaleSize(90),
                                                    borderColor: 'orange',
                                                    borderBottomWidth: this.props.newReimbursement.isShowCalendar ? 0 : ScreenUtil.scaleSize(4),
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Text style={
                                                        this.getCurrentTimeColor()
                                                    }>
                                                        {
                                                            this.props.newReimbursement.calendarTime
                                                        }
                                                    </Text>
                                                </View>
                                            </TouchableWithoutFeedback>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                this.startOrEndDatePress();
                                            }}
                                        >
                                            <View style={{
                                                flexDirection: 'row', alignItems: 'center', flex: 1,
                                                marginRight: ScreenUtil.scaleSize(30)
                                            }}>
                                                <Text style={{
                                                    fontSize: ScreenUtil.setSpText(12),
                                                    color: 'orange', fontWeight: 'bold'
                                                }}>{Message.CONFIRM}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={[CustomStyles.separatorLine, {width: deviceWidth}]}/>
                                    {
                                        this.props.newReimbursement.isShowCalendar ?
                                            <CalendarList
                                                current={current}
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
                                                    this.calendarListDayPress(day);
                                                }}
                                                markedDates={{
                                                    [this.props.newReimbursement.isStartDateTimeFlag ?
                                                        this.props.newReimbursement.startDateSelected :
                                                        this.props.newReimbursement.endDateSelected]: {selected: true}
                                                }}
                                                theme={{
                                                    selectedDayBackgroundColor: 'orange',
                                                    selectedDayTextColor: '#ffffff',
                                                    todayTextColor: 'orange',
                                                }}
                                            />
                                            :
                                            this.getTimeComponent()
                                    }
                                </View>
                            </View>
                        ) : null
                    }

                    <Header
                        titleText={this.props.newReimbursement.titleText}
                        thisComponent={this}
                        backClick={this.onBack}
                        rightText={Message.SAVE}
                        rightClick={this.submitReimbursement.bind(this, 0)}
                        rightTextStyle={{
                            fontSize: ScreenUtil.setSpText(9),
                            color: '#FFAA00',
                        }}
                        backControl={false}
                    />
                    {this.props.newReimbursement.isRecording === true ? (
                        <View style={styles.recordingView}>
                            <View style={styles.recordingRow}>
                                <Image source={{uri:Base64Images.VOICE}}
                                       style={styles.microPhoneIcon}/>
                            </View>
                            <Text style={{
                                fontSize: ScreenUtil.setSpText(9),
                                color: 'white',
                                marginTop: ScreenUtil.scaleSize(20)
                            }}>{Message.NEW_RE_RECORDING + this.props.newReimbursement.text}</Text>
                        </View>
                    ) : (
                        <View/>
                    )}
                    <InputScrollView style={styles.sclView} keyboardShouldPersistTaps={'handled'}
                                     keyboardOffset={80}
                                     ref="scroll">
                        <View style={{
                            paddingHorizontal: ScreenUtil.scaleSize(30),
                            backgroundColor: 'white'
                        }}>
                            <TouchableOpacity style={{flex: 1}} onPress={() => {
                                this.typePickerPress();
                            }}>
                                <View style={styles.row}>
                                    <Text style={styles.rowLabel}>{Message.NEW_RE_REIMBURSEMENT_TYPE}<Text
                                        style={styles.requiredWord}>*</Text></Text>
                                    {
                                        Util.checkIsEmptyString(this.props.newReimbursement.applyTypeName) ? (
                                            <Text style={[styles.placeholderText, {flex: 1}]}
                                                  numberOfLines={1}>{Message.NEW_RE_SELECT_REIMBURSEMENT_TYPE}</Text>
                                        ) : (
                                            <Text style={[styles.placeholderText, {color: '#666666', flex: 1}]}
                                                  numberOfLines={1}>{this.props.newReimbursement.applyTypeName}</Text>
                                        )
                                    }
                                    <Image source={require('./../../img/common/arrow.png')} style={styles.arrowIcon}/>
                                </View>
                            </TouchableOpacity>
                            <View style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>

                            <TouchableOpacity style={{flex: 1}} onPress={() => {
                                this.departmentPickerPress();
                            }}>
                                <View style={styles.row}>
                                    <Text style={styles.rowLabel}>{Message.NEW_RE_DEPARTMENT}<Text
                                        style={styles.requiredWord}>*</Text></Text>
                                    {
                                        Util.checkIsEmptyString(this.props.newReimbursement.expenseDepartmentName) ? (
                                            <Text style={[styles.placeholderText, {flex: 1}]}
                                                  numberOfLines={1}>{Message.NEW_RE_SELECT_DEPARTMENT}</Text>
                                        ) : (
                                            <Text style={[styles.placeholderText, {color: '#666666', flex: 1}]}
                                                  numberOfLines={1}>{this.props.newReimbursement.expenseDepartmentName}</Text>
                                        )
                                    }
                                    <Image source={require('./../../img/common/arrow.png')} style={styles.arrowIcon}/>
                                </View>
                            </TouchableOpacity>
                            <View style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>

                            {
                                this.props.newReimbursement.applyTypeCode == '1' ? this.renderTravelLabels() : this.renderCommonLabels()
                            }

                            {this.props.newReimbursement.bizExpenseTypeList.map((item, i) => this.renderExpenseDetailItem(item, i))}

                            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                <View style={[styles.row, {justifyContent: 'flex-end'}]}>
                                    <TouchableOpacity onPress={() => {
                                        this.props.addNewExpenseDetails();
                                    }}>
                                        <View style={styles.row}>
                                            <Image source={require('./../../img/reimbursement/add.png')}
                                                   style={styles.addIcon}/>
                                            <Text
                                                style={{
                                                    color: '#ABABAB',
                                                    fontSize: ScreenUtil.setSpText(9),
                                                    textAlignVertical: 'center',
                                                    marginLeft: ScreenUtil.scaleSize(5)
                                                }}>{Message.NEW_RE_ADD_DETAIL}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>
                            <View style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>

                            {
                                this.props.newReimbursement.applyTypeCode == '1'
                                    ?
                                    (
                                        <View>
                                            <View style={styles.row}>
                                                <TextInput editable={false} style={[styles.rowLabel, {padding: 0}]}
                                                           underlineColorAndroid="transparent"
                                                           value={Message.NEW_RE_ASSISTANCE}/>
                                                <TextInput
                                                    editable={true}
                                                    style={[styles.rowInput]}
                                                    placeholderTextColor="#ABABAB"
                                                    placeholder={Message.NEW_RE_ENTER_ASSISTANCE}
                                                    underlineColorAndroid="transparent"
                                                    keyboardType={'numeric'}
                                                    maxLength={15}
                                                    value={this.props.newReimbursement.travelBill ? this.props.newReimbursement.travelBill + '' : ''}
                                                    onChangeText={(text) => {
                                                        this.updatetravelBillTotalAmount(text);
                                                    }}
                                                    onBlur={() => {
                                                        this.travelBillFixTwo();
                                                    }}
                                                    onFocus={() => {
                                                        this.inputOnFocus(this)
                                                    }}
                                                    returnKeyType={'done'}/>
                                            </View>
                                            <View
                                                style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>
                                        </View>
                                    )
                                    :
                                    (
                                        <View></View>
                                    )
                            }


                            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                <View style={[styles.rowHeader, {height: ScreenUtil.scaleSize(80)}]}>
                                    <TextInput editable={false} style={[styles.rowLabel, {padding: 0}]}
                                               underlineColorAndroid="transparent" value={Message.NEW_RE_ATTACHMENT}/>
                                    <TouchableOpacity onPress={() => {
                                        if (this.props.newReimbursement.bizExpenseAttachmentList.length < 20) {
                                            //this.openImagePicker();
                                            dismissKeyboard();
                                            if (Platform.OS == 'ios') {
                                                this.openImagePicker();
                                            } else {
                                                OpenFileSystemModule.openFileSystem().then((file) => {
                                                    if (!Util.contains(['doc', 'docx', 'ppt', 'pdf', 'xls', 'xlsx', 'png', 'img', 'jpg', 'bmp'], file.type)) {
                                                        Util.showToast(Message.NEW_RE_FILE_TYPE);
                                                        return;
                                                    }

                                                    if (file.size > 10 * 1024 * 1000) {
                                                        Util.showToast(Message.NEW_RE_FILE_MAX);
                                                        return;
                                                    }

                                                    const source = {
                                                        uri: file.uri,
                                                        fileName: file.name,
                                                        fileSize: file.size,
                                                        fileType: file.type,
                                                        isStatic: true
                                                    };
                                                    this.props.uploadAttachment(this.props.newReimbursement.bizExpenseAttachmentList, source);
                                                }, (code, msg) => {
                                                    Util.showToast(Message.NEW_RE_GET_FILE_FAIL);
                                                })
                                            }
                                        } else {
                                            Util.showToast(Message.NEW_RE_ATTACHMENT_MAX);
                                        }
                                    }}>
                                        <View style={styles.row}>
                                            <Image source={require('./../../img/reimbursement/upload.png')}
                                                   style={styles.addIcon}/>
                                            <Text
                                                style={{
                                                    color: '#ABABAB',
                                                    fontSize: ScreenUtil.setSpText(9),
                                                    textAlignVertical: 'center',
                                                    marginLeft: ScreenUtil.scaleSize(5)
                                                }}>{Message.NEW_RE_UPLOAD_ATTACHMENT}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>

                            <View style={styles.attachListView}>
                                {this.props.newReimbursement.bizExpenseAttachmentList.map((item,index) => this.renderAttachItem(item,index))}
                            </View>
                        </View>
                        <View style={styles.separatorView}></View>
                    </InputScrollView>

                    <View style={styles.bottomView}>
                        <Text
                            style={styles.bottomLabel}>{Message.NEW_RE_INVOICE_ACCOUNT + ': ' + this.props.newReimbursement.totalNum + Message.NEW_RE_INVOICE_ACCOUNT_UNIT}</Text>
                        <Text
                            style={[styles.bottomLabel, {
                                flex: 1,
                                marginLeft: ScreenUtil.scaleSize(50)
                            }]}>{Message.NEW_RE_AMOUNT + ': ' + this.props.newReimbursement.totalAmount + Message.NEW_RE_INVOICE_Y}</Text>
                        <TouchableOpacity onPress={() => {
                            this.submitReimbursement(3);
                        }}>
                            <View style={styles.submitView}>
                                <Text style={styles.submitText}>{Message.BUTTON_SUBMIT}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Dialog
                        titleText={this.props.newReimbursement.alertTitle}
                        content={this.props.newReimbursement.alertContent}
                        type={'alert'}
                        modalVisible={this.props.newReimbursement.warningDialog}
                        alertBtnText={Message.CONFIRM}
                        alertBtnStyle={{color: '#FFAA00'}}
                        alertBtnClick={this.props.closeAlert.bind(this)}
                        thisComponent={this}
                        onClose={this._onClose}
                    />
                </SafeAreaView>
            </TouchableWithoutFeedback>
        )
    }
}

function mapStateToProps(state) {
    return {
        newReimbursement: state.Reimbursement,
        nav: state.nav,
        appState: state.App,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        initData: initData,
        back: back,
        recogniseVoiceRecord: recogniseVoiceRecord,
        navigateInvoiceDetails: navigateInvoiceDetails,
        uploadAttachment: uploadAttachment,
        selectReimType: selectReimType,
        saveReimbursement: saveReimbursement,
        addNewExpenseDetails: addNewExpenseDetails,
        deleteExpenseDetail: deleteExpenseDetail,
        navigateInvoiceList: navigateInvoiceList,
        deleteInvoice: deleteInvoice,
        showAlert: showAlert,
        closeAlert: closeAlert,
        changeState: changeState,
        loadData: loadData,
        getExpenseType: getExpenseType,
        addInvoice: navigateAddInvoice,
        editReimbursement: editReimbursement,
        initReimbursement: initReimbursement,
        deleteReimbursement: deleteReimbursement,
        navigateScanQrCode: navigateScanQrCode,
        ocrValidation: ocrValidation,
        invoiceDetailsChangeState: invoiceDetailsChangeState,
        changeAppState: changeAppState,
        navigateSelectCity: navigateSelectCity,
        changeType: changeType,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(NewReimbursement);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    sclView: {
        //flex: 1,
        backgroundColor: '#F6F6F6'
    },
    recordingView: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: ScreenUtil.scaleSize(320),
        height: ScreenUtil.scaleSize(320),
        zIndex: 20,
        backgroundColor: 'black',
        top: deviceHeight / 3,
        left: (deviceWidth - ScreenUtil.scaleSize(320)) / 2,
        opacity: 0.7,
        borderRadius: ScreenUtil.scaleSize(10),
    },
    recordingRow: {
        flexDirection: 'row',
        width: ScreenUtil.scaleSize(150),
        alignItems: 'flex-end',
        justifyContent: 'space-between'
    },
    recordingItem: {
        backgroundColor: 'white',
        height: ScreenUtil.scaleSize(10),
        width: ScreenUtil.scaleSize(30)
    },
    microPhoneIcon: {
        width: ScreenUtil.scaleSize(165),
        height: ScreenUtil.scaleSize(150),
        resizeMode: 'contain'
    },
    row: {
        height: ScreenUtil.scaleSize(80),
        flexDirection: 'row',
        alignItems: 'center'
    },
    rowHeader: {
        height: ScreenUtil.scaleSize(60),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rowLabel: {
        width: ScreenUtil.scaleSize(210),
        fontSize: ScreenUtil.setSpText(9),
        textAlignVertical: 'center',
        color: '#666666'
    },
    rowLabelDetail: {
        width: ScreenUtil.scaleSize(190),
        fontSize: ScreenUtil.setSpText(9),
        textAlignVertical: 'center',
        color: '#666666'
    },
    placeholderText: {
        flex: 1,
        //marginLeft: ScreenUtil.scaleSize(90),
        fontSize: ScreenUtil.setSpText(9),
        color: '#ABABAB',
    },
    selectBtn: {
        flex: 1,
        height: ScreenUtil.scaleSize(80),
        flexDirection: 'row',
        alignItems: 'center',
        //marginLeft: ScreenUtil.scaleSize(90),
    },
    selectBtnPlaceholderText: {
        fontSize: ScreenUtil.setSpText(9),
        color: '#ABABAB',
    },
    selectBtnText: {
        fontSize: ScreenUtil.setSpText(9),
        color: '#666666',
    },
    arrowIcon: {
        width: ScreenUtil.scaleSize(19),
        height: ScreenUtil.scaleSize(32),
        resizeMode: Image.resizeMode.contain,
        // marginLeft: ScreenUtil.setSpText(30)
    },
    trashIcon: {
        width: ScreenUtil.scaleSize(28),
        height: ScreenUtil.scaleSize(30),
        resizeMode: Image.resizeMode.contain,
    },
    addIcon: {
        width: ScreenUtil.scaleSize(32),
        height: ScreenUtil.scaleSize(32),
        resizeMode: Image.resizeMode.contain,
    },
    rowSeparator: {
        backgroundColor: '#DEDEDE',
        height: ScreenUtil.scaleSize(1),
        paddingHorizontal: ScreenUtil.scaleSize(30)
    },
    separatorView: {
        height: ScreenUtil.scaleSize(240),
    },
    detail: {
        marginTop: ScreenUtil.scaleSize(20),
        // borderWidth: ScreenUtil.scaleSize(1),
        // borderColor: '#DEDEDE',
        borderRadius: ScreenUtil.scaleSize(8),
        backgroundColor: '#F9F9F9',
        shadowOffset: {width: 0, height: 1},
        shadowColor: 'rgba(0,0,0,0.3)',
        shadowOpacity: 1,
        shadowRadius: 2,
        elevation: 2,
    },
    invoiceItemBg: {
        marginLeft: ScreenUtil.scaleSize(-10),
        marginTop: ScreenUtil.scaleSize(-10),
    },
    invoiceItem: {
        marginLeft: ScreenUtil.scaleSize(10),
        marginTop: ScreenUtil.scaleSize(10),
        borderWidth: ScreenUtil.scaleSize(1),
        borderColor: '#E3E3E3',
        height: ScreenUtil.scaleSize(140),
        borderRadius: ScreenUtil.scaleSize(8),
        backgroundColor: 'white',
        padding: ScreenUtil.scaleSize(20)
    },
    invoiceItemRow: {
        flexDirection: 'row'
    },
    invoiceItemDetailLabel: {
        width: ScreenUtil.scaleSize(130),
        color: '#ABABAB',
        fontSize: ScreenUtil.setSpText(9),
    },
    invoiceItemDetailValue: {
        fontSize: ScreenUtil.setSpText(9),
        color: '#666666',
        flex: 1,
    },
    bottomView: {
        flexDirection: 'row',
        alignItems: 'center',
        height: ScreenUtil.scaleSize(96),
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        width: deviceWidth,
        borderTopColor: '#DEDEDE',
        borderTopWidth: ScreenUtil.scaleSize(1),
        backgroundColor: 'white'
    },
    bottomLabel: {
        marginLeft: ScreenUtil.scaleSize(30),
        fontSize: ScreenUtil.setSpText(7),
        textAlignVertical: 'center',
        color: '#666666'
    },
    submitView: {
        height: ScreenUtil.scaleSize(96),
        width: ScreenUtil.scaleSize(175),
        backgroundColor: '#FFAA00',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitText: {
        fontSize: ScreenUtil.setSpText(9),
        textAlignVertical: 'center',
        color: 'white'
    },
    attachListView: {
        marginLeft: ScreenUtil.scaleSize(200),
        paddingBottom: ScreenUtil.scaleSize(10),
    },
    attachItem: {
        flex: 1,
        flexDirection: 'row',
        height: ScreenUtil.scaleSize(96),
    },
    deleteIcon: {
        width: ScreenUtil.scaleSize(30),
        height: ScreenUtil.scaleSize(30),
        resizeMode: Image.resizeMode.contain,
    },
    deleteIconTouchView: {
        marginLeft: ScreenUtil.scaleSize(-10),
        marginRight: ScreenUtil.scaleSize(-10),
        marginTop: ScreenUtil.scaleSize(-10),
        paddingHorizontal: ScreenUtil.scaleSize(10),
        paddingTop: ScreenUtil.scaleSize(10),
    },
    deleteIconTouch: {
        position: 'absolute',
        top: ScreenUtil.scaleSize(10),
        left: 0,
        zIndex: 2,
    },
    deleteIconTouchAttach: {
        position: 'absolute',
        top: ScreenUtil.scaleSize(20),
        left: ScreenUtil.scaleSize(10),
        zIndex: 2,
    },
    fileIcon: {
        marginTop: ScreenUtil.scaleSize(20),
        marginLeft: ScreenUtil.scaleSize(10),
        width: ScreenUtil.scaleSize(58),
        height: ScreenUtil.scaleSize(66),
        resizeMode: Image.resizeMode.contain,
    },
    attachDetail: {
        marginLeft: ScreenUtil.scaleSize(20),
        marginTop: ScreenUtil.scaleSize(20),
        height: ScreenUtil.scaleSize(64),
    },
    attachDetailText: {
        flex: 1,
        fontSize: ScreenUtil.setSpText(7),
        color: '#666666',
        maxWidth: ScreenUtil.scaleSize(402)
    },
    modal: {
        alignItems: 'center',
        height: ScreenUtil.scaleSize(480)
    },
    selectionTitleView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: ScreenUtil.scaleSize(80),
        width: ScreenUtil.scaleSize(690),
        marginHorizontal: ScreenUtil.scaleSize(30),
        borderBottomColor: '#DEDEDE',
        borderBottomWidth: ScreenUtil.scaleSize(1),
    },
    selectionBtn: {
        fontSize: ScreenUtil.setSpText(9),
        color: '#FFAA00'
    },
    pickerStyle: {
        flex: 1,
        margin: ScreenUtil.scaleSize(30),
        backgroundColor: 'red'
    },

    modalTime: {
        height: ScreenUtil.scaleSize(300),
    },


    rowInput: {
        flex: 1,
        textAlign: 'left',
        //marginLeft: ScreenUtil.scaleSize(90),
        fontSize: ScreenUtil.setSpText(9),
        padding: 0,
        color: '#666666',
    },

    requiredWord: {
        fontSize: ScreenUtil.scaleSize(28),
        height: ScreenUtil.scaleSize(40),
        width: ScreenUtil.scaleSize(14),
        color: 'red',
        letterSpacing: ScreenUtil.scaleSize(-0.68),
        lineHeight: ScreenUtil.scaleSize(40)
    }
});