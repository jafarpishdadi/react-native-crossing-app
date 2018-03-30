/**
 * Created by Richard.ji on 2017/11/28.
 */

import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    View,
    Platform,
    TouchableOpacity,
    TouchableWithoutFeedback,
    NativeModules,
    FlatList,
    ActivityIndicator,
    BackHandler,
    PixelRatio
} from "react-native";
import ScreenUtil, {deviceHeight, deviceWidth} from "../../utils/ScreenUtil";
import {CustomStyles} from "../../css/CustomStyles";
import Message from "../../constant/Message";
import Header from "./../common/CommonHeader";
import {
    doInitialise,
    changeState,
    loadInvoiceListDataWithoutReimbursement,
    selectInvoice,
    refreshNoReimbursementData,
    loadMoreNoReimbursementData
} from "../../redux/actions/invoice/AddInvoice";
import {back, navigateInvoiceDetails, navigateNewReimbursement} from "../../redux/actions/navigator/Navigator";
import Picker from "react-native-picker";
import BackDialog from "./../common/BackDialog";
import Util from "../../utils/Util";
import {changeState as changeAppState} from "../../redux/actions/App";
import CommonLoading from "./../common/CommonLoading";
import SafeAreaView from "react-native-safe-area-view";
var RNBridgeModule = NativeModules.RNBridgeModule;

class AddInvoice extends Component {

    static navigationOptions = {
        header: null,
        tabBarLabel: Message.INVOICE_LIST,
        tabBarIcon: ({tintColor, focused}) => (
            <Image
                source={focused ? require('../../img/mainScreen/invoice_selected.png') : require('../../img/mainScreen/invoice_unselected.png')}
                style={CustomStyles.icon}
            />
        )
    }

    componentDidMount() {
        //清空页面数据
        this.props.doInitialise();
        if (this.props.navigation.state.params && this.props.navigation.state.params.expenseId) {
            this.props.changeState({
                targetExpenseId: this.props.navigation.state.params.expenseId,
                selectedItem: this.props.navigation.state.params.selectedInvoice,
                reimbursementSelected: this.props.navigation.state.params.selectedInvoice
            });
        }
        this.props.loadInvoiceListDataWithoutReimbursement('', this.props.navigation.state.params.selectedInvoice);
    }

    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        Picker.hide();
        component.props.back();
        //清空页面数据
        component.props.doInitialise();
    }

    /**
     * 初始日期选择器默认值，默认值为“全部”
     * @returns {string}
     */
    showEmptyDateData() {
        return (
            this.props.state.selectedYear === '' && this.props.state.selectedMonth === ''
                ?
                (this.props.state.defaultData) : (this.props.state.selectedYear + '' +
            this.props.state.selectedMonth)
        );
    }

    /**
     * 日期选择器
     */
    createDatePicker() {
        const d = new Date();
        const year = d.getFullYear() + '年';
        const month = '' + (d.getMonth() + 1) + '月';
        const selectedYear = this.props.state.selectedYear;
        const selectedMonth = this.props.state.selectedMonth;

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
            pickerFontSize: 17,
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
                    isLoading: false,
                    reimbursementCategory: [
                        '差旅费报销单',
                        '通用报销单'
                    ],
                    defaultData: '全部',

                    dataWithoutReimbursement: [],       //未报销发票

                    selectedItem: [],       //单行选中的发票
                    selectedItemIDCount: 0, //单行选中的发票ID数
                    selectedItemAmount: 0,  //单行选中的发票金额数
                    isSelectedItem: [],     //单行发票按钮是否选中
                    allItemCount: 0,       //列表所有发票数
                    allItemAmount: [],       //列表所有发票金额
                    allItem: [],            //列表所有发票
                    isSelectedAll: false,   //是否选择全选按钮
                    checkedInvoice: [],      //已查验的发票

                    reimbursementType: '',      //报销单类型

                    showPickerShadow: false,   //是否显示选择器阴影
                });
                this.props.loadInvoiceListDataWithoutReimbursement(
                    selectedDateStr, this.props.navigation.state.params.selectedInvoice);
            },
            onPickerCancel: (pickedValue, pickedIndex) => {
                const emptyDateStr = '';
                this.props.doInitialise();
                this.props.loadInvoiceListDataWithoutReimbursement(
                    emptyDateStr, this.props.navigation.state.params.selectedInvoice);
            },
            onPickerSelect: (pickedValue, pickedIndex) => {
                // console.log('date', pickedValue, pickedIndex);
            }
        });
        Picker.show();
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

    /**
     * 渲染全选后显示icon
     * @returns {XML}
     */
    selectedAllItemsCheckbox() {
        var selectedItemIDCount;//单行选中的发票ID数
        var allItemCount = 0;        //列表所有发票数
        var isSelectedAll;      //是否选择全选按钮
        var dataWithoutReimbursement;   //未报销发票数组

        selectedItemIDCount = this.props.state.selectedItemIDCount;
        isSelectedAll = this.props.state.isSelectedAll;
        dataWithoutReimbursement = this.props.state.dataWithoutReimbursement;

        for (var k = 0; k < dataWithoutReimbursement.length; k++) {
            if (!(Util.contains(['01', '02', '04', '10', '11'], dataWithoutReimbursement[k].invoiceTypeCode)
                && ((dataWithoutReimbursement[k].totalAmount < 0) || (dataWithoutReimbursement[k].checkState == 0)))) {
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
     * 渲染全选状态
     */
    selectedAllItems() {
        var selectedItemIDCount;//单行选中的发票ID数
        var allItemCount = 0;   //列表所有发票数
        var isSelectedAll;      //是否选择全选按钮
        var selectedItem;       //单行选中的发票
        var allItem;            //列表所有发票
        var selectedItemAmount; //单行选中的发票金额数
        var allItemAmount;      //列表所有发票金额
        var totalAmount;         //所有发票金额数值
        var dataWithoutReimbursement;   //未报销发票数组
        var selectedDateStr;

        selectedItemIDCount = this.props.state.selectedItemIDCount;
        isSelectedAll = this.props.state.isSelectedAll;
        selectedItem = this.props.state.selectedItem;
        allItem = this.props.state.allItem;
        selectedItemAmount = this.props.state.selectedItemAmount;
        allItemAmount = this.props.state.allItemAmount;
        totalAmount = 0;//初始化,防止undefined
        selectedDateStr = this.props.state.selectedDateStr;
        //获取最新未报销发票
        loadInvoiceListDataWithoutReimbursement(selectedDateStr, []);
        dataWithoutReimbursement = this.props.state.dataWithoutReimbursement;

        for (var k = 0; k < dataWithoutReimbursement.length; k++) {
            if (!(Util.contains(['01', '02', '04', '10', '11'], dataWithoutReimbursement[k].invoiceTypeCode)
                && ((dataWithoutReimbursement[k].totalAmount < 0) || (dataWithoutReimbursement[k].checkState == 0)))) {
                allItemCount += parseInt(dataWithoutReimbursement[k].invoiceCount);
            }
        }

        if (allItemAmount.length > 0) {
            for (var i = 0; i < allItemAmount.length; i++) {
                totalAmount += allItemAmount[i];
            }
        }

        if (selectedItemIDCount == allItemCount && isSelectedAll) {
            selectedItem = [];
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

        selectedItem = this.props.state.selectedItem;
        isSelectedAll = this.props.state.isSelectedAll;
        selectedItemIDCount = this.props.state.selectedItemIDCount;
        isSelectedItem = this.props.state.isSelectedItem;
        selectedItemAmount = parseFloat(this.props.state.selectedItemAmount);
        dataWithoutReimbursement = this.props.state.dataWithoutReimbursement;

        for (var k = 0; k < dataWithoutReimbursement.length; k++) {
            if (!(Util.contains(['01', '02', '04', '10', '11'], dataWithoutReimbursement[k].invoiceTypeCode)
                && dataWithoutReimbursement[k].checkState == 0)) {
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
                        selectedItem = [].concat(this.props.state.allItem);
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
     * 计算选中发票张数
     */
    calculateCount() {
        var selectedItemIDCount;
        selectedItemIDCount = this.props.state.selectedItemIDCount;
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
        var allItemCount        //列表所有发票数
        var isSelectedAll;      //是否选择全选按钮
        var allItemAmount;      //列表所有发票金额
        selectedItemAmount = this.props.state.selectedItemAmount;
        selectedItemIDCount = this.props.state.selectedItemIDCount;
        allItemCount = this.props.state.allItemCount;
        isSelectedAll = this.props.state.isSelectedAll;
        allItemAmount = this.props.state.allItemAmount;

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
                selectedItemAmount = 0;
                return selectedItemAmount;
            }
        } else {
            if (selectedItemAmount >= 0) {
                return selectedItemAmount;
            } else {
                selectedItemAmount = 0
                return selectedItemAmount;
            }
        }
        this.props.changeState({selectedItemAmount: selectedItemAmount.toFixed(2)});
    }

    /**
     *对统一背景和logo以及标题为发票明细第一条的发票规整统一入口
     * @param invoiceType 发票类型代码
     * @returns {*}
     */
    collectInvoiceTypeCode(invoiceType) {

        switch (invoiceType) {
            case '01':
            case '02':
            case '04':
            case '10':
            case '11':
                return '99';
            default:
                return invoiceType;
        }
    }

    uncheckedStatus(invoiceItem) {
        if (Util.contains(['01', '02', '04', '10', '11'], invoiceItem.invoiceTypeCode) && invoiceItem.checkState == 0) {
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

        allItem = this.props.state.allItem;
        allItemAmount = this.props.state.allItemAmount;


        checkedInvoice = this.props.state.checkedInvoice;
        if (!(Util.contains(['01', '02', '04', '10', '11'], invoiceItem.invoiceTypeCode) && ((invoiceItem.totalAmount < 0) || (invoiceItem.checkState == 0)))) {
            if (!Util.contains(allItem, invoiceItem.uuid)) {
                allItem.push(invoiceItem.uuid);
                allItemAmount.push(parseFloat(invoiceItem.totalAmount));
            }
        } else {
            if (!Util.contains(checkedInvoice, invoiceItem.uuid)) {
                checkedInvoice.push(invoiceItem.uuid);
            }
        }

        selectedItem = this.props.state.selectedItem;
        index = selectedItem.indexOf(invoiceItem.uuid);

        if (Util.contains(['01', '02', '04', '10', '11'], invoiceItem.invoiceTypeCode) && ((invoiceItem.totalAmount < 0) || (invoiceItem.checkState == 0))) {
            selectedIcon = require('./../../img/invoice/disabled_hooked.png');
        } else {
            if (index == (-1) && selectedItem.indexOf(-invoiceItem.uuid) == (-1)) {
                selectedIcon = require('./../../img/invoice/oval_unselected.png');
            } else if (index == (-1) && selectedItem.indexOf(-invoiceItem.uuid) != (-1)) {
                selectedIcon = require('./../../img/invoice/oval_unselected.png');
            } else {
                selectedIcon = require('./../../img/invoice/hooked.png');
            }
        }

        return (
            <View>
                <View style={{flexDirection: 'row', flex: 1}}>
                    <TouchableWithoutFeedback
                        disabled={Util.contains(['01', '02', '04', '10', '11'], invoiceItem.invoiceTypeCode) && ((invoiceItem.totalAmount < 0) || (invoiceItem.checkState == 0))}
                        onPress={() => {
                            this.toggleSelected(invoiceItem, invoiceItem.totalAmount);
                        }}
                        style={{width: ScreenUtil.scaleSize(0.1 * deviceWidth)}}>
                        <View style={[styles.checkboxView, {padding: 0, margin: 0}]}>
                            <Image
                                style={styles.checkboxIcon}
                                source={selectedIcon}/>
                        </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            this.props.navigateInvoiceDetails({
                                invoiceTypeCode: invoiceItem.invoiceTypeCode,
                                uuid: invoiceItem.uuid,
                                //reimbursementSelected: this.props.navigation.state.params.selectedInvoice
                            });
                            this.props.changeState({isFilter: false});
                            Picker.hide();
                        }}>
                        <View style={{padding: 0, margin: 0}}>
                            <View style={styles.standaloneRowFrontView}>
                                {this.uncheckedStatus(invoiceItem)}
                                <View style={styles.invoiceItemHeader}>
                                    <Image source={invoiceIcon}
                                           style={styles.invoiceIcon}/>
                                    <Text numberOfLines={1} ellipsizeMode='tail'
                                          style={styles.invoiceItemTypeText}>
                                        {invoiceType}
                                    </Text>
                                    <Text
                                        style={[styles.invoiceItemAmountText]}>
                                        {Message.MONEY + invoiceItem.totalAmount}
                                    </Text>
                                </View>
                                <View style={styles.invoiceItemDetail}>
                                    <Text
                                        style={styles.invoiceItemCreateDate}>{Message.INVOICE_LIST_CREATE_DATE + ':'}</Text>
                                    <Text
                                        style={[styles.invoiceItemCreateDate, {marginLeft: ScreenUtil.scaleSize(60)}]}>{this.handleDateFormat(invoiceItem.invoiceDate)}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                <View style={{
                    marginLeft: 0.16 * deviceWidth + ScreenUtil.scaleSize(30),
                    marginRight: ScreenUtil.scaleSize(30),
                    height: 1 / PixelRatio.get(),
                    backgroundColor: '#DEDEDE'
                }}/>
            </View>
        )
    }

    /**
     * 获取选中的发票，转换成新建报销单页面可用的数据格式
     * @returns 选中的发票列表
     */
    getSelectedInvoiceListToNewReimbursement() {
        var selectInvoiceList = [];
        for (var i = 0; i < this.props.state.selectedItem.length; i++) {
            for (var j = 0; j < this.props.state.dataWithoutReimbursement.length; j++) {
                if (this.props.state.selectedItem[i] == this.props.state.dataWithoutReimbursement[j].uuid) {
                    var targetInvoiceItem = {};
                    var invoiceItem = this.props.state.dataWithoutReimbursement[j];
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
     * 上拉加载数据
     */
    loadMoreData() {
        if (this.props.state.noReimbursementLoadMore) {
            this.props.changeState({noReimbursementLoadMore: false});
            this.props.loadMoreNoReimbursementData({
                invoiceTime: this.props.state.selectedDateStr,
                reimburseState: 0,
                invoiceTypeCode: '',
                page: this.props.state.noReimbursementPage + 1,
                rows: 20,
                isSyn: 'N',
            }, this.props.state.dataWithoutReimbursement);
        }
    }

    /**
     * 渲染Flatlist footer component
     * @returns {XML}
     * @private
     */
    _listFooter() {
        return (
            (this.props.state.showLoading) ?
                <View style={{
                    flex: 1, flexDirection: 'row',
                    alignSelf: 'center',
                    width: ScreenUtil.scaleSize(280),
                    paddingVertical: ScreenUtil.scaleSize(10)
                }}>
                    <View style={{flex: 1, padding: 0, margin: 0, width: ScreenUtil.scaleSize(25)}}>
                        <ActivityIndicator
                            animating={this.props.state.showLoading}
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
        );
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{flex: 1, backgroundColor: '#F3F3F3'}}>
                    <BackDialog
                        thisComponent={this}
                        isShow={this.props.state.showPickerShadow}
                        backgroundClick={
                            (component) => {
                                Picker.hide();
                                component.props.changeState({showPickerShadow: false});
                            }
                        }/>
                    <Header
                        titleText={Message.INVOICE_LIST_TITLE}
                        thisComponent={this}
                        showBackIcon={false}
                        rightText={Message.CANCEL}
                        rightClick={this.onBack}
                        rightIconStyle={{
                            width: ScreenUtil.scaleSize(42),
                            height: ScreenUtil.scaleSize(42),
                            resizeMode: 'stretch',
                        }}
                    />
                    <CommonLoading isShow={this.props.state.isLoading}/>
                    <View style={styles.sectionDateView}>
                        <Image source={require('./../../img/invoice/calendar.png')}
                               style={styles.calendarIcon}/>
                        <TouchableOpacity style={[styles.selectDateBtn]} onPress={() => {
                            if (Platform.OS === 'android') {
                                RNBridgeModule.checkFloatWindowOpAllowed((result)=> {
                                    this.props.changeState({showPickerShadow: true});
                                    this.createDatePicker();
                                });
                            } else {
                                this.props.changeState({showPickerShadow: true});
                                this.createDatePicker();
                            }
                        }}>
                            <Text style={[styles.dateText]}>
                                {
                                    this.showEmptyDateData()
                                }
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        style={styles.flatList}
                        data={this.props.state.dataWithoutReimbursement}
                        onRefresh={() => {
                            this.props.refreshNoReimbursementData(this.props.state.selectedDateStr);
                        }}
                        refreshing={this.props.state.isRefreshing}
                        onEndReached={() => {
                            this.loadMoreData();
                        }}
                        onEndReachedThreshold={1}
                        renderItem={({item, index}) => this.renderInvoiceItem(item, index)}
                        ListFooterComponent={this._listFooter.bind(this)}
                    />
                    <View style={styles.bottomView}>
                        <TouchableOpacity
                            style={styles.selectedSummary}
                            onPress={() => {
                                this.selectedAllItems();
                            }}>
                            {this.selectedAllItemsCheckbox()}
                        </TouchableOpacity>
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
                        <TouchableOpacity
                            style={styles.submitContainer}
                            onPress={() => {
                                var selectInvoiceList = this.getSelectedInvoiceListToNewReimbursement();
                                this.props.selectInvoice(this.props.state.targetExpenseId, selectInvoiceList);
                                //清空数据
                                this.props.doInitialise();
                                //返回新建报销单
                                this.props.back();
                            }}>
                            <View style={styles.submitView}>
                                <Text style={styles.submitText}>{Message.BUTTON_SUBMIT}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        )
    }
}

function mapStateToProps(state) {
    return {
        state: state.AddInvoice,
        nav: state.nav,
        appState: state.App,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        back: back,
        doInitialise: doInitialise,
        navigateInvoiceDetails: navigateInvoiceDetails,
        navigateNewReimbursement: navigateNewReimbursement,
        changeState: changeState,
        loadInvoiceListDataWithoutReimbursement: loadInvoiceListDataWithoutReimbursement,
        selectInvoice: selectInvoice,
        refreshNoReimbursementData: refreshNoReimbursementData,
        loadMoreNoReimbursementData: loadMoreNoReimbursementData,
        changeAppState: changeAppState,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AddInvoice);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    sectionDateView: {
        flexDirection: 'row',
        alignItems: 'center',
        width: deviceWidth,
        height: ScreenUtil.scaleSize(90),
        paddingVertical: ScreenUtil.scaleSize(20),
        backgroundColor: '#FFFFFF'
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

    standaloneRowFrontView: {
        alignItems: 'center',
        marginBottom: ScreenUtil.scaleSize(5),
        padding: 0,
        marginHorizontal: 0,
        height: ScreenUtil.scaleSize(122),
        width: 0.84 * deviceWidth
    },
    uncheckedIcon: {
        position: 'absolute',
        right: ScreenUtil.scaleSize(49.6),
        top: ScreenUtil.scaleSize(14),
        width: ScreenUtil.scaleSize(94),
        height: ScreenUtil.scaleSize(94)
    },
    invoiceItemHeader: {
        flexDirection: 'row',
        width: 0.84 * deviceWidth,
        height: ScreenUtil.scaleSize(61),
        alignItems: 'center',
    },
    invoiceItemDetail: {
        flexDirection: 'row',
        width: 0.84 * deviceWidth,
        height: ScreenUtil.scaleSize(61),
        alignItems: 'center',
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
        fontSize: ScreenUtil.setSpText(8),
    },
    invoiceItemAmountText: {
        // flex: 1,
        backgroundColor: "transparent",
        paddingRight: ScreenUtil.scaleSize(30),
        // width: ScreenUtil.scaleSize(180),
        textAlign: 'right',
        color: '#FFAA00',
        fontSize: ScreenUtil.setSpText(8),
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
        width: ScreenUtil.scaleSize(175),
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
        width: ScreenUtil.scaleSize(35),
        height: ScreenUtil.scaleSize(35),
    },
    checkboxView: {
        alignItems: 'center',
        width: 0.16 * deviceWidth,
        marginTop: ScreenUtil.scaleSize(44)
    },
    flatList: {
        marginTop: ScreenUtil.scaleSize(20),
        paddingTop: ScreenUtil.scaleSize(14),
        backgroundColor: '#FFFFFF'
    },
});