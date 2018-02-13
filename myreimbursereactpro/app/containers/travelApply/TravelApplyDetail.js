/**
 * Created by Louis.lu on 2018-01-29.
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
    Animated,
} from "react-native";
import ScreenUtil, {deviceHeight, deviceWidth} from "../../utils/ScreenUtil";
import Message from "../../constant/Message";
import Header from "../common/CommonHeader";
import InputDialog from "../common/InputDialog";
import CommonLoading from "../common/CommonLoading";
import Dialog from "../common/Dialog";
import Store from "react-native-simple-store";
import {
    back,
} from "../../redux/actions/navigator/Navigator";
import {changeState as changeAppState} from "../../redux/actions/App";
import Util from "../../utils/Util";
import {
    changeState,
    initData,
    loadData,
    editTravelApplyDetail,
} from "../../redux/actions/travelApply/TravelApplyDetail"
var PreviewModule = NativeModules.PreviewModule;

class TravelApplyDetail extends Component {
    static navigationOptions = ({navigation}) => ({
        header: null
    });

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.initData();
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
                that.props.changeState({
                    currentUser: user.userName,
                    currentUserId: user.userNo,
                })
            }
        })
        that.props.loadData(this.props.navigation.state.params.travelApplyDetail)
    }

    //驳回输入获得焦点
    inputOnFocus(component) {
        Animated.timing(
            component.props.state.dialogTop,
            {
                duration: 200,
                toValue: ScreenUtil.scaleSize(150),
            }
        ).start();
    }

    //驳回输入失去焦点
    inputOnBlur(component) {
        Animated.timing(
            component.props.state.dialogTop,
            {
                duration: 200,
                toValue: (deviceHeight - ScreenUtil.scaleSize(502)) / 2,
            }
        ).start();
    }

    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        //物理返回键关闭弹窗
        component.props.changeState({
            showRejectDialog: false,
            showCommentDialog: false,
            showEmailDialog: false,
        })
        component.props.back();
    }

    /**
     * 获取表单状态
     * @param code 表单状态code
     */
    getStatus(code) {
        switch (code) {
            case '0':
                return Message.REIMBURSEMENT_NO_COMMIT;
                break;
            case '1':
                return Message.REIMBURSEMENT_CANCEL;
                break;
            case '2':
                return Message.REIMBURSEMENT_REJECT;
                break;
            case '3':
                return Message.REIMBURSEMENT_ING;
                break;
            case '4' :
                return Message.REIMBURSEMENT_PASS;
                break;
            default:
        }
    }

    /**
     *渲染水印
     */
    renderIcon() {
        let iconImage = '';
        switch (this.props.state.applyStatus) {
            case '1':
                iconImage = require('../../img/reimbursement/cancel.png');
                break;
            case '2':
                iconImage = require('../../img/reimbursement/reject.png');
                break;
            case '4':
                iconImage = require('../../img/reimbursement/pass.png');
                break;
            default:
        }

        return (
            (this.props.state.applyStatus == '1' ||
            this.props.state.applyStatus == '2' ||
            this.props.state.applyStatus == '4') ? (
                <Image source={iconImage}
                       style={{
                           width: ScreenUtil.scaleSize(139),
                           height: ScreenUtil.scaleSize(139),
                           resizeMode: 'stretch',
                           position: 'absolute',
                           right: ScreenUtil.scaleSize(30),
                           top: ScreenUtil.scaleSize(20),
                           zIndex: 500,
                       }}/>
            ) : (
                null
            )
        )
    }

    /**
     * 渲染底部操作
     */
    renderBottom() {
        return (
            <View style={{
                backgroundColor: '#FFFFFF',
                opacity: 0.9,
                height: ScreenUtil.scaleSize(120),
                borderTopWidth: ScreenUtil.scaleSize(1),
                borderTopColor: '#DEDEDE',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around'
            }}>
                <TouchableOpacity onPress={this.openRejectDialog.bind(this)}>
                    <Image source={require('../../img/reimbursement/refuse.png')}
                           style={{
                               height: ScreenUtil.scaleSize(74),
                               width: ScreenUtil.scaleSize(311),
                               resizeMode: 'stretch',
                           }}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.operateAgree.bind(this)}>
                    <Image source={require('../../img/reimbursement/agree.png')}
                           style={{
                               height: ScreenUtil.scaleSize(74),
                               width: ScreenUtil.scaleSize(311),
                               resizeMode: 'stretch',
                           }}/>
                </TouchableOpacity>
            </View>
        )
    }

    /**
     * 打开驳回对话框
     */
    openRejectDialog() {
        this.props.changeState({
            showRejectDialog: true,
        })
    }

    /**
     * 关闭驳回对话框
     */
    closeRejectDialog() {
        this.props.changeState({
            showRejectDialog: false,
        })
    }

    /**
     * 确定驳回
     */
    operateReject(component) {
        Util.showToast("确认驳回")
        //清空驳回原因内容
        this.props.changeState({operateComment: ''});
    }

    /**
     * 同意
     */
    operateAgree() {
        Util.showToast("同意")
        /*this.props.operateApproval({
         state: '4',
         expenseNo: this.props.state.expenseNo,
         taskId: this.props.navigation.state.params.taskId,
         taskDefKey: this.props.navigation.state.params.taskDefKey,
         procinstId: this.props.state.procinstId,
         uuidList: this.props.state.invoiceUUIDList,
         })*/
    }

    /**
     * 打开邮箱对话框
     */
    openEmailDialog(component) {
        if (Platform.OS == 'ios') {
            component.props.changeState({isLoading: true});
            setTimeout(
                () => {
                    var timestamp = (new Date()).valueOf();
                },
                500
            );
        } else {
            component.props.changeState({
                showEmailDialog: true,
            })
        }
    }

    /**
     * 发送邮件
     */
    sendEmail() {
        //判断邮箱合法性
        if (Util.checkEmail(this.props.state.email)) {
            this.props.changeState({
                showEmailDialog: false,
            })
            Util.showToast("发送邮件")
        } else {
            Util.showToast(Message.EMAIL_ERROR);
        }
    }

    /**
     * 关闭邮箱对话框
     */
    closeEmailDialog() {
        this.props.changeState({
            showEmailDialog: false,
        })
    }

    /**
     * 关闭评论对话框
     */
    closeCommentDialog() {
        this.props.changeState({
            showCommentDialog: false,
            showCommentTip: false
        })
    }

    /**
     * 评论
     */
    addComment(component) {
        const item = component.props.state.currentCommentItem;
        if (Util.checkIsEmptyString(this.props.state.commentContent)) {
            this.props.changeState({showCommentTip: true, commentContent: ''});
            Util.showToast(Message.REIMBURSEMENT_EMPTY_COMMENT_CONTENT);
        } else {
            /*component.props.addComment({
             commentContent: {
             expenseNo: component.props.state.expenseNo,
             taskId: item.taskId,
             toUserId: (component.props.state.currentUserId == component.props.state.createUserId) ? item.userId : component.props.state.createUserId,
             procinstId: item.procinstId,
             pid: item.pid ? item.id : 'root',
             taskKey: item.taskKey,
             comment: this.props.state.commentContent,
             }
             })*/
            this.props.changeState({showCommentDialog: false});
        }
    }

    /**
     * 编辑
     */
    editTavelApply(component) {
        var data = component.props.state;
        var requestData = {
            source: 'TravelApplyDetail',
            expenseDepartmentName: data.expenseDepartmentName,
            expenseDepartmentId: data.expenseDepartmentId,
            cause: data.cause,
            selectedStartDate: data.applyStartDate,
            selectedEndDate: data.applyEndDate,
            travelDays: data.travelDays,
            expectedCostAmount: data.expectedCostAmount,
            peerPerple: data.peerPerple,
            attachmentList: data.attachmentList,
            applyStatus: data.applyStatus,
            targetCity: data.targetCity,
            attachmentIDList: [],     //删除的报销单附件ID集合
            attachmentURLList: [],     //删除的申请单附件URL集合
            titleText: data.applyStatus === "0" ? Message.NEW_TRAVEL_APPLY_EDIT_TITLE : Message.NEW_TRAVEL_APPLY_TITLE,
        }
        component.props.editTravelApplyDetail(JSON.parse(JSON.stringify(requestData)));
    }

    /**
     * 打开确认撤回对话框
     */
    openCancelDialog(component) {
        component.props.changeState({
            cancelModalVisible: true,
        })
    }

    /**
     * 关闭取消对话框
     */
    _closeCancelModal() {
        this.props.changeState({
            cancelModalVisible: false,
        });
    }

    //取消撤回
    _cancelClick() {

    }

    /**
     * 撤销
     */
    operateCancel(component) {
        Util.showToast("撤销")
    }

    renderApplicationDate(date) {
        if (date === '' || date === null) {
            return '';
        } else {
            return date.substring(0, 16);
        }
    }

    /**
     * 打开评论对话框
     */
    openCommentDialog(item) {
        this.props.changeState({
            showCommentDialog: true,
            currentCommentItem: item,
            commentContent: ''  //打开评论对话框前，清空评论内容
        })
    }

    /**
     * 预览文件
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

    /**
     * 渲染评论图片
     * @param fileList 文件列表
     */
    renderCommentImg(fileList) {
        const arr = fileList.filter(item => item.userType == 0);
        if (arr && arr.length > 0) {
            return (
                <View style={{
                    height: ScreenUtil.scaleSize(56),
                    marginLeft: ScreenUtil.scaleSize(150),
                    marginTop: ScreenUtil.scaleSize(10),
                    flexDirection: 'row',
                }}>
                    {
                        arr.map((img) => {
                            return (
                                <TouchableOpacity style={{
                                    marginLeft: ScreenUtil.scaleSize(20),
                                }} onPress={() => {
                                    this.previewDocument({
                                        fileAddress: img.fileDir,
                                        fileName: img.fileName,
                                    })
                                }}>
                                    <Image source={require('../../img/reimbursement/file_pic.png')}
                                           style={{
                                               height: ScreenUtil.scaleSize(56),
                                               width: ScreenUtil.scaleSize(80),
                                               resizeMode: 'stretch',
                                           }}/>
                                </TouchableOpacity>
                            )
                        })
                    }
                </View>
            )
        }
    }

    /**
     * 渲染文件图标
     * @param fileType 文件类型
     */
    renderFileIcon(fileType) {
        let icon = '';
        switch (fileType.toLowerCase()) {
            case 'docx':
                icon = require('./../../img/reimbursement/file_word.png');
                break;
            case 'doc':
                icon = require('./../../img/reimbursement/file_word.png');
                break;
            case 'ppt':
                icon = require('./../../img/reimbursement/file_ppt.png');
                break;
            case 'pdf':
                icon = require('./../../img/reimbursement/file_pdf.png');
                break;
            case 'xls':
                icon = require('./../../img/reimbursement/file_excel.png');
                break;
            case 'xlsx':
                icon = require('./../../img/reimbursement/file_excel.png');
                break;
            case 'png':
                icon = require('./../../img/reimbursement/file_pic.png');
                break;
            case 'img':
                icon = require('./../../img/reimbursement/file_pic.png');
                break;
            case 'jpg':
                icon = require('./../../img/reimbursement/file_pic.png');
                break;
            case 'bmp':
                icon = require('./../../img/reimbursement/file_pic.png');
                break;
            default:
                icon = require('./../../img/reimbursement/file_word.png');
        }

        return (
            <Image source={icon}
                   style={{
                       width: ScreenUtil.scaleSize(58),
                       height: ScreenUtil.scaleSize(66),
                       resizeMode: 'stretch',
                   }}/>
        )
    }

    /**
     * 渲染评论附件
     * @param fileList 文件列表
     */
    renderCommentAttachment(fileList) {
        const arr = fileList.filter(item => item.userType == 1);
        return arr.map((item) => {
            return (
                <TouchableOpacity style={{
                    height: ScreenUtil.scaleSize(66),
                    marginLeft: ScreenUtil.scaleSize(170),
                    marginTop: ScreenUtil.scaleSize(10),
                    flexDirection: 'row',
                }} onPress={() => {
                    this.previewDocument({
                        fileAddress: item.fileDir,
                        fileName: this.getFileName(item.fileName),
                    })
                }}>
                    {this.renderFileIcon(item.fileType)}
                    <View style={{
                        height: ScreenUtil.scaleSize(66),
                        justifyContent: 'space-between',
                        marginLeft: ScreenUtil.scaleSize(20),
                        flex: 1,
                    }}>
                        <Text numberOfLines={1} style={{
                            fontSize: ScreenUtil.setSpText(7),
                            color: '#666666'
                        }}>
                            {item.fileName}
                        </Text>
                        <Text style={{
                            fontSize: ScreenUtil.setSpText(7),
                            color: '#666666'
                        }}>
                            {item.fileSize + 'KB'}
                        </Text>
                    </View>
                </TouchableOpacity>
            )
        })
    }

    /**
     * 渲染评论列表
     * @param commentList 评论列表
     * @param index 审批序号
     */
    renderComment(commentList, applicationIndex, operateComment, operateUserName, operateTime, operate) {
        const color = (applicationIndex + 1 == this.props.state.approvalRecordList.length) ? 'transparent' : '#DEDEDE';
        if ((commentList == null || commentList.length == 0) && Util.checkIsEmptyString(operateComment)) {
            return (
                <View style={{
                    height: ScreenUtil.scaleSize(80),
                    borderLeftColor: color,
                    marginLeft: ScreenUtil.scaleSize(19),
                    borderLeftWidth: ScreenUtil.scaleSize(1),
                }}/>
            )
        } else {
            return (
                <View style={{
                    borderLeftColor: color,
                    marginLeft: ScreenUtil.scaleSize(19),
                    borderLeftWidth: ScreenUtil.scaleSize(1),
                }}>
                    <FlatList
                        data={commentList}
                        renderItem={({item, index}) => (
                            <View style={{
                                marginTop: ScreenUtil.scaleSize(index == 0 ? 20 : 10),
                                marginBottom: ScreenUtil.scaleSize(index + 1 == commentList.length ? 40 : 0),
                            }}>
                                <View style={{flexDirection: 'row'}}>
                                    <Text style={{
                                        width: ScreenUtil.scaleSize(120),
                                        fontSize: ScreenUtil.setSpText(7),
                                        color: '#666666',
                                        marginLeft: ScreenUtil.scaleSize(50),
                                    }} numberOfLines={1}>{item.userName + ':'}</Text>
                                    <Text style={{
                                        flex: 1,
                                        width: ScreenUtil.scaleSize(237),
                                        fontSize: ScreenUtil.setSpText(7),
                                        color: '#666666',
                                        marginRight: ScreenUtil.scaleSize(40),
                                    }}>{item.comment}</Text>
                                    {
                                        (index + 1 == commentList.length &&
                                        operate == '3' &&
                                        this.props.state.applyStatus == '3' &&
                                        item.toUserId == this.props.state.currentUserId) ? (
                                            this.renderCommentButton(item)
                                        ) : (
                                            <Text style={{
                                                width: ScreenUtil.scaleSize(250),
                                                fontSize: ScreenUtil.setSpText(7),
                                                color: '#ABABAB',
                                            }}>{this.renderApplicationDate(item.createTimeStr)}</Text>
                                        )
                                    }
                                </View>
                                {
                                    this.renderCommentImg(item.bizCommentAttachmentExtList)
                                }
                                {
                                    this.renderCommentAttachment(item.bizCommentAttachmentExtList)
                                }
                            </View>
                        )}
                    />
                    {
                        (operateComment) ? (
                            <View style={{
                                flexDirection: 'row',
                                marginBottom: ScreenUtil.scaleSize(40),
                                marginTop: ScreenUtil.scaleSize(commentList ? -30 : 20),
                            }}>
                                <Text style={{
                                    width: ScreenUtil.scaleSize(120),
                                    fontSize: ScreenUtil.setSpText(7),
                                    color: '#666666',
                                    marginLeft: ScreenUtil.scaleSize(50),
                                }} numberOfLines={1}>{operateUserName + ':'}</Text>
                                <Text style={{
                                    flex: 1,
                                    width: ScreenUtil.scaleSize(237),
                                    fontSize: ScreenUtil.setSpText(7),
                                    color: '#666666',
                                    marginRight: ScreenUtil.scaleSize(40),
                                }}>{operateComment}</Text>
                                <Text style={{
                                    width: ScreenUtil.scaleSize(250),
                                    fontSize: ScreenUtil.setSpText(7),
                                    color: '#ABABAB',
                                }}>{this.renderApplicationDate(operateTime)}</Text>
                            </View>
                        ) : null
                    }
                </View>
            )
        }
    }

    /**
     * 渲染审批流程
     * @param operate 审批状态
     */
    renderApplication(item, index) {
        let icon = '';
        let color = '';
        let operate = '';
        switch (item.operate) {
            case '0':
                icon = require('../../img/reimbursement/ok.png');
                color = '#ABABAB';
                operate = Message.OPERATE_APPLY;
                break;
            case '4':
                icon = require('../../img/reimbursement/ok.png');
                color = '#66CC00';
                operate = Message.OPERATE_AGREE;
                break;
            case '3':
                icon = require('../../img/reimbursement/ok.png');
                color = '#CE1A1A';
                operate = Message.OPERATE_WAIT;
                break;
            case '2':
                icon = require('../../img/reimbursement/error.png');
                color = '#CE1A1A';
                operate = Message.OPERATE_REJECT;
                break;
            case '1':
                icon = require('../../img/reimbursement/wait.png');
                color = '#ABABAB';
                operate = Message.OPERATE_CANCEL_LABEL;
                break;
            case '5':
                icon = require('../../img/reimbursement/ok.png');
                color = '#66CC00';
                operate = Message.OPERATE_PASS;
                break;
            default:
                break;
        }
        return (
            <View style={{
                marginTop: ScreenUtil.scaleSize(index == 0 ? 40 : 0),
                marginBottom: ScreenUtil.scaleSize(index + 1 == this.props.state.approvalRecordList.length ? 40 : 0),
            }}>
                <View style={{
                    height: ScreenUtil.scaleSize(40),
                    alignItems: 'center',
                    flexDirection: 'row',
                    //marginTop: ScreenUtil.scaleSize(index == 0 ? 40 : 0),
                }}>
                    <Image source={icon}
                           style={{
                               width: ScreenUtil.scaleSize(40),
                               height: ScreenUtil.scaleSize(40),
                               resizeMode: 'stretch',
                           }}/>
                    <Text style={[styles.text, {
                        marginLeft: ScreenUtil.scaleSize(30),
                        width: ScreenUtil.scaleSize(120),
                    }]} numberOfLines={1}>{item.userName}</Text>
                    <Text style={{
                        color: color,
                        fontSize: ScreenUtil.setSpText(9),
                        //marginLeft: ScreenUtil.scaleSize(30),
                        flex: 1,
                    }}>{operate}</Text>
                    {
                        (item.operate == '3') ? (
                            <TouchableOpacity onPress={() => {
                                this.openCommentDialog(item)
                            }}>
                                <Text style={{
                                    color: 'orange',
                                    fontSize: ScreenUtil.setSpText(9),
                                }}>{Message.COMMENT}</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={{
                                color: '#ABABAB',
                                fontSize: ScreenUtil.setSpText(9),
                                width: ScreenUtil.scaleSize(250),
                            }}>{this.renderApplicationDate(item.createTimeStr)}</Text>
                        )
                    }
                </View>
                {this.renderComment(item.bizCommentExtList, index, item.operateComment, item.userName, item.createTimeStr, item.operate)}
            </View>
        )
    }

    render() {
        let rightMessage = null;
        let rightColor = null;
        let rightClick = null;
        if (this.props.state.applyStatus == '4') {
            rightMessage = Message.PRINT;
            rightColor = '#FFAA00';
            rightClick = this.openEmailDialog;
        }
        if (this.props.state.currentUserId == this.props.state.currentUserId) {
            if (Util.contains(['0', '1', '2'], this.props.state.applyStatus)) {
                rightMessage = Message.EDIT;
                rightColor = '#ABABAB';
                rightClick = this.editTavelApply;
            }
            if (this.props.state.applyStatus == "3") {
                rightMessage = Message.OPERATE_CANCEL;
                rightColor = '#ABABAB';
                rightClick = this.openCancelDialog;
            }
        }
        return (
            <View style={styles.container}>
                <CommonLoading isShow={this.props.state.isLoading}/>
                <Dialog
                    content={Message.CANCEL_REIMBURSEMENT}
                    type={'confirm'}
                    leftBtnText={Message.CANCEL}
                    rightBtnText={Message.CONFIRM}
                    modalVisible={this.props.state.cancelModalVisible}
                    leftBtnStyle={{color: '#A5A5A5',}}
                    rightBtnStyle={{color: '#FFAA00',}}
                    onClose={this._closeCancelModal.bind(this)}
                    leftBtnClick={this._cancelClick.bind(this)}
                    rightBtnClick={this.operateCancel.bind(this)}
                    thisComponent={this}
                />
                <InputDialog isShow={this.props.state.showRejectDialog}
                             backgroundClick={this.closeRejectDialog.bind(this)}
                             titleText={Message.REIMBURSEMENT_REJECT_REASON}
                             inputHeight={238}
                             inputWidth={530}
                             thisComponent={this}
                             maxLength={300}
                             placeholder={Message.REIMBURSEMENT_REJECT_TEXT_PLACEHOLDER}
                             multiline={true}
                             onChangeText={(component, text) => {
                                 component.props.changeState({
                                     operateComment: text
                                 })
                             }}
                             returnKeyType={'done'}
                             leftButtonText={Message.CANCEL}
                             rightButtonText={Message.CONFIRM}
                             rightClick={this.operateReject.bind(this)}
                             width={590}
                             height={502}
                             top={this.props.state.dialogTop}
                             onFocus={this.inputOnFocus}
                             onBlur={this.inputOnBlur}/>
                <InputDialog isShow={this.props.state.showEmailDialog}
                             backgroundClick={this.closeEmailDialog.bind(this)}
                             titleText={Message.EMAIL_DIALOG_PLACEHOLDER}
                             showDialogOpen={true}
                             multiline={true}
                             autoGrow={true}
                             defaultValue={this.props.state.email}
                             inputHeight={68}
                             inputWidth={470}
                             thisComponent={this}
                             maxLength={100}
                             onChangeText={(component, text) => {
                                 component.props.changeState({
                                     email: text
                                 })
                             }}
                             placeholder={Message.EMAIL_DIALOG_PLACEHOLDER}
                             returnKeyType={'done'}
                             leftButtonText={Message.CANCEL}
                             rightButtonText={Message.CONFIRM}
                             rightClick={this.sendEmail.bind(this)}
                             width={590}
                             textAlignVertical={'center'}
                             height={332}/>
                <InputDialog isShow={this.props.state.showCommentDialog}
                             titleText={Message.COMMENT}
                             inputHeight={238}
                             inputWidth={530}
                             thisComponent={this}
                             maxLength={300}
                             onChangeText={(component, text) => {
                                 component.props.changeState({
                                     commentContent: text
                                 })
                             }}
                             leftClick={this.closeCommentDialog.bind(this)}
                             rightClick={this.addComment.bind(this)}
                             placeholder={Message.REIMBURSEMENT_REJECT_TEXT_PLACEHOLDER}
                             multiline={true}
                             returnKeyType={'done'}
                             leftButtonText={Message.CANCEL}
                             rightButtonText={Message.CONFIRM}
                             width={590}
                             height={502}
                             top={this.props.state.dialogTop}
                             onFocus={this.inputOnFocus}
                             onBlur={this.inputOnBlur}/>

                <Header
                    titleText={this.props.state.applicationTitle}
                    thisComponent={this}
                    backClick={this.onBack}
                    rightText={rightMessage}
                    rightClick={rightClick}
                    rightTextStyle={{
                        fontSize: ScreenUtil.setSpText(9),
                        color: rightColor,
                    }}
                />
                <ScrollView style={styles.sclView} keyboardShouldPersistTaps={'handled'} scrollOffset={50}
                            ref="scroll">
                    <View style={styles.topView}>
                        {this.renderIcon()}
                        <View style={{
                            height: ScreenUtil.scaleSize(48),
                            justifyContent: 'center',
                        }}>
                            <Text style={{
                                fontSize: ScreenUtil.setSpText(12),
                                color: '#666666',
                                fontWeight: 'bold',
                            }}>{this.props.state.applyPeople}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>{this.getStatus(this.props.state.applyStatus)}</Text>
                        </View>
                        <View style={{
                            backgroundColor: '#DEDEDE',
                            height: ScreenUtil.scaleSize(2),
                            marginTop: ScreenUtil.scaleSize(20),
                        }}/>
                        <View style={styles.row}>
                            <Text style={styles.label}>{Message.TRAVEL_APPLY_DETAIL_NUMBER}</Text>
                            <Text style={styles.text}>{this.props.state.applyNo}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>{Message.TRAVEL_APPLY_DETAIL_APPLY_TIME}</Text>
                            <Text style={styles.text}>{this.props.state.applyTime}</Text>
                        </View>
                    </View>

                    <View style={[styles.topView, {marginTop: ScreenUtil.scaleSize(20)}]}>
                        <View style={{
                            height: ScreenUtil.scaleSize(40),
                            justifyContent: 'center',
                        }}>
                            <Text style={{
                                fontSize: ScreenUtil.setSpText(9),
                                color: '#666666',
                                fontWeight: 'bold',
                            }}>{Message.TRAVEL_APPLY_DETAIL}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>{Message.REIMBURSEMENT_DEPARTMENT}</Text>
                            <Text style={styles.text}>{this.props.state.expenseDepartmentName}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>{Message.NEW_TRAVEL_APPLY_CAUSEL}</Text>
                            <Text style={styles.text}>{this.props.state.cause}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>{Message.NEW_TRAVEL_APPLY_BEGIN_DATE}</Text>
                            <Text style={styles.text}>{this.props.state.applyStartDate}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>{Message.NEW_TRAVEL_APPLY_END_DATE}</Text>
                            <Text style={styles.text}>{this.props.state.applyEndDate}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>{Message.NEW_TRAVEL_APPLY_DAYS}</Text>
                            <Text style={styles.text}>{this.props.state.travelDays + "天"}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>{Message.NEW_TRAVEL_APPLY_CITY}</Text>
                            <Text style={styles.text}>{this.props.state.targetCity}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>{Message.NEW_TRAVEL_APPLY_EXPECTED_COST}</Text>
                            <Text
                                style={[styles.text, {color: '#FFAA00'}]}>{this.props.state.expectedCostAmount}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>{Message.NEW_TRAVEL_APPLY_PEER_PERPLE}</Text>
                            <Text style={styles.text}>{this.props.state.peerPerple}</Text>
                        </View>
                        <View style={styles.row}>
                            <View style={{
                                height: ScreenUtil.scaleSize(40),
                            }}>
                                <Text style={styles.label}>{Message.NEW_TRAVEL_APPLY_ATTACHMENT}</Text>
                            </View>
                            <FlatList/>
                        </View>
                    </View>
                    {
                        this.props.state.applyStatus == 0 ? (
                            null
                        ) : (
                            <View style={{
                                paddingHorizontal: ScreenUtil.scaleSize(30),
                                paddingTop: ScreenUtil.scaleSize(10),
                                marginTop: ScreenUtil.scaleSize(20),
                                backgroundColor: '#FFFFFF',
                            }}>

                                <View style={{
                                    height: ScreenUtil.scaleSize(40),
                                }}>
                                    <Text style={styles.text}>{Message.APPROVAL}</Text>
                                </View>
                                <FlatList
                                    data={this.props.state.approvalRecordList}
                                    renderItem={({item, index}) => (
                                        this.renderApplication(item, index)
                                    )}
                                />
                            </View>
                        )
                    }
                </ScrollView>
                {this.renderBottom()}
            </View>
        )
    }
}

function mapStateToProps(state) {
    return {
        state: state.TravelApplyDetail,
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
        changeAppState: changeAppState,
        editTravelApplyDetail: editTravelApplyDetail,
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(TravelApplyDetail);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    sclView: {
        //flex: 1,
        backgroundColor: '#F6F6F6'
    },
    topView: {
        paddingHorizontal: ScreenUtil.scaleSize(30),
        paddingVertical: ScreenUtil.scaleSize(20),
        backgroundColor: '#FFFFFF',
    },
    row: {
        height: ScreenUtil.scaleSize(40),
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: ScreenUtil.scaleSize(20),
    },
    label: {
        width: ScreenUtil.scaleSize(230),
        color: '#ABABAB',
        fontSize: ScreenUtil.setSpText(9),
    },
    text: {
        color: '#666666',
        fontSize: ScreenUtil.setSpText(9),
    },
})