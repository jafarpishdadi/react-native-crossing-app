/**
 * Created by sky.qian on 11/8/2017.
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

export default class BackDialog extends React.Component {
	static propTypes = {
		backgroundClick: PropTypes.func,   // 阴影部分点击事件
		thisComponent: PropTypes.object,    // 当前Component
		isShow: PropTypes.bool, //是否显示
		top: PropTypes.number,     //向下偏移量
	};

	//参数默认值
	static defaultProps = {
		isShow: false,
		top: 0,
	};

	//阴影部分点击事件
	_backgroundClick() {
		if (this.props.backgroundClick) {
			this.props.backgroundClick(this.props.thisComponent);
		}
	}

	render() {
		return this.props.isShow ? (
			<TouchableWithoutFeedback style={{
				zIndex: 999,
			}} onPress={this._backgroundClick.bind(this)}>
				<View style={{
					position: 'absolute',
					width: deviceWidth,
					height: deviceHeight,
					zIndex: 999,
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: '#000000',
					opacity: 0.45,
					top: this.props.top,
					elevation: 4,
				}} />
			</TouchableWithoutFeedback>
		) : (
			null
		)
	}
}