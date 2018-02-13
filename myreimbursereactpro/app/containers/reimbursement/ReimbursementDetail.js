/**
 * 报销详情
 * Created by sky.qian on 10/31/2017.
 */
import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
    Text,
    Button,
    View,
    TouchableWithoutFeedback,
    Image,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    FlatList,
    NativeModules,
    ScrollView,
    KeyboardAvoidingView,
    Keyboard,
    Animated,
    Platform,
    BackHandler
} from "react-native";
import Message from "../../constant/Message";
import ScreenUtil, {deviceWidth, deviceHeight} from "../../utils/ScreenUtil";
import {
    changeState,
    loadData,
    downloadAttachment,
    operateCancel,
    operateApproval,
    addComment,
    initData,
    editReimbursementDetail,
    sendEmail
} from "../../redux/actions/reimbursement/ReimbursementDetail";
import {
    back,
    navigateReimbursementReply,
    navigateInvoiceDetails,
    resetApplicationList,
    navigateApplicationList
} from "../../redux/actions/navigator/Navigator";
import Header from "../../containers/common/CommonHeader";
import InputDialog from "../../containers/common/InputDialog";
import Util from "../../utils/Util";
import API from "../../utils/API";
import Store from "react-native-simple-store";
import CommonLoading from "../../containers/common/CommonLoading";
import Dialog from "./../common/Dialog";
import {changeState as changeAppState} from "../../redux/actions/App";
import {CustomStyles} from '../../css/CustomStyles';

var PreviewModule = NativeModules.PreviewModule;

class ReimbursementDetail extends Component {
    static navigationOptions = ({navigation}) => ({
        header: null
    });

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
        this.props.loadData(this.props.navigation.state.params.formId)
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
     * 渲染评论或回复按钮
     */
    renderCommentButton(item) {
        if (this.props.state.currentUserId == this.props.state.createUserId) {
            return (
                <TouchableOpacity onPress={() => {
                    this.gotoReplyPage(item)
                }}>
                    <Text style={{
                        width: ScreenUtil.scaleSize(250),
                        fontSize: ScreenUtil.setSpText(7),
                        color: '#FFAA00',
                    }}>{Message.REPLY}</Text>
                </TouchableOpacity>
            )
        } else {
            return (
                <TouchableOpacity onPress={() => {
                    this.openCommentDialog(item)
                }}>
                    <Text style={{
                        width: ScreenUtil.scaleSize(250),
                        fontSize: ScreenUtil.setSpText(7),
                        color: '#FFAA00',
                    }}>{Message.COMMENT}</Text>
                </TouchableOpacity>
            )
        }

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
     * 预览图片
     */
    renderImgPreview() {
        return (
            (this.props.state.previewShow) ? (
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
                        <Image source={{
                            uri: API.DOWNLOAD_ATTACHMENT_BY_DIR,
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'token': this.props.state.token
                            },
                            body: JSON.stringify({fileDir: this.props.state.previewImgItem.fileAddress + '.' + this.props.state.previewImgItem.fileType})
                        }}
                               style={{
                                   width: deviceWidth,
                                   height: deviceHeight,
                                   resizeMode: 'contain',
                               }}/>
                    </View>
                </TouchableWithoutFeedback>
            ) : (
                null
            )
        )
    }

    renderApplicationDate (date) {
        if (date === '' || date === null) {
            return '';
        } else {
            return date.substring(0,16);
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
                        (item.userId == this.props.state.currentUserId &&
                        this.props.state.createUserId != this.props.state.currentUserId &&
                        item.operate == '3' && Util.checkIsEmptyString(item.operateComment) &&
                        (item.bizCommentExtList == null || item.bizCommentExtList.length == 0) &&
                        this.props.navigation.state.params.source != 'approved') ? (
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
     * 打开评论对话框
     */
    openCommentDialog(item) {
        this.props.changeState({
            showCommentDialog: true,
            currentCommentItem: item,
            commentContent: ''  //打开评论对话框前，清空评论内容
        })
    }

    gotoReplyPage(item) {
        this.props.changeState({
            currentCommentItem: item,
        })
        this.props.navigateReimbursementReply({
            expenseNo: this.props.state.expenseNo,
            taskId: item.taskId,
            toUserId: (this.props.state.currentUserId == this.props.state.createUserId) ? item.userId : this.props.state.createUserId,
            procinstId: item.procinstId,
            pid: item.pid ? item.id : 'root',
            taskKey: item.taskKey,
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
     * 打开邮箱对话框
     */
    openEmailDialog(component) {
        if (Platform.OS == 'ios') {
            component.props.changeState({isLoading: true});
            setTimeout(
                () => {
                    var timestamp = (new Date()).valueOf();

                    PreviewModule.previewDocument(API.PRINT, component.props.state.token, JSON.stringify({
                        expenseNo: component.props.state.applyNo,
                        procinstId: component.props.state.procinstId,
                    }), '',timestamp + '.pdf', (value)=> {
                        component.props.changeState({isLoading: false});
                    })
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
            this.props.sendEmail({
                expenseNo: this.props.state.applyNo,
                email: this.props.state.email,
                procinstId: this.props.state.procinstId,
            })
        } else {
            Util.showToast(Message.EMAIL_ERROR);
        }
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
     * 撤销
     */
    operateCancel(component) {
        component.props.operateCancel({
            state: '1',
            expenseNo: component.props.state.expenseNo,
            procinstId: component.props.state.procinstId,
            uuidList: component.props.state.invoiceUUIDList,
        })
    }

    /**
     * 确定驳回
     */
    operateReject(component) {
        component.props.operateApproval({
            state: '2',
            expenseNo: component.props.state.expenseNo,
            procinstId: component.props.state.procinstId,
            taskId: component.props.navigation.state.params.taskId,
            taskDefKey: component.props.navigation.state.params.taskDefKey,
            operateComment: component.props.state.operateComment,
            uuidList: component.props.state.invoiceUUIDList,
        })
        //清空驳回原因内容
        this.props.changeState({operateComment: ''});
    }

    /**
     * 同意
     */
    operateAgree() {
        this.props.operateApproval({
            state: '4',
            expenseNo: this.props.state.expenseNo,
            taskId: this.props.navigation.state.params.taskId,
            taskDefKey: this.props.navigation.state.params.taskDefKey,
            procinstId: this.props.state.procinstId,
            uuidList: this.props.state.invoiceUUIDList,
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
            component.props.addComment({
                commentContent: {
                    expenseNo: component.props.state.expenseNo,
                    taskId: item.taskId,
                    toUserId: (component.props.state.currentUserId == component.props.state.createUserId) ? item.userId : component.props.state.createUserId,
                    procinstId: item.procinstId,
                    pid: item.pid ? item.id : 'root',
                    taskKey: item.taskKey,
                    comment: this.props.state.commentContent,
                }
            })
            this.props.changeState({showCommentDialog: false});
        }
    }

    /**
     * 编辑
     */
    edit(component) {
        const data = component.props.state;
        var requestData ={
            source: 'ReimbursementDetail',
            applyTypeCode: data.applyTypeCode,
            applyTypeName: data.applyType,
            expenseDesc: data.expenseDesc,
            selectedStartDate: data.applyStartTime,
            startHour: data.applyStartTime ? data.applyStartTime.substring(11, 13) : '',
            startMinute: data.applyStartTime ? data.applyStartTime.substring(14) : '',
            selectedEndDate: data.applyEndTime,
            endHour: data.applyEndTime ? data.applyEndTime.substring(11, 13) : '',
            endMinute: data.applyEndTime ? data.applyEndTime.substring(14) : '',
            targetCity: data.applyCity,
            travelDays: data.travelDays,
            totalNum: data.invoiceTotalNum,
            travelBill: data.travelBill,
            totalAmount: data.applyAmount,
            expenseDepartmentId: data.expenseDepartmentId,
            expenseDepartmentName: data.department,
            bizExpenseTypeList: data.applyDetail,
            bizExpenseAttachmentList: data.fileList,
            expenseNo: data.applyNo,
            applyStatus: data.applyStatus,
            bizExpenseAttachmentIDList: [],     //删除的报销单附件ID集合
            bizExpenseAttachmentURLList: [],    //删除的报销单附件URL集合
            bizExpenseTypeIDList: [],           //删除的报销单明细ID集合
            bizExpenseBillIDList: [],           //删除的发票ID集合
            invoiceUUIDList: data.invoiceUUIDList,      //发票id集合
            bizExpenseAttachmentListFromDetail: data.fileList,
            bizExpenseTypeListFromDetail: data.applyDetail,
        }
        component.props.editReimbursementDetail(JSON.parse(JSON.stringify(requestData)))
    }

    /**
     * 编辑未提交报销单
     */
    edit0(component) {
        const data = component.props.state;
        var requestData = {
            source: 'ReimbursementDetail',
            applyTypeCode: data.applyTypeCode,
            applyTypeName: data.applyType,
            expenseDesc: data.expenseDesc,
            selectedStartDate: data.applyStartTime,
            startHour: data.applyStartTime ? data.applyStartTime.substring(11, 13) : '',
            startMinute: data.applyStartTime ? data.applyStartTime.substring(14) : '',
            selectedEndDate: data.applyEndTime,
            endHour: data.applyEndTime ? data.applyEndTime.substring(11, 13) : '',
            endMinute: data.applyEndTime ? data.applyEndTime.substring(14) : '',
            targetCity: data.applyCity,
            travelDays: data.travelDays,
            totalNum: data.invoiceTotalNum,
            travelBill: data.travelBill,
            totalAmount: data.applyAmount,
            expenseDepartmentId: data.expenseDepartmentId,
            expenseDepartmentName: data.department,
            bizExpenseTypeList: data.applyDetail,
            bizExpenseAttachmentList: data.fileList,
            expenseNo: data.applyNo,
            applyStatus: data.applyStatus,
            bizExpenseAttachmentIDList: [],     //删除的报销单附件ID集合
            bizExpenseAttachmentURLList: [],    //删除的报销单附件URL集合
            bizExpenseTypeIDList: [],           //删除的报销单明细ID集合
            bizExpenseBillIDList: [],           //删除的发票ID集合
            invoiceUUIDList: data.invoiceUUIDList,      //发票id集合
            titleText:Message.EDIT_REIMBURSEMENT,//报销单标题
            bizExpenseAttachmentListFromDetail: data.fileList,
            bizExpenseTypeListFromDetail: data.applyDetail,
        };
        component.props.editReimbursementDetail(JSON.parse(JSON.stringify(requestData)));
    }

    //选择报销单编辑器
    selectEdit(){
        if(this.props.state.applyStatus ==1 || this.props.state.applyStatus ==2){
            return this.edit;
        }else{
            return this.edit0;
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
     * 关闭取消对话框
     */
    _closeCancelModal() {
        this.props.changeState({
            cancelModalVisible: false,
        });
    }

    /**
     * 预览文件
     */
    previewDocument(item){
        this.props.changeState({isLoading:true});
        setTimeout(
            () => {
                PreviewModule.previewDocument(API.DOWNLOAD_ATTACHMENT_BY_DIR, this.props.state.token, JSON.stringify({fileDir : item.fileAddress}),item.fileAddress,item.fileName,(value)=> {
                    this.props.changeState({isLoading:false});
                })
            },
            500
        );

    }

    //取消撤回
    _cancelClick() {
       /* this.props.changeState({
            cancelModalVisible: false,
        })*/
        // this.props.back();
        this.props.navigateApplicationList();
    }


    /**
     * 渲染底部操作
     */
    renderBottom() {
        if (this.props.navigation.state.params.source == 'unapproved' ||
            (this.props.navigation.state.params.source == 'notice' && this.props.navigation.state.params.isApprovalUser)) {
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
        } else {
            return null;
        }

    }

    /**
     * 渲染增票发票明细显示格式
     */
    renderInvoiceDetail (object) {
        if (object.length > 15) {
            return object.substring(0,16) + '...';
        } else {
            return object;
        }
    }

    /**
     * 文件名过长显示
     */
    getFileName(fileName) {
        const index = fileName.lastIndexOf(".");
        const suffix = fileName.substring(index + 1);
        let name = fileName.substring(0, index);
        if (name.length > 14) {
            name = name.substring(0, 14);
        }
        return name + '...' + suffix;
    }

    render() {
        let rightMessage = null;
        let rightColor = null;
        let rightClick = null;
        if (this.props.state.applyStatus == 4) {
            rightMessage = Message.PRINT;
            rightColor = '#FFAA00';
            rightClick = this.openEmailDialog;
        }
        if (this.props.state.currentUserId == this.props.state.createUserId) {
            if (Util.contains(['0', '1', '2'], this.props.state.applyStatus)) {
                rightMessage = Message.EDIT;
                rightColor = '#ABABAB';
                rightClick = this.selectEdit();
            }
            if (this.props.state.applyStatus == 3){
                rightMessage = Message.OPERATE_CANCEL;
                rightColor = '#ABABAB';
                rightClick = this.openCancelDialog;
            }
        }

        return (
            <View style={styles.container}>
                <CommonLoading isShow={this.props.state.isLoading}/>
                {this.renderImgPreview()}
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
                        <View style={[CustomStyles.separatorLine, {marginTop: ScreenUtil.scaleSize(20)}]}/>
                        <View style={styles.row}>
                            <Text style={styles.label}>{Message.REIMBURSEMENT_NO}</Text>
                            <Text style={styles.text}>{this.props.state.applyNo}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>{Message.REIMBURSEMENT_TIME}</Text>
                            <Text style={styles.text}>{this.props.state.applyTime}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>{Message.REIMBURSEMENT_AMOUNT}</Text>
                            <Text
                                style={[styles.text, {color: '#FFAA00'}]}>{(this.props.state.applyAmount == ''?'':Message.MONEY + parseFloat(this.props.state.applyAmount).toFixed(2))}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>{Message.REIMBURSEMENT_TYPE}</Text>
                            <Text style={styles.text}>{this.props.state.applyType}</Text>
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
                            }}>{this.props.state.applyTypeCode == '1' ? Message.REIMBURSEMENT_TRAVEL_DETAIL : Message.REIMBURSEMENT_NORMAL_DETAIL}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>{Message.REIMBURSEMENT_DEPARTMENT}</Text>
                            <Text style={styles.text}>{this.props.state.department}</Text>
                        </View>
                        {
                            this.props.state.applyTypeCode == '1' ? (
                                <View>
                                    <View style={styles.row}>
                                        <Text style={styles.label}>{Message.REIMBURSEMENT_START_DATE}</Text>
                                        <Text style={styles.text}>{this.props.state.applyStartTime}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={styles.label}>{Message.REIMBURSEMENT_END_DATE}</Text>
                                        <Text style={styles.text}>{this.props.state.applyEndTime}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={styles.label}>{Message.REIMBURSEMENT_BUSINESS_DAY}</Text>
                                        <Text style={styles.text}>{this.props.state.travelDays}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={styles.label}>{Message.NEW_RE_BUSINESS_CITY}</Text>
                                        <Text style={styles.text}>{this.props.state.applyCity}</Text>
                                    </View>
                                    <View style={{
                                        flexDirection: 'row',
                                        marginTop: ScreenUtil.scaleSize(25),
                                    }}>
                                        <Text style={styles.label}>{Message.REIMBURSEMENT_REASON_FOR_TRIP_FEE}</Text>
                                        <View style={{
                                            width: ScreenUtil.scaleSize(450),
                                        }}>
                                            <TextInput
                                                editable={false}
                                                multiline={true}
                                                autoGrow={true}
                                                minHeight={ScreenUtil.scaleSize(40)}
                                                maxHeight={ScreenUtil.scaleSize(700)}
                                                value={this.props.state.expenseDesc}
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
                                                }} />
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View style={{
                                    flexDirection: 'row',
                                    marginTop: ScreenUtil.scaleSize(25),
                                }}>
                                    <Text style={styles.label}>{Message.REIMBURSEMENT_REASON}</Text>
                                    <View style={{
                                        width: ScreenUtil.scaleSize(450),
                                    }}>
                                        <TextInput
                                            editable={false}
                                            multiline={true}
                                            autoGrow={true}
                                            minHeight={ScreenUtil.scaleSize(40)}
                                            maxHeight={ScreenUtil.scaleSize(700)}
                                            value={this.props.state.expenseDesc}
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
                                            }} />
                                    </View>
                                </View>
                            )
                        }
                        <FlatList
                            data={this.props.state.applyDetail}
                            renderItem={({item, index}) => (
                                <View style={styles.detailView}>
                                    <View style={{height: ScreenUtil.scaleSize(33), justifyContent: 'center'}}>
                                        <Text style={{
                                            fontSize: ScreenUtil.setSpText(7),
                                            color: '#ABABAB',
                                        }}>{Message.NEW_RE_DETAIL + ' (' + (index + 1) + ')'}</Text>
                                    </View>
                                    <View style={[styles.row, {marginTop: ScreenUtil.scaleSize(30)}]}>
                                        <Text style={styles.detailLabel}>{Message.NEW_RE_COST_TYPE}</Text>
                                        <Text style={styles.text}>{item.expenseNameTwo}</Text>
                                    </View>
                                    <View style={{
                                        flexDirection: 'row',
                                        marginTop: ScreenUtil.scaleSize(25),
                                    }}>
                                        <Text style={styles.detailLabel}>{Message.NEW_RE_COST_DETAIL}</Text>
                                        <View style={{
                                            width: ScreenUtil.scaleSize(400),
                                        }}>
                                            {item.detail == '' ? null :
                                                <TextInput
                                                editable={false}
                                                multiline={true}
                                                autoGrow={true}
                                                minHeight={ScreenUtil.scaleSize(40)}
                                                maxHeight={ScreenUtil.scaleSize(750)}
                                                value={item.detail}
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
                                                }} />}
                                        </View>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={styles.detailLabel}>{Message.NEW_RE_INVOICE_DETAIL}</Text>
                                    </View>
                                    <FlatList
                                        data={item.bizExpenseBillList}
                                        renderItem={({item, index}) => (
                                            <TouchableOpacity onPress={() => {
                                                this.props.navigateInvoiceDetails({uuid: item.invoiceUUID,fromReDetail:true})
                                            }} style={styles.invoiceDetail}>
                                                <View style={{
                                                    flexDirection: 'row',
                                                }}>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        height: ScreenUtil.scaleSize(40),
                                                        alignItems: 'center',
                                                        width: ScreenUtil.scaleSize(305),
                                                    }}>
                                                        <Text
                                                            style={styles.invoiceLabel}>{Message.NEW_RE_INVOICE_DATE + ':'}</Text>
                                                        <Text
                                                            style={styles.text}>{item.invoiceDateStr ? item.invoiceDateStr.substring(0, 10) : ''}</Text>
                                                    </View>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        height: ScreenUtil.scaleSize(40),
                                                        alignItems: 'center',
                                                        width: ScreenUtil.scaleSize(305),
                                                    }}>
                                                        <Text
                                                            style={styles.invoiceLabel}>{Message.NEW_RE_INVOICE_AMOUNT + ':'}</Text>
                                                        <Text style={styles.text}>{parseFloat(item.invoiceAmount).toFixed(2)}</Text>
                                                    </View>
                                                </View>
                                                <View style={{
                                                    flexDirection: 'row',
                                                }}>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        height: ScreenUtil.scaleSize(40),
                                                        alignItems: 'center',
                                                        marginTop: ScreenUtil.scaleSize(20),
                                                    }}>
                                                        <Text
                                                            style={styles.invoiceLabel}>{Message.NEW_RE_DETAIL + ':'}</Text>
                                                        {
                                                            Util.contains(['01', '02', '04', '10', '11'], item.invoiceType) ? (
                                                                <Text
                                                                    style={styles.text}>{this.renderInvoiceDetail(item.invoiceDetail)}</Text>
                                                            ) : (
                                                                <Text
                                                                    style={styles.text}>{Util.getInvoiceTypeName(item.invoiceType)}</Text>
                                                            )
                                                        }
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                    />
                                    <View style={styles.row}>
                                        <Text style={styles.detailLabel}>{Message.NEW_RE_INVOICE_DETAIL_AMOUNT}</Text>
                                        <Text style={[styles.text, {color: '#FFAA00'}]}>{(item.totalAmount == ''? '':Message.MONEY+ item.totalAmount)}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={styles.detailLabel}>{Message.NEW_RE_INVOICE_ACCOUNT}</Text>
                                        <Text
                                            style={styles.text}>{item.totalNum ? item.totalNum + Message.NEW_RE_INVOICE_ACCOUNT_UNIT : ''}</Text>
                                    </View>
                                </View>
                            )}
                        />
                        {
                            this.props.state.applyTypeCode == '1' ? (
                                <View style={styles.row}>
                                    <Text style={styles.label}>{Message.NEW_RE_ASSISTANCE}</Text>
                                    <Text style={[styles.text, {color: '#FFAA00'}]}>{this.props.state.travelBill ? (Message.MONEY + this.props.state.travelBill) : ''}</Text>
                                </View>
                            ) : null
                        }
                        <View style={{
                            marginTop: ScreenUtil.scaleSize(20),
                            flexDirection: 'row',
                        }}>
                            <View style={{
                                height: ScreenUtil.scaleSize(40),
                            }}>
                                <Text style={styles.label}>{Message.NEW_RE_ATTACHMENT}</Text>
                            </View>
                            <FlatList
                                data={this.props.state.fileList}
                                renderItem={({item, index}) => (
                                    <TouchableOpacity style={{
                                        flexDirection: 'row',
                                        height: ScreenUtil.scaleSize(66),
                                        marginTop: ScreenUtil.scaleSize(index == 0 ? 0 : 40),
                                        alignItems: 'center',
                                    }} onPress={() => {
                                        this.previewDocument(item);
                                    }}>
                                        {this.renderFileIcon(item.fileType)}
                                        <View style={{
                                            marginLeft: ScreenUtil.scaleSize(20),
                                            flex: 1,
                                        }}>
                                            <Text style={{
                                                fontSize: ScreenUtil.setSpText(7),
                                                color: '#666666',
                                            }} numberOfLines={1}>{item.fileName}</Text>
                                            <Text style={{
                                                fontSize: ScreenUtil.setSpText(7),
                                                color: '#666666'
                                            }} numberOfLines={1}>{item.fileSize + 'KB'}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                        <View style={[CustomStyles.separatorLine, {marginTop: ScreenUtil.scaleSize(20)}]}/>
                        <View style={styles.row}>
                            <Text style={[styles.label]}>{Message.REIMBURSEMENT_TOTAL_AMOUNT}</Text>
                            <Text style={[styles.text, {color: '#FFAA00'}]}>{this.props.state.applyAmount ==''?'':Message.MONEY+ parseFloat(this.props.state.applyAmount).toFixed(2)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>{Message.REIMBURSEMENT_TOTAL_INVOICE}</Text>
                            <Text
                                style={styles.text}>{this.props.state.invoiceTotalNum + Message.NEW_RE_INVOICE_ACCOUNT_UNIT}</Text>
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
        state: state.ReimbursementDetail,
        nav: state.nav,
        appState: state.App,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changeState: changeState,
        back: back,
        loadData: loadData,
        downloadAttachment: downloadAttachment,
        operateCancel: operateCancel,
        operateApproval: operateApproval,
        addComment: addComment,
        navigateReimbursementReply: navigateReimbursementReply,
        initData: initData,
        editReimbursementDetail: editReimbursementDetail,
        navigateInvoiceDetails: navigateInvoiceDetails,
        resetApplicationList: resetApplicationList,
        sendEmail: sendEmail,
        navigateApplicationList:navigateApplicationList,
        changeAppState: changeAppState,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ReimbursementDetail);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F3F3'
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
    detailView: {
        padding: ScreenUtil.scaleSize(20),
        backgroundColor: '#F9F9F9',
        margin: 2,
        marginTop: ScreenUtil.scaleSize(20),
        borderRadius: ScreenUtil.scaleSize(8),

        shadowOffset: {width: 0, height: 1},
        shadowColor: 'rgba(0,0,0,0.3)',
        shadowOpacity: 1,
        shadowRadius: 2,
        elevation: 2,
    },
    detailLabel: {
        width: ScreenUtil.scaleSize(210),
        color: '#ABABAB',
        fontSize: ScreenUtil.setSpText(9),
    },
    invoiceDetail: {
        padding: ScreenUtil.scaleSize(20),
        backgroundColor: '#FFFFFF',
        marginTop: ScreenUtil.scaleSize(20),
        borderRadius: ScreenUtil.scaleSize(8),
        borderColor: '#E3E3E3',
        borderWidth: ScreenUtil.scaleSize(1),
    },
    invoiceLabel: {
        width: ScreenUtil.scaleSize(140),
        color: '#ABABAB',
        fontSize: ScreenUtil.setSpText(9),
    },
    dialogBackView: {
        position: 'absolute',
        width: deviceWidth,
        height: deviceHeight,
        backgroundColor: '#000000',
        opacity: 0.45,
        zIndex: 999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialogView: {
        position: 'absolute',
        backgroundColor: '#FFFFFF',
        borderRadius: ScreenUtil.scaleSize(8),
        width: ScreenUtil.scaleSize(590),
        height: ScreenUtil.scaleSize(502),
        zIndex: 1000,
        top: (deviceHeight - ScreenUtil.scaleSize(502)) / 2,
        left: (deviceWidth - ScreenUtil.scaleSize(590)) / 2,
    },
    dialogTitle: {
        height: ScreenUtil.scaleSize(40),
        fontSize: ScreenUtil.setSpText(9),
        color: '#666666',
        alignSelf: 'center',
        marginTop: ScreenUtil.scaleSize(40),
    },
    dialogInput: {
        width: ScreenUtil.scaleSize(530),
        height: ScreenUtil.scaleSize(238),
        borderRadius: ScreenUtil.scaleSize(8),
        borderColor: '#DEDEDE',
        borderWidth: ScreenUtil.scaleSize(1),
        marginTop: ScreenUtil.scaleSize(20),
        marginHorizontal: ScreenUtil.scaleSize(30),
        fontSize: ScreenUtil.setSpText(9),
        textAlign: 'left',
        color: '#666666',
        textAlignVertical: 'top',
        paddingHorizontal: ScreenUtil.scaleSize(30),
        paddingVertical: ScreenUtil.scaleSize(20),
    },
    dialogButton: {
        height: ScreenUtil.scaleSize(112),
        flexDirection: 'row',
        alignItems: 'center',
    },
    emailDialogView: {
        backgroundColor: '#FFFFFF',
        borderRadius: ScreenUtil.scaleSize(8),
        width: ScreenUtil.scaleSize(590),
        height: ScreenUtil.scaleSize(374),
        zIndex: 1000,
    },
    emailDialogInput: {
        width: ScreenUtil.scaleSize(470),
        height: ScreenUtil.scaleSize(68),
        borderRadius: ScreenUtil.scaleSize(6),
        borderColor: '#DEDEDE',
        borderWidth: ScreenUtil.scaleSize(1),
        marginTop: ScreenUtil.scaleSize(20),
        marginHorizontal: ScreenUtil.scaleSize(60),
        fontSize: ScreenUtil.setSpText(9),
        textAlign: 'left',
        color: '#666666',
        textAlignVertical: 'center',
        paddingHorizontal: ScreenUtil.scaleSize(30),
        paddingVertical: 0,
    },
});