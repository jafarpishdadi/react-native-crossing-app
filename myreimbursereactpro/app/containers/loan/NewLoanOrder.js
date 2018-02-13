import React, {Component} from "react";
import {changeState, uploadAttachment, loadData, initData} from "../../redux/actions/loan/NewLoanOrder";
import {back} from "../../redux/actions/navigator/Navigator";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
    StyleSheet,
    View,
    TouchableWithoutFeedback,
    Image,
    Text,
    TouchableOpacity,
    TextInput,
    Platform,
    NativeModules,
} from "react-native";
import InputScrollView from "react-native-input-scroll-view";
import Util from "../../utils/Util";
import ScreenUtil, {deviceHeight, deviceWidth} from "../../utils/ScreenUtil";
import Message from "../../constant/Message";
import Header from "../../containers/common/CommonHeader";
import Picker from "react-native-picker";
import Permissions from "react-native-permissions";
import {
    recogniseVoiceRecord
} from "../../redux/actions/loan/NewLoanOrder";
import CommonLoading from "../../containers/common/CommonLoading";
import API from "../../utils/API";
import Dialog from "./../common/Dialog";
import Store from "react-native-simple-store";
import {CustomStyles} from '../../css/CustomStyles';
import BackDialog from "./../common/BackDialog";

var RNBridgeModule = NativeModules.RNBridgeModule;
const pickerConfirmBtnColor = [255, 170, 0, 1];
const pickerCancelBtnColor = [255, 170, 0, 1];
const pickerToolBarBg = [255, 255, 255, 1];
const pickerBg = [255, 255, 255, 1];
const pickerFontColor = [171, 171, 171, 1];
let lastRecordPressed = null;
var VoiceRecordModule = NativeModules.VoiceRecordModule;
var OpenFileSystemModule = NativeModules.OpenFileSystem;
var PreviewModule = NativeModules.PreviewModule;

class NewLoanOrder extends Component {

    static navigationOptions = ({navigation}) => ({
        header: null
    });

    componentWillMount() {
        //todo init data
        this.props.initData();
    }

    componentDidMount() {
        const that = this;
        Store.get('user').then((user) => {
            if (user) {
                if (Util.checkIsEmptyString(that.props.state.departmentName) ||
                    Util.checkIsEmptyString(that.props.state.departmentId)) {
                    that.props.changeState({
                        expenseDepartmentName: user.orgDepName,
                        expenseDepartmentId: user.orgDepId,
                    })
                }
            }
        });
        this.props.loadData();
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
            saveModalVisible: false,
            showNoPermissionDialog: false,
        });
    }

    /**
     * 借款事由输入框高度变化
     * @param event
     * @private
     */
    _LoanReasonTextInputOnChange(event) {
        let height = event.nativeEvent.contentSize.height;
        if (height < ScreenUtil.scaleSize(40)) {
            height = ScreenUtil.scaleSize(40);
        } else if (height > ScreenUtil.scaleSize(333)) {
            height = ScreenUtil.scaleSize(333);
        }
        this.props.changeState({
            LoanReasonTextInputHeight: height,
        })
    }

    /**
     * 借款事由输入框高度变化
     * @param event
     * @private
     */
    _RemarksTextInputOnChange(event) {
        let height = event.nativeEvent.contentSize.height;
        if (height < ScreenUtil.scaleSize(40)) {
            height = ScreenUtil.scaleSize(40);
        } else if (height > ScreenUtil.scaleSize(333)) {
            height = ScreenUtil.scaleSize(333);
        }
        this.props.changeState({
            RemarksTextInputHeight: height,
        })
    }

    /**
     * 部门选择器
     */
    createDepartmentPicker() {
        const dismissKeyboard = require('dismissKeyboard');
        dismissKeyboard();
        if (Util.checkIsEmptyString(this.props.state.organizationList) ||
            this.props.state.organizationList.length == 0) {
            Util.showToast(Message.NO_DATA);
            return;
        }

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
                    LoanDepartmentId: organizationDetail.id,
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
     * 录音开始
     */
    startRecord(type,expenseId) {
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
            this.props.changeState({
                isRecording: true,
                isVoice:true
            });
            VoiceRecordModule.start();
            this._onCountTime(type, expenseId);
        })
    }

    /**
     * 录音结束，松开按钮
     * @param type 0:报销事由  1:费用说明
     * @param expenseId 费用明细id 当type为1的时候需要
     */
    endRecord(type,expenseId) {
        var dateNow = (new Date()).valueOf();
        if (lastRecordPressed && lastRecordPressed + 300 > dateNow) {
            this.props.changeState({
                isRecording: false,
                isVoice:false
            })
            Util.showToast(Message.NEW_RE_RECORDING_SHORT);
            this._clearCountTime();
            return;
        }
        if(lastRecordPressed && lastRecordPressed + 20 * 1000 > dateNow){
            this.props.changeState({
                isRecording: false,
            });
            VoiceRecordModule.stop((recordData)=> {
                this.props.recogniseVoiceRecord(type,expenseId,{voice:recordData.recordData,length:recordData.recordData.length})
                //console.log(recordPath);
            });

            this._clearCountTime();
        }

    }

    /**
     * 语音倒计时
     * @private
     */
    _onCountTime(type,expenseId) {
        var that = this;

        //设置定时器，倒数60秒
        that.interval = setInterval(() => {
            const timer = that.props.state.timeCount - 1;

            //倒数到0，重置文案
            if (timer < 1) {
                that.props.changeState({
                    timeEnd: true,
                });
                that.endTimeRecord(type,expenseId);
            } else {
                that.props.changeState({
                    timeCount: timer,
                    text: '(' + timer + 's)',
                });
            }
        }, 1000)
    }

    /**
     * 录音结束，时间结束
     * @param type 0:报销事由  1:费用说明
     * @param expenseId 费用明细id 当type为1的时候需要
     */
    endTimeRecord(type,expenseId) {
        this.props.changeState({
            isRecording: false,
        });
        var dateNow = (new Date()).valueOf();
        if (lastRecordPressed && lastRecordPressed + 300 > dateNow) {
            this.props.changeState({
                isRecording: false,
                isVoice:false
            });
            Util.showToast(Message.NEW_RE_RECORDING_SHORT);
            this._clearCountTime();
            return;
        }
        VoiceRecordModule.stop((recordData)=> {
            this.props.recogniseVoiceRecord(type,expenseId,{voice:recordData.recordData,length:recordData.recordData.length})
            //console.log(recordPath);
        });

        this._clearCountTime();
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
     * 借款金额
     * @param loanAmount
     */
    updateLoanAmount(loanAmount) {
        //判断输入是否是数字
        if (!Util.checkFloatNumber2(loanAmount)) {
            return;
        }
        this.props.changeState({
            loanAmount: loanAmount,
        })
    }

    /**
     * 借款金额保留小数两位
     */
    loanAmountFixTwo() {
        this.props.changeState({
            loanAmount: this.props.state.loanAmount ? parseFloat(this.props.state.loanAmount).toFixed(2) : '',
        })
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
     * 预览文件
     */
    previewDocument(item){
        this.props.changeState({isLoading:true});
        setTimeout(
            () => {
                PreviewModule.previewDocument(API.DOWNLOAD_ATTACHMENT_BY_DIR, this.props.state.token, JSON.stringify({fileDir : item.fileAddress}), item.fileAddress, item.fileName,(value)=> {
                    this.props.changeState({isLoading:false});
                })
            },
            500
        );

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
        //todo
    }

    /**
     * 字段校验
     */
    checkData() {
        if (!this.props.state.loanAmount) {
            Util.showToast(Message.NEW_INVOICE_AMOUNT_PLACEHOLDER);
            return;
        }
        this.submit();
    }

    /**
     * 提交借款单
     * @returns {XML}
     */
    submit() {
        //todo
    }

    render(){
        const dismissKeyboard = require('dismissKeyboard');
        return(
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={styles.container}>
                    <CommonLoading isShow={this.props.state.isLoading}/>
                    <Dialog
                        content={Message.NEW_LOAN_BACK_MSG}
                        type={'confirm'}
                        leftBtnText={Message.CANCEL}
                        rightBtnText={Message.CONFIRM}
                        modalVisible={this.props.state.saveModalVisible}
                        leftBtnStyle={{color: '#A5A5A5',}}
                        rightBtnStyle={{color: '#FFAA00',}}
                        onClose={this._closeModal.bind(this)}
                        leftBtnClick={this._cancelClick.bind(this)}
                        rightBtnClick={this._ensureSaveClick.bind(this)}
                        thisComponent={this}
                    />
                    <Dialog
                        titleText={this.props.state.dialogTitle}
                        content={this.props.state.dialogContent}
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
                        titleText= {Message.NEW_LOAN_TITLE}
                        thisComponent={this}
                        backClick={this.onBack}
                        rightText={Message.SAVE}
                        rightClick={this._ensureSaveClick.bind(this)}
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
                                <View style={styles.row}>
                                    <Text style={styles.rowLabel}>{Message.NEW_RE_DEPARTMENT}</Text>
                                    <TouchableOpacity style={styles.selectBtn} onPress={() => {
                                        this.createDepartmentPicker();
                                    }}>
                                        {
                                            Util.checkIsEmptyString(this.props.state.departmentName) ? (
                                                <Text style={[styles.textInput, {color: '#ABABAB'}]}
                                                      numberOfLines={1}>{Message.NEW_RE_SELECT_DEPARTMENT}</Text>
                                            ) : (
                                                <Text style={styles.textInput}
                                                      numberOfLines={1}>{this.props.state.departmentName}</Text>
                                            )
                                        }
                                        <Image source={require('./../../img/common/arrow.png')} style={styles.arrowIcon}/>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>
                            <View style={CustomStyles.separatorLine}/>

                            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                    <Text style={styles.rowLabel}>{Message.NEW_LOAN_REASON}</Text>
                                    <View style={{
                                        marginTop: ScreenUtil.scaleSize(20),
                                        marginBottom: ScreenUtil.scaleSize(20),
                                        width: ScreenUtil.scaleSize(360),
                                    }}>
                                        <TextInput
                                            editable={true}
                                            placeholder={Message.NEW_LOAN_REASON_PLACEHOLDER}
                                            placeholderTextColor="#ABABAB"
                                            underlineColorAndroid="transparent"
                                            style={{
                                                textAlign: 'left',
                                                fontSize: ScreenUtil.setSpText(9),
                                                color: '#666666',
                                                textAlignVertical: 'center',
                                                paddingTop: 0,
                                                paddingBottom: 0,
                                                paddingLeft: 0,
                                                height: this.props.state.LoanReasonTextInputHeight
                                            }}
                                            maxLength={300}
                                            multiline={true}
                                            value={this.props.state.LoanReason}
                                            onChangeText={(text) => {
                                                this.props.changeState({LoanReason: text})
                                            }}
                                            onContentSizeChange={this._LoanReasonTextInputOnChange.bind(this)}
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
                                                      delayPressOut={200}
                                                      disabled={this.props.state.isVoice}
                                                      onPressIn={this.startRecord.bind(this, 0, '')}
                                                      onPressOut={this.endRecord.bind(this,0,'')}
                                    >
                                        <Image source={require('../../img/reimbursement/voice.png')}
                                               style={{
                                                   width: ScreenUtil.scaleSize(19),
                                                   height: ScreenUtil.scaleSize(30),
                                                   resizeMode: 'stretch',
                                               }}/>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>
                            <View style={CustomStyles.separatorLine}/>

                            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                <View style={styles.row}>
                                    <Text style={styles.rowLabel}>{Message.NEW_LOAN_AMOUNT}</Text>
                                    <TextInput
                                        editable={true}
                                        style={styles.textInput}
                                        placeholderTextColor="#ABABAB"
                                        placeholder={Message.NEW_LOAN_AMOUNT_PLACEHOLDER}
                                        underlineColorAndroid="transparent"
                                        keyboardType={'numeric'}
                                        value={this.props.state.loanAmount}
                                        onChangeText={(text) => {
                                            this.updateLoanAmount(text);
                                        }}
                                        onBlur={() => {
                                            this.loanAmountFixTwo();
                                        }}
                                        returnKeyType={'done'}/>
                                </View>
                            </TouchableWithoutFeedback>
                            <View style={CustomStyles.separatorLine}/>

                            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                    <Text style={styles.rowLabel}>{Message.NEW_LOAN_REMARK}</Text>
                                    <View style={{
                                        marginTop: ScreenUtil.scaleSize(20),
                                        marginBottom: ScreenUtil.scaleSize(20),
                                        width: ScreenUtil.scaleSize(360),
                                    }}>
                                        <TextInput
                                            editable={true}
                                            placeholder={Message.NEW_LOAN_REMARK_PLACEHOLDER}
                                            placeholderTextColor="#ABABAB"
                                            underlineColorAndroid="transparent"
                                            style={{
                                                textAlign: 'left',
                                                fontSize: ScreenUtil.setSpText(9),
                                                color: '#666666',
                                                textAlignVertical: 'center',
                                                paddingTop: 0,
                                                paddingBottom: 0,
                                                paddingLeft: 0,
                                                height: this.props.state.RemarksTextInputHeight
                                            }}
                                            maxLength={300}
                                            multiline={true}
                                            value={this.props.state.remarks}
                                            onChangeText={(text) => {
                                                this.props.changeState({remarks: text})
                                            }}
                                            onContentSizeChange={this._RemarksTextInputOnChange.bind(this)}
                                        />
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>

                        <TouchableWithoutFeedback onPress={dismissKeyboard}>
                            <View style={{
                                marginTop: ScreenUtil.scaleSize(20),
                                paddingHorizontal: ScreenUtil.scaleSize(30),
                                backgroundColor: '#FFFFFF'
                            }}>
                                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                    <View style={styles.row}>
                                        <Text style={[styles.textInput, {color: Platform.OS == 'ios' ? '#ABABAB' : '#666666'}]}>{Message.NEW_RE_ATTACHMENT}</Text>
                                        <TouchableOpacity onPress={() => {
                                            if (Platform.OS != 'ios') {
                                                if (this.props.state.attachmentList.length < 20) {
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
                                                        };
                                                        this.props.uploadAttachment(this.props.state.attachmentList, source);
                                                    }, (code, msg) => {
                                                        Util.showToast(Message.NEW_RE_GET_FILE_FAIL);
                                                    })
                                                } else {
                                                    Util.showToast(Message.NEW_RE_ATTACHMENT_MAX)
                                                }
                                            }
                                        }}>
                                            <View style={styles.rowImage}>
                                                <Image source={require('./../../img/reimbursement/attach.png')}
                                                       style={styles.addIcon}/>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableWithoutFeedback>
                                <View style={styles.attachListView}>
                                    {this.props.state.attachmentList.map((item) => this.renderAttachItem(item))}
                                </View>
                                <View style={CustomStyles.separatorLine}/>

                                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                                    <View style={styles.row}>
                                        <Text style={styles.textInput}>{Message.NEW_TRAVEL_APPLY_COPY}</Text>
                                        <TouchableOpacity onPress={() => {Util.showToast("该功能暂不支持,下个版本再试试吧")
                                        }}>
                                            <View style={styles.rowImage}>
                                                <Image source={require('./../../img/reimbursement/add.png')}
                                                       style={styles.addIcon}/>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>

                        <TouchableOpacity
                            style={{
                                marginTop: ScreenUtil.scaleSize(180),
                                alignSelf: 'center',
                                marginBottom: ScreenUtil.scaleSize(120),
                            }}
                            onPress={() => {
                                this.checkData();
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
                    </InputScrollView>
                </View>
            </TouchableWithoutFeedback>)
    }

}

function mapStateToProps(state) {
    return {
        state: state.NewLoanOrder,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        back: back,
        changeState:changeState,
        recogniseVoiceRecord:recogniseVoiceRecord,
        uploadAttachment: uploadAttachment,
        loadData: loadData,
        initData: initData,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(NewLoanOrder);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    sclView: {
        //flex: 1,
        backgroundColor: '#F6F6F6'
    },
    row: {
        height: ScreenUtil.scaleSize(80),
        flexDirection: 'row',
        alignItems: 'center',
        //paddingHorizontal: ScreenUtil.scaleSize(30)
    },
    rowImage: {
        height: ScreenUtil.scaleSize(80),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: ScreenUtil.scaleSize(80),
    },
    rowLabel: {
        width: ScreenUtil.scaleSize(210),
        fontSize: ScreenUtil.setSpText(9),
        textAlignVertical: 'center',
        color: '#666666'
    },
    requiredWord: {
        fontSize: ScreenUtil.scaleSize(28),
        height: ScreenUtil.scaleSize(40),
        width: ScreenUtil.scaleSize(14),
        color: 'red',
        letterSpacing: ScreenUtil.scaleSize(-0.68),
        lineHeight: ScreenUtil.scaleSize(40)
    },
    textInput: {
        flex: 1,
        fontSize: ScreenUtil.setSpText(9),
        color: '#666666',
        padding: 0,
    },
    arrowIcon: {
        width: ScreenUtil.scaleSize(19),
        height: ScreenUtil.scaleSize(32),
        resizeMode: Image.resizeMode.contain,
        marginLeft: ScreenUtil.setSpText(30)
    },
    rowHeader: {
        height: ScreenUtil.scaleSize(60),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    addIcon: {
        width: ScreenUtil.scaleSize(32),
        height: ScreenUtil.scaleSize(32),
        resizeMode: Image.resizeMode.contain,
    },
    logoutIcon: {
        width: ScreenUtil.scaleSize(550),
        height: ScreenUtil.scaleSize(75),
        resizeMode: 'stretch',
        alignSelf: 'center',
        marginTop: ScreenUtil.scaleSize(200),
        marginBottom: ScreenUtil.scaleSize(120)
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
    deleteIconTouchView: {
        marginLeft: ScreenUtil.scaleSize(-10),
        marginRight: ScreenUtil.scaleSize(-10),
        marginTop: ScreenUtil.scaleSize(-10),
        paddingHorizontal: ScreenUtil.scaleSize(10),
        paddingTop: ScreenUtil.scaleSize(10),
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
    attachListView: {
        marginLeft: ScreenUtil.scaleSize(200),
        paddingBottom: ScreenUtil.scaleSize(10),
    },
    rowSeparatorSC: {
        backgroundColor: '#F6F6F6',
        height: ScreenUtil.scaleSize(20),
        //paddingHorizontal: ScreenUtil.scaleSize(30)
    },
    selectBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: ScreenUtil.scaleSize(80),
    },
});