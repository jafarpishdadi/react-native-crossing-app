/**
 * Created by sky.qian on 11/17/2017.
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
	ActivityIndicator,
} from "react-native";
import ScreenUtil, {deviceHeight, deviceWidth} from "../../utils/ScreenUtil";
import Message from '../../constant/Message';

export default class CommonLoading extends React.Component {
	static propTypes = {
		size: PropTypes.string,    //指示器尺寸
		isShow: PropTypes.bool,    //是否显示
	};

	//参数默认值
	static defaultProps = {
		size: 'large',
	};

	render() {
		return this.props.isShow ? (
			<View style={{
				position: 'absolute',
				width: deviceWidth,
				height: deviceHeight,
				zIndex: 999,
				justifyContent: 'center',
				alignItems: 'center',
			}}>
				<View style={styles.backView} />
				<View style={{
					width: ScreenUtil.scaleSize(300),
					height: ScreenUtil.scaleSize(300),
					backgroundColor: '#000000',
					opacity: 0.85,
					borderRadius: ScreenUtil.scaleSize(12),
					justifyContent: 'center',
					alignItems: 'center',
					zIndex: 1000,
				}}>
					<ActivityIndicator
						animating={true}
						color="white"
						size={this.props.size} />
					<Text style={{
						fontSize: ScreenUtil.setSpText(9),
						marginTop: ScreenUtil.scaleSize(20),
						color: 'white',
					}}>{Message.LOADING}</Text>
				</View>
			</View>
		) : (
			null
		)
	}
}

const styles = StyleSheet.create({
	backView: {
		position: 'absolute',
		width: deviceWidth,
		height: deviceHeight,
		backgroundColor: 'transparent',
		zIndex: 999,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
