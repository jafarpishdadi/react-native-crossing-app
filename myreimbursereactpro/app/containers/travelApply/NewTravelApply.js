/**
 * Created by Louis.lu on 2018-01-23.
 * 新建差旅申请单
 */
import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    TextInput,
    View,
    Platform,
    TouchableOpacity,
    NativeModules,
    TouchableWithoutFeedback,
    FlatList,
    ActivityIndicator,
    PixelRatio,
    ScrollView,
    BackHandler
} from "react-native";
import ScreenUtil, {deviceHeight, deviceWidth} from "../../utils/ScreenUtil";
import InputScrollView from "react-native-input-scroll-view";
import Message from "../../constant/Message";
import Header from "../common/CommonHeader";
import Permissions from "react-native-permissions";
import BackDialog from "../common/BackDialog";
import PromptDialog from "../common/PromptDialog";
import CommonLoading from "../common/CommonLoading";
import Dialog from "../common/Dialog";
import Picker from "react-native-picker";
import Store from "react-native-simple-store";
import {
    back,
    navigateSelectCopyPerson,
} from "../../redux/actions/navigator/Navigator";
import Util from "../../utils/Util";
import {
    initData,
    changeState,
    loadData,
    recogniseVoiceRecord,
    uploadAttachment,
} from "../../redux/actions/travelApply/NewTravelApply"
import API from "../../utils/API";
import {changeState as changeAppState} from "../../redux/actions/App";
import {CustomStyles} from '../../css/CustomStyles';

var RNBridgeModule = NativeModules.RNBridgeModule;
var VoiceRecordModule = NativeModules.VoiceRecordModule;
var OpenFileSystemModule = NativeModules.OpenFileSystem;
var PreviewModule = NativeModules.PreviewModule;
const pickerConfirmBtnColor = [255, 170, 0, 1];
const pickerCancelBtnColor = [255, 170, 0, 1];
const pickerToolBarBg = [255, 255, 255, 1];
const pickerBg = [255, 255, 255, 1];
const pickerFontColor = [102, 102, 102, 1];
let lastRecordPressed = null;

class NewTravelApply extends Component {
    static navigationOptions = ({navigation}) => ({
        header: null
    });

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        var that = this;
        Store.get('user').then((user) => {
            if (user) {
                if (Util.checkIsEmptyString(that.props.state.expenseDepartmentName) ||
                    Util.checkIsEmptyString(that.props.state.expenseDepartmentId)) {
                    that.props.changeState({
                        expenseDepartmentName: user.orgDepName,
                        expenseDepartmentId: user.orgDepId,
                    })
                }
            }
        });
        Store.get('token').then((tokenStr) => {
            if (tokenStr) {
                that.props.changeState({
                    token: tokenStr
                })
            }
        })
        if (!(this.props.navigation.state.params && this.props.navigation.state.params.noInit)) {
            setTimeout(() => {
                this.props.loadData(this.props.navigation.state.params);
            }, 200)
        }
    }

    componentWillUnmount() {
        this.props.initData();
    }


    /**
     * 保存申请
     */
    submitTravelApply(type) {
        console.log(this.props.state);
        var state = this.props.state;
        var requestData = {
            expenseDepartmentId: Util.checkIsEmptyString(state.expenseDepartmentId) ? "" : state.expenseDepartmentId,
            expenseDepartmentName: state.expenseDepartmentName,
            cause: state.cause,
            selectedStartDate: state.selectedStartDate,
            selectedEndDate: state.selectedEndDate,
            travelDays: state.travelDays,
            targetCity: state.targetCity,
            expectedCostAmount: state.expectedCostAmount,
            peerPerple: state.peerPerple,
            attachmentList: state.attachmentList,
            copyPersonList: state.copyPersonList,
        }
        if (type == 0) {
            Util.showToast("保存")
        } else {
            if (Util.checkIsEmptyString(state.selectedStartDate)) {
                Util.showToast(Message.NEW_RE_PLEASE_REQUIRED);
                return;
            }
            else if (Util.checkIsEmptyString(state.selectedEndDate)) {
                Util.showToast(Message.NEW_RE_PLEASE_REQUIRED);
                return;
            }
            else if (Util.checkIsEmptyString(state.targetCity)) {
                Util.showToast(Message.NEW_RE_PLEASE_REQUIRED);
                return;
            }
            else {
                Util.showToast("提交")
            }
        }
    }


    /**
     * 部门选择器
     */
    createDepartmentPicker() {
        if (Util.checkIsEmptyString(this.props.state.organizationList) ||
            this.props.state.organizationList.length == 0) {
            Util.showToast(Message.NO_DATA);
            return;
        }
        const dismissKeyboard = require('dismissKeyboard');
        dismissKeyboard();
        Picker.init({
            pickerData: this.props.state.organizationList,
            selectedValue: [this.props.state.expenseDepartmentName],
            pickerConfirmBtnText: Message.COMPLETE,
            pickerCancelBtnText: Message.CANCEL,
            pickerConfirmBtnColor: pickerConfirmBtnColor,
            pickerCancelBtnColor: pickerCancelBtnColor,
            pickerToolBarBg: pickerToolBarBg,
            pickerBg: pickerBg,
            pickerFontColor: pickerFontColor,
            pickerTitleText: '',
            onPickerConfirm: data => {
                var departmentStr = '';
                for (var i = 0; i < data.length; i++) {
                    if (data[i] == "" || data[i] == '<null>') {
                        departmentStr = this.props.state.organizationList[0];
                    } else {
                        departmentStr += data[i];
                    }
                }
                var organizationDetail = this.props.state.organizationOriginalList.find(function (organizationType) {
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
     * 地区选择器
     */
    createAreaPicker() {
        const dismissKeyboard = require('dismissKeyboard');
        dismissKeyboard();
        Picker.init({
            pickerData: Util.createAreaData(),
            selectedValue: this.props.state.targetCity.split(' '),
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
        })
        Picker.show();
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
        const selectedStartDate = this.props.state.selectedStartDate;
        const selectedEndDate = this.props.state.selectedEndDate;
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
            onPickerConfirm: (pickedValue, pickedIndex) => {
                var selectedDateStr = pickedValue[0] +
                    (pickedValue[1].length > 2 ? pickedValue[1] : ('0' + pickedValue[1])) +
                    (pickedValue[2].length > 2 ? pickedValue[2] : ('0' + pickedValue[2])) + ' ' +
                    (pickedValue[3].length > 1 ? pickedValue[3] : '0' + pickedValue[3]) + ':' +
                    (pickedValue[4].length > 1 ? pickedValue[4] : '0' + pickedValue[4]);
                if (dateType == 0) {
                    if (!Util.checkIsEmptyString(this.props.state.selectedEndDate)) {
                        var beginDate = new Date(Util.formateDate3(selectedDateStr.replace("年", "-").replace("月", "-").replace("日", "").replace("时", "").replace("分", "")));
                        var endDate = new Date(Util.formateDate3(this.props.state.selectedEndDate));
                        if (beginDate.getTime() > endDate.getTime()) {
                            Util.showToast(Message.NEW_RE_TIME_CHECK);
                            this.props.changeState({
                                selectedStartDate: "",
                                showPickerShadow: false
                            })
                            return;
                        }

                    }
                    this.props.changeState({
                        selectedStartDate: selectedDateStr.replace("年", "-").replace("月", "-").replace("日", "").replace("时", "").replace("分", ""),
                        showPickerShadow: false
                    })
                } else {
                    if (!Util.checkIsEmptyString(this.props.state.selectedStartDate)) {
                        var beginDate = new Date(Util.formateDate3(this.props.state.selectedStartDate));
                        var endDate = new Date(Util.formateDate3(selectedDateStr.replace("年", "-").replace("月", "-").replace("日", "").replace("时", "").replace("分", "")));
                        if (beginDate.getTime() > endDate.getTime()) {
                            Util.showToast(Message.NEW_RE_TIME_CHECK);
                            this.props.changeState({
                                selectedEndDate: "",
                                showPickerShadow: false
                            })
                            return;
                        }
                    }
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
     * 提示窗关闭事件
     * @private
     */
    _onClose() {
        this.props.changeState({
            showPrompt: false,
        });
        //操作成功后，立即返回上一页，否则留在当前页
        if (this.props.state.promptType == 'success') {
            this.props.back();
        }
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
        this.submitTravelApply(0);
    }

    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        Picker.hide();
        component.props.changeState({
            saveModalVisible: true,
            showPickerShadow: false,
        });
    }

    //输入获得焦点
    inputOnFocus(component) {
        Picker.hide();
    }

    /**
     * 录音开始
     */
    startRecord(type, expenseId) {
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
    endRecord() {
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
                this.props.recogniseVoiceRecord({voice: recordData.recordData, length: recordData.recordData.length})
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
    endTimeRecord() {
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
            this.props.recogniseVoiceRecord({voice: recordData.recordData, length: recordData.recordData.length})
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
            const timer = that.props.state.timeCount - 1;

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
     * 出差事由输入框高度变化
     * @private
     */
    _causeTextInputOnChange(event) {
        let height = event.nativeEvent.contentSize.height;
        if (height < ScreenUtil.scaleSize(40)) {
            height = ScreenUtil.scaleSize(40);
        } else if (height > ScreenUtil.scaleSize(333)) {
            height = ScreenUtil.scaleSize(333);
        }
        this.props.changeState({
            causeTextInputHeight: height,
        })
    }

    //同行人输入框高度编号
    _peerPersonTextInputOnChange(event) {
        let height = event.nativeEvent.contentSize.height;
        if (height < ScreenUtil.scaleSize(40)) {
            height = ScreenUtil.scaleSize(40);
        } else if (height > ScreenUtil.scaleSize(333)) {
            height = ScreenUtil.scaleSize(333);
        }
        this.props.changeState({
            peerPersonTextInputHeight: height,
        })
    }

    /**
     * 出差事由文本变化
     * @param text
     */
    changeCauseText(text) {
        var cause = "";
        if (text.length > 300) {
            cause = text.substring(0, 299);
        } else {
            cause = text;
        }
        this.props.changeState({cause: cause})
    }

    /**
     * 输入预计花费
     * @param text
     */
    updateExpectedCostAmount(text) {
        //判断输入是否是数字
        if (!Util.checkFloatNumber(text)) {
            Util.showToast(Message.ONLY_INPUT_NUMBER);
            return;
        }
        //整数最大12位
        if (parseFloat(text) >= 10000000) {
            return;
        }
        this.props.changeState({
            expectedCostAmount: text,
        })
    }

    /**
     * 预计花费保留小数两位
     */
    expectedCostFixTwo() {
        this.props.changeState({
            expectedCostAmount: this.props.state.expectedCostAmount ? parseFloat(this.props.state.expectedCostAmount).toFixed(2) : '',
        })
    }

    //渲染抄送人
    renderCopyPerson() {
        var personList = this.props.state.copyPersonList;
        var personValue = "";
        if (!Util.checkListIsEmpty(personList)) {
            for (var i = 0, j = personList.length; i < j; i++) {
                if (i < j - 1) {
                    personValue += personList[i].name + "、";
                }

                if (i == j - 1) {
                    personValue += personList[i].name;
                }
            }
            return personValue;
        } else {
            return "";
        }

    }

    //多选抄送人 高度变化
    _personTextInputOnChange(event) {
        let height = event.nativeEvent.contentSize.height;
        if (height < ScreenUtil.scaleSize(40)) {
            height = ScreenUtil.scaleSize(40);
        } else if (height > ScreenUtil.scaleSize(333)) {
            height = ScreenUtil.scaleSize(333);
        }
        this.props.changeState({
            personTextInputHeight: height,
        })
    }

    /**
     * 打开图片选择器
     */
    openImagePicker() {
        var ImagePicker = require('react-native-image-picker');

        //选择器的配置
        var options = {
            title: Message.CHOOSE_PHOTO,
            cancelButtonTitle: Message.CANCEL,
            takePhotoButtonTitle: Message.TAKE_PHOTO,
            maxWidth: 1200,
            maxHeight: 1200,
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
                this.props.uploadAttachment(this.props.state.attachmentList, source);

            }
        });
    }

    /**
     * 渲染单个附件
     * @param item  附件数据
     */
    renderAttachItem(item) {
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
                    var attachList = [];
                    for (var i = 0; i < this.props.state.attachmentList.length; i++) {
                        if (item.fileName != this.props.state.attachmentList[i].fileName) {
                            attachList.push(this.props.state.attachmentList[i]);
                        }
                    }
                    this.props.changeState({
                        attachmentList: attachList,
                        attachmentIDList: item.id ? this.props.state.attachmentIDList.concat(item.id)
                            : this.props.state.attachmentIDList,
                        attachmentURLList: item.fileAddress ? this.props.state.attachmentURLList.concat(item.fileAddress)
                            : this.props.state.attachmentURLList,
                    })
                }}>
                    <Image source={require('./../../img/common/delete.png')}
                           style={styles.deleteIcon}/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.attachItem} onPress={() => {
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
     * 预览附件
     * @param item
     */
    previewDocument(item) {
        this.props.changeState({isLoading: true});
        setTimeout(
            () => {
                PreviewModule.previewDocument(API.DOWNLOAD_ATTACHMENT_BY_DIR, this.props.state.token, JSON.stringify({fileDir: item.fileAddress}), item.fileAddress, item.fileName, (value)=> {
                    this.props.changeState({isLoading: false});
                })
            }
        );
    }

    render() {
        const dismissKeyboard = require('dismissKeyboard');
        return (
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={styles.container}>
                    <BackDialog
                        thisComponent={this}
                        isShow={this.props.state.showPickerShadow}
                        backgroundClick={
                            (component) => {
                                Picker.hide();
                                component.props.changeState({showPickerShadow: false});
                            }
                        }/>
                    <Dialog
                        content={Message.NEW_TRAVEL_IS_SAVE_INFO}
                        type={'confirm'}
                        leftBtnText={Message.CANCEL}
                        rightBtnText={Message.CONFIRM}
                        modalVisible={this.props.state.saveModalVisible}
                        leftBtnStyle={{color: '#A5A5A5',}}
                        rightBtnStyle={{color: '#FFAA00',}}
                        onClose={this._closeModal.bind(this)}
                        leftBtnClick={this._cancelClick.bind(this)}
                        rightBtnClick={this._ensureSaveClick.bind(this, 0)}
                        thisComponent={this}
                    />
                    <PromptDialog
                        modalVisible={this.props.state.showPrompt}
                        thisComponent={this}
                        onClose={this._onClose.bind(this)}
                        promptType={this.props.state.promptType}
                        hint={this.props.state.promptMsg}
                    />

                    <CommonLoading isShow={this.props.state.isLoading}/>
                    <Dialog
                        titleText={Message.AUTHORITY_SETTING}
                        content={Message.AUTHORIZE_MICROPHONE}
                        type={'confirm'}
                        leftBtnText={Message.CANCEL}
                        rightBtnText={Message.AUTHORITY_SETTING}
                        modalVisible={this.props.state.showNoPermissionDialog}
                        leftBtnStyle={{color: '#A5A5A5'}}
                        rightBtnStyle={{color: '#FFAA00'}}
                        rightBtnClick={Permissions.openSettings}
                        thisComponent={this}
                        onClose={this._closeModal.bind(this)}
                    />
                    <Header
                        titleText={this.props.state.titleText}
                        thisComponent={this}
                        backClick={this.onBack}
                        rightText={Message.SAVE}
                        rightClick={this.submitTravelApply.bind(this, 0)}
                        rightTextStyle={{
                            fontSize: ScreenUtil.setSpText(9),
                            color: '#FFAA00',
                        }}
                        backControl={false}
                    />
                    {this.props.state.isRecording === true ? (
                        <View style={styles.recordingView}>
                            <View style={styles.recordingRow}>
                                <Image source={require('./../../img/reimbursement/microPhone.png')}
                                       style={styles.microPhoneIcon}/>
                                <View style={styles.recordingItem}/>
                            </View>
                            <Text style={{
                                fontSize: ScreenUtil.setSpText(9),
                                color: 'white',
                                marginTop: ScreenUtil.scaleSize(20)
                            }}>{Message.NEW_RE_RECORDING + this.props.state.text}</Text>
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
                            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                <TouchableOpacity style={{flex: 1}} onPress={() => {
                                    if (Platform.OS === 'android') {
                                        RNBridgeModule.checkFloatWindowOpAllowed((result)=> {
                                            RNBridgeModule.checkFloatWindowOpAllowed((result)=> {
                                                this.props.changeState({showPickerShadow: true});
                                                this.createDepartmentPicker();
                                            });
                                        });
                                    } else {
                                        this.props.changeState({showPickerShadow: true});
                                        this.createDepartmentPicker();
                                    }
                                }}>
                                    <View style={styles.row}>
                                        <Text style={styles.rowLabel}>{Message.NEW_RE_DEPARTMENT}</Text>
                                        {Util.checkIsEmptyString(this.props.state.expenseDepartmentName) ?
                                            <Text style={[styles.placeholderText, {flex: 1}]}
                                                  numberOfLines={1}>{Message.NEW_RE_SELECT_DEPARTMENT}</Text>
                                            :
                                            <Text style={[styles.placeholderText, {color: '#666666', flex: 1}]}
                                                  numberOfLines={1}>{this.props.state.expenseDepartmentName}</Text>
                                        }
                                        <Image source={require('./../../img/common/arrow.png')}
                                               style={styles.arrowIcon}/>
                                    </View>
                                </TouchableOpacity>
                            </TouchableWithoutFeedback>
                            <View style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>
                            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                    <TextInput
                                        editable={false}
                                        style={[styles.rowLabel, {padding: 0}]}
                                        underlineColorAndroid="transparent"
                                        value={Message.NEW_TRAVEL_APPLY_CAUSEL}/>
                                    <View style={{
                                        marginTop: ScreenUtil.scaleSize(20),
                                        marginBottom: ScreenUtil.scaleSize(20),
                                        width: ScreenUtil.scaleSize(500),
                                    }}>
                                        <TextInput
                                            editable={true}
                                            placeholder={Message.NEW_TRAVEL_APPLY_PLEASE_INPUT_CAUSEL}
                                            placeholderTextColor="#ABABAB"
                                            underlineColorAndroid="transparent"
                                            maxLength={300}
                                            multiline={true}
                                            style={{
                                                height: this.props.state.causeTextInputHeight,
                                                textAlign: 'left',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginLeft: ScreenUtil.scaleSize(90),
                                                fontSize: ScreenUtil.setSpText(9),
                                                color: '#666666',
                                                textAlignVertical: 'center',
                                                paddingTop: 0,
                                                paddingBottom: 0,
                                                paddingLeft: 0,
                                            }}
                                            value={this.props.state.cause}
                                            onFocus={() => {
                                                this.inputOnFocus(this)
                                            }}
                                            onContentSizeChange={this._causeTextInputOnChange.bind(this)}
                                            onChangeText={(text) => {
                                                this.changeCauseText(text);
                                            }}
                                        />
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
                                                      disabled={this.props.state.isVoice}
                                                      onPressIn={this.startRecord.bind(this, 0, '')}
                                                      onPressOut={this.endRecord.bind(this, 0, '')}>
                                        <Image source={require('../../img/reimbursement/voice.png')}
                                               style={{
                                                   width: ScreenUtil.scaleSize(19),
                                                   height: ScreenUtil.scaleSize(30),
                                                   resizeMode: 'stretch',
                                               }}/>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>
                            <View style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>
                            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                <TouchableOpacity style={{flex: 1}} onPress={() => {
                                    if (Platform.OS === 'android') {
                                        RNBridgeModule.checkFloatWindowOpAllowed((result)=> {
                                            this.props.changeState({showPickerShadow: true});
                                            this.createDatePicker(0);
                                        });
                                    } else {
                                        this.props.changeState({showPickerShadow: true});
                                        this.createDatePicker(0);
                                    }
                                }}>
                                    <View style={styles.row}>
                                        <Text style={styles.rowLabel}>{Message.NEW_TRAVEL_APPLY_BEGIN_DATE}<Text
                                            style={styles.requiredWord}>*</Text></Text>
                                        {Util.checkIsEmptyString(this.props.state.selectedStartDate) ?
                                            <Text style={[styles.placeholderText, {flex: 1}]}
                                                  numberOfLines={1}>{Message.NEW_TRAVEL_APPLY_SELECT_BEGIN_DATE}</Text>
                                            :
                                            <Text style={[styles.placeholderText, {color: '#666666'}]}
                                                  numberOfLines={1}>{this.props.state.selectedStartDate}</Text>
                                        }

                                        <Image source={require('./../../img/common/arrow.png')}
                                               style={styles.arrowIcon}/>
                                    </View>
                                </TouchableOpacity>
                            </TouchableWithoutFeedback>
                            <View style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>
                            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                <TouchableOpacity style={{flex: 1}} onPress={() => {
                                    if (Platform.OS === 'android') {
                                        RNBridgeModule.checkFloatWindowOpAllowed((result)=> {
                                            this.props.changeState({showPickerShadow: true});
                                            this.createDatePicker(1);
                                        });
                                    } else {
                                        this.props.changeState({showPickerShadow: true});
                                        this.createDatePicker(1);
                                    }
                                }}>
                                    <View style={styles.row}>
                                        <Text style={styles.rowLabel}>{Message.NEW_TRAVEL_APPLY_END_DATE}<Text
                                            style={styles.requiredWord}>*</Text></Text>
                                        {Util.checkIsEmptyString(this.props.state.selectedEndDate) ?
                                            <Text style={[styles.placeholderText, {flex: 1}]}
                                                  numberOfLines={1}>{Message.NEW_TRAVEL_APPLY_SELECT_END_DATE}</Text>
                                            :
                                            <Text style={[styles.placeholderText, {color: '#666666'}]}
                                                  numberOfLines={1}>{this.props.state.selectedEndDate}</Text>
                                        }
                                        <Image source={require('./../../img/common/arrow.png')}
                                               style={styles.arrowIcon}/>
                                    </View>
                                </TouchableOpacity>
                            </TouchableWithoutFeedback>
                            <View style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>
                            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                <View style={styles.row}>
                                    <TextInput editable={false} style={[styles.rowLabel, {padding: 0}]}
                                               underlineColorAndroid="transparent"
                                               value={Message.NEW_TRAVEL_APPLY_DAYS}/>
                                    <TextInput
                                        editable={true}
                                        placeholder={Message.NEW_TRAVEL_APPLY_PLEASE_INPUT_DAYS}
                                        placeholderTextColor="#ABABAB"
                                        underlineColorAndroid="transparent"
                                        keyboardType="numeric"
                                        maxLength={20}
                                        style={[styles.rowInput]}
                                        value={this.props.state.travelDays ? this.props.state.travelDays + '' : ''}
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
                                        returnKeyType={'done'}
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                            <View style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>
                            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                <TouchableOpacity style={{flex: 1}} onPress={() => {
                                    if (Platform.OS === 'android') {
                                        RNBridgeModule.checkFloatWindowOpAllowed((result)=> {
                                            this.props.changeState({showPickerShadow: true});
                                            this.createAreaPicker();
                                        });
                                    } else {
                                        this.props.changeState({showPickerShadow: true});
                                        this.createAreaPicker();
                                    }
                                }}>
                                    <View style={styles.row}>
                                        <Text style={styles.rowLabel}>{Message.NEW_TRAVEL_APPLY_CITY}<Text
                                            style={styles.requiredWord}>*</Text></Text>
                                        {
                                            Util.checkIsEmptyString(this.props.state.targetCity) ?
                                                <Text style={[styles.placeholderText, {flex: 1}]}
                                                      numberOfLines={1}>{Message.NEW_TRAVEL_APPLY_SELECT_CITY}</Text>
                                                :
                                                <Text style={[styles.placeholderText, {color: '#666666'}]}
                                                      numberOfLines={1}>{this.props.state.targetCity}</Text>
                                        }

                                        <Image source={require('./../../img/common/arrow.png')}
                                               style={styles.arrowIcon}/>
                                    </View>
                                </TouchableOpacity>
                            </TouchableWithoutFeedback>
                            <View style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>
                            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                <View style={styles.row}>
                                    <TextInput
                                        editable={false}
                                        style={[styles.rowLabel, {padding: 0}]}
                                        underlineColorAndroid="transparent"
                                        value={Message.NEW_TRAVEL_APPLY_EXPECTED_COST}/>
                                    <TextInput
                                        editable={true}
                                        style={[styles.rowInput]}
                                        placeholderTextColor="#ABABAB"
                                        placeholder={Message.NEW_TRAVEL_APPLY_PLEASE_INPUT_EXPECTED_COST}
                                        underlineColorAndroid="transparent"
                                        keyboardType={'numeric'}
                                        maxLength={10}
                                        value={this.props.state.expectedCostAmount}
                                        onChangeText={(text) => {
                                            this.updateExpectedCostAmount(text);
                                        }}
                                        onBlur={() => {
                                            this.expectedCostFixTwo();
                                        }}
                                        onFocus={() => {
                                            this.inputOnFocus(this)
                                        }}
                                        returnKeyType={'done'}
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                            <View style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>
                            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                    <TextInput
                                        editable={false}
                                        style={[styles.rowLabel, {padding: 0}]}
                                        underlineColorAndroid="transparent"
                                        value={Message.NEW_TRAVEL_APPLY_PEER_PERPLE}/>
                                    <View style={{
                                        marginTop: ScreenUtil.scaleSize(20),
                                        marginBottom: ScreenUtil.scaleSize(20),
                                        width: ScreenUtil.scaleSize(500),
                                    }}>
                                        <TextInput
                                            editable={true}
                                            style={{
                                                height: this.props.state.peerPersonTextInputHeight,
                                                textAlign: 'left',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginLeft: ScreenUtil.scaleSize(90),
                                                fontSize: ScreenUtil.setSpText(9),
                                                color: '#666666',
                                                textAlignVertical: 'center',
                                                paddingTop: 0,
                                                paddingBottom: 0,
                                                paddingLeft: 0,
                                            }}
                                            multiline={true}
                                            placeholderTextColor="#ABABAB"
                                            placeholder={Message.NEW_TRAVEL_APPLY_PLEASE_INPUT_PEER_PERPLE}
                                            underlineColorAndroid="transparent"
                                            maxLength={300}
                                            value={this.props.state.peerPerple}
                                            onChangeText={(text) => {
                                                this.props.changeState({
                                                    peerPerple: text
                                                });
                                            }}
                                            onFocus={() => {
                                                this.inputOnFocus(this)
                                            }}
                                            onContentSizeChange={this._peerPersonTextInputOnChange.bind(this)}
                                            returnKeyType={'done'}
                                        />
                                    </View>

                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                        <View style={{
                            paddingHorizontal: ScreenUtil.scaleSize(30),
                            backgroundColor: 'white',
                            marginTop: ScreenUtil.scaleSize(20)
                        }}>
                            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                <View style={[styles.rowHeader]}>
                                    <TextInput editable={false} underlineColorAndroid="transparent"
                                               style={[styles.rowLabel, {padding: 0}]}
                                               value={Message.NEW_TRAVEL_APPLY_ATTACHMENT}/>
                                    <TouchableOpacity onPress={() => {
                                        if (this.props.state.attachmentList.length < 20) {
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
                                                    this.props.uploadAttachment(this.props.state.attachmentList, source);
                                                }, (code, msg) => {
                                                    Util.showToast(Message.NEW_RE_GET_FILE_FAIL);
                                                })
                                            }
                                        } else {
                                            Util.showToast(Message.NEW_RE_ATTACHMENT_MAX);
                                        }
                                    }}>
                                        <Image source={require('./../../img/reimbursement/attach.png')}
                                               style={styles.addAttachmentIcon}/>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>
                            <View style={styles.attachListView}>
                                {this.props.state.attachmentList.map((item) => this.renderAttachItem(item))}
                            </View>
                            <View style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>
                            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <TextInput
                                        editable={false}
                                        underlineColorAndroid="transparent"
                                        style={[styles.rowLabel, {padding: 0}]}
                                        value={Message.NEW_TRAVEL_APPLY_COPY}/>
                                    <View style={{
                                        marginTop: ScreenUtil.scaleSize(20),
                                        marginBottom: ScreenUtil.scaleSize(20),
                                        width: ScreenUtil.scaleSize(500),
                                    }}>
                                        <TextInput
                                            editable={false}
                                            underlineColorAndroid="transparent"
                                            maxLength={300}
                                            multiline={true}
                                            style={{
                                                height: this.props.state.personTextInputHeight,
                                                textAlign: 'left',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginLeft: ScreenUtil.scaleSize(90),
                                                fontSize: ScreenUtil.setSpText(9),
                                                color: '#666666',
                                                textAlignVertical: 'center',
                                                paddingTop: 0,
                                                paddingBottom: 0,
                                                paddingLeft: 0,
                                            }}
                                            value={this.renderCopyPerson()}
                                            onFocus={() => {
                                                this.inputOnFocus(this)
                                            }}
                                            onContentSizeChange={this._personTextInputOnChange.bind(this)}
                                        />
                                    </View>
                                    <TouchableOpacity onPress={() => {
                                        this.props.addCopyPerson({
                                            selectCopyPerson: this.props.state.copyPersonList
                                        })
                                    }}>
                                        <Image source={require('./../../img/reimbursement/add.png')}
                                               style={styles.addIcon}/>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>

                        </View>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: ScreenUtil.scaleSize(180),
                            marginBottom: ScreenUtil.scaleSize(115),
                            alignSelf: 'center',
                        }}>
                            <TouchableOpacity onPress={() => {
                                this.submitTravelApply(3);
                            }}>
                                <View style={{
                                    height: ScreenUtil.scaleSize(75),
                                    width: ScreenUtil.scaleSize(550),
                                    backgroundColor: '#FFAA00',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: ScreenUtil.scaleSize(8),
                                }}>
                                    <Text style={{
                                        color: '#FFFFFF',
                                        fontSize: ScreenUtil.setSpText(9),
                                    }}>{Message.BUTTON_SUBMIT}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </InputScrollView>
                </View>
            </TouchableWithoutFeedback>
        )
    }
}

function mapStateToProps(state) {
    return {
        state: state.NewTravelApply,
        nav: state.nav,
        appState: state.App,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        back: back,
        initData: initData,
        changeState: changeState,
        loadData: loadData,
        recogniseVoiceRecord: recogniseVoiceRecord,
        addCopyPerson: navigateSelectCopyPerson,
        uploadAttachment: uploadAttachment,
        changeAppState: changeAppState,
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(NewTravelApply);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    sclView: {
        //flex: 1,
        backgroundColor: '#F6F6F6'
    },
    row: {
        height: ScreenUtil.scaleSize(80),
        flexDirection: 'row',
        alignItems: 'center'
    },
    rowLabel: {
        width: ScreenUtil.scaleSize(130),
        fontSize: ScreenUtil.setSpText(9),
        textAlignVertical: 'center',
        color: '#666666'
    },
    rowSeparator: {
        height: 1 / PixelRatio.get(),
        backgroundColor: '#DEDEDE',
    },
    arrowIcon: {
        width: ScreenUtil.scaleSize(19),
        height: ScreenUtil.scaleSize(32),
        resizeMode: Image.resizeMode.contain,
        // marginLeft: ScreenUtil.setSpText(30)
    },
    placeholderText: {
        flex: 1,
        marginLeft: ScreenUtil.scaleSize(90),
        fontSize: ScreenUtil.setSpText(9),
        color: '#ABABAB',
    },
    addIcon: {
        width: ScreenUtil.scaleSize(32),
        height: ScreenUtil.scaleSize(32),
        resizeMode: Image.resizeMode.contain,
    },
    addAttachmentIcon: {
        width: ScreenUtil.scaleSize(31),
        height: ScreenUtil.scaleSize(40),
        resizeMode: Image.resizeMode.contain,
    },
    rowHeader: {
        height: ScreenUtil.scaleSize(80),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rowInput: {
        flex: 1,
        textAlign: 'left',
        marginLeft: ScreenUtil.scaleSize(90),
        fontSize: ScreenUtil.setSpText(9),
        padding: 0,
        color: '#666666',
    },
    recordingView: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: ScreenUtil.scaleSize(300),
        height: ScreenUtil.scaleSize(300),
        zIndex: 20,
        backgroundColor: 'black',
        top: deviceHeight / 3,
        left: (deviceWidth - ScreenUtil.scaleSize(300)) / 2,
        opacity: 0.7,
        borderRadius: ScreenUtil.scaleSize(10),
    },
    recordingRow: {
        flexDirection: 'row',
        width: ScreenUtil.scaleSize(150),
        alignItems: 'flex-end',
        justifyContent: 'space-between'
    },
    microPhoneIcon: {
        width: ScreenUtil.scaleSize(95),
        height: ScreenUtil.scaleSize(150),
        resizeMode: 'contain'
    },
    recordingItem: {
        backgroundColor: 'white',
        height: ScreenUtil.scaleSize(10),
        width: ScreenUtil.scaleSize(30)
    },
    submitView: {
        height: ScreenUtil.scaleSize(75),
        width: ScreenUtil.scaleSize(550),
        backgroundColor: '#FFAA00',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitText: {
        fontSize: ScreenUtil.setSpText(9),
        textAlignVertical: 'center',
        color: 'white'
    },
    requiredWord: {
        fontSize: ScreenUtil.scaleSize(28),
        height: ScreenUtil.scaleSize(40),
        width: ScreenUtil.scaleSize(14),
        color: 'red',
        letterSpacing: ScreenUtil.scaleSize(-0.68),
        lineHeight: ScreenUtil.scaleSize(40)
    },
    attachListView: {
        marginLeft: ScreenUtil.scaleSize(200),
        paddingBottom: ScreenUtil.scaleSize(10),
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
    deleteIcon: {
        width: ScreenUtil.scaleSize(30),
        height: ScreenUtil.scaleSize(30),
        resizeMode: Image.resizeMode.contain,
    },
    attachItem: {
        flex: 1,
        flexDirection: 'row',
        height: ScreenUtil.scaleSize(96),
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
})