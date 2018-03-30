/**
 * 回复页
 * Created by sky.qian on 11/6/2017.
 */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
	Text,
	Button,
	View,
	TouchableWithoutFeedback,
	Image,
	TouchableOpacity,
	StyleSheet,
	TextInput,
	NativeModules,
	FlatList,
	Platform,
} from 'react-native';

import Message from '../../constant/Message';
import ScreenUtil, {deviceWidth} from '../../utils/ScreenUtil';
import {back} from '../../redux/actions/navigator/Navigator';
import Header from '../../containers/common/CommonHeader';
import {changeState, addComment, uploadAttachment, initData} from '../../redux/actions/reimbursement/CommentReply';
import Util from '../../utils/Util';
import API from '../../utils/API';
import CommonLoading from "../../containers/common/CommonLoading";
import Store from 'react-native-simple-store';
import {CustomStyles} from '../../css/CustomStyles';

import Dialog from "./../common/Dialog";
const Permissions = require('react-native-permissions');
var OpenFileSystemModule = NativeModules.OpenFileSystem;
var PreviewModule = NativeModules.PreviewModule;
import SafeAreaView from "react-native-safe-area-view";
import InputScrollView from "react-native-input-scroll-view";

class CommentReply extends Component {
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
	}

	/**
	 * 返回
	 * @param component 当前组件
	 */
	onBack(component) {
		component.props.back();
	}

	/**
	 * 发送评论
	 * @param component
	 */
	send(component) {
		const params = component.props.navigation.state.params;
		if(Util.checkIsEmptyString(component.props.state.comment) &&
			component.props.state.attachmentList.length == 0){
			Util.showToast(Message.COMMENT_REPLY_CONTENT_IS_NOT_NULL);
			return;
		}
		component.props.addComment({
			commentContent: {
				billNo: params.expenseNo,
				taskId: params.taskId,
				toUserId: params.toUserId,
				procinstId: params.procinstId,
				pid: params.pid,
				taskKey: params.taskKey,
				comment: component.props.state.comment,
			},
			commentFileTypes: this.props.state.attachmentList
		}, params.templateNo)
	}

	/**
	 * 关闭相机权限弹框
	 */
	onCloseCamera() {
		this.props.changeState({showNoPermissionDialog:false});
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
					quality:0.6,
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
						let type;
						if (Platform.OS != 'ios') {
							type = response.originalType;
						} else {
							type = response.uri.substring(response.uri.lastIndexOf(".") + 1, response.uri.length).toLowerCase()
						}
						if (!Util.contains(['png', 'img', 'jpg', 'bmp'], type)) {
							Util.showToast(Message.NEW_RE_FILE_TYPE);
							return;
						}
						if (response.fileSize > 10 * 1024 * 1000) {
							Util.showToast(Message.NEW_RE_FILE_MAX);
							return;
						}
						const source = {
							uri: response.uri,
							fileName: Platform.OS != 'ios' ? response.originalName : response.fileName,
							fileSize: response.fileSize,
							fileType: response.type,
							userType: 0,
						};
						this.props.uploadAttachment(this.props.state.attachmentList, source);

					}
				});
			});
	}

	/**
	 *
	 * @param 文件item
	 * @returns fileTypeIcon
	 */
	getFileIcon(item) {
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
		return fileTypeIcon;
	}

	/**
	 * 预览文件
	 */
	previewDocument(item){
		this.props.changeState({isLoading:true});
		setTimeout(
			() => {
				PreviewModule.previewDocument(API.DOWNLOAD_ATTACHMENT_BY_DIR, this.props.state.token, JSON.stringify({fileDir : item.fileDir}),item.fileDir,item.fileName,(value)=> {
					this.props.changeState({isLoading:false});
				})
			},
			500
		);

	}

	render() {
		const dismissKeyboard = require('dismissKeyboard');
		const imgArr = this.props.state.attachmentList.filter(item => item.userType == 0);
		const fileArr = this.props.state.attachmentList.filter(item => item.userType == 1);
		return(
			<TouchableWithoutFeedback onPress={dismissKeyboard}>
				<SafeAreaView style={styles.container}>
					<CommonLoading isShow={this.props.state.isLoading}/>
					<Header
						thisComponent={this}
						backClick={this.onBack}
						rightText={Message.SENT}
						rightClick={this.send.bind(this)}
						rightTextStyle={{
							fontSize: ScreenUtil.setSpText(9),
							color: '#FFAA00',
						}}
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
                    <InputScrollView style={styles.sclView} keyboardShouldPersistTaps={'handled'}
                                     keyboardOffset={80}
                                     ref="scroll">
					<TextInput
						style={styles.input}
						placeholder={Message.REIMBURSEMENT_REJECT_TEXT_PLACEHOLDER}
						maxLength={300}
						multiline={true}
						autoGrow={true}
						placeholderTextColor="#ABABAB"
						underlineColorAndroid="transparent"
						selectionColor="#FFAA00"
						onChangeText={(text) => {
							this.props.changeState({
								comment: text
							})
						}}
						returnKeyType={'done'}
					/>
					<View style={{
						backgroundColor: '#FFFFFF',
						marginTop: ScreenUtil.scaleSize(20),
						paddingHorizontal: ScreenUtil.scaleSize(30),
						width: deviceWidth,
					}}>
						<TouchableOpacity onPress={() => {
							dismissKeyboard();
							const arr = this.props.state.attachmentList.filter(item => item.userType == 0);
							if (arr.length < 5) {
                                    this.openImagePicker();
							} else {
								Util.showToast(Message.REIMBURSEMENT_IMG_COUNT)
							}
						}}>
							<View style={styles.row}>
								<Text style={styles.textLabel}>{Message.PICTURE}</Text>
								<Image source={require('../../img/reimbursement/pic.png')}
									style={{
										width: ScreenUtil.scaleSize(40),
										height: ScreenUtil.scaleSize(40),
										resizeMode: 'stretch'
									}}/>
							</View>
						</TouchableOpacity>
						<FlatList
							data={imgArr}
							showsVerticalScrollIndicator={false}
							renderItem={({item, index}) => (
								<View style={{
									flexDirection: 'row',
									height: ScreenUtil.scaleSize(80),
									alignItems: 'center'
								}}>
									<TouchableOpacity style={{
										position: 'absolute',
										top: 0,
										left: 0,
										zIndex: 999,
									}} onPress={() => {
										this.props.changeState({
											attachmentList: this.props.state.attachmentList.filter(file => file.id != item.id),
										})
									}}>
										<Image source={require('../../img/common/delete.png')}
										       style={{
											       width: ScreenUtil.scaleSize(30),
											       height: ScreenUtil.scaleSize(30),
											       resizeMode: 'contain',
										       }}/>
									</TouchableOpacity>
									<TouchableOpacity style={{
										height: ScreenUtil.scaleSize(80),
										flexDirection: 'row',
										alignItems: 'center',
									}} onPress={() => {
										this.previewDocument(item)
									}}>
										<Image source={this.getFileIcon(item)}
										       style={{
											       width: ScreenUtil.scaleSize(58),
											       height: ScreenUtil.scaleSize(66),
											       resizeMode: 'contain',
											       marginLeft: ScreenUtil.scaleSize(15),
										       }}/>
										<View style={{
											height: ScreenUtil.scaleSize(66),
											justifyContent: 'space-between',
											marginLeft: ScreenUtil.scaleSize(20),
										}}>
											<Text style={{
												fontSize: ScreenUtil.setSpText(7),
												color: '#666666',
												width: ScreenUtil.scaleSize(597),
											}} numberOfLines={1}>{item.fileName}</Text>
											<Text style={{
												fontSize: ScreenUtil.setSpText(7),
												color: '#666666',
											}}>{item.fileSize + 'KB'}</Text>
										</View>
									</TouchableOpacity>
								</View>
							)}
						/>
						<View style={CustomStyles.separatorLine}/>
						<TouchableOpacity onPress={() => {
							dismissKeyboard();
							if (Platform.OS != 'ios') {
								const arr = this.props.state.attachmentList.filter(item => item.userType == 1);
								if (arr.length < 3) {
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
											userType: 1,
										};
										this.props.uploadAttachment(this.props.state.attachmentList, source);
									}, (code, msg) => {
										Util.showToast(Message.NEW_RE_GET_FILE_FAIL);
									})
								} else {
									Util.showToast(Message.REIMBURSEMENT_FILE_COUNT)
								}
							}
						}}>
							<View style={styles.row}>
								<Text style={[styles.textLabel, {color: Platform.OS == 'ios' ? '#ABABAB' : '#666666'}]}>{Message.NEW_RE_ATTACHMENT}</Text>
								<Image source={require('../../img/reimbursement/attach.png')}
								       style={{
									       width: ScreenUtil.scaleSize(31),
									       height: ScreenUtil.scaleSize(40),
									       resizeMode: 'stretch'
								       }}/>
							</View>
						</TouchableOpacity>
						<FlatList
							data={fileArr}
							showsVerticalScrollIndicator={false}
							renderItem={({item, index}) => (
								<View style={{
									flexDirection: 'row',
									height: ScreenUtil.scaleSize(80),
									alignItems: 'center',
								}}>
									<TouchableOpacity style={{
										position: 'absolute',
										top: 0,
										left: 0,
										zIndex: 999,
									}} onPress={() => {
										this.props.changeState({
											attachmentList: this.props.state.attachmentList.filter(file => file.id != item.id),
										})
									}}>
										<Image source={require('../../img/common/delete.png')}
										       style={{
											       width: ScreenUtil.scaleSize(30),
											       height: ScreenUtil.scaleSize(30),
											       resizeMode: 'contain',
										       }}/>
									</TouchableOpacity>
									<TouchableOpacity style={{
										height: ScreenUtil.scaleSize(80),
										flexDirection: 'row',
										alignItems: 'center',
									}} onPress={() => {
										this.previewDocument(item)
									}}>
										<Image source={this.getFileIcon(item)}
										       style={{
											       width: ScreenUtil.scaleSize(58),
											       height: ScreenUtil.scaleSize(66),
											       resizeMode: 'contain',
											       marginLeft: ScreenUtil.scaleSize(15),
										       }}/>
										<View style={{
											height: ScreenUtil.scaleSize(66),
											justifyContent: 'space-between',
											marginLeft: ScreenUtil.scaleSize(20),
										}}>
											<Text style={{
												fontSize: ScreenUtil.setSpText(7),
												color: '#666666',
												width: ScreenUtil.scaleSize(597),
											}} numberOfLines={1}>{item.fileName}</Text>
											<Text style={{
												fontSize: ScreenUtil.setSpText(7),
												color: '#666666',
											}}>{item.fileSize + 'KB'}</Text>
										</View>
									</TouchableOpacity>
								</View>
							)}
						/>
					</View>
					</InputScrollView>
				</SafeAreaView>
			</TouchableWithoutFeedback>
		)
	}
}

function mapStateToProps(state) {
	return {
		state: state.CommentReply,
	}
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({
		back: back,
		changeState: changeState,
		addComment: addComment,
		uploadAttachment: uploadAttachment,
		initData: initData,
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CommentReply);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white'
	},
	input: {
		fontSize: ScreenUtil.setSpText(9),
		textAlign: 'left',
		color: '#666666',
		textAlignVertical: 'top',
		paddingHorizontal: ScreenUtil.scaleSize(30),
		paddingVertical: ScreenUtil.scaleSize(20),
		width: deviceWidth,
		height: ScreenUtil.scaleSize(315),
		backgroundColor: '#FFFFFF',
	},
	row: {
		flexDirection: 'row',
		height: ScreenUtil.scaleSize(80),
		alignItems: 'center',
	},
	textLabel: {
		height: ScreenUtil.scaleSize(40),
		textAlignVertical: 'center',
		fontSize: ScreenUtil.setSpText(9),
		color: '#666666',
		flex: 1,
	},
    sclView: {
        //flex: 1,
        backgroundColor: '#F6F6F6',
		marginBottom: ScreenUtil.scaleSize(100),
    },
})
