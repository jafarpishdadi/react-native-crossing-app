/**
 * 借款单详情页面
 * Created by jack.fan on 22/1/2018.
 */

import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TextInput,
    Image,
    FlatList,
    TouchableOpacity,
    NativeModules,
    Animated,
    Platform,
} from "react-native";
import {back, navigateReimbursementReply,} from "../../redux/actions/navigator/Navigator";
import {changeState, initData, operateCancel, sendEmail, loadData, operateApproval, addComment, editLoanDetail} from "../../redux/actions/loan/LoanOrderDetail";
import ScreenUtil, {deviceHeight, deviceWidth} from "../../utils/ScreenUtil";
import Header from "../../containers/common/CommonHeader";
import Message from "../../constant/Message";
import API from "../../utils/API";
import CommonLoading from "../../containers/common/CommonLoading";
import Util from "../../utils/Util";
import InputDialog from "../../containers/common/InputDialog";
import Dialog from "./../common/Dialog";
import Store from "react-native-simple-store";

var PreviewModule = NativeModules.PreviewModule;

class LoanOrderDetail extends Component {
    static navigationOptions = ({navigation}) => ({
        header: null
    });

    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        //物理返回键关闭弹窗
        component.props.changeState({
            //showRejectDialog: false,
            //showCommentDialog: false,
            //showEmailDialog: false,
        })
        component.props.back();
    }

    componentWillMount() {
        this.props.initData();
    }

    componentDidMount() {
/*        const that = this;
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
        })*/
/*        this.props.loadData(this.props.navigation.state.params.formId)*/
        this.props.loadData("1001");
    }

    /**
     * 获取借款单状态
     * @param code 借款单code
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
                    <Text style={[styles.text, {marginLeft: ScreenUtil.scaleSize(30)}]}>{item.userName}</Text>
                    <Text style={{
                        color: color,
                        fontSize: ScreenUtil.setSpText(9),
                        marginLeft: ScreenUtil.scaleSize(30),
                        flex: 1,
                    }}>{operate}</Text>
                    {
                        (1 < 2) ? (
                            <TouchableOpacity onPress={() => {
                                this.openCommentDialog(item)
                            }}>
                                <Text style={{
                                    color: 'orange',
                                    fontSize: ScreenUtil.setSpText(9),
                                }}>评论</Text>
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
     * 打开评论对话框
     */
    openCommentDialog(item) {
        this.props.changeState({
            showCommentDialog: true,
            currentCommentItem: item,
            commentContent: ''  //打开评论对话框前，清空评论内容
        })
    }

    renderApplicationDate (date) {
        if (date === '' || date === null) {
            return '';
        } else {
            return date.substring(0,16);
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
                                //marginBottom: ScreenUtil.scaleSize(index + 1 == commentList.length ? 40 : 0),
                            }}>
                                <View style={{flexDirection: 'row'}}>
                                    <Text style={{
                                        width: ScreenUtil.scaleSize(85),
                                        fontSize: ScreenUtil.setSpText(7),
                                        color: '#666666',
                                        marginLeft: ScreenUtil.scaleSize(50),
                                    }}>{item.userName + ':'}</Text>
                                    <Text style={{
                                        flex: 1,
                                        width: ScreenUtil.scaleSize(272),
                                        fontSize: ScreenUtil.setSpText(7),
                                        color: '#666666',
                                        marginRight: ScreenUtil.scaleSize(40),
                                    }}>{item.comment}</Text>
                                    {
                                        (1 < 2) ? (
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
                            }}>
                                <Text style={{
                                    width: ScreenUtil.scaleSize(85),
                                    fontSize: ScreenUtil.setSpText(7),
                                    color: '#666666',
                                    marginLeft: ScreenUtil.scaleSize(50),
                                }}>{operateUserName + ':'}</Text>
                                <Text style={{
                                    flex: 1,
                                    width: ScreenUtil.scaleSize(272),
                                    fontSize: ScreenUtil.setSpText(7),
                                    color: '#666666',
                                    marginRight: ScreenUtil.scaleSize(40),
                                }}>{operateComment}</Text>
                                <Text style={{
                                    width: ScreenUtil.scaleSize(260),
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
     * 渲染评论图片
     * @param fileList 文件列表
     */
    renderCommentImg(fileList) {
        const arr = fileList.filter(item => item.userType == 0);
        if (arr && arr.length > 0) {
            return (
                <View style={{
                    height: ScreenUtil.scaleSize(56),
                    marginLeft: ScreenUtil.scaleSize(109),
                    marginTop: ScreenUtil.scaleSize(10),
                    flexDirection: 'row',
                }}>
                    {
                        arr.map((img) => {
                            return (
                                <TouchableOpacity style={{
                                    marginLeft: ScreenUtil.scaleSize(26),
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
     * 渲染评论或回复按钮
     */
    renderCommentButton(item) {
        if (1 < 2) {
            return (
                <TouchableOpacity onPress={() => {
                    this.gotoReplyPage(item)
                }}>
                    <Text style={{
                        width: ScreenUtil.scaleSize(250),
                        fontSize: ScreenUtil.setSpText(7),
                        color: '#FFAA00',
                    }}>回复</Text>
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
                    }}>评论</Text>
                </TouchableOpacity>
            )
        }

    }

    gotoReplyPage(item) {
        this.props.changeState({
            currentCommentItem: item,
        })
        this.props.navigateReimbursementReply({
            expenseNo: this.props.state.expenseNo,
            taskId: item.taskId,
            toUserId: (1 < 2) ? item.userId : this.props.state.createUserId,
            procinstId: item.procinstId,
            pid: item.pid ? item.id : 'root',
            taskKey: item.taskKey,
        })
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
                    marginLeft: ScreenUtil.scaleSize(135),
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

    /**
     * 关闭评论对话框
     */
    closeCommentDialog() {
        this.props.changeState({
            showCommentDialog: false,
            showCommentTip: false
        })
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
     * 关闭邮箱对话框
     */
    closeEmailDialog() {
        this.props.changeState({
            showEmailDialog: false,
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
                    <TouchableOpacity onPress={this.openAgreeCheckDialog.bind(this)}>
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
     * 打开驳回对话框
     */
    openRejectDialog() {
        this.props.changeState({
            showRejectDialog: true,
        })
    }

    /**
     * 打开同意确认对话框
     */
    openAgreeCheckDialog(){
        this.props.changeState({
            showAgreeDialog: true
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
        component.props.operateApproval({
/*            state: '2',
            expenseNo: component.props.state.expenseNo,
            procinstId: component.props.state.procinstId,
            taskId: component.props.navigation.state.params.taskId,
            taskDefKey: component.props.navigation.state.params.taskDefKey,
            operateComment: component.props.state.operateComment,
            uuidList: component.props.state.invoiceUUIDList,*/
        })
        //清空驳回原因内容
        this.props.changeState({operateComment: ''});
    }

    /**
     * 关闭取消对话框
     */
    _closeAgreeModal() {
        this.props.changeState({
            showAgreeDialog: false,
        });
    }

    //取消撤回
    _cancelClick() {
         this.props.changeState({
             cancelModalVisible: false,
             showAgreeDialog: false,
         })
        // this.props.back();
        //this.props.navigateApplicationList();
    }

    /**
     * 同意
     */
    operateAgree() {
        this.props.operateApproval({
/*            state: '4',
            expenseNo: this.props.state.expenseNo,
            taskId: this.props.navigation.state.params.taskId,
            taskDefKey: this.props.navigation.state.params.taskDefKey,
            procinstId: this.props.state.procinstId,
            uuidList: this.props.state.invoiceUUIDList,*/
        })
    }

    //选择借款单编辑器
    selectEdit(){
/*        if(this.props.state.applyStatus ==1 || this.props.state.applyStatus ==2){
            return this.edit;
        }else{
            return this.edit0;
        }*/
         //Util.showToast("您选择了编辑借款单111");
        return this.edit;
    }

    /**
     * 编辑
     */
    edit(component) {
        component.props.editLoanDetail()
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
     *渲染水印
     */
    renderIcon() {
        let iconImage = '';
        switch (this.props.navigation.state.params.applyStatus) {
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
     * 评论
     */
    addComment(component) {
        const item = component.props.state.currentCommentItem;
        if (Util.checkIsEmptyString(this.props.state.commentContent)) {
            this.props.changeState({showCommentTip: true, commentContent: ''});
            Util.showToast(Message.REIMBURSEMENT_EMPTY_COMMENT_CONTENT);
        } else {
            component.props.addComment({
/*                commentContent: {
                        expenseNo: component.props.state.expenseNo,
                        taskId: item.taskId,
                        toUserId: (component.props.state.currentUserId == component.props.state.createUserId) ? item.userId : component.props.state.createUserId,
                        procinstId: item.procinstId,
                        pid: item.pid ? item.id : 'root',
                        taskKey: item.taskKey,
                        comment: this.props.state.commentContent,
                }*/
            })
            this.props.changeState({showCommentDialog: false});
        }
    }

    render() {
        let rightMessage = null;
        let rightColor = null;
        let rightClick = null;
        if (this.props.navigation.state.params.applyStatus == 4) {
            rightMessage = Message.PRINT;
            rightColor = '#FFAA00';
            rightClick = this.openEmailDialog;
        }
        if (this.props.state.currentUserId == this.props.state.createUserId) {
            if (Util.contains(['0', '1', '2'], this.props.navigation.state.params.applyStatus)) {
                rightMessage = Message.EDIT;
                rightColor = '#ABABAB';
                rightClick = this.selectEdit();
            }
/*            if (this.props.navigation.state.params.applyStatus == 3){
                rightMessage = Message.OPERATE_CANCEL;
                rightColor = '#ABABAB';
                rightClick = this.openCancelDialog;
            }*/
        }

        return (
            <View style={styles.container}>
                <CommonLoading isShow={this.props.state.isLoading}/>
                <Dialog
                    content={Message.LOAN_ORDER_DETAIL_AGREE_CONFIRM}
                    type={'confirm'}
                    leftBtnText={Message.CANCEL}
                    rightBtnText={Message.CONFIRM}
                    modalVisible={this.props.state.showAgreeDialog}
                    leftBtnStyle={{color: '#A5A5A5',}}
                    rightBtnStyle={{color: '#FFAA00',}}
                    onClose={this._closeAgreeModal.bind(this)}
                    leftBtnClick={this._cancelClick.bind(this)}
                    rightBtnClick={this.operateAgree.bind(this)}
                    thisComponent={this}
                />
                <InputDialog isShow={this.props.state.showRejectDialog}
                             backgroundClick={this.closeRejectDialog.bind(this)}
                             titleText={Message.LOAN_ORDER_DETAIL_REJECT_REASON}
                             inputHeight={238}
                             inputWidth={530}
                             thisComponent={this}
                             maxLength={300}
                             placeholder={Message.LOAN_ORDER_DETAIL_REJECT_TEXT_PLACEHOLDER}
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
                             titleText="评论"
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
                             titleText={Message.LOAN_EMAIL_DIALOG_PLACEHOLDER}
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
                             placeholder={Message.LOAN_EMAIL_DIALOG_PLACEHOLDER}
                             returnKeyType={'done'}
                             leftButtonText={Message.CANCEL}
                             rightButtonText={Message.CONFIRM}
                             rightClick={this.sendEmail.bind(this)}
                             width={590}
                             textAlignVertical={'center'}
                             height={332}/>
                <Dialog
                    content={Message.CANCEL_LOAN}
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
                            <Text style={styles.label}>{this.getStatus(this.props.navigation.state.params.applyStatus)}</Text>
                        </View>
                        <View style={{
                            backgroundColor: '#DEDEDE',
                            height: ScreenUtil.scaleSize(2),
                            marginTop: ScreenUtil.scaleSize(20),
                        }}/>
                        <View style={styles.row}>
                            <Text style={styles.label}>{Message.LOAN_DETAIL_ORDER_ID}</Text>
                            <Text style={styles.text}>{this.props.state.applyNo}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>{Message.LOAN_DETAIL_APPLY_TIME}</Text>
                            <Text style={styles.text}>{this.props.state.applyTime}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>{Message.LOAN_DETAIL_AMOUNT}</Text>
                            <Text
                                style={[styles.text, {color: '#FFAA00'}]}>{(this.props.state.applyAmount == ''?'':Message.MONEY + parseFloat(this.props.state.applyAmount).toFixed(2))}</Text>
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
                            }}>{Message.LOAN_DETAIL_DETAIL}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>{Message.LOAN_DETAIL_DEPARTMENT}</Text>
                            <Text style={styles.text}>{this.props.state.department}</Text>
                        </View>
                        <View style={{
                            flexDirection: 'row',
                            marginTop: ScreenUtil.scaleSize(25),
                        }}>
                            <Text style={styles.label}>{Message.LOAN_DETAIL_REASON}</Text>
                            <View style={{
                                width: ScreenUtil.scaleSize(450),
                            }}>
                                <TextInput
                                    editable={false}
                                    multiline={true}
                                    autoGrow={true}
                                    minHeight={ScreenUtil.scaleSize(40)}
                                    maxHeight={ScreenUtil.scaleSize(700)}
                                    value={this.props.state.loanReason}
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
                        <View style={styles.row}>
                            <Text style={styles.label}>{Message.LOAN_DETAIL_AMOUNT}</Text>
                            <Text
                                style={[styles.text, {color: '#FFAA00'}]}>{(this.props.state.applyAmount == ''?'':Message.MONEY + parseFloat(this.props.state.applyAmount).toFixed(2))}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>{Message.LOAN_DETAIL_REMARK}</Text>
                            <Text style={styles.text}>{this.props.state.remark}</Text>
                        </View>
                        <View style={{
                            marginTop: ScreenUtil.scaleSize(20),
                            flexDirection: 'row',}}>
                             <View style={{
                                 height: ScreenUtil.scaleSize(40),
                             }}>
                                 <Text style={styles.label}>{Message.LOAN_DETAIL_ATTACHMENT}</Text>
                            </View>
                            <FlatList
                                data={this.props.state.attachmentList}
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
                    </View>

                    {this.props.navigation.state.params.applyStatus !=4 ?
                        (
                            <View style={{
                                paddingHorizontal: ScreenUtil.scaleSize(30),
                                paddingTop: ScreenUtil.scaleSize(10),
                                marginTop: ScreenUtil.scaleSize(20),
                                backgroundColor: '#FFFFFF',
                            }}>
                                <View style={{
                                    height: ScreenUtil.scaleSize(40),}}>
                                  <Text style={styles.text}>{Message.LOAN_DETAIL_AUDIT}</Text>
                                </View>
                                <FlatList
                                    data={this.props.state.approvalRecordList}
                                    renderItem={({item, index}) => (
                                        this.renderApplication(item, index)
                                    )}
                                />
                             </View> ) :  null }

                    {this.props.navigation.state.params.applyStatus ==4 ?
                        (
                            <View style={styles.tab}>
                                <View style={styles.section}>
                                    <TouchableOpacity
                                        style={{
                                            height: ScreenUtil.scaleSize(50),
                                            width: deviceWidth / 2,
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onPress={() => {
                                            this.props.changeState({
                                                selected: '0',
                                            })
                                        }}>
                                        <Text style={{
                                            fontSize: ScreenUtil.setSpText(9),
                                            color: this.props.state.selected == '0' ? '#FFAA00' : '#666666'}}>
                                            {Message.LOAN_DETAIL_PAY_BACK_RECORD}
                                        </Text>
                                    </TouchableOpacity>
                                    {
                                        this.props.state.selected == '0' ? (
                                            <View style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: (deviceWidth / 2 - ScreenUtil.scaleSize(96)) / 2,
                                                height: ScreenUtil.scaleSize(4),
                                                width: ScreenUtil.scaleSize(96),
                                                backgroundColor: '#FFAA00',
                                            }} />
                                        ) : null
                                    }
                                </View>
                                <View style={styles.section}>
                                    <TouchableOpacity
                                        style={{
                                            height: ScreenUtil.scaleSize(50),
                                            width: deviceWidth / 2,
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onPress={() => {
                                            this.props.changeState({
                                                selected: '1',
                                            })
                                        }}>
                                        <Text style={{
                                            fontSize: ScreenUtil.setSpText(9),
                                            color: this.props.state.selected == '1' ? '#FFAA00' : '#666666'
                                        }}>
                                            {Message.LOAN_DETAIL_AUDIT_FLOW}
                                        </Text>
                                    </TouchableOpacity>
                                    {
                                        this.props.state.selected == '1' ? (
                                            <View style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: (deviceWidth / 2 - ScreenUtil.scaleSize(96)) / 2,
                                                height: ScreenUtil.scaleSize(4),
                                                width: ScreenUtil.scaleSize(96),
                                                backgroundColor: '#FFAA00',
                                            }} />
                                        ) : null
                                    }
                                </View>
                             </View> ) : null }

                    {this.props.navigation.state.params.applyStatus == 4 ?
                       (
                           <View style={{
                                paddingHorizontal: ScreenUtil.scaleSize(30),
                                backgroundColor: '#FFFFFF',}}>
                              <View style={{
                                  backgroundColor: '#DEDEDE',
                                  height: ScreenUtil.scaleSize(1),}}/>
                           </View> ) : null }

                    {this.props.navigation.state.params.applyStatus == 4 ?
                     (
                        <View>
                            {this.props.state.selected == 0 ?
                                (
                                    <View style={{
                                        paddingTop: ScreenUtil.scaleSize(10),
                                        backgroundColor: '#FFFFFF',}}>
                                            <FlatList
                                                data={this.props.state.payBackRecordList}
                                                renderItem={({item, index}) => (
                                                    <View style={styles.payBackRowContainer}>
                                                        <View style={styles.payBackRow}>
                                                            <Text style={styles.label}>{item.payBackDate}</Text>
                                                        </View>
                                                        <View style={styles.payBackRow}>
                                                            <Text style={{
                                                                color: '#FFAA00',
                                                                fontSize: ScreenUtil.setSpText(9),
                                                                flex:1,
                                                                textAlign: 'right',
                                                            }}>{item.payBackAmount}</Text>
                                                        </View>
                                                        <View style={styles.payBackRow}>
                                                            <Text style={{
                                                                color: '#666666',
                                                                fontSize: ScreenUtil.setSpText(9),
                                                            }}>{item.payBackDesc}</Text>
                                                        </View>
                                                        <View style={{
                                                            backgroundColor: '#DEDEDE',
                                                            height: ScreenUtil.scaleSize(1),
                                                            marginTop: ScreenUtil.scaleSize(20),
                                                        }}/>
                                                    </View>
                                                )}
                                            />
                                            <View style={styles.debtAmountStyle}>
                                                <Text Text numberOfLines={1}
                                                      style={[styles.debtAmountText, {maxWidth: 400,}]}>{Message.LOAN_DETAIL_PAY_BACK_REMAIN}</Text>
                                                <Text
                                                    style={styles.debtAmountInput}>{this.props.state.debtAmount}</Text>
                                            </View>
                                </View>  )  :
                                (
                                    <View style={{
                                        paddingHorizontal: ScreenUtil.scaleSize(30),
                                        paddingTop: ScreenUtil.scaleSize(10),
                                        //marginTop: ScreenUtil.scaleSize(20),
                                        backgroundColor: '#FFFFFF',
                                    }}>
                                        <View style={{
                                            height: ScreenUtil.scaleSize(40),
                                        }}>
                                            <Text style={styles.text}>{Message.LOAN_DETAIL_AUDIT}</Text>
                                        </View>
                                        <FlatList
                                            data={this.props.state.approvalRecordList}
                                            renderItem={({item, index}) => (
                                                this.renderApplication(item, index)
                                            )}
                                        />
                                    </View>)}
                        </View> ) : null }
                </ScrollView>
                {this.renderBottom()}
            </View>
        )
    }
}

function mapStateToProps(state) {
    return {
        state: state.LoanOrderDetail,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changeState: changeState,
        back: back,
        navigateReimbursementReply: navigateReimbursementReply,
        initData: initData,
        operateCancel: operateCancel,
        sendEmail: sendEmail,
        loadData: loadData,
        operateApproval: operateApproval,
        addComment: addComment,
        editLoanDetail: editLoanDetail,
    },dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(LoanOrderDetail);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F3F3'
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
    payBackRowContainer: {
        paddingHorizontal: ScreenUtil.scaleSize(30),
        paddingVertical: ScreenUtil.scaleSize(10),
        backgroundColor: '#FFFFFF',
    },
    payBackRow:{
        height: ScreenUtil.scaleSize(24),
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: ScreenUtil.scaleSize(10),
    },
    debtAmountStyle: {
        flexDirection: 'row',
        //width: ScreenUtil.scaleSize(730),
        height: ScreenUtil.scaleSize(120),
        alignItems: 'center',
    },
    debtAmountText:{
        flex: 1,
        color: '#FF8080',
        fontSize: ScreenUtil.setSpText(9),
        paddingHorizontal: ScreenUtil.scaleSize(30),
    },
    debtAmountInput:{
        flex: 1,
        textAlign: 'right',
        color: '#FF8080',
        fontSize: ScreenUtil.setSpText(9),
        paddingHorizontal: ScreenUtil.scaleSize(30),
    },
    tab: {
        marginTop: ScreenUtil.scaleSize(20),
        height: ScreenUtil.scaleSize(58),
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
    },
    section: {
        height: ScreenUtil.scaleSize(58),
        width: deviceWidth / 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
})