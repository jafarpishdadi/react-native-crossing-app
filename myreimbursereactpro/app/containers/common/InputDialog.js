/**
 * Created by sky.qian on 11/6/2017.
 */
import React, {Component} from "react";
import PropTypes from 'prop-types';
import {
	View,
	Text,
	Image,
	StyleSheet,
	StatusBar,
	Platform,
	TouchableOpacity,
	TouchableWithoutFeedback,
	Animated,
	TextInput,

} from "react-native";
import ScreenUtil, {deviceHeight, deviceWidth} from "../../utils/ScreenUtil";
import Message from '../../constant/Message';

export default class InputDialog extends React.Component {
	static propTypes = {
		backgroundClick: PropTypes.func,   // 阴影部分点击事件
		titleText: PropTypes.string,  // 标题名
		inputWidth: PropTypes.number,   //输入框宽度
		inputHeight: PropTypes.number,  //输入框高度
		thisComponent: PropTypes.object,    // 当前Component
		maxLength: PropTypes.number,   //最多输入字数
		placeholder: PropTypes.string,  // 输入框提示信息
		multiline: PropTypes.bool, //是否多行显示
		onChangeText: PropTypes.func,   // 文本内容改变
		onBlur: PropTypes.func,   // 文本失去焦点
		onFocus: PropTypes.func,   // 文本获得焦点
		returnKeyType: PropTypes.string,    //键盘返回类型
		leftButtonText: PropTypes.string,  // 左按钮内容
		rightButtonText: PropTypes.string,  //右按钮内容
		leftClick: PropTypes.func,  //左按钮点击事件
		rightClick: PropTypes.func, //右按钮点击事件
		showDialogOpen: PropTypes.bool,//是否显示对话框
		isShow: PropTypes.bool, //是否显示
		width: PropTypes.number,   //对话框宽度
		height: PropTypes.number,   //对话框高度
		top: PropTypes.number,   //对话框垂直位置
		textAlignVertical: PropTypes.string,  //文字垂直布局
		autoGrow: PropTypes.bool, //自动换行
		defaultValue: PropTypes.string,  //内容
	};

	//参数默认值
	static defaultProps = {
		maxLength: 30,
		multiline: false,
		isShow: false,
		showDialogOpen: false,
		textAlignVertical: 'top',
		autoGrow: false,
	};

	//阴影部分点击事件
	_backgroundClick() {
		var that = this;
		setTimeout(() => {
			if (that.props.backgroundClick) {
				that.props.backgroundClick(that.props.thisComponent);
			}
		}, 200)

		if (this.refs.input) {
			this.refs.input.blur();
		}
	}

	//文本内容改变
	_onChangeText(text) {
		if (this.props.onChangeText) {
			this.props.onChangeText(this.props.thisComponent, text);
		}
	}

	//文本失去焦点
	_onBlur() {
		if (this.props.onBlur) {
			this.props.onBlur(this.props.thisComponent);
		}
	}

	//文本获得焦点
	_onFocus() {
		if (this.props.onFocus) {
			this.props.onFocus(this.props.thisComponent);
		}
	}

	//左按钮点击事件
	_leftClick() {
		if (this.props.onBlur) {
			this.props.onBlur(this.props.thisComponent);
		}    //修复ios对话框不回到原来位置
		var that = this;
		setTimeout(() => {
			if (that.props.leftClick) {
				that.props.leftClick(that.props.thisComponent);
			}
			that._backgroundClick();
		}, 300);
	}

	//右按钮点击事件
	_rightClick() {
		if (this.props.onBlur) {
			this.props.onBlur(this.props.thisComponent);
		}    //修复ios对话框不回到原来位置
		var that = this;
		setTimeout(() => {
			if (!that.props.showDialogOpen) {
				if (that.props.rightClick) {
					that.props.rightClick(that.props.thisComponent);
				}
				that._backgroundClick();
			} else {
				that.props.rightClick(that.props.thisComponent);
			}
		}, 300);
	}

	render() {
		return this.props.isShow ? (
			<View style={{
				position: 'absolute',
				width: deviceWidth,
				height: deviceHeight,
				zIndex: 999,
				justifyContent: 'center',
				alignItems: 'center',
				elevation: 4,
			}}>
				<TouchableWithoutFeedback onPress={this._backgroundClick.bind(this)}>
					<View style={styles.dialogBackView} />
				</TouchableWithoutFeedback>
				<Animated.View style={[styles.dialogView, {
					top: this.props.top ? this.props.top : new Animated.Value((deviceHeight - ScreenUtil.scaleSize(this.props.height)) / 2),
					left: (deviceWidth - ScreenUtil.scaleSize(this.props.width)) / 2,
					width: ScreenUtil.scaleSize(this.props.width),
					//height: ScreenUtil.scaleSize(this.props.height),
				}]}>
					<Text style={styles.dialogTitle}>{this.props.titleText}</Text>
					<TextInput
						style={[styles.dialogInput, {
							width: ScreenUtil.scaleSize(this.props.inputWidth),
							//height: ScreenUtil.scaleSize(this.props.inputHeight),
							textAlignVertical: this.props.textAlignVertical,
						}]}
						defaultValue={this.props.defaultValue}
						placeholder={this.props.placeholder}
						maxLength={this.props.maxLength}
						minHeight={ScreenUtil.scaleSize(this.props.inputHeight)}
						maxHeight={ScreenUtil.scaleSize(333)}
						multiline={this.props.multiline}
						autoGrow={this.props.autoGrow}
						placeholderTextColor="#ABABAB"
						underlineColorAndroid="transparent"
						selectionColor="#FFAA00"
						onChangeText={(text) => {
							this._onChangeText(text)
						}}
						//returnKeyType={this.props.returnKeyType}
					    onFocus={this._onFocus.bind(this)}
					    onBlur={this._onBlur.bind(this)}
					    ref={'input'}
					/>
					<View style={{
						width: ScreenUtil.scaleSize(590),
						height: ScreenUtil.scaleSize(2),
						backgroundColor: '#DEDEDE',
						marginTop: ScreenUtil.scaleSize(50),
					}}/>
					<View style={styles.dialogButton}>
						<TouchableOpacity onPress={this._leftClick.bind(this)}>
							<View style={{
								width: ScreenUtil.scaleSize(294),
								height: ScreenUtil.scaleSize(112),
								justifyContent: 'center',
								alignItems: 'center',
							}}>
								<Text style={{
									fontSize: ScreenUtil.setSpText(9),
									color: '#ABABAB',
								}}>{this.props.leftButtonText}</Text>
							</View>
						</TouchableOpacity>
						<View style={{
							width: ScreenUtil.scaleSize(2),
							height: ScreenUtil.scaleSize(60),
							backgroundColor: '#DEDEDE',
						}}/>
						<TouchableOpacity onPress={this._rightClick.bind(this)}>
							<View style={{
								width: ScreenUtil.scaleSize(294),
								height: ScreenUtil.scaleSize(112),
								justifyContent: 'center',
								alignItems: 'center',
							}}>
								<Text style={{
									fontSize: ScreenUtil.setSpText(9),
									color: '#FFAA00',
								}}>{this.props.rightButtonText}</Text>
							</View>
						</TouchableOpacity>
					</View>
				</Animated.View>
			</View>
		) : (
			null
		)
	}
}

const styles = StyleSheet.create({
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
		zIndex: 1000,
	},
	dialogInput: {
		borderRadius: ScreenUtil.scaleSize(8),
		borderColor: '#DEDEDE',
		borderWidth: ScreenUtil.scaleSize(1),
		marginTop: ScreenUtil.scaleSize(20),
		alignSelf: 'center',
		fontSize: ScreenUtil.setSpText(9),
		textAlign: 'left',
		color: '#666666',
		textAlignVertical: 'top',
		paddingHorizontal: ScreenUtil.scaleSize(30),
		paddingVertical: ScreenUtil.scaleSize(0),
	},
	dialogButton: {
		height: ScreenUtil.scaleSize(112),
		flexDirection: 'row',
		alignItems: 'center',
	},
	dialogTitle: {
		height: ScreenUtil.scaleSize(40),
		fontSize: ScreenUtil.setSpText(9),
		color: '#666666',
		alignSelf: 'center',
		marginTop: ScreenUtil.scaleSize(40),
	},
});