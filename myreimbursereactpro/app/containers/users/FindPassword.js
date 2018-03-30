/**
 * 找回密码
 * Created by sky.qian on 10/30/2017.
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
	TextInput
} from 'react-native';

import Message from '../../constant/Message';
import ScreenUtil from '../../utils/ScreenUtil';
import {changeState,getValidationCode,createNewPasswordAction,findPasswordInit} from '../../redux/actions/users/FindPassword';
import Util from '../../utils/Util';
import Dialog from '../../containers/common/Dialog';
import CommonLoading from '../../containers/common/CommonLoading';
import {back} from '../../redux/actions/navigator/Navigator';
import Header from "./../common/CommonHeader";
import {CustomStyles} from '../../css/CustomStyles';
import SafeAreaView from "react-native-safe-area-view";

class FindPassword extends Component {

	static navigationOptions = ({navigation}) => ({
		header: null,
	})

	/**
	 * 进入页面时，清空页面
	 */
	componentWillMount() {
		this.props.findPasswordInit();
	}

	/**
	 * 离开页面时，验证码倒计时初始化
	 */
	componentWillUnmount(){
		this._clearCountTime();
	}

	/**
	 * 检查提交数据
	 */
	checkData() {
		const dismissKeyboard = require('dismissKeyboard');
		dismissKeyboard();
		if(Util.checkIsEmptyString(this.props.state.findPasswordPhone) &&
			Util.checkIsEmptyString(this.props.state.findPasswordVerificationCode)) {
			this.props.changeState({
				showDialog1: true,
			})
		}
		else if(Util.checkIsEmptyString(this.props.state.findPasswordPhone) &&
			!Util.checkIsEmptyString(this.props.state.findPasswordVerificationCode)){
			this.props.changeState({
				showDialog2: true,
			})
		}else if(!Util.checkIsEmptyString(this.props.state.findPasswordPhone) &&
			Util.checkIsEmptyString(this.props.state.findPasswordVerificationCode)){
			this.props.changeState({
				showDialog3: true,
			})
		}
			else {
				this.props.createNewPasswordAction(
				 	{
				 		phoneNumber : this.props.state.findPasswordPhone,
				 		verificationCode : this.props.state.findPasswordVerificationCode,
						timeCount : this.props.state.timeCount
				 	},
				 );
		}
	}

	/**
	 * 发送验证码，检查手机号格式
	 */
	sendValidationCode() {
        var that = this;
		if(Util.checkPhone(that.props.state.findPasswordPhone)) {
            that.props.getValidationCode(
            	{
				phoneNumber: that.props.state.findPasswordPhone,
				mark:"2"
				},
                function(data){
				    if(data){
                        //倒计时结束前不可点击
                        if (that.props.state.timeFlag) {
                        	that.props.changeState({
								timeFlag: false
							});
                        } else {
                            return;
                        }
                        //发送验证码按钮显示倒计时
                        that._onCountTime();
                    }
                }
            )


		} else {
			Util.showToast(Message.REGISTER_INVALID_PHONE);
		}
	}

	/**
	 * 发送验证码按钮,显示倒计时
	 * @private
	 */
	_onCountTime() {
		var that = this;
		const now = Date.now()
		const overTimeStamp = now + 60 * 1000 + 100/*过期时间戳（毫秒） +100 毫秒容错*/

		//设置定时器，倒数60秒
		that.interval = setInterval(() => {
			const nowStamp = Date.now();
			if(nowStamp>=overTimeStamp){
				that._clearCountTime();
				that.props.changeState({
					text: Message.GET_AGAIN,
				});
			}else{
				const leftTime = parseInt((overTimeStamp - nowStamp)/1000, 10);
				that.props.changeState({
					timeCount: leftTime,
					text: '(' + leftTime + 's)',
					btnDisable: true,
				});
			}
		}, 1000)
	}

	/**
	 * 清除验证码按钮的倒计时
	 * @private
	 */
	_clearCountTime() {
		this.interval && clearInterval(this.interval);

		this.props.changeState({
			timeCount: 60,
			text:  Message.GET_VERIFICATION_CODE,
			btnDisable: false,
			timeFlag: true,
		});
	}

	/**
	 * 关闭弹窗1
	 * @param component 当前component
	 */
	_closeModal1(component) {
		component.props.changeState({
			showDialog1: false,
		})
	}

	/**
	 * 关闭弹窗2
	 * @param component 当前component
	 */
	_closeModal2(component) {
		component.props.changeState({
			showDialog2: false,
		})
	}

	/**
	 * 关闭弹窗3
	 * @param component 当前component
	 */
	_closeModal3(component) {
		component.props.changeState({
			showDialog3: false,
		})
	}

	/**
	 * 返回
	 * @param component 当前组件
	 */
	onBack(component) {
		component.props.back();
	}

	//验证码样式
	_choose_ver_code_style(){
		if(Util.checkIsEmptyString(this.props.state.findPasswordPhone)){
			return styles.sendExTxt1}
		else{
			return styles.sendExTxt2
		}
	}

	//验证码外框样式
	_choose_code_View1_style(){
		if(Util.checkIsEmptyString(this.props.state.findPasswordPhone)){
			if(!this.props.state.btnDisable)
			{
				this.props.changeState({
					btnDisable: true,
				});
			}
			return styles.codeView1;
		}
		else if(!this.props.state.timeFlag){
			if(!this.props.state.btnDisable)
			{
				this.props.changeState({
					btnDisable: true,
				});
			}
			return styles.codeView2;
		}
		else{
			if(this.props.state.btnDisable){
				this.props.changeState({
					btnDisable: false,
				});}
			return styles.codeView2;
		}
	}

	render() {
		const dismissKeyboard = require('dismissKeyboard');
		return(
			<SafeAreaView style={styles.container}>
				<TouchableWithoutFeedback onPress={dismissKeyboard}>
					<View style={styles.container}>
						<Header
							titleText={Message.FIND_PASSWORD}
							thisComponent={this}
							backClick={this.onBack}
						/>
						<Dialog
							content={Message.FIND_PASSWORD_CHECK_EMPTY_DATA_MESSAGE}
							type={'alert'}
							alertBtnText={Message.CONFIRM}
							modalVisible={this.props.state.showDialog1}
							alertBtnStyle={{color: '#FFAA00',}}
							onClose={this._closeModal1}
							alertBtnClick={this._closeModal1}
							thisComponent={this}
						/>
						<Dialog
							content={Message.FIND_PASSWORD_CHECK_PHONE_NUMBER}
							type={'alert'}
							alertBtnText={Message.CONFIRM}
							modalVisible={this.props.state.showDialog2}
							alertBtnStyle={{color: '#FFAA00',}}
							onClose={this._closeModal2}
							alertBtnClick={this._closeModal2}
							thisComponent={this}
						/>
						<Dialog
							content={Message.FIND_PASSWORD_CHECK_CODE_NUMBER}
							type={'alert'}
							alertBtnText={Message.CONFIRM}
							modalVisible={this.props.state.showDialog3}
							alertBtnStyle={{color: '#FFAA00',}}
							onClose={this._closeModal3}
							alertBtnClick={this._closeModal3}
							thisComponent={this}
						/>
						<CommonLoading isShow={this.props.state.isLoading}/>
						<View style={{paddingHorizontal: ScreenUtil.scaleSize(30)}}>
							<View style={styles.inputRow}>
								<Text style={styles.inputLabel}>{Message.REGISTER_PHONE_NO}</Text>
								<TextInput
									style={styles.inputText}
									placeholder={Message.REGISTER_INPUT_PHONE}
									maxLength={11}
									placeholderTextColor="#ABABAB"
									underlineColorAndroid="transparent"
									ref="phone"
									selectionColor="#FFAA00"
									keyboardType="numeric"
									value={this.props.state.findPasswordPhone}
									onChangeText={(text) => {this.props.changeState({findPasswordPhone: text})}}
									returnKeyType={'done'}/>
							</View>
							<View style={CustomStyles.separatorLine}/>
							<View style={styles.inputRow}>
								<Text style={styles.inputLabel}>{Message.REGISTER_VERIFICATION_CODE}</Text>
								<TextInput
									style={styles.inputText}
									placeholder={Message.REGISTER_INPUT_VERIFICATION_CODE}
									maxLength={6}
									placeholderTextColor="#ABABAB"
									underlineColorAndroid="transparent"
									ref="code"
									selectionColor="#FFAA00"
									keyboardType="numeric"
									value={this.props.state.findPasswordVerificationCode}
									onChangeText={(text) => {this.props.changeState({findPasswordVerificationCode: text})}}
									returnKeyType={'done'}/>
								<TouchableOpacity disabled={this.props.state.btnDisable} onPress={() => {
									this.sendValidationCode();
								}}>
									<View style={this._choose_code_View1_style()}>
										<Text style={this._choose_ver_code_style()}>{this.props.state.text}</Text>
									</View>
								</TouchableOpacity>
							</View>
							<View style={CustomStyles.separatorLine}/>
						</View>
						<TouchableOpacity
							style={{
								marginTop: ScreenUtil.scaleSize(180),
							}}
							onPress={() => {
								this.checkData();
							}}>
							<Image source={require('../../img/common/next.png')}
								style={{
									height: ScreenUtil.scaleSize(75),
									width: ScreenUtil.scaleSize(550),
									resizeMode: 'stretch',
									alignSelf: 'center',
								}}/>
						</TouchableOpacity>
					</View>
				</TouchableWithoutFeedback>
			</SafeAreaView>
		)
	}
}

function mapStateToProps(state) {
	return {
		state: state.FindPassword,
	}
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({
		changeState: changeState,
		back:back,
		createNewPasswordAction: createNewPasswordAction,
		getValidationCode : getValidationCode,
		findPasswordInit : findPasswordInit
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(FindPassword);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	inputRow: {
		height: ScreenUtil.scaleSize(80),
		flexDirection: 'row',
		alignItems: 'center',
	},
	inputLabel: {
		color: '#666666',
		fontSize: ScreenUtil.setSpText(9),
		width: ScreenUtil.scaleSize(110)
	},
	inputText: {
		marginLeft: ScreenUtil.scaleSize(128),
		fontSize: ScreenUtil.setSpText(9),
		padding: 0,
		flex: 1,
	},
	codeView1: {
		borderRadius: ScreenUtil.scaleSize(5),
		height: ScreenUtil.scaleSize(53),
		width: ScreenUtil.scaleSize(142),
		borderWidth: ScreenUtil.scaleSize(1),
		borderColor: '#ABABAB',
		justifyContent: 'center',
		alignItems: 'center',
	},
	codeView2: {
		borderRadius: ScreenUtil.scaleSize(5),
		height: ScreenUtil.scaleSize(53),
		width: ScreenUtil.scaleSize(142),
		borderWidth: ScreenUtil.scaleSize(1),
		borderColor: '#FFAA00',
		justifyContent: 'center',
		alignItems: 'center',
	},
	sendExTxt1: {
		color: '#ABABAB',
		textAlign: 'center',
		fontSize: ScreenUtil.scaleSize(20),
	},
	sendExTxt2: {
		color: '#FFAA00',
		textAlign: 'center',
		fontSize: ScreenUtil.scaleSize(20),
	},
});