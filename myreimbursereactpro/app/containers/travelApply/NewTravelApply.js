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
    BackHandler,
    DatePickerIOS
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
import {back, navigateSelectCopyPerson, navigateSelectCity} from "../../redux/actions/navigator/Navigator";
import Util from "../../utils/Util";
import {
    initData,
    changeState,
    loadData,
    recogniseVoiceRecord,
    uploadAttachment,
    saveTravelApply,
    updateTravelApply
} from "../../redux/actions/travelApply/NewTravelApply";
import API from "../../utils/API";
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
        LocaleConfig.locales['zh'] = {
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            dayNames: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        };

        LocaleConfig.defaultLocale = 'zh';
    }

    componentDidMount() {
        var that = this;
        Store.get('user').then((user) => {
            if (user) {
                if (Util.checkIsEmptyString(that.props.state.departmentName) ||
                    Util.checkIsEmptyString(that.props.state.departmentId)) {
                    that.props.changeState({
                        departmentName: user.orgDepName,
                        departmentId: user.orgDepId,
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
        this.props.loadData(this.props.navigation.state.params);
    }

    componentWillMount() {
        this.props.initData();
    }


    /**
     * 保存申请
     */
    submitTravelApply(type) {
        var state = this.props.state;
        var requestData = {
            travelApplyDid: Util.checkIsEmptyString(state.departmentId) ? "" : state.departmentId,
            travelApplyDname: state.departmentName,
            travelApplyDesc: state.cause,
            beginDate: state.selectedStartDate,
            endDate: state.selectedEndDate,
            travelDays: state.travelDays,
            targetCity: state.targetCity,
            planCost: state.expectedCostAmount,
            travelPartnerId: this.getPeerPersonListId(this.props.state.peerPersonList),
            travelPartner: this.renderPeerPerson().replace(/、/g, ','),
            ccUid: this.getPeerPersonListId(this.props.state.copyPersonList),
            ccName: this.renderCopyPerson().replace(/、/g, ','),
            travelApplyAttachmentList: state.attachmentList,
            travelApplyAttachmentIDList: state.attachmentIDList,
            travelApplyAttachmentURLList: state.attachmentURLList,
        }
        if (type == 0) {
            requestData.travelApplyStateCode = '0';
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
                requestData.travelApplyStateCode = '3';
            }
        }

        //判断结束时间必须大于开始时间
        if (state.selectedStartDate && state.selectedEndDate) {
            const startTime = new Date(Util.formateDate3(state.selectedStartDate));
            const endTime = new Date(Util.formateDate3(state.selectedEndDate));
            if (endTime <= startTime) {
                Util.showToast(Message.NEW_RE_TIME_CHECK);
                return;
            }
        }

        if (this.props.navigation.state.params && this.props.navigation.state.params.source === 'TravelApplyDetail' && !Util.checkIsEmptyString(this.props.state.travelApplyNo)) {
            if (state.applyStatus === '1' || state.applyStatus === '2') {
                this.props.saveTravelApply(requestData);
            } else {
                requestData.travelApplyNo = state.travelApplyNo;
                this.props.updateTravelApply(requestData);
            }
        } else {
            this.props.saveTravelApply(requestData);
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
            selectedValue: [this.props.state.departmentName],
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
                    departmentName: departmentStr,
                    departmentId: organizationDetail.id,
                    showPickerShadow: false
                })
            },
            onPickerCancel: () => {
                this.props.changeState({showPickerShadow: false});
            }
        });
        this.props.changeState({showPickerShadow: true});
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
        });
    }

    //输入获得焦点
    inputOnFocus(component) {
        Picker.hide();
    }

    /**
     * 录音开始
     */
    startRecord() {
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
            this._onCountTime();
        })
    }

    /**
     * 录音结束，松开按钮
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
                if (recordData && recordData != '') {
                    this.props.recogniseVoiceRecord({
                        voice: recordData.recordData,
                        length: recordData.recordData.length
                    })
                }
            });

            this._clearCountTime();
        }
    }

    /**
     * 录音结束，时间结束
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
    _onCountTime() {
        var that = this;

        //设置定时器，倒数60秒
        that.interval = setInterval(() => {
            const timer = that.props.state.timeCount - 1;

            //倒数到0，重置文案
            if (timer < 1) {
                that.props.changeState({
                    timeEnd: true,
                });
                that.endTimeRecord();
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

    /**
     * 出差事由文本变化
     * @param text
     */
    changeCauseText(text) {
        var cause = "";
        if (text.length > 300) {
            cause = text.substring(0, 300);
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
        const arr = text.split('.');

        //判断输入是否是数字
        if (!Util.checkFloatNumber(text)) {
            Util.showToast(Message.NEW_TRAVEL_OVER_ZERO_NUM);
            return;
        }

        //整数最大7位
        if (parseFloat(text) >= 10000000) {
            return;
        }

        //最多2位小数
        if (arr.length == 2 && arr[1].length > 2) {
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
                    personValue += personList[i].userName + "、";
                }

                if (i == j - 1) {
                    personValue += personList[i].userName;
                }
            }
            return personValue;
        } else {
            return "";
        }
    }

    /**
     * 获取 同行人/抄送人id以逗号分隔
     * @param personList  同行人或抄送人列表
     */
    getPeerPersonListId(personList) {
        var personIdValue = "";
        if (!Util.checkListIsEmpty(personList)) {
            for (var i = 0, j = personList.length; i < j; i++) {
                if (i < j - 1) {
                    personIdValue += personList[i].userNo + ",";
                }

                if (i == j - 1) {
                    personIdValue += personList[i].userNo;
                }
            }
            return personIdValue;
        } else {
            return "";
        }
    }

    //渲染同行人
    renderPeerPerson() {
        var personList = this.props.state.peerPersonList;
        var personValue = "";
        if (!Util.checkListIsEmpty(personList)) {
            for (var i = 0, j = personList.length; i < j; i++) {
                if (i < j - 1) {
                    personValue += personList[i].userName + "、";
                }

                if (i == j - 1) {
                    personValue += personList[i].userName;
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
                        this.props.uploadAttachment(this.props.state.attachmentList, source);
                    }
                });
            });
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
                    var attachList = this.props.state.attachmentList;
                    attachList.splice(index,1);
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
            },
            500
        );
    }

    getCurrentCalendarColor() {
        if (this.props.state.isShowCalendar) {
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
        if (!this.props.state.isShowCalendar) {
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


    startOrEndDatePress() {
        let startDateSelected = this.props.state.startDateSelected;
        let endDateSelected = this.props.state.endDateSelected;
        let startTimeSelected = this.props.state.startTimeSelected;
        let endTimeSelected = this.props.state.endTimeSelected;
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

        if (this.props.state.isStartDateTimeFlag) {
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

        if (this.props.state.isEndDateTimeFlag) {
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

        if (this.props.state.isStartDateTimeFlag) {
            this.props.changeState({
                isModalBoxOpen: false,
                selectedStartDate: startDateTimeSelected
            });
        }
        if (this.props.state.isEndDateTimeFlag) {
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
        this.props.changeState({
            selectedTempDate: day.dateString,
        })
        const showDateSelected = year + '年' + month + '月' + selectedDay + '日';
        if (this.props.state.isStartDateTimeFlag) {
            this.props.changeState({
                startDateSelected: day.dateString,
                calendarDate: showDateSelected,
                showStartDateSelected: showDateSelected,
                isShowCalendar: false
            })
        }
        if (this.props.state.isEndDateTimeFlag) {
            this.props.changeState({
                endDateSelected: day.dateString,
                calendarDate: showDateSelected,
                showEndDateSelected: showDateSelected,
                isShowCalendar: false
            })
        }
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
        if (this.props.state.isStartDateTimeFlag) {
            this.props.changeState({
                startTimeSelected: selectedTime,
                calendarTime: selectedTime,
                startHour: hour,
                startMinute: minute
            });
        }
        if (this.props.state.isEndDateTimeFlag) {
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
        if (this.props.state.isStartDateTimeFlag) {
            if (this.props.state.startHour != '') {
                now.setHours(this.props.state.startHour);
            }
            if (this.props.state.startMinute != '') {
                now.setMinutes(this.props.state.startMinute);
            }
        }
        if (this.props.state.isEndDateTimeFlag) {
            if (this.props.state.endHour != '') {
                now.setHours(this.props.state.endHour);
            }
            if (this.props.state.endMinute != '') {
                now.setMinutes(this.props.state.endMinute);
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
     * 打开弹窗初始日期（年月日）
     * @param isStart 是否是开始时间
     * @returns {*}
     */
    getInitialDate(isStart) {
        var calendarDate = "";
        if (isStart) {
            if (!this.props.state.showStartDateSelected) {
                if (!this.props.state.selectedStartDate) {
                    calendarDate = this.getNowDate();
                } else {
                    this.props.changeState({startDateSelected: this.props.state.selectedStartDate.substring(0, 10)})
                    calendarDate = Util.formatDate1((this.props.state.selectedStartDate.substring(0, 10)).replace(/-/g, ''));
                }
            } else {
                calendarDate = this.props.state.showStartDateSelected;
            }
        } else {
            if (!this.props.state.showEndDateSelected) {
                if (!this.props.state.selectedEndDate) {
                    calendarDate = this.getNowDate();
                } else {
                    this.props.changeState({endDateSelected: this.props.state.selectedEndDate.substring(0, 10)})
                    calendarDate = Util.formatDate1((this.props.state.selectedEndDate.substring(0, 10)).replace(/-/g, ''));
                }
            } else {
                calendarDate = this.props.state.showEndDateSelected;
            }
        }
        return calendarDate;
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
     * 打开弹窗初始时间（时分）
     * @param isStart 是否是开始时间
     */
    getInitialTime(isStart) {
        var calendarTime = "";
        if (isStart) {
            if (!this.props.state.startTimeSelected) {
                if (!this.props.state.selectedStartDate) {
                    calendarTime = this.getNowTime(true);
                } else {
                    calendarTime = this.props.state.selectedStartDate.substring(11, 16);
                }
            } else {
                calendarTime = this.props.state.startTimeSelected;
            }
            this.props.changeState({
                startTimeSelected: calendarTime
            });
        } else {
            if (!this.props.state.endTimeSelected) {
                if (!this.props.state.selectedEndDate) {
                    calendarTime = this.getNowTime(false);
                } else {
                    calendarTime = this.props.state.selectedEndDate.substring(11, 16);
                }
            } else {
                calendarTime = this.props.state.endTimeSelected;
            }
            this.props.changeState({
                endTimeSelected: calendarTime
            });
        }
        return calendarTime;
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

    render() {
        const dismissKeyboard = require('dismissKeyboard');
        let current;
        let tempDate;
        if (this.props.state.isStartDateTimeFlag) {
            tempDate = this.props.state.selectedStartDate;
        }
        if (this.props.state.isEndDateTimeFlag) {
            tempDate = this.props.state.selectedEndDate;
        }
        current = tempDate ? new Date(tempDate.substring(0, 4), tempDate.substring(5, 7) - 1, tempDate.substring(8, 10)) : null;
        if (this.props.state.selectedTempDate) {
            current = this.props.state.selectedTempDate;
        }
        return (
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <SafeAreaView style={styles.container}>
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

                    {
                        this.props.state.isModalBoxOpen ? (

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
                                                    borderBottomWidth: this.props.state.isShowCalendar ? ScreenUtil.scaleSize(4) : 0,
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Text style={
                                                        this.getCurrentCalendarColor()
                                                    }>
                                                        {
                                                            this.props.state.calendarDate
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
                                                    borderBottomWidth: this.props.state.isShowCalendar ? 0 : ScreenUtil.scaleSize(4),
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Text style={
                                                        this.getCurrentTimeColor()
                                                    }>
                                                        {
                                                            this.props.state.calendarTime
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
                                        this.props.state.isShowCalendar ?
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
                                                    [this.props.state.isStartDateTimeFlag ?
                                                        this.props.state.startDateSelected :
                                                        this.props.state.endDateSelected]: {selected: true}
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

                    {this.props.state.isRecording === true ? (
                        <View style={styles.recordingView}>
                            <View style={styles.recordingRow}>
                                <Image source={{uri:Base64Images.VOICE}}
                                       style={styles.microPhoneIcon}/>
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
                                                this.createDepartmentPicker();
                                            });
                                        });
                                    } else {
                                        this.createDepartmentPicker();
                                    }
                                }}>
                                    <View style={styles.row}>
                                        <Text style={styles.rowLabel}>{Message.NEW_RE_DEPARTMENT}</Text>
                                        {Util.checkIsEmptyString(this.props.state.departmentName) ?
                                            <Text style={[styles.placeholderText, {flex: 1}]}
                                                  numberOfLines={1}>{Message.NEW_RE_SELECT_DEPARTMENT}</Text>
                                            :
                                            <Text style={[styles.placeholderText, {color: '#666666', flex: 1}]}
                                                  numberOfLines={1}>{this.props.state.departmentName}</Text>
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
                                        marginTop: ScreenUtil.scaleSize(Platform.OS == 'ios' ? 24 : 20),
                                        marginBottom: ScreenUtil.scaleSize(Platform.OS == 'ios' ? 16 : 20),
                                        width: ScreenUtil.scaleSize(410),
                                    }}>
                                        <TextInput
                                            editable={true}
                                            placeholder={Message.NEW_TRAVEL_APPLY_PLEASE_INPUT_CAUSEL}
                                            placeholderTextColor="#ABABAB"
                                            underlineColorAndroid="transparent"
                                            maxLength={300}
                                            onSelectionChange={(event)=> this.getSelectIndex(event, this.props.state.cause)}
                                            multiline={true}
                                            style={{
                                                height: this.props.state.causeTextInputHeight,
                                                textAlign: 'left',
                                                alignItems: 'center',
                                                justifyContent: 'center',
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
                                    dismissKeyboard();
                                    this.props.changeState({
                                        isModalBoxOpen: true,
                                        isStartDateTimeFlag: true,
                                        isEndDateTimeFlag: false,
                                        calendarDate: this.getInitialDate(true),
                                        calendarTime: this.getInitialTime(true)
                                    });
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
                                    dismissKeyboard();
                                    this.props.changeState({
                                        isModalBoxOpen: true,
                                        isStartDateTimeFlag: false,
                                        isEndDateTimeFlag: true,
                                        calendarDate: this.getInitialDate(false),
                                        calendarTime: this.getInitialTime(false)
                                    });
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
                            <TouchableOpacity onPress={() => {
                                if (Platform.OS === 'android') {
                                    dismissKeyboard();
                                    this.props.navigateSelectCity({
                                        targetCity: this.props.state.targetCity,
                                        callback: (item) => {
                                            this.props.changeState({
                                                targetCity: item
                                            })
                                        }
                                    });
                                } else {
                                    dismissKeyboard();
                                    this.props.navigateSelectCity({
                                        targetCity: this.props.state.targetCity,
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
                                    <Text style={styles.rowLabel}>{Message.NEW_TRAVEL_APPLY_CITY}
                                        <Text style={styles.requiredWord}>*</Text>
                                    </Text>
                                    <Text style={{
                                        fontSize: ScreenUtil.setSpText(9),
                                        color: this.props.state.targetCity ? '#666666' : '#ABABAB',
                                        width: ScreenUtil.scaleSize(410),
                                        marginTop: ScreenUtil.scaleSize(20),
                                        marginBottom: ScreenUtil.scaleSize(20),
                                    }}>{this.props.state.targetCity ? this.props.state.targetCity : Message.NEW_TRAVEL_APPLY_SELECT_CITY}</Text>
                                    <View style={{
                                        flex: 1,
                                        height: ScreenUtil.scaleSize(80),
                                        justifyContent: 'center',
                                        alignItems: 'flex-end',
                                    }}>
                                        <Image source={require('./../../img/common/arrow.png')}
                                               style={styles.arrowIcon}/>
                                    </View>
                                </View>
                            </TouchableOpacity>
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
                            <TouchableOpacity onPress={
                                () => {
                                    dismissKeyboard();
                                    this.props.addCopyPerson({
                                        code: 1,
                                        selectedPersonList: this.props.state.peerPersonList,
                                        callback: (item) => {
                                            this.props.changeState({
                                                peerPersonList: item
                                            })
                                        }
                                    })
                                }
                            }>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                    <Text style={styles.rowLabel}>{Message.NEW_TRAVEL_APPLY_PEER_PEOPLE}</Text>
                                    <Text style={{
                                        fontSize: ScreenUtil.setSpText(9),
                                        color: this.props.state.peerPersonList.length == 0 ? '#ABABAB' : '#666666',
                                        width: ScreenUtil.scaleSize(410),
                                        marginTop: ScreenUtil.scaleSize(20),
                                        marginBottom: ScreenUtil.scaleSize(20),
                                    }}>{this.props.state.peerPersonList.length == 0 ? Message.NEW_TRAVEL_APPLY_PLEASE_INPUT_PEER_PEOPLE : this.renderPeerPerson()}</Text>
                                    <View style={{
                                        flex: 1,
                                        height: ScreenUtil.scaleSize(80),
                                        justifyContent: 'center',
                                        alignItems: 'flex-end',
                                    }}>
                                        <Image source={require('./../../img/common/arrow.png')}
                                               style={styles.arrowIcon}/>
                                    </View>
                                </View>
                            </TouchableOpacity>
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
                                        dismissKeyboard();
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
                                {this.props.state.attachmentList.map((item,index) => this.renderAttachItem(item,index))}
                            </View>
                            <View style={[CustomStyles.separatorLine, {paddingHorizontal: ScreenUtil.scaleSize(30)}]}/>
                            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                <TouchableOpacity
                                    onPress={
                                        () => {
                                            dismissKeyboard();
                                            this.props.addCopyPerson({
                                                code: 0,
                                                selectedPersonList: this.props.state.copyPersonList,
                                                callback: (item) => {
                                                    this.props.changeState({
                                                        copyPersonList: item
                                                    })
                                                }
                                            })
                                        }
                                    }
                                >
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center'
                                    }}>
                                        <TextInput
                                            editable={false}
                                            underlineColorAndroid="transparent"
                                            style={[styles.rowLabel, {padding: 0}]}
                                            value={Message.NEW_TRAVEL_APPLY_COPY}/>
                                        <View style={{
                                            marginTop: ScreenUtil.scaleSize(20),
                                            marginBottom: ScreenUtil.scaleSize(20),
                                            width: ScreenUtil.scaleSize(410),
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
                                                    fontSize: ScreenUtil.setSpText(9),
                                                    color: '#666666',
                                                    textAlignVertical: 'center',
                                                    paddingTop: Platform.OS == 'ios' ? ScreenUtil.scaleSize(4) : 0,
                                                    paddingBottom: 0,
                                                    paddingLeft: 0,
                                                }}
                                                value={this.renderCopyPerson()}
                                                onContentSizeChange={this._personTextInputOnChange.bind(this)}
                                            />
                                        </View>
                                        <View style={{
                                            flex: 1,
                                            height: ScreenUtil.scaleSize(80),
                                            justifyContent: 'center',
                                            alignItems: 'flex-end',
                                        }}>
                                            <Image source={require('./../../img/reimbursement/add.png')}
                                                   style={styles.addIcon}/>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </TouchableWithoutFeedback>

                        </View>

                        <View style={styles.separatorView}></View>
                    </InputScrollView>
                    <View style={styles.bottomView}>
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
                </SafeAreaView>
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
        saveTravelApply: saveTravelApply,
        navigateSelectCity: navigateSelectCity,
        updateTravelApply: updateTravelApply,
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
        backgroundColor: '#F6F6F6',
    },

    separatorView: {
        backgroundColor: '#F6F6F6',
        height: ScreenUtil.scaleSize(Platform.OS == 'ios' ? 247 : 212),
    },
    row: {
        height: ScreenUtil.scaleSize(80),
        flexDirection: 'row',
        alignItems: 'center'
    },
    rowLabel: {
        width: ScreenUtil.scaleSize(210),
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
        width: ScreenUtil.scaleSize(165),
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
    bottomView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: ScreenUtil.scaleSize(119),
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        width: deviceWidth,
        backgroundColor: 'white',
        shadowOffset: {width: 0, height: 1},
        shadowColor: 'rgba(145,145,145,0.3)',
        shadowOpacity: 1,
        shadowRadius: 2,
        elevation: 2,
    }
})