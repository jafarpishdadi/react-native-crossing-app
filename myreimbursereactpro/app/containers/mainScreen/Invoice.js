/**
 * 票夹
 * Created by sky.qian on 10/26/2017.
 */
import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
    Animated,
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    View,
    Platform,
    TouchableOpacity,
    NativeModules,
    TouchableWithoutFeedback,
    FlatList,
    PixelRatio,
    ActivityIndicator,
    findNodeHandle,
    DeviceEventEmitter
} from "react-native";
import ScreenUtil, {deviceHeight, deviceWidth} from "../../utils/ScreenUtil";
import {CustomStyles} from "../../css/CustomStyles";
import Message from "../../constant/Message";
import Header from "./../common/CommonHeader";
import {SwipeRow} from "react-native-swipe-list-view";
import {
    changeState,
    selectInvoice,
    loadInvoiceListDataWithoutReimbursement,
    loadInvoiceListDataWithinReimbursement,
    loadInvoiceListDataDoneReimbursement,
    loadInvoiceDelete,
    ocrValidation,
    doInitialise,
    refreshNoReimbursementData,
    refreshInReimbursementData,
    refreshCompletedReimbursementData,
    loadMoreNoReimbursementData,
    loadMoreInReimbursementData,
    loadMoreCompletedReimbursementData,
    loadInvoiceListDataReimbursement,
    getApplyType,
    loadInvoiceListDataReimbursementByDate,
    loadInvoiceListReimbursedData
} from "../../redux/actions/invoice/Invoice";
import {
    navigateInvoiceDetails,
    navigateScanQrCode,
    navigateEditInvoice,
    back,
    navigateNewReimbursement
} from "../../redux/actions/navigator/Navigator";
import Picker from "react-native-picker";
import Util from "../../utils/Util";
import PopDialog from "./../common/PopDialog";
import Dialog from "./../common/Dialog";
import {BlurView} from "react-native-blur";
import BackDialog from "./../common/BackDialog";
import CommonLoading from "./../common/CommonLoading";
import {changeState as changeAppState} from './../../redux/actions/App';
const Permissions = require('react-native-permissions');
var RNBridgeModule = NativeModules.RNBridgeModule;
const interpolate = (value, opts) => {
    const x = value.interpolate(opts);
    x.toJSON = () => x.__getValue();
    return x;
};
let countZIndex = 500;
let amountZIndex = 500;

class Invoice extends Component {

    static navigationOptions = {
        header: null,
        tabBarLabel: Message.INVOICE_LIST,
        tabBarIcon: ({tintColor, focused}) => (
            <Image
                source={focused ? require('../../img/mainScreen/invoice_selected.png') : require('../../img/mainScreen/invoice_unselected.png')}
                style={CustomStyles.icon}
            />
        ),
        tabBarOnPress: ({route, index}, jumpToIndex) => {
            if (route.routeName === 'Invoice') {
                DeviceEventEmitter.emit('InvoiceList');
                DeviceEventEmitter.emit('setInvoiceTab');
            }
            jumpToIndex(index);
        }
    }

    constructor(props) {
        super(props);
        props.loadMore = false;
        this.state = {
            scrollY: new Animated.Value(0), //列表滚动距离
            countZIndex: -500,
            amountZIndex: -500,
            countArrowY: new Animated.Value(0),
            amountArrowY: new Animated.Value(0),
            dynamicHeight: 0,
        };
    }

    componentDidMount() {
        this.props.doInitialise();
        if (this.props.navigation.state.params && this.props.navigation.state.params.expenseId) {
            this.props.changeState({
                targetExpenseId: this.props.navigation.state.params.expenseId,
                selected: this.props.navigation.state.params.selectedInvoice,
                showCheckbox: true
            });
        }
        if (!this.props.invoice.isFirst) {
            //加载数据
            this.props.loadInvoiceListDataReimbursement('N');
        }
        this.hideBlurSubscription = DeviceEventEmitter.addListener('hideBlurTabTwo', ()=>this.blurAction('0'));
        this.showBlurSubscription = DeviceEventEmitter.addListener('showBlurTabTwo', ()=>this.blurAction('1'));
        this.invoiceEventListener = DeviceEventEmitter.addListener('InvoiceList', ()=>this.toggleToInvoiceListAction());
        this.setInvoiceTab = DeviceEventEmitter.addListener('setInvoiceTab', ()=>this.setTab());
    }

    /**
     * 组件卸载
     * 清除定时器，监听器
     */
    componentWillUnmount() {
        this.hideBlurSubscription.remove();
        this.showBlurSubscription.remove();
        this.invoiceEventListener.remove();
        this.setInvoiceTab.remove();
    }

    setTab() {
        const that = this;
        setTimeout(() => {
            that.props.changeAppState({
                currentTab: 'Invoice'
            })
        }, 100);
    }

    /**
     * 返回
     */
    backClick() {
        if (Util.checkIsEmptyString(this.props.invoice.targetExpenseId)) {
            this.props.changeState({showCheckbox: false});
        } else {
            this.props.back();
        }
    }

    /**
     * 新增弹窗
     */
    popDialog() {
        this.props.changeState({showDialog: true});
    }

    /**
     * 关闭弹窗
     * @param component 当前component
     */
    _closeModal(component) {
        component.props.changeState({showDialog: false, deleteConfirm: false});
    }

    /**
     * 模糊相关操作
     */
    blurAction(type) {
        if (type == '1') {
            this.props.changeState({viewRef: findNodeHandle(this.refs.blurView)});
        } else {
            this.props.changeState({viewRef: null});
        }
    }

    /**
     * 切换到票夹时，收起阴影框显示等操作
     */
    toggleToInvoiceListAction() {
        const {countArrowY, amountArrowY} = this.state;
        const that = this;
        setTimeout(() => {
            that.props.changeState({
                invoiceCountZIndex: -500,
                invoiceAmountZIndex: -500
            });
        }, 100);

        countArrowY.setValue(0);
        amountArrowY.setValue(0);
        this.refs.countView.setNativeProps({style: {zIndex: -500}});
        this.refs.amountView.setNativeProps({style: {zIndex: -500}});
    }

    /**
     * 初始日期选择器默认值，默认值为“全部”
     * @returns {string}
     */
    showEmptyDateData() {
        let month = this.props.invoice.selectedMonth;
        if (month.length === 2) {
            month = '0' + month;
        }
        return (
            this.props.invoice.selectedYear === '' && this.props.invoice.selectedMonth === ''
                ?
                (this.props.invoice.defaultData) : (this.props.invoice.selectedYear + '' + month)
        );
    }

    /**
     * 日期选择器
     */
    createDatePicker() {
        const d = new Date();
        const year = d.getFullYear() + '年';
        const month = '' + (d.getMonth() + 1) + '月';
        const selectedYear = this.props.invoice.selectedYear;
        const selectedMonth = this.props.invoice.selectedMonth;

        Picker.init({
            pickerData: Util.createDateDataWithoutDay(),
            selectedValue: (selectedYear == '' || selectedMonth == '') ? [year, month] : [selectedYear, selectedMonth],
            pickerConfirmBtnText: Message.COMPLETE,
            pickerCancelBtnText: Message.ALL,
            pickerConfirmBtnColor: [255, 170, 0, 1],
            pickerCancelBtnColor: [255, 170, 0, 1],
            pickerToolBarBg: [255, 255, 255, 1],
            pickerBg: [255, 255, 255, 1],
            pickerFontColor: [102, 102, 102, 1],
            pickerTitleText: '',
            onPickerConfirm: (pickedValue, pickedIndex) => {
                var yearFormat;
                var monthFormat;
                var selectedDateStr;
                yearFormat = pickedValue[0].substring(0, 4);
                if (pickedValue[1].length == 2) {
                    monthFormat = '0' + pickedValue[1].substring(0, 1);
                } else {
                    monthFormat = pickedValue[1].substring(0, 2);
                }
                selectedDateStr = yearFormat + monthFormat;
                this.props.changeState({
                    selectedYear: pickedValue[0],
                    selectedMonth: pickedValue[1],
                    selectedDateStr: selectedDateStr,
                    showCountDetail: false,
                    showAmountDetail: false,
                    deleteConfirm: false,
                    showDialog: false,          //是否显示提示对话框
                    // showCheckbox: false,        //是否显示复选框

                    // reimbursementStatus: 0,             //报销状态，值0=未报销,2=报销中,3=已报销,默认0

                    selectedItem: [],       //单行选中的发票
                    selectedItemIDCount: 0, //单行选中的发票ID数
                    selectedItemAmount: 0,  //单行选中的发票金额数
                    isSelectedItem: [],     //单行发票按钮是否选中
                    allItemCount: 0,       //列表所有发票数
                    allItemAmount: [],       //列表所有发票金额
                    allItem: [],            //列表所有发票
                    isSelectedAll: false,   //是否选择全选按钮
                    checkedInvoice: [],      //已查验的发票

                    showPickerShadow: false,   //是否显示选择器阴影
                    isLoading: true,
                    isShowDatePicker: false
                });
                this.props.loadInvoiceListDataReimbursementByDate(selectedDateStr);
            },
            onPickerCancel: (pickedValue, pickedIndex) => {
                const emptyDateStr = '';
                if (!this.props.invoice.showCheckbox) {
                    this.props.doInitialise();
                    this.props.changeState({isLoading: true, isShowDatePicker: false});
                } else {
                    this.props.changeState({
                        deleteConfirm: false,
                        showCountDetail: false,      //显示累计张数详情
                        showAmountDetail: false,     //显示累计金额详情
                        showDialog: false,          //是否显示提示对话框
                        // showCheckbox: false,        //是否显示复选框

                        reimbursementStatus: 0,             //报销状态，值0=未报销,2=报销中,3=已报销,默认0

                        selectedItem: [],       //单行选中的发票
                        selectedItemIDCount: 0, //单行选中的发票ID数
                        selectedItemAmount: 0,  //单行选中的发票金额数
                        isSelectedItem: [],     //单行发票按钮是否选中
                        allItemCount: 0,       //列表所有发票数
                        allItemAmount: [],       //列表所有发票金额
                        allItem: [],            //列表所有发票
                        isSelectedAll: false,   //是否选择全选按钮
                        checkedInvoice: [],      //已查验的发票

                        selectedYear: '',
                        selectedMonth: '',
                        selectedDateStr: '',

                        showPickerShadow: false,   //是否显示选择器阴影
                        isLoading: true,
                        isShowDatePicker: false
                    });
                }
                this.props.loadInvoiceListDataReimbursementByDate(emptyDateStr);
            },
            onPickerSelect: (pickedValue, pickedIndex) => {
                // console.log('date', pickedValue, pickedIndex);
            }
        });
    }

    //01-11  发票标题显示成明细第一条,logo统一显示的规整统一入口
    collectInvoiceTypeCode(invoiceType) {

        switch (invoiceType) {
            case '01':
            case '02':
            // case '03':
            case '04':
            case '10':
            case '11':
                return '99';
            default:
                return invoiceType;
        }
    }

    /**
     * 渲染单行发票选中或取消
     * @param invoiceItem   单行发票数据
     * @param amount        单行发票金额
     */
    toggleSelected(invoiceItem, amount) {
        var selectedItem;       //单行选中的发票
        var isSelectedAll;      //是否选择全选按钮
        var selectedItemIDCount;//单行选中的发票ID数
        var allItemCount = 0;   //列表所有发票数
        var isSelectedItem;     //单行发票按钮是否选中
        var selectedItemAmount; //单行选中的发票金额数
        var checkedInvoice;     //已查验的发票
        var dataWithoutReimbursement;
        var status;

        selectedItem = this.props.invoice.selectedItem;
        isSelectedAll = this.props.invoice.isSelectedAll;
        selectedItemIDCount = this.props.invoice.selectedItemIDCount;
        isSelectedItem = this.props.invoice.isSelectedItem;
        selectedItemAmount = parseFloat(this.props.invoice.selectedItemAmount);
        dataWithoutReimbursement = this.props.invoice.dataWithoutReimbursement;
        status = this.props.invoice.reimbursementStatus;

        for (var k = 0; k < dataWithoutReimbursement.length; k++) {
            if (!(Util.contains(['01', '02', '04', '10', '11'], dataWithoutReimbursement[k].invoiceTypeCode)
                && ((dataWithoutReimbursement[k].totalAmount < 0) || (dataWithoutReimbursement[k].checkState == 0))) && status != 2 && status != 3) {
                allItemCount += parseInt(dataWithoutReimbursement[k].invoiceCount);
            }
        }

        var index = selectedItem.indexOf(invoiceItem.uuid); //获取数组索引

        if (!(Util.contains(['01', '02', '04', '10', '11'], invoiceItem.invoiceTypeCode) && ((invoiceItem.totalAmount < 0) || (invoiceItem.checkState == 0)))) {
            if (isSelectedAll) {
                this.props.changeState({isSelectedAll: false, allItemCount: allItemCount});
                if (selectedItemIDCount == allItemCount) {
                    selectedItemIDCount -= parseInt(invoiceItem.invoiceCount);
                    selectedItemAmount -= parseFloat(amount);
                    selectedItem.splice(index, 1, '-' + invoiceItem.uuid);
                    isSelectedItem.splice(index, 1, false);
                    this.props.changeState({
                        selectedItem: selectedItem,
                        selectedItemIDCount: selectedItemIDCount,
                        selectedItemAmount: selectedItemAmount.toFixed(2)
                    });
                }
            } else {
                if (selectedItemIDCount == allItemCount) {
                    this.props.changeState({isSelectedAll: true, allItemCount: allItemCount});
                } else {
                    if (index == (-1) && selectedItem.indexOf('-' + invoiceItem.uuid) == (-1)) {
                        selectedItem.push(invoiceItem.uuid);
                        selectedItemIDCount += parseInt(invoiceItem.invoiceCount);
                        selectedItemAmount += parseFloat(amount);
                        isSelectedItem.push(true);
                    } else if (index == (-1) && selectedItem.indexOf('-' + invoiceItem.uuid) != (-1)) {
                        selectedItem.splice(selectedItem.indexOf('-' + invoiceItem.uuid), 1, invoiceItem.uuid)
                        selectedItemIDCount += parseInt(invoiceItem.invoiceCount);
                        selectedItemAmount += parseFloat(amount);
                        isSelectedItem.splice(selectedItem.indexOf('-' + invoiceItem.uuid), 1, true);
                    } else { // index >= 0
                        selectedItem.splice(index, 1, '-' + invoiceItem.uuid);
                        selectedItemIDCount -= parseInt(invoiceItem.invoiceCount);
                        selectedItemAmount -= parseFloat(amount);
                        isSelectedItem.splice(index, 1, false);
                    }
                    if (selectedItemIDCount == allItemCount) {
                        selectedItem = [].concat(this.props.invoice.allItem);
                        this.props.changeState({
                            isSelectedAll: true,
                            selectedItem: selectedItem,
                            allItemCount: allItemCount,
                            selectedItemIDCount: selectedItemIDCount,
                            selectedItemAmount: selectedItemAmount.toFixed(2)
                        });
                    } else {
                        this.props.changeState({
                            isSelectedAll: false,
                            selectedItem: selectedItem,
                            allItemCount: allItemCount,
                            selectedItemIDCount: selectedItemIDCount,
                            selectedItemAmount: selectedItemAmount.toFixed(2)
                        });
                    }
                }

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
        //检查相机，相册权限是否打开，没有则弹框提示
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
                    // storageOptions: {
                    //     skipBackup: true,
                    //     path: 'images'
                    // }
                    maxWidth: 1600,
                    maxHeight: 1600,
                    quality: 0.6
                };
                ImagePicker.launchCamera(options, (response) => {
                    if (response.didCancel || response.error || response.customButton) {
                        //取消 异常 自定义按钮
                    }
                    else {
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
                    // storageOptions: {
                    //     skipBackup: true,
                    //     path: 'images'
                    // }
                    maxWidth: 1600,
                    maxHeight: 1600,
                    quality: 0.6
                };
                ImagePicker.launchImageLibrary(options, (response) => {
                    if (response.didCancel || response.error || response.customButton) {
                        //取消 异常 自定义按钮
                    }
                    else {
                        this.props.ocrValidation({picture: response.data}, {});
                    }
                });
            });
    }

    /**
     * 确认删除发票
     */
    ensureDeleteClick() {
        this['openRow'] = null;
        this.props.loadInvoiceDelete(this.props.invoice.preDeleteInvoiceId);
    }

    /**
     * 报销单选择器
     */
    createReimbursementPicker() {
        let reimbursementTypeList = this.props.invoice.reimbursementTypeList;

        if (!reimbursementTypeList) {
            Util.showToast("报销单类型为空");
        }

        Picker.init({
            pickerData: this.props.invoice.reimbursementTypeList,
            selectedValue: [this.props.invoice.reimbursementType],
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
                        areaStr = this.props.invoice.reimbursementTypeList[0];
                    } else {
                        areaStr += data[i];
                    }
                }

                var selectedList = this.getSelectedInvoiceListToNewReimbursement();
                this.props.navigateNewReimbursement({applyTypeName: areaStr, selectedList: selectedList})
                this.props.changeState({showPickerShadow: false});
            },
            onPickerCancel: data => {
                this.props.changeState({showPickerShadow: false});
            }
        });
    }

    /**
     * 渲染全选状态
     */
    selectedAllItems() {
        var selectedItemIDCount;//单行选中的发票ID数
        var allItemCount = 0;        //列表所有发票数
        var isSelectedAll;      //是否选择全选按钮
        var selectedItem;       //单行选中的发票
        var allItem;            //列表所有发票
        var selectedItemAmount; //单行选中的发票金额数
        var allItemAmount;      //列表所有发票金额
        var totalAmount         //所有发票金额数值
        var dataWithoutReimbursement;   //未报销发票数组
        var status;
        var selectedDateStr;

        selectedItemIDCount = this.props.invoice.selectedItemIDCount;
        isSelectedAll = this.props.invoice.isSelectedAll;
        selectedItem = this.props.invoice.selectedItem;
        allItem = this.props.invoice.allItem;
        selectedItemAmount = this.props.invoice.selectedItemAmount;
        allItemAmount = this.props.invoice.allItemAmount;
        totalAmount = 0;//初始化,防止undefined
        status = this.props.invoice.reimbursementStatus;
        dataWithoutReimbursement = this.props.invoice.dataWithoutReimbursement;

        for (var k = 0; k < dataWithoutReimbursement.length; k++) {
            if (!(Util.contains(['01', '02', '04', '10', '11'], dataWithoutReimbursement[k].invoiceTypeCode)
                && ((dataWithoutReimbursement[k].totalAmount < 0) || (dataWithoutReimbursement[k].checkState == 0))) && status != 2 && status != 3) {
                allItemCount += parseInt(dataWithoutReimbursement[k].invoiceCount);
            }
        }

        if (allItemAmount.length > 0) {
            for (var i = 0; i < allItemAmount.length; i++) {
                totalAmount += allItemAmount[i];
            }
        }

        if (selectedItemIDCount == allItemCount && isSelectedAll) {
            selectedItem = []
            this.props.changeState({
                isSelectedAll: false,
                selectedItemIDCount: 0,
                selectedItem: selectedItem,
                selectedItemAmount: 0
            });
        } else {
            selectedItem = [].concat(allItem);
            selectedItemAmount = totalAmount;
            this.props.changeState({
                isSelectedAll: true,
                selectedItemIDCount: allItemCount,
                selectedItem: selectedItem,
                selectedItemAmount: selectedItemAmount
            });
        }
    }

    /**
     * 渲染全选后显示icon
     * @returns {XML}
     */
    selectedAllItemsCheckbox() {
        var selectedItemIDCount;//单行选中的发票ID数
        var allItemCount = 0;   //列表所有发票数
        var isSelectedAll;      //是否选择全选按钮
        var dataWithoutReimbursement;   //未报销发票数组
        var status;

        selectedItemIDCount = this.props.invoice.selectedItemIDCount;
        isSelectedAll = this.props.invoice.isSelectedAll;
        dataWithoutReimbursement = this.props.invoice.dataWithoutReimbursement;
        status = this.props.invoice.reimbursementStatus;

        for (var k = 0; k < dataWithoutReimbursement.length; k++) {
            if (!(Util.contains(['01', '02', '04', '10', '11'], dataWithoutReimbursement[k].invoiceTypeCode)
                && ((dataWithoutReimbursement[k].totalAmount < 0) || (dataWithoutReimbursement[k].checkState == 0))) && status != 2 && status != 3) {
                allItemCount += parseInt(dataWithoutReimbursement[k].invoiceCount);
            }
        }

        return (
            (selectedItemIDCount >= 0 && allItemCount >= 0 && selectedItemIDCount == allItemCount && isSelectedAll) ?
                <Image
                    style={styles.selectedSummaryIcon}
                    source={require('./../../img/invoice/hooked.png')}/>
                :
                <Image
                    style={styles.selectedSummaryIcon}
                    source={require('./../../img/invoice/oval_unselected.png')}/>
        );
    }

    /**
     * 计算选中发票张数
     */
    calculateCount() {
        var selectedItemIDCount;
        selectedItemIDCount = this.props.invoice.selectedItemIDCount;
        if (selectedItemIDCount >= 0) {
            return selectedItemIDCount;
        } else {
            selectedItemIDCount = 0;
            return selectedItemIDCount;
        }
        this.props.changeState({selectedItemIDCount: selectedItemIDCount});
    }

    /**
     * 计算选中发票金额
     */
    calculateAmount() {
        var selectedItemAmount;
        var selectedItemIDCount;//单行选中的发票ID数
        var allItemCount;       //列表所有发票数
        var isSelectedAll;      //是否选择全选按钮
        var allItemAmount;      //列表所有发票金额
        selectedItemAmount = this.props.invoice.selectedItemAmount;
        selectedItemIDCount = this.props.invoice.selectedItemIDCount;
        allItemCount = this.props.invoice.allItemCount;
        isSelectedAll = this.props.invoice.isSelectedAll;
        allItemAmount = this.props.invoice.allItemAmount;

        if (selectedItemIDCount == allItemCount || isSelectedAll) {

            //全部选中
            if (selectedItemIDCount != 0 && allItemCount != 0 && isSelectedAll == true) {
                selectedItemAmount = 0;
                for (var i = 0; i < allItemAmount.length; i++) {
                    selectedItemAmount += parseFloat(allItemAmount[i]);
                }
            } else if (selectedItemIDCount == 0 && allItemCount == 0 && isSelectedAll == false) {
                selectedItemAmount = 0;
            } else {
                selectedItemAmount = 0;
                for (var i = 0; i < allItemAmount.length; i++) {
                    selectedItemAmount += parseFloat(allItemAmount[i]);
                }
            }

            selectedItemAmount = selectedItemAmount.toFixed(2);

            if (selectedItemAmount >= 0) {
                return selectedItemAmount;
            } else {
                return 0;
            }
        } else {
            if (selectedItemAmount >= 0) {
                return selectedItemAmount;
            } else {
                return 0;
            }
        }
        this.props.changeState({selectedItemAmount: selectedItemAmount.toFixed(2)});
    }

    /**
     * 处理日期格式
     * @param invoiceDate 发票日期
     * @returns {string|*}
     */
    handleDateFormat(invoiceDate) {
        var date;
        date = invoiceDate.substring(0, 4) + '-' + invoiceDate.substring(4, 6) + '-' + invoiceDate.substring(6);
        return date;
    }

    uncheckedStatus(invoiceItem) {
        var status = this.props.invoice.reimbursementStatus;
        if (Util.contains(['01', '02', '04', '10', '11'], invoiceItem.invoiceTypeCode) && invoiceItem.checkState == 0 && status != 2 && status != 3) {
            return (
                <Image
                    style={styles.uncheckedIcon}
                    source={require('../../img/invoice/invoice_unchecked_icon.png')}/>
            )
        } else {
            return (
                <View/>
            )
        }
    }

    /**
     * 处理金额保留小数位数
     * @returns {string}
     */
    handleAmount(totalAmount) {
        var money = parseFloat(totalAmount).toFixed(2);
        return money;
    }

    /**
     * 增票的货物或应税劳务名称格式化
     * @param goodsName 增票的货物或应税劳务
     * @returns {*}
     */
    goodsNameFormat(goodsName) {
        if (goodsName.length <= 10) {
            return goodsName;
        } else {
            var subStr = goodsName.substring(0, 11) + '...';
            return subStr;
        }
    }

    /**
     * 渲染单个发票item
     * @param invoiceItem 发票数据
     * @param index 发票下标
     */
    renderInvoiceItem(invoiceItem, index) {
        var invoiceIcon;
        var invoiceType;
        var selectedIcon;
        var allItem;
        var index;
        var selectedItem;
        var checkedInvoice;
        var allItemAmount;
        var status;
        const ref = 'row_' + invoiceItem.uuid;
        switch (this.collectInvoiceTypeCode(invoiceItem.invoiceTypeCode)) {
            case '03':
                invoiceIcon = require('./../../img/invoice/invoice_icon_common.png');
                invoiceType = Message.INVOICE_LIST_INVOICE_TYPE_JDCTYFP;
                break;
            case '99':
                invoiceIcon = require('./../../img/invoice/invoice_icon_common.png');
                invoiceType = this.goodsNameFormat(invoiceItem.goodsName);
                break;
            case '91':
                invoiceIcon = require('./../../img/invoice/invoice_icon_taxi.png');
                invoiceType = Message.INVOICE_LIST_INVOICE_TYPE_TAXI;
                break;
            case '92':
                invoiceIcon = require('./../../img/invoice/invoice_icon_train.png');
                invoiceType = Message.INVOICE_LIST_INVOICE_TYPE_TRAIN;
                break;
            case '93':
                invoiceIcon = require('./../../img/invoice/invoice_icon_plane.png');
                invoiceType = Message.INVOICE_LIST_INVOICE_TYPE_PLANE;
                break;
            case '95':
                invoiceIcon = require('./../../img/invoice/invoice_icon_quota.png');
                invoiceType = Message.INVOICE_LIST_INVOICE_TYPE_QUOTA;
                break;
            case '00':
                invoiceIcon = require('./../../img/invoice/invoice_icon_other.png');
                invoiceType = Message.INVOICE_LIST_INVOICE_TYPE_OTHER;
                break;
            //94,96,97,98 和99的发票logo需在给出对应图标时进行更新
            case '94':
                invoiceIcon = require('./../../img/invoice/invoice_icon_common.png');
                invoiceType = Message.INVOICE_TYPE_NAME_94;
                break;
            case '96':
                invoiceIcon = require('./../../img/invoice/invoice_icon_common.png');
                invoiceType = Message.INVOICE_TYPE_NAME_96;
                break;
            case '97':
                invoiceIcon = require('./../../img/invoice/invoice_icon_common.png');
                invoiceType = Message.INVOICE_TYPE_NAME_97;
                break;
            case '98':
                invoiceIcon = require('./../../img/invoice/invoice_icon_common.png');
                invoiceType = Message.INVOICE_TYPE_NAME_98;
                break;
        }
        allItem = this.props.invoice.allItem;
        allItemAmount = this.props.invoice.allItemAmount;
        status = this.props.invoice.reimbursementStatus;

        checkedInvoice = this.props.invoice.checkedInvoice;
        if (!(Util.contains(['01', '02', '04', '10', '11'], invoiceItem.invoiceTypeCode) && ((invoiceItem.totalAmount < 0) || (invoiceItem.checkState == 0))) && status != 2 && status != 3) {
            if (!Util.contains(allItem, invoiceItem.uuid)) {
                allItem.push(invoiceItem.uuid);
                allItemAmount.push(parseFloat(invoiceItem.totalAmount));
            }
        } else {
            if (!Util.contains(checkedInvoice, invoiceItem.uuid)) {
                checkedInvoice.push(invoiceItem.uuid);
            }
        }

        selectedItem = this.props.invoice.selectedItem;
        index = selectedItem.indexOf(invoiceItem.uuid);

        if (Util.contains(['01', '02', '04', '10', '11'], invoiceItem.invoiceTypeCode) && ((invoiceItem.totalAmount < 0) || (invoiceItem.checkState == 0)) && status != 2 && status != 3) {
            selectedIcon = require('./../../img/invoice/disabled_hooked.png');
        } else {
            if (index == (-1) && selectedItem.indexOf('-' + invoiceItem.uuid) == (-1)) {
                selectedIcon = require('./../../img/invoice/oval_unselected.png');
            } else if (index == (-1) && selectedItem.indexOf('-' + invoiceItem.uuid) != (-1)) {
                selectedIcon = require('./../../img/invoice/oval_unselected.png');
            } else {
                selectedIcon = require('./../../img/invoice/hooked.png');
            }
        }

        return (
            this.props.invoice.showCheckbox == false ?
                <View style={{backgroundColor: 'white'}}>
                    <SwipeRow
                        key={ref}
                        leftOpenValue={75}
                        rightOpenValue={-ScreenUtil.scaleSize(110)}
                        disableLeftSwipe={this.props.invoice.canDelete}
                        disableRightSwipe={true}
                        closeOnRowPress={true}
                        onRowOpen={
                            ()=> {
                                this.commonClosedShadowbox();
                                if (!this['openRow']) {
                                    this['openRow'] = ref;
                                }
                                if (this['openRow'] != ref) {
                                    this[this['openRow']].closeRow();
                                    this['openRow'] = ref;
                                }
                            }
                        }
                        ref={(swipeRow) => {
                            this[ref] = swipeRow;
                            if (swipeRow) {
                                setTimeout(
                                    () => {
                                        swipeRow.closeRow();
                                    }
                                    , 100);
                            }
                        }}
                    >
                        <View style={styles.standaloneRowBack}>
                            <Text style={styles.backTextWhite}>Left</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    this.props.changeState({
                                        deleteConfirm: true,
                                        preDeleteInvoiceId: invoiceItem.uuid
                                    });
                                }}>
                                <View style={{paddingHorizontal: ScreenUtil.scaleSize(30)}}>
                                    <Image source={require('./../../img/invoice/delete.png')}
                                           style={[styles.invoiceRowBtnIcon]}/>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <TouchableWithoutFeedback
                            onPress={() => {
                                this.commonClosedShadowbox();
                                this.props.changeState({
                                    invoiceCountZIndex: -500,
                                    invoiceAmountZIndex: -500
                                });

                                Picker.hide();

                                this.props.navigateInvoiceDetails({
                                    invoiceTypeCode: invoiceItem.invoiceTypeCode,
                                    uuid: invoiceItem.uuid
                                });
                            }}>
                            <View style={styles.standaloneRowFront}>
                                {this.uncheckedStatus(invoiceItem)}
                                <View style={styles.invoiceItemHeader}>
                                    <Image source={invoiceIcon}
                                           style={styles.invoiceIcon}/>
                                    <Text numberOfLines={1} ellipsizeMode='tail'
                                          style={[styles.invoiceItemTypeText]}>{invoiceType}</Text>
                                    <Text
                                        style={styles.invoiceItemAmount}>{Message.MONEY + this.handleAmount(invoiceItem.totalAmount)}</Text>
                                </View>
                                <View style={styles.invoiceItemDetail}>
                                    <Text
                                        style={styles.invoiceItemCreateDate}>{Message.INVOICE_LIST_CREATE_DATE + ':'}</Text>
                                    <Text
                                        style={[styles.invoiceItemCreateDate, {marginLeft: ScreenUtil.scaleSize(60)}]}>{this.handleDateFormat(invoiceItem.invoiceDate)}</Text>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </SwipeRow>
                    <View
                        style={{
                            width: deviceWidth - 2 * ScreenUtil.scaleSize(30),
                            height: 1 / PixelRatio.get(),
                            backgroundColor: '#DEDEDE',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            marginHorizontal: ScreenUtil.scaleSize(30)
                        }}/>
                </View>
                :
                <View style={{flexDirection: 'row', width: deviceWidth, height: ScreenUtil.scaleSize(123)}}>
                    <TouchableWithoutFeedback
                        disabled={Util.contains(['01', '02', '04', '10', '11'], invoiceItem.invoiceTypeCode) && ((invoiceItem.totalAmount < 0) || (invoiceItem.checkState == 0))}
                        onPress={() => {
                            this.toggleSelected(invoiceItem, invoiceItem.totalAmount);
                        }}>
                        <View style={[styles.checkboxView, {padding: 0, margin: 0}]}>
                            <Image
                                style={styles.checkboxIcon}
                                source={selectedIcon}/>
                        </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback
                        onPress={() => {

                            this.commonClosedShadowbox();
                            this.props.changeState({
                                invoiceCountZIndex: -500,
                                invoiceAmountZIndex: -500
                            });

                            Picker.hide();

                            this.props.navigateInvoiceDetails({
                                invoiceTypeCode: invoiceItem.invoiceTypeCode,
                                uuid: invoiceItem.uuid,
                            })
                        }}>
                        <View style={styles.standaloneRowFrontView}>
                            {this.uncheckedStatus(invoiceItem)}
                            <View style={styles.invoiceItemHeaderView}>
                                <Image source={invoiceIcon}
                                       style={styles.invoiceIcon}/>
                                <Text style={styles.invoiceItemTypeText} numberOfLines={1}
                                      ellipsizeMode='tail'>{invoiceType}</Text>
                                <Text
                                    style={[styles.invoiceItemAmountText]}>{Message.MONEY + invoiceItem.totalAmount}</Text>
                            </View>
                            <View style={styles.invoiceItemDetailView}>
                                <Text
                                    style={styles.invoiceItemCreateDate}>{Message.INVOICE_LIST_CREATE_DATE + ':'}</Text>
                                <Text
                                    style={[styles.invoiceItemCreateDate, {marginLeft: ScreenUtil.scaleSize(60)}]}>{this.handleDateFormat(invoiceItem.invoiceDate)}</Text>
                            </View>
                            <View style={{
                                position: 'absolute',
                                right: ScreenUtil.scaleSize(30), top: ScreenUtil.scaleSize(122),
                                left: ScreenUtil.scaleSize(30),
                                width: 0.84 * deviceWidth - 2 * ScreenUtil.scaleSize(30),
                                height: 1 / PixelRatio.get(),
                                backgroundColor: '#DEDEDE'
                            }}></View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>

        )
    }

    /**
     * 获取选中的发票，转换成新建报销单页面可用的数据格式
     * @returns 选中的发票列表
     */
    getSelectedInvoiceListToNewReimbursement() {
        var selectInvoiceList = [];
        for (var i = 0; i < this.props.invoice.selectedItem.length; i++) {
            for (var j = 0; j < this.props.invoice.dataWithoutReimbursement.length; j++) {
                if (this.props.invoice.selectedItem[i] == this.props.invoice.dataWithoutReimbursement[j].uuid) {
                    var targetInvoiceItem = {};
                    var invoiceItem = this.props.invoice.dataWithoutReimbursement[j];
                    targetInvoiceItem.invoiceType = invoiceItem.invoiceTypeCode;
                    targetInvoiceItem.invoiceNum = invoiceItem.invoiceCount;
                    targetInvoiceItem.invoiceDetail = invoiceItem.goodsName;
                    targetInvoiceItem.invoiceUUID = invoiceItem.uuid;
                    targetInvoiceItem.invoiceDateStr = Util.formatDate(invoiceItem.invoiceDate);
                    targetInvoiceItem.invoiceAmount = invoiceItem.totalAmount;
                    targetInvoiceItem.imageAddress = '';
                    targetInvoiceItem.checkStatusCode = invoiceItem.checkState;
                    targetInvoiceItem.invoiceTypeName = Util.getInvoiceTypeName(invoiceItem.invoiceTypeCode);
                    targetInvoiceItem.invoiceTaxamount = invoiceItem.taxAmount;
                    selectInvoiceList.push(targetInvoiceItem);
                    break;
                }
            }
        }
        return selectInvoiceList;
    }


    /**
     * 票夹底部报销按钮执行
     * @constructor
     */
    ButtonAction() {
        var status = this.props.invoice.reimbursementStatus;
        const {countArrowY, amountArrowY, scrollY} = this.state;
        switch (status) {
            case 0:
                if (this.props.invoice.selectedDateStr == '') {
                    this.props.changeState({
                        showCheckbox: true,
                        invoiceCountZIndex: -500,
                        invoiceAmountZIndex: -500
                    });
                    countArrowY.setValue(0);
                    amountArrowY.setValue(0);
                    scrollY.setValue(0);
                    this.refs.statusLabelView.setNativeProps({style: {zIndex: -30}});
                    this.refs.countView.setNativeProps({style: {zIndex: -500}});
                    this.refs.amountView.setNativeProps({style: {zIndex: -500}});
                } else {
                    this.props.changeState({
                        showCheckbox: true,
                        selectedYear: '',
                        selectedMonth: '',
                        selectedDateStr: '',
                        invoiceCountZIndex: -500,
                        invoiceAmountZIndex: -500
                    });
                    countArrowY.setValue(0);
                    amountArrowY.setValue(0);
                    scrollY.setValue(0);
                    this.refs.statusLabelView.setNativeProps({style: {zIndex: -30}});
                    this.refs.countView.setNativeProps({style: {zIndex: -500}});
                    this.refs.amountView.setNativeProps({style: {zIndex: -500}});
                    this.props.loadInvoiceListReimbursedData();
                }
                break;
            case 1:
                this.props.changeState({
                    showCheckbox: false
                });
                break;
            case 2:
                this.props.changeState({
                    showCheckbox: false
                });
                break;
            default:
        }
    }

    /**
     * 渲染票夹底部视图
     * @returns {XML}
     */
    renderBottom() {
        var reimbursementStatus = this.props.invoice.reimbursementStatus;
        if (reimbursementStatus === 0) {
            return (
                <View style={styles.bottomView}>

                    {this.props.invoice.showCheckbox ? (
                        <TouchableOpacity
                            style={styles.selectedSummary}
                            onPress={() => {
                                this.selectedAllItems();
                            }}>
                            {this.selectedAllItemsCheckbox()}
                        </TouchableOpacity>
                    ) : (<View/>)}
                    {this.props.invoice.showCheckbox ? (
                        <View style={{marginLeft: ScreenUtil.scaleSize(10)}}>
                            <Text style={styles.selectedSummaryText}>
                                {Message.INVOICE_LIST_CHOICE}
                                {this.calculateCount()}
                                {Message.INVOICE_LIST_INVOICE_COUNT}</Text>
                            <Text style={styles.selectedSummaryText}>
                                {Message.INVOICE_LIST_AMOUNT_TOTAL}
                                {this.calculateAmount()}
                                {Message.INVOICE_LIST_RMB}</Text>
                        </View>
                    ) : (<View/>)}

                    {this.renderSubmitButton()}
                </View>
            );
        } else {
            return (
                <View/>
            );
        }
    }

    /**
     * 渲染报销、提交按钮显示
     * @returns {XML}
     */
    renderSubmitButton() {
        var showCheckbox = this.props.invoice.showCheckbox;
        return (
            showCheckbox ?
                <TouchableOpacity
                    style={styles.submitContainer}
                    onPress={() => {
                        if (this.props.invoice.selectedItemIDCount == 0) {
                            Util.showToast(Message.INVOICE_LIST_CHOOSE_INVOICE)
                        } else {
                            if (Util.checkIsEmptyString(this.props.invoice.targetExpenseId)) {
                                this.props.changeState({showPickerShadow: true});
                                this.createReimbursementPicker();
                                Picker.show();
                            } else {
                                var selectInvoiceList = this.getSelectedInvoiceListToNewReimbursement();
                                this.props.selectInvoice(this.props.invoice.targetExpenseId, selectInvoiceList);
                                //提交后清空数据
                                this.props.doInitialise();
                            }
                        }
                    }}>
                    <View style={styles.submitView}>
                        <Text style={styles.submitText}>{Message.BUTTON_SUBMIT}</Text>
                    </View>
                </TouchableOpacity>
                :
                <TouchableOpacity
                    style={styles.submitContainer}
                    onPress={() => {
                        this.ButtonAction();
                    }}>
                    <View style={styles.submitView}>
                        <Text style={styles.submitText}>{Message.BUTTON_REIMBURSEMENT}</Text>
                    </View>
                </TouchableOpacity>
        );
    }

    /**
     * 渲染未报销样式
     * @returns {{fontSize: *, color: string}}
     */
    renderNotReimbursementLabel() {
        var status = this.props.invoice.reimbursementStatus;
        return (status == 0 ?
        {fontSize: ScreenUtil.setSpText(7), color: 'orange'} :
        {fontSize: ScreenUtil.setSpText(7), color: '#666666'});
    }

    /**
     * 渲染报销中样式
     * @returns {{fontSize: *, color: string}}
     */
    renderInReimbursementLabel() {
        var status = this.props.invoice.reimbursementStatus;
        return (status == 2 ?
        {fontSize: ScreenUtil.setSpText(7), color: 'orange'} :
        {fontSize: ScreenUtil.setSpText(7), color: '#666666'});
    }

    /**
     * 渲染已报销样式
     * @returns {{fontSize: *, color: string}}
     */
    renderDoneReimbursementLabel() {
        var status = this.props.invoice.reimbursementStatus;
        return (status == 3 ?
        {fontSize: ScreenUtil.setSpText(7), color: 'orange'} :
        {fontSize: ScreenUtil.setSpText(7), color: '#666666'});
    }

    /**
     * 根据不同报销状态刷新对应的数据
     */
    refreshReimbursementByStatus() {
        switch (this.props.invoice.reimbursementStatus) {
            case 0:
                this.props.refreshNoReimbursementData(this.props.invoice.selectedDateStr);
                break;
            case 2:
                this.props.refreshInReimbursementData(this.props.invoice.selectedDateStr);
                break;
            case 3:
                this.props.refreshCompletedReimbursementData(this.props.invoice.selectedDateStr);
                break;
            default:
        }
    }

    /**
     * 报销状态
     * @returns {*}
     */
    reimbursementStatus() {
        switch (this.props.invoice.reimbursementStatus) {
            case 0:
                return this.props.invoice.dataWithoutReimbursement;
            case 2:
                return this.props.invoice.dataWithinReimbursement;
            case 3:
                return this.props.invoice.dataDoneReimbursement;
            default:
        }

    }

    /**
     * 渲染Flatlist头部视图样式
     * @returns {*}
     */
    renderListHeaderStyle() {
        return (
            this.props.invoice.showCheckbox ?
            {
                width: 0,
                height: 0,
                backgroundColor: '#FFFFFF'
            } : {
                width: deviceWidth,
                height: ScreenUtil.scaleSize(58),
                backgroundColor: '#FFFFFF'
            }
        );
    }

    /**
     * listHeader点击日期触发事件
     */
    listHeaderDatePress() {
        const {countArrowY, amountArrowY} = this.state;
        if (Platform.OS === 'android') {
            RNBridgeModule.checkFloatWindowOpAllowed((result)=> {
                countZIndex = -500;
                amountZIndex = -500;
                this.refs.countView.setNativeProps({
                    style: {zIndex: -500}
                });
                this.refs.amountView.setNativeProps({
                    style: {zIndex: -500}
                });
                this.refs.countView.getNative
                this.props.changeState({
                    showPickerShadow: true,
                    isShowDatePicker: true,
                    invoiceCountZIndex: -500,
                    invoiceAmountZIndex: -500

                });
                countArrowY.setValue(0);
                amountArrowY.setValue(0);
                this.createDatePicker();
                Picker.show();
            });
        } else {
            countZIndex = -500;
            amountZIndex = -500;
            this.refs.countView.setNativeProps({
                style: {zIndex: -500}
            });
            this.refs.amountView.setNativeProps({
                style: {zIndex: -500}
            });
            this.props.changeState({
                showPickerShadow: true,
                isShowDatePicker: true,
                invoiceCountZIndex: -500,
                invoiceAmountZIndex: -500

            });
            countArrowY.setValue(0);
            amountArrowY.setValue(0);
            this.createDatePicker();
            Picker.show();
        }
    }

    /**
     * listHeader点击累计张数触发事件
     */
    listHeaderCountPress() {
        let invoiceCountZIndex = this.props.invoice.invoiceCountZIndex;
        const {countArrowY, amountArrowY} = this.state;
        if (countZIndex > 0) {
            if (invoiceCountZIndex > 0) {
                this.refs.countView.setNativeProps({
                    style: {zIndex: -500}
                });
                this.refs.amountView.setNativeProps({
                    style: {zIndex: -500}
                });
                this.props.changeState({
                    invoiceCountZIndex: -500,
                    invoiceAmountZIndex: -500
                });
                countArrowY.setValue(0);
                amountArrowY.setValue(0);
            } else {
                this.refs.countView.setNativeProps({
                    style: {zIndex: 500}
                });
                this.refs.amountView.setNativeProps({
                    style: {zIndex: -500}
                });
                this.props.changeState({
                    invoiceCountZIndex: 500,
                    invoiceAmountZIndex: -500
                });
                countArrowY.setValue(1);
                amountArrowY.setValue(0);
            }
        } else {
            countZIndex = 500;
            this.refs.countView.setNativeProps({
                style: {zIndex: 500}
            });
            this.refs.amountView.setNativeProps({
                style: {zIndex: -500}
            });
            this.props.changeState({
                invoiceCountZIndex: 500,
                invoiceAmountZIndex: -500
            });
            countArrowY.setValue(1);
            amountArrowY.setValue(0);
        }
    }

    /**
     * listHeader点击累计金额触发事件
     */
    listHeaderAmountPress() {
        let invoiceAmountZIndex = this.props.invoice.invoiceAmountZIndex;
        const {countArrowY, amountArrowY} = this.state;
        if (amountZIndex > 0) {
            if (invoiceAmountZIndex > 0) {
                this.refs.countView.setNativeProps({
                    style: {zIndex: -500}
                });
                this.refs.amountView.setNativeProps({
                    style: {zIndex: -500}
                });
                this.props.changeState({
                    invoiceCountZIndex: -500,
                    invoiceAmountZIndex: -500
                });
                countArrowY.setValue(0);
                amountArrowY.setValue(0);
            } else {
                this.refs.countView.setNativeProps({
                    style: {zIndex: -500}
                });
                this.refs.amountView.setNativeProps({
                    style: {zIndex: 500}
                });
                this.props.changeState({
                    invoiceCountZIndex: -500,
                    invoiceAmountZIndex: 500
                });
                countArrowY.setValue(0);
                amountArrowY.setValue(1);
            }
        } else {
            amountZIndex = 500;
            this.refs.countView.setNativeProps({
                style: {zIndex: -500}
            });
            this.refs.amountView.setNativeProps({
                style: {zIndex: 500}
            });
            this.props.changeState({
                invoiceCountZIndex: -500,
                invoiceAmountZIndex: 500
            });
            countArrowY.setValue(0);
            amountArrowY.setValue(1);
        }
    }

    /**
     * listHeader点击未报销触发事件
     */
    listHeaderNoReimbursementStatusPress() {
        const {countArrowY, amountArrowY} = this.state;
        this.props.changeState({
            reimbursementStatus: 0,
            canDelete: false,
            reimbursementSelected: 0,
            showCountDetail: false,
            showAmountDetail: false,
            invoiceCountZIndex: -500,
            invoiceAmountZIndex: -500
        });
        countArrowY.setValue(0);
        amountArrowY.setValue(0);
        this.refs.countView.setNativeProps({style: {zIndex: -500}});
        this.refs.amountView.setNativeProps({style: {zIndex: -500}});
    }

    /**
     * listHeader点击报销中触发事件
     */
    listHeaderInReimbursementStatusPress() {
        const {countArrowY, amountArrowY} = this.state;
        this.props.changeState({
            reimbursementStatus: 2,
            canDelete: true,
            showCheckbox: false,
            reimbursementSelected: 2,
            showCountDetail: false,
            showAmountDetail: false,
            invoiceCountZIndex: -500,
            invoiceAmountZIndex: -500
        });
        countArrowY.setValue(0);
        amountArrowY.setValue(0);
        this.refs.countView.setNativeProps({style: {zIndex: -500}});
        this.refs.amountView.setNativeProps({style: {zIndex: -500}});
    }

    /**
     * listHeader点击已报销触发事件
     */
    listHeaderDoneReimbursementStatusPress() {
        const {countArrowY, amountArrowY} = this.state;
        this.props.changeState({
            reimbursementStatus: 3,
            canDelete: true,
            showCheckbox: false,
            reimbursementSelected: 3,
            showCountDetail: false,
            showAmountDetail: false,
            invoiceCountZIndex: -500,
            invoiceAmountZIndex: -500
        });
        countArrowY.setValue(0);
        amountArrowY.setValue(0);
        this.refs.countView.setNativeProps({style: {zIndex: -500}});
        this.refs.amountView.setNativeProps({style: {zIndex: -500}});
    }

    /**
     * Flatlist头部视图
     * @returns {XML}
     * @private
     */
    _listHeader = () => {
        return (
            <View>
                {
                    this.props.invoice.showCheckbox ?
                        (null) :
                        (
                            <ImageBackground
                                style={styles.listHeaderBackgroundImageStyle}
                                source={require('../../img/invoice/invoice_header_icon.jpg')}
                            >
                                <View style={styles.listHeaderLeftPartViewStyle}>
                                    <TouchableOpacity
                                        onPress={this.listHeaderDatePress.bind(this)}
                                    >
                                        <View
                                            style={styles.listHeaderDateLabelViewStyle}>
                                            <Text
                                                style={styles.listHeaderDateLabelTextStyle}>
                                                {this.showEmptyDateData()}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{marginLeft: ScreenUtil.scaleSize(10)}}
                                        onPress={this.listHeaderDatePress.bind(this)}
                                    >
                                        {this.props.invoice.isShowDatePicker ? (
                                            <ImageBackground source={require('./../../img/invoice/up.png')}
                                                             style={styles.downIcon}/>
                                        ) : (
                                            <ImageBackground source={require('./../../img/invoice/down.png')}
                                                             style={styles.downIcon}/>
                                        )}
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.listHeaderVerticalLineViewStyle}/>
                                <View style={styles.listHeaderRightPartViewStyle}>
                                    <View style={styles.listHeaderRightPartCountOrAmountParentViewStyle}>
                                        <View style={styles.listHeaderRightPartCountOrAmountFirstChildrenViewStyle}>
                                            <TouchableOpacity
                                                onPress={this.listHeaderCountPress.bind(this)}
                                            >
                                                <View style={styles.rightPartCountOrAmountSecondChildrenViewStyle}>
                                                    <Text style={styles.rightPartCountOrAmountSecondChildrenTextStyle}>
                                                        {Message.INVOICE_LIST_SUMMARY_COUNT}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={this.listHeaderCountPress.bind(this)}
                                            >
                                                {
                                                    <Animated.View
                                                        style={[styles.rightPartCountOrAmountSecondChildrenAnimatedViewStyle,
                                                            {
                                                                transform: [{
                                                                    rotateZ: interpolate(this.state.countArrowY, {
                                                                        inputRange: [0, 0],
                                                                        outputRange: ['0deg', '180deg']
                                                                    })
                                                                }]
                                                            }]}
                                                    >
                                                        <ImageBackground
                                                            source={require('./../../img/invoice/down.png')}
                                                            style={[styles.downIcon]}/>
                                                    </Animated.View>
                                                }
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.rightPartCountOrAmountFirstChildTextViewStyle}>
                                            <Text style={styles.rightPartCountOrAmountTextStyle}>
                                                {this.props.invoice.zsl}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.listHeaderRightPartCountOrAmountParentViewStyle}>
                                        <View
                                            style={[styles.listHeaderRightPartCountOrAmountFirstChildrenViewStyle]}>
                                            <TouchableOpacity
                                                onPress={this.listHeaderAmountPress.bind(this)}
                                            >
                                                <View style={styles.rightPartCountOrAmountSecondChildrenViewStyle}>
                                                    <Text style={styles.rightPartCountOrAmountSecondChildrenTextStyle}>
                                                        {Message.INVOICE_LIST_SUMMARY_AMOUNT}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={this.listHeaderAmountPress.bind(this)}
                                            >
                                                {
                                                    <Animated.View
                                                        style={[styles.rightPartCountOrAmountSecondChildrenAnimatedViewStyle,
                                                            {
                                                                transform: [{
                                                                    rotateZ: interpolate(this.state.amountArrowY, {
                                                                        inputRange: [0, 0],
                                                                        outputRange: ['0deg', '180deg']
                                                                    })
                                                                }]
                                                            }]}
                                                    >
                                                        <ImageBackground
                                                            source={require('./../../img/invoice/down.png')}
                                                            style={styles.downIcon}/>
                                                    </Animated.View>
                                                }
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.rightPartCountOrAmountFirstChildTextViewStyle}>
                                            <Text style={styles.rightPartCountOrAmountTextStyle}>
                                                {this.props.invoice.zje}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </ImageBackground>
                        )
                }
                <View style={this.renderListHeaderStyle()}>
                    {
                        this.props.invoice.showCheckbox ?
                            (null) :
                            (
                                <View style={styles.reimbursementNavigator}>
                                    <TouchableOpacity
                                        style={styles.listHeaderInvoiceStatusPressViewStyle}
                                        onPress={this.listHeaderNoReimbursementStatusPress.bind(this)}>
                                        <View style={{
                                            height: ScreenUtil.scaleSize(30),
                                            justifyContent: 'center'
                                        }}>
                                            <Text style={this.renderNotReimbursementLabel()}>
                                                {Message.INVOICE_LIST_NOT_REIMBURSEMENT}
                                            </Text>
                                        </View>

                                        <View style={styles.sectionSlideViewWithoutReimbursement}>
                                            {this.props.invoice.reimbursementStatus == 0 ?
                                                <Image
                                                    style={styles.horizontalLine}
                                                    source={require('./../../img/invoice/horizontal_line.png')}/>
                                                : null
                                            }

                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.listHeaderInvoiceStatusPressViewStyle}
                                        onPress={this.listHeaderInReimbursementStatusPress.bind(this)}>
                                        <View style={{
                                            height: ScreenUtil.scaleSize(30),
                                            justifyContent: 'center'
                                        }}>
                                            <Text
                                                style={this.renderInReimbursementLabel()}>
                                                {Message.INVOICE_LIST_IN_REIMBURSEMENT}
                                            </Text>
                                        </View>

                                        <View style={[styles.sectionSlideViewWithoutReimbursement]}>
                                            {this.props.invoice.reimbursementStatus == 2 ?
                                                <Image
                                                    style={styles.horizontalLine}
                                                    source={require('./../../img/invoice/horizontal_line.png')}/>
                                                : null
                                            }
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.listHeaderInvoiceStatusPressViewStyle}
                                        onPress={this.listHeaderDoneReimbursementStatusPress.bind(this)}>
                                        <View style={{
                                            height: ScreenUtil.scaleSize(30),
                                            justifyContent: 'center'
                                        }}>
                                            <Text
                                                style={this.renderDoneReimbursementLabel()}>
                                                {Message.INVOICE_LIST_REIMBURSEMENT_ED}
                                            </Text>
                                        </View>

                                        <View style={styles.sectionSlideViewWithoutReimbursement}>
                                            {this.props.invoice.reimbursementStatus == 3 ?
                                                <Image
                                                    style={styles.horizontalLine}
                                                    source={require('./../../img/invoice/horizontal_line.png')}/>
                                                : null
                                            }
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )
                    }
                </View>
                <View style={{height: ScreenUtil.scaleSize(20), backgroundColor: '#F3F3F3'}}>
                </View>
            </View>
        );
    }

    /**
     * Flatlist滚动事件处理
     * @param scrollView
     * @private
     */
    _onScroll(scrollView) {
        let offsetY = scrollView.nativeEvent.contentOffset.y; // 滑动起始距离
        let targetOffset = ScreenUtil.scaleSize(193);
        const {countArrowY, amountArrowY} = this.state;

        countZIndex = -500;
        amountZIndex = -500;

        if (Math.round(offsetY) - Math.round(targetOffset) >= 0) {
            this.refs.statusLabelView.setNativeProps({style: {zIndex: 30}});
            this.refs.countView.setNativeProps({style: {zIndex: -500}});
            this.refs.amountView.setNativeProps({style: {zIndex: -500}});
        } else {
            this.refs.statusLabelView.setNativeProps({style: {zIndex: -30}});
            this.refs.countView.setNativeProps({style: {zIndex: -500}});
            this.refs.amountView.setNativeProps({style: {zIndex: -500}});
        }

        if (Platform.OS == 'ios') {
            this.renderScrollValue(scrollView);
        }

        this.state.dynamicHeight = offsetY;
        countArrowY.setValue(0);
        amountArrowY.setValue(0);
        Picker.hide();

    }

    /**
     * 渲染ios滚动时置顶视图的显示效果
     * @returns {XML}
     * @private
     */
    _renderDynamicView() {
        if (Platform.OS == 'ios') {
            const {scrollY} = this.state;
            return (
                <Animated.View
                    style={{
                        height: ScreenUtil.scaleSize(58),
                        opacity: interpolate(scrollY, {
                            inputRange: [0, ScreenUtil.scaleSize(193)],
                            outputRange: [0, 1],
                            extrapolate: 'clamp'
                        })
                    }}
                >
                    <View style={this.renderListHeaderStyle()}>
                        {
                            this.props.invoice.showCheckbox ?
                                (null) :
                                (
                                    <View style={styles.reimbursementNavigator}>
                                        <TouchableOpacity
                                            style={styles.flatListScrollViewOutLayerTopViewStyle}
                                            onPress={() => {
                                                this.props.changeState({
                                                    reimbursementStatus: 0,
                                                    canDelete: false,
                                                    reimbursementSelected: 0
                                                });
                                            }}>
                                            <View>
                                                <Text style={this.renderNotReimbursementLabel()}>
                                                    {Message.INVOICE_LIST_NOT_REIMBURSEMENT}
                                                </Text>
                                            </View>

                                            <View style={styles.sectionSlideViewWithoutReimbursement}>
                                                {this.props.invoice.reimbursementStatus == 0 ?
                                                    <Image
                                                        style={styles.horizontalLine}
                                                        source={require('./../../img/invoice/horizontal_line.png')}/>
                                                    : null
                                                }

                                            </View>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.flatListScrollViewOutLayerTopViewStyle}
                                            onPress={() => {
                                                this.props.changeState({
                                                    reimbursementStatus: 2,
                                                    canDelete: true,
                                                    showCheckbox: false,
                                                    reimbursementSelected: 2
                                                });
                                            }}>
                                            <View>
                                                <Text
                                                    style={this.renderInReimbursementLabel()}>
                                                    {Message.INVOICE_LIST_IN_REIMBURSEMENT}
                                                </Text>
                                            </View>

                                            <View style={[styles.sectionSlideViewWithoutReimbursement]}>
                                                {this.props.invoice.reimbursementStatus == 2 ?
                                                    <Image
                                                        style={styles.horizontalLine}
                                                        source={require('./../../img/invoice/horizontal_line.png')}/>
                                                    : null
                                                }
                                            </View>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.flatListScrollViewOutLayerTopViewStyle}
                                            onPress={() => {
                                                this.props.changeState({
                                                    reimbursementStatus: 3,
                                                    canDelete: true,
                                                    showCheckbox: false,
                                                    reimbursementSelected: 3
                                                });
                                            }}>
                                            <View>
                                                <Text
                                                    style={this.renderDoneReimbursementLabel()}>
                                                    {Message.INVOICE_LIST_REIMBURSEMENT_ED}
                                                </Text>
                                            </View>

                                            <View style={styles.sectionSlideViewWithoutReimbursement}>
                                                {this.props.invoice.reimbursementStatus == 3 ?
                                                    <Image
                                                        style={styles.horizontalLine}
                                                        source={require('./../../img/invoice/horizontal_line.png')}/>
                                                    : null
                                                }
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                )
                        }
                    </View>
                </Animated.View>
            );
        }

        return (
            <View style={this.renderListHeaderStyle()}>
                {
                    this.props.invoice.showCheckbox ?
                        (null) :
                        (
                            <View style={styles.reimbursementNavigator}>
                                <TouchableOpacity
                                    style={styles.flatListScrollViewOutLayerTopViewStyle}
                                    onPress={() => {
                                        this.props.changeState({
                                            reimbursementStatus: 0,
                                            canDelete: false,
                                            reimbursementSelected: 0
                                        });
                                    }}>
                                    <View>
                                        <Text style={this.renderNotReimbursementLabel()}>
                                            {Message.INVOICE_LIST_NOT_REIMBURSEMENT}
                                        </Text>
                                    </View>

                                    <View style={styles.sectionSlideViewWithoutReimbursement}>
                                        {this.props.invoice.reimbursementStatus == 0 ?
                                            <Image
                                                style={styles.horizontalLine}
                                                source={require('./../../img/invoice/horizontal_line.png')}/>
                                            : null
                                        }

                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.flatListScrollViewOutLayerTopViewStyle}
                                    onPress={() => {
                                        this.props.changeState({
                                            reimbursementStatus: 2,
                                            canDelete: true,
                                            showCheckbox: false,
                                            reimbursementSelected: 2
                                        });
                                    }}>
                                    <View>
                                        <Text
                                            style={this.renderInReimbursementLabel()}>
                                            {Message.INVOICE_LIST_IN_REIMBURSEMENT}
                                        </Text>
                                    </View>

                                    <View style={[styles.sectionSlideViewWithoutReimbursement]}>
                                        {this.props.invoice.reimbursementStatus == 2 ?
                                            <Image
                                                style={styles.horizontalLine}
                                                source={require('./../../img/invoice/horizontal_line.png')}/>
                                            : null
                                        }
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.flatListScrollViewOutLayerTopViewStyle}
                                    onPress={() => {
                                        this.props.changeState({
                                            reimbursementStatus: 3,
                                            canDelete: true,
                                            showCheckbox: false,
                                            reimbursementSelected: 3
                                        });
                                    }}>
                                    <View>
                                        <Text
                                            style={this.renderDoneReimbursementLabel()}>
                                            {Message.INVOICE_LIST_REIMBURSEMENT_ED}
                                        </Text>
                                    </View>

                                    <View style={styles.sectionSlideViewWithoutReimbursement}>
                                        {this.props.invoice.reimbursementStatus == 3 ?
                                            <Image
                                                style={styles.horizontalLine}
                                                source={require('./../../img/invoice/horizontal_line.png')}/>
                                            : null
                                        }
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )
                }
            </View>
        );
    }

    /**
     * 通过Animated.Value实现页面的滚动切换
     * @param scrollView
     */
    renderScrollValue(scrollView) {
        const {scrollY} = this.state;
        const {nativeEvent: {contentOffset: {y: offsetY}}} = scrollView;
        const p = Math.round(ScreenUtil.scaleSize(193));
        const distance = Math.round(offsetY);
        if (distance <= p || scrollY._value <= p) {
            scrollY.setValue(distance < p ? 0 : distance);
        }
    }

    /**
     * 票夹head触发事件
     */
    renderInvoiceHead() {
        this.props.changeState({
            deleteConfirm: false,
            showCountDetail: false,      //显示累计张数详情
            showAmountDetail: false,     //显示累计金额详情
            showDialog: false,          //是否显示提示对话框
            showCheckbox: false,        //是否显示复选框

            selectedItem: [],       //单行选中的发票
            selectedItemIDCount: 0, //单行选中的发票ID数
            selectedItemAmount: 0,  //单行选中的发票金额数
            isSelectedItem: [],     //单行发票按钮是否选中
            allItemCount: 0,       //列表所有发票数
            allItemAmount: [],       //列表所有发票金额
            allItem: [],            //列表所有发票
            isSelectedAll: false,   //是否选择全选按钮
            checkedInvoice: [],      //未查验的增票发票


            selectedYear: '',
            selectedMonth: '',
            selectedDateStr: '',
            defaultData: '全部',


            /**
             * 返回发票Data数组数据为：uuid,invoiceTypeCode,totalAmount,reimburseState,reimburseSerialNo,
             * invoiceDate,invoiceDetail,isBlush,checkSate,isCanceled,isException,invoiceCount
             */         //
            dataWithoutReimbursement: [],       //未报销发票
            dataWithinReimbursement: [],        //报销中发票
            dataDoneReimbursement: [],          //已报销发票
            reimbursementStatus: 0,             //报销状态，值0=未报销,2=报销中,3=已报销,默认0

            preDeleteInvoiceId: '',                           //删除发票uuid

            targetExpenseId: '',                         //进入票夹页面选择发票去保险单

            canDelete: false,                   //左滑是否删除,报销0时可以删除，2、3时不可删除

            isRefreshing: false,        //刷新中
            showLoading: false,         //上拉加载时，是否显示加载信息,如‘正在加载...’

            noReimbursementPage: 1,
            noReimbursementLoadMore: false,

            inReimbursementPage: 1,
            inReimbursementLoadMore: false,

            doneReimbursementPage: 1,
            doneReimbursementLoadMore: false,

            showPickerShadow: false,   //是否显示选择器阴影
        });
        this.props.loadInvoiceListReimbursedData();
        Picker.hide();
        this.backClick();
    }

    /**
     * 渲染Flatlist endReached触发
     */
    renderFlatListEndReached() {
        if (this.props.invoice.reimbursementStatus == 0 &&
            this.props.invoice.noReimbursementLoadMore) {
            this.props.changeState({noReimbursementLoadMore: false});
            this.props.loadMoreNoReimbursementData({
                invoiceTime: this.props.invoice.selectedDateStr,
                reimburseState: 0,
                invoiceTypeCode: '',
                page: this.props.invoice.noReimbursementPage + 1,
                rows: 20,
                isSyn: 'N',
            });
        } else if (this.props.invoice.reimbursementStatus == 2 &&
            this.props.invoice.inReimbursementLoadMore) {
            this.props.changeState({inReimbursementLoadMore: false});
            this.props.loadMoreInReimbursementData({
                invoiceTime: this.props.invoice.selectedDateStr,
                reimburseState: 2,
                invoiceTypeCode: '',
                page: this.props.invoice.inReimbursementPage + 1,
                rows: 20,
                isSyn: 'N',
            });
        } else if (this.props.invoice.reimbursementStatus == 3 &&
            this.props.invoice.doneReimbursementLoadMore) {
            this.props.changeState({doneReimbursementLoadMore: false});
            this.props.loadMoreCompletedReimbursementData({
                invoiceTime: this.props.invoice.selectedDateStr,
                reimburseState: 3,
                invoiceTypeCode: '',
                page: this.props.invoice.doneReimbursementPage + 1,
                rows: 20,
                isSyn: 'N',
            });
        }
    }

    /**
     * Flatlist footer component
     * @returns {XML}
     * @private
     */
    _listFooter() {
        return (
            this.props.invoice.showLoading ?
                <View style={{
                    flex: 1, flexDirection: 'row',
                    alignSelf: 'center',
                    width: ScreenUtil.scaleSize(280),
                    paddingVertical: ScreenUtil.scaleSize(10)
                }}>
                    <View style={{
                        flex: 1, padding: 0, margin: 0, width: ScreenUtil.scaleSize(25),
                        alignSelf: 'flex-end'
                    }}>
                        <ActivityIndicator
                            animating={this.props.invoice.showLoading}
                            style={{height: ScreenUtil.scaleSize(20)}}
                            size="small"/>
                    </View>
                    <View style={{
                        flex: 1, padding: 0, margin: 0, height: ScreenUtil.scaleSize(20),
                        alignSelf: 'flex-start', justifyContent: 'center'
                    }}>
                        <Text style={{fontSize: ScreenUtil.setSpText(8), color: '#666666'}}>
                            {Message.INVOICE_LIST_LOADING}
                        </Text>
                    </View>
                </View> : <View/>
        )
    }

    /**
     * 设置Flatlist每行的index作为key
     * @param item
     * @param index
     * @private
     */
    _keyExtractor = (item, index) => index;

    /**
     * 关闭票夹阴影框公用方法
     */
    commonClosedShadowbox() {
        const {countArrowY, amountArrowY} = this.state;
        countZIndex = -500;
        amountZIndex = -500;
        this.refs.countView.setNativeProps({
            style: {zIndex: -500}
        });
        this.refs.amountView.setNativeProps({
            style: {zIndex: -500}
        });
        countArrowY.setValue(0);
        amountArrowY.setValue(0);
    }

    render() {

        return (
            <View style={styles.container}>
                <BlurView
                    style={{
                        position: "absolute",
                        top: 0, left: 0, bottom: 0, right: 0,
                        flex: 1,
                        zIndex: (this.props.invoice.viewRef != null ? 300 : -99)
                    }}
                    viewRef={this.props.invoice.viewRef}
                    blurType="light"
                    blurAmount={10}/>

                <View ref="blurView" style={styles.blurViewStyle}>
                    <BackDialog
                        thisComponent={this}
                        isShow={this.props.invoice.showPickerShadow}
                        backgroundClick={
                            (component) => {
                                Picker.hide();
                                component.props.changeState({showPickerShadow: false, isShowDatePicker: false});
                            }
                        }/>
                    <CommonLoading isShow={this.props.invoice.isLoading}/>
                    <PopDialog
                        showVisible={this.props.invoice.showDialog}
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
                                    this.ocrValidationFromCamera();
                                },
                                100
                            );

                        }}
                        albumClick={()=> {
                            this.props.changeState({showDialog: false});
                            setTimeout(
                                () => {
                                    this.ocrValidationFromImageLibrary();
                                },
                                100
                            );
                        }}
                        cancelClick={this._closeModal}
                        backClick={() => this.props.changeState({showDialog: false})}
                    />
                    {
                        this.props.invoice.showCheckbox
                            ?
                            (<Header
                                titleText={Message.INVOICE_LIST_TITLE}
                                thisComponent={this}
                                showBackIcon={false}
                                rightText={Message.CANCEL}
                                rightClick={this.renderInvoiceHead.bind(this)}
                                rightIconStyle={{
                                    width: ScreenUtil.scaleSize(42),
                                    height: ScreenUtil.scaleSize(42),
                                    resizeMode: 'stretch',
                                }}
                            />)
                            :
                            (<Header
                                titleText={Message.INVOICE_LIST_TITLE}
                                thisComponent={this}
                                showBackIcon={false}
                                backClick={() => {
                                    this.backClick();
                                    Picker.hide();
                                }}
                                rightClick={() => {
                                    this.commonClosedShadowbox();
                                    this.props.changeState({
                                        invoiceCountZIndex: -500,
                                        invoiceAmountZIndex: -500

                                    });

                                    Picker.hide();

                                    this.popDialog();
                                }}
                                rightIcon={require('../../img/invoice/plus.png')}
                                rightIconStyle={{
                                    width: ScreenUtil.scaleSize(42),
                                    height: ScreenUtil.scaleSize(42),
                                    resizeMode: 'stretch',
                                }}
                            />)
                    }
                    <Dialog
                        content={Message.INVOICE_LIST_DELETE_CONFIRM}
                        type={'confirm'}
                        leftBtnText={Message.CANCEL}
                        rightBtnText={Message.CONFIRM}
                        modalVisible={this.props.invoice.deleteConfirm}
                        leftBtnStyle={{color: '#A5A5A5',}}
                        rightBtnStyle={{color: '#FFAA00',}}
                        onClose={this._closeModal.bind(this)}
                        rightBtnClick={this.ensureDeleteClick.bind(this)}
                        thisComponent={this}
                    />
                    <Dialog
                        titleText={this.props.invoice.dialogTitle}
                        content={this.props.invoice.dialogContent}
                        type={'confirm'}
                        leftBtnText={Message.CANCEL}
                        rightBtnText={Message.AUTHORIZE_SET_PERMISSIONS}
                        modalVisible={this.props.invoice.showNoPermissionDialog}
                        leftBtnStyle={{color: '#A5A5A5',}}
                        rightBtnStyle={{color: '#FFAA00',}}
                        rightBtnClick={Permissions.openSettings}
                        thisComponent={this}
                        onClose={this.onCloseCamera.bind(this)}
                    />

                    {
                        <ImageBackground
                            style={{
                                width: ScreenUtil.scaleSize(335),
                                height: ScreenUtil.scaleSize(258),
                                resizeMode: 'stretch',
                                position: 'absolute',
                                top: ScreenUtil.scaleSize(Platform.OS == 'ios' ? 271 : 236) - this.state.dynamicHeight,
                                left: ScreenUtil.scaleSize(285),
                                zIndex: -500
                            }}
                            source={require('../../img/invoice/count_shadow_box.png')}
                            ref="countView"
                        >
                            <BlurView
                                style={{
                                    position: "absolute",
                                    top: ScreenUtil.scaleSizeNew(13),
                                    left: 0, bottom: 0, right: 0,
                                    borderRadius: ScreenUtil.scaleSize(8),
                                }}
                                blurType="dark"
                                blurAmount={10}
                            />
                            <View style={styles.countOrAmountShadowFirstChildViewStyle}>
                                <View>
                                    <Text style={styles.countOrAmountShadowTextStyle}>
                                        {Message.INVOICE_LIST_NOT_REIMBURSEMENT}
                                    </Text>
                                </View>
                                <View style={styles.countOrAmountShadowLabelViewStyle}>
                                    <Text style={styles.countOrAmountShadowTextStyle}>
                                        {this.props.invoice.wbxzs}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.countOrAmountShadowSeparatorViewStyle}/>
                            <View style={styles.countOrAmountShadowChildViewStyle}>
                                <View>
                                    <Text style={styles.countOrAmountShadowTextStyle}>
                                        {Message.INVOICE_LIST_IN_REIMBURSEMENT}
                                    </Text>
                                </View>
                                <View style={styles.countOrAmountShadowLabelViewStyle}>
                                    <Text style={styles.countOrAmountShadowTextStyle}>
                                        {this.props.invoice.bxzzs}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.countOrAmountShadowSeparatorViewStyle}/>
                            <View style={styles.countOrAmountShadowChildViewStyle}>
                                <View>
                                    <Text style={styles.countOrAmountShadowTextStyle}>
                                        {Message.INVOICE_LIST_REIMBURSEMENT_ED}
                                    </Text>
                                </View>
                                <View style={styles.countOrAmountShadowLabelViewStyle}>
                                    <Text style={styles.countOrAmountShadowTextStyle}>
                                        {this.props.invoice.ybxzs}
                                    </Text>
                                </View>
                            </View>
                        </ImageBackground>
                    }

                    {
                        <ImageBackground
                            style={{
                                width: ScreenUtil.scaleSize(335),
                                height: ScreenUtil.scaleSize(258),
                                resizeMode: 'stretch',
                                position: 'absolute',
                                top: ScreenUtil.scaleSize(Platform.OS == 'ios' ? 271 : 236) - this.state.dynamicHeight,
                                left: ScreenUtil.scaleSize(375),
                                zIndex: -500
                            }}
                            source={require('../../img/invoice/shadow_box.png')}
                            ref="amountView"
                        >
                            <BlurView
                                style={{
                                    position: "absolute",
                                    top: ScreenUtil.scaleSizeNew(13),
                                    left: 0, bottom: 0, right: 0,
                                    borderRadius: ScreenUtil.scaleSize(8),
                                }}
                                blurType="dark"
                                blurAmount={10}
                            />
                            <View style={styles.countOrAmountShadowFirstChildViewStyle}>
                                <View>
                                    <Text style={styles.countOrAmountShadowTextStyle}>
                                        {Message.INVOICE_LIST_NOT_REIMBURSEMENT}
                                    </Text>
                                </View>
                                <View style={styles.countOrAmountShadowLabelViewStyle}>
                                    <Text style={styles.countOrAmountShadowTextStyle}>
                                        {this.props.invoice.wbxje}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.countOrAmountShadowSeparatorViewStyle}/>
                            <View style={styles.countOrAmountShadowChildViewStyle}>
                                <View>
                                    <Text style={styles.countOrAmountShadowTextStyle}>
                                        {Message.INVOICE_LIST_IN_REIMBURSEMENT}
                                    </Text>
                                </View>
                                <View style={styles.countOrAmountShadowLabelViewStyle}>
                                    <Text style={styles.countOrAmountShadowTextStyle}>
                                        {this.props.invoice.bxzje}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.countOrAmountShadowSeparatorViewStyle}/>
                            <View style={styles.countOrAmountShadowChildViewStyle}>
                                <View>
                                    <Text style={styles.countOrAmountShadowTextStyle}>
                                        {Message.INVOICE_LIST_REIMBURSEMENT_ED}
                                    </Text>
                                </View>
                                <View style={styles.countOrAmountShadowLabelViewStyle}>
                                    <Text style={styles.countOrAmountShadowTextStyle}>
                                        {this.props.invoice.ybxje}
                                    </Text>
                                </View>
                            </View>
                        </ImageBackground>
                    }

                    {
                        this.props.invoice.showCheckbox ?
                            (
                                <View
                                    style={styles.sectionDateView}>
                                    <Image source={require('./../../img/invoice/calendar.png')}
                                           style={styles.calendarIcon}/>
                                    <TouchableOpacity style={[styles.selectDateBtn]} onPress={() => {
                                        if (Platform.OS === 'android') {
                                            RNBridgeModule.checkFloatWindowOpAllowed((result)=> {
                                                this.props.changeState({showPickerShadow: true});
                                                this.createDatePicker();
                                                Picker.show();
                                            });
                                        } else {
                                            this.props.changeState({showPickerShadow: true});
                                            this.createDatePicker();
                                            Picker.show();
                                        }
                                    }}>
                                        <Text style={[styles.dateText]}>{
                                            this.showEmptyDateData()
                                        }</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (null)
                    }
                    {
                        <View style={styles.statusLabelViewStyle} ref="statusLabelView">
                            {
                                this._renderDynamicView()
                            }
                        </View>
                    }
                    <FlatList
                        style={styles.multiSelectedStyle}
                        data={this.reimbursementStatus()}
                        onRefresh={() => {
                            this.props.refreshNoReimbursementData(this.props.invoice.selectedDateStr);
                        }}
                        refreshing={this.props.invoice.isRefreshing}
                        onEndReached={this.renderFlatListEndReached.bind(this)}
                        onEndReachedThreshold={0.03}
                        ListHeaderComponent={this._listHeader}
                        onScroll={(scrollView) => {
                            if (!this.props.invoice.showCheckbox) {
                                this._onScroll(scrollView);
                            }
                        }}
                        scrollEventThrottle={10}
                        renderItem={({item, index}) => this.renderInvoiceItem(item, index)}
                        ListFooterComponent={this._listFooter.bind(this)}
                        keyExtractor={this._keyExtractor}
                    />
                    {this.renderBottom()}
                </View>

            </View>
        )
    }
}

function mapStateToProps(state) {
    return {
        invoice: state.Invoice,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changeState: changeState,
        back: back,
        navigateEditInvoice: navigateEditInvoice,
        doInitialise: doInitialise,
        ocrValidation: ocrValidation,
        selectInvoice: selectInvoice,
        navigateInvoiceDetails: navigateInvoiceDetails,
        navigateScanQrCode: navigateScanQrCode,
        navigateNewReimbursement: navigateNewReimbursement,
        loadInvoiceListDataWithoutReimbursement: loadInvoiceListDataWithoutReimbursement,
        loadInvoiceListDataWithinReimbursement: loadInvoiceListDataWithinReimbursement,
        loadInvoiceListDataDoneReimbursement: loadInvoiceListDataDoneReimbursement,
        loadInvoiceDelete: loadInvoiceDelete,
        refreshNoReimbursementData: refreshNoReimbursementData,
        refreshInReimbursementData: refreshInReimbursementData,
        refreshCompletedReimbursementData: refreshCompletedReimbursementData,
        loadMoreNoReimbursementData: loadMoreNoReimbursementData,
        loadMoreInReimbursementData: loadMoreInReimbursementData,
        loadMoreCompletedReimbursementData: loadMoreCompletedReimbursementData,
        loadInvoiceListDataReimbursement: loadInvoiceListDataReimbursement,
        loadInvoiceListDataReimbursementByDate: loadInvoiceListDataReimbursementByDate,
        loadInvoiceListReimbursedData: loadInvoiceListReimbursedData,
        getApplyType,
        changeAppState: changeAppState,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Invoice);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F3F3'
    },
    downIcon: {
        width: ScreenUtil.scaleSize(13),
        height: ScreenUtil.scaleSize(7),
        resizeMode: Image.resizeMode.contain,
    },
    sectionSlideViewWithoutReimbursement: {
        width: ScreenUtil.scaleSize(96),
        left: (deviceWidth / 3 - ScreenUtil.scaleSize(96)) / 2,
        position: 'absolute',
        bottom: 0,
    },
    sectionDateView: {
        flexDirection: 'row',
        alignItems: 'center',
        width: deviceWidth,
        height: ScreenUtil.scaleSize(90),
        paddingVertical: ScreenUtil.scaleSize(20),
        backgroundColor: '#FFFFFF'
    },

    horizontalLine: {
        width: ScreenUtil.scaleSize(96),
        height: ScreenUtil.scaleSize(4),
    },

    calendarIcon: {
        marginLeft: ScreenUtil.scaleSize(30),
        width: ScreenUtil.scaleSize(35),
        height: ScreenUtil.scaleSize(40),
        resizeMode: Image.resizeMode.contain,
    },
    selectDateBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: ScreenUtil.scaleSize(191),
        height: ScreenUtil.scaleSize(50),
        marginLeft: ScreenUtil.scaleSize(30),
        borderWidth: ScreenUtil.scaleSize(1),
        borderColor: '#DEDEDE',
        borderRadius: ScreenUtil.scaleSize(6)
    },
    dateText: {
        fontSize: ScreenUtil.setSpText(7),
        color: '#666666',
    },

    standaloneRowBack: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F3F3F3'
        // padding: ScreenUtil.scaleSize(40)
    },

    standaloneRowFront: {
        alignItems: 'center',
        width: deviceWidth,
        height: ScreenUtil.scaleSize(123),
        backgroundColor: '#FFFFFF'
    },

    standaloneRowFrontView: {
        padding: 0,
        marginHorizontal: 0,
        height: ScreenUtil.scaleSize(123),
        width: 0.84 * deviceWidth
    },

    backTextWhite: {
        color: '#FFFFFF'
    },

    uncheckedIcon: {
        position: 'absolute',
        right: ScreenUtil.scaleSize(49.6),
        top: ScreenUtil.scaleSize(14),
        width: ScreenUtil.scaleSize(94),
        height: ScreenUtil.scaleSize(94),
        resizeMode: 'stretch',
    },
    invoiceItemHeader: {
        flexDirection: 'row',
        width: deviceWidth,
        height: ScreenUtil.scaleSize(33),
        alignItems: 'center',
        marginTop: ScreenUtil.scaleSize(14)
    },
    invoiceItemDetail: {
        flexDirection: 'row',
        width: deviceWidth,
        height: ScreenUtil.scaleSize(33),
        alignItems: 'center',
        marginTop: ScreenUtil.scaleSize(28)
    },
    invoiceItemHeaderView: {
        flexDirection: 'row',
        width: 0.84 * deviceWidth,
        height: ScreenUtil.scaleSize(33),
        alignItems: 'center',
        marginTop: ScreenUtil.scaleSize(14),
    },
    invoiceItemDetailView: {
        flexDirection: 'row',
        width: 0.84 * deviceWidth,
        height: ScreenUtil.scaleSize(33),
        alignItems: 'center',
        marginTop: ScreenUtil.scaleSize(28),
        marginBottom: ScreenUtil.scaleSize(14)
    },
    invoiceIcon: {
        marginLeft: ScreenUtil.scaleSize(30),
        width: ScreenUtil.scaleSize(31),
        height: ScreenUtil.scaleSize(31),
    },
    invoiceItemTypeText: {
        flex: 1,
        backgroundColor: "transparent",
        marginLeft: ScreenUtil.scaleSize(10),
        color: '#666666',
        fontSize: ScreenUtil.setSpText(8)
    },
    invoiceItemAmount: {
        // flex: 1,
        backgroundColor: "transparent",
        marginRight: ScreenUtil.scaleSize(30),
        // width: ScreenUtil.scaleSize(180),
        textAlign: 'right',
        color: '#FFAA00',
        fontSize: ScreenUtil.setSpText(8)
    },
    invoiceItemAmountText: {
        // flex: 1,
        backgroundColor: "transparent",
        paddingRight: ScreenUtil.scaleSize(30),
        // width: ScreenUtil.scaleSize(180),
        textAlign: 'right',
        color: '#FFAA00',
        fontSize: ScreenUtil.setSpText(7),
    },
    invoiceItemCreateDate: {
        color: '#ABABAB',
        backgroundColor: "transparent",
        marginLeft: ScreenUtil.scaleSize(30),
        fontSize: ScreenUtil.setSpText(8),
    },
    bottomView: {
        borderTopWidth: 1 / PixelRatio.get(),
        borderColor: '#DEDEDE',
        flexDirection: 'row',
        height: ScreenUtil.scaleSize(96),
        backgroundColor: '#FDFDFD',
        opacity: 0.9
    },
    selectedSummary: {
        width: 0.1 * deviceWidth,
        marginTop: ScreenUtil.scaleSize(30),
        alignItems: 'center'
    },
    selectedSummaryIcon: {
        width: ScreenUtil.scaleSize(35),
        height: ScreenUtil.scaleSize(35)
    },
    selectedSummaryText: {
        marginTop: ScreenUtil.scaleSize(10),
        fontSize: ScreenUtil.setSpText(7),
        color: '#666666'
    },
    submitContainer: {
        position: 'absolute',
        right: ScreenUtil.scaleSize(1),
    },
    submitView: {
        height: ScreenUtil.scaleSize(96),
        width: ScreenUtil.scaleSize(187),
        backgroundColor: '#FFAA00',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitText: {
        fontSize: ScreenUtil.setSpText(10),
        textAlignVertical: 'center',
        color: 'white',
        fontWeight: 'bold'
    },
    checkboxIcon: {
        width: ScreenUtil.scaleSize(40),
        height: ScreenUtil.scaleSize(40),
    },
    checkboxView: {
        alignItems: 'center',
        width: 0.16 * deviceWidth,
        marginTop: ScreenUtil.scaleSize(44)
    },
    invoiceRowBtnIcon: {
        width: ScreenUtil.scaleSize(50),
        height: ScreenUtil.scaleSize(50),
        alignSelf: 'center',
        justifyContent: 'center'
    },
    reimbursementNavigator: {
        width: deviceWidth,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: ScreenUtil.scaleSize(58),
        padding: 0
    },
    listHeaderBackgroundImageStyle: {
        width: deviceWidth,
        height: ScreenUtil.scaleSize(193),
        resizeMode: 'stretch',
        flexDirection: 'row'
    },
    // Flatlist listheader左部分视图样式
    listHeaderLeftPartViewStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: ScreenUtil.scaleSize(254),
        height: ScreenUtil.scaleSize(193)
    },
    // Flatlist listheader左部分视图日期显示视图样式
    listHeaderDateLabelViewStyle: {
        height: ScreenUtil.scaleSize(48),
        backgroundColor: 'transparent',
        justifyContent: 'center'
    },
    // Flatlist listheader左部分视图日期显示字体样式
    listHeaderDateLabelTextStyle: {
        fontSize: ScreenUtil.setSpText(11),
        color: 'white'
    },
    // Flatlist listheader竖直线视图样式
    listHeaderVerticalLineViewStyle: {
        width: 1 / PixelRatio.get(),
        height: ScreenUtil.scaleSize(113),
        marginVertical: ScreenUtil.scaleSize(40),
        backgroundColor: 'white'
    },
    // Flatlist listheader右部分视图样式
    listHeaderRightPartViewStyle: {
        flexDirection: 'row',
        height: ScreenUtil.scaleSize(193),
        width: deviceWidth - ScreenUtil.scaleSize(254) - 1 / PixelRatio.get()
    },
    // Flatlist listheader右部分视图-累计张数或金额父视图样式
    listHeaderRightPartCountOrAmountParentViewStyle: {
        marginLeft: ScreenUtil.scaleSize(60),
        height: ScreenUtil.scaleSize(113),
        alignSelf: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'column'
    },
    // Flatlist listheader右部分视图-累计张数或金额一代子视图label view样式
    listHeaderRightPartCountOrAmountFirstChildrenViewStyle: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        height: ScreenUtil.scaleSize(40)
    },
    // Flatlist listheader右部分视图-累计张数或金额一代子视图text view样式
    rightPartCountOrAmountFirstChildTextViewStyle: {
        marginTop: ScreenUtil.scaleSize(20),
        height: ScreenUtil.scaleSize(53),
        backgroundColor: 'transparent'
    },
    // Flatlist listheader右部分视图-累计张数或金额text样式
    rightPartCountOrAmountTextStyle: {
        fontSize: ScreenUtil.setSpText(12.6),
        color: 'white'
    },
    // Flatlist listheader右部分视图-累计张数或金额二代子视图label view样式
    rightPartCountOrAmountSecondChildrenViewStyle: {
        height: ScreenUtil.scaleSize(40),
        backgroundColor: 'transparent',
        justifyContent: 'center'
    },
    // Flatlist listheader右部分视图-累计张数或金额二代text样式
    rightPartCountOrAmountSecondChildrenTextStyle: {
        fontSize: ScreenUtil.setSpText(9),
        color: 'white'
    },
    // Flatlist listheader右部分视图-累计张数或金额二代子视图arrow animated view样式
    rightPartCountOrAmountSecondChildrenAnimatedViewStyle: {
        flex: 1,
        marginLeft: ScreenUtil.scaleSize(10),
        height: ScreenUtil.scaleSize(40),
        justifyContent: 'center'
    },
    // Flatlist listheader底部发票状态视图样式
    listHeaderInvoiceStatusPressViewStyle: {
        width: deviceWidth / 3,
        height: ScreenUtil.scaleSize(58),
        alignItems: 'center',
        justifyContent: 'center'
    },
    // flatlist 滚动时列表置顶视图样式
    flatListScrollViewOutLayerTopViewStyle: {
        width: deviceWidth / 3,
        height: ScreenUtil.scaleSize(58),
        alignItems: 'center',
        justifyContent: 'center'
    },
    // 累计张数或金额阴影框视图样式, Deprecated
    countOrAmountShadowImageBackgroundViewStyle: {
        width: ScreenUtil.scaleSize(335),
        height: ScreenUtil.scaleSize(258),
        resizeMode: 'stretch',
        position: 'absolute',
        top: ScreenUtil.scaleSize(Platform.OS == 'ios' ? 317 : 245),
        left: ScreenUtil.scaleSize(326),
        zIndex: -500
    },
    // 累计张数或金额阴影框视图第一个子视图样式
    countOrAmountShadowFirstChildViewStyle: {
        flexDirection: 'row',
        marginHorizontal: ScreenUtil.scaleSize(30),
        marginTop: ScreenUtil.scaleSize(14),
        backgroundColor: 'transparent',
        height: ScreenUtil.scaleSize(80),
        alignItems: 'center'
    },
    // 累计张数或金额阴影框视图子视图样式
    countOrAmountShadowChildViewStyle: {
        flexDirection: 'row',
        paddingHorizontal: ScreenUtil.scaleSize(30),
        backgroundColor: 'transparent',
        height: ScreenUtil.scaleSize(80),
        alignItems: 'center'
    },
    // 累计张数或金额阴影框视图分割线视图样式
    countOrAmountShadowSeparatorViewStyle: {
        height: 1 / PixelRatio.get(),
        backgroundColor: '#5D5D5D',
        marginHorizontal: ScreenUtil.scaleSize(30)
    },
    // 累计张数或金额阴影框label视图样式
    countOrAmountShadowLabelViewStyle: {
        marginLeft: ScreenUtil.scaleSize(48)
    },
    // 累计张数或金额阴影框text样式
    countOrAmountShadowTextStyle: {
        fontSize: ScreenUtil.setSpText(9),
        color: 'white'
    },
    flatListStyle: {
        backgroundColor: '#F3F3F3'
    },
    multiSelectedStyle: {
        backgroundColor: '#FFFFFF'
    },
    blurViewStyle: {
        flex: 1, backgroundColor: '#FFFFFF'
    },
    statusLabelViewStyle: {
        flex: 1,
        position: 'absolute',
        zIndex: -30,
        top: Platform.OS === 'ios' ? ScreenUtil.scaleSize((Util.isIphoneX() ? 128 : 128)) : ScreenUtil.scaleSize(92),
        left: 0,
        right: 0,
        marginBottom: ScreenUtil.scaleSize(20)
    }
});