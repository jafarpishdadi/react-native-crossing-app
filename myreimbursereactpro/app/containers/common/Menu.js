/**
 * 选择新建报销单、差旅单、借款单
 * Created by sky.qian on 2/1/2018.
 */
import React, { Component } from 'react';
import {
	View,
	Text,
	findNodeHandle,
	StyleSheet,
	Modal,
	Image,
	TouchableOpacity,
	Animated,
	TouchableWithoutFeedback,
} from 'react-native';
//import { BlurView } from 'react-native-blur';
import ScreenUtil, {deviceHeight, deviceWidth} from '../../utils/ScreenUtil';
import PropTypes from 'prop-types';
import Message from "../../constant/Message";

export default class Menu extends Component {

	static propTypes = {
		gotoNewReimbursement: PropTypes.func,   // 跳转到新建报销单页面
		navigateNewLoanOrder: PropTypes.func,   // 跳转到新建借款单页面
		navigateNewTravelApply: PropTypes.func,   // 跳转到新建差旅申请单页面
	};

	constructor(props) {
		super(props);
		this.state = {
			viewRef: null,
			isShow: false,
			reimbursementBottom: new Animated.Value(ScreenUtil.scaleSize(-150)),
			loanBottom: new Animated.Value(ScreenUtil.scaleSize(-150)),
			travelBottom: new Animated.Value(ScreenUtil.scaleSize(-150)),
		};
	}

	/*componentDidMount() {
		this.setState({ viewRef: findNodeHandle(this.backgroundImage) });
	}*/

	close = function() {
		Animated.parallel([
			Animated.timing(
				this.state.reimbursementBottom,
				{
					toValue: ScreenUtil.scaleSize(-150),
					duration: 200,
					delay: 0
				}
			),
			Animated.timing(
				this.state.loanBottom,
				{
					toValue: ScreenUtil.scaleSize(-150),
					duration: 200,
				}
			),
			Animated.timing(
				this.state.travelBottom,
				{
					toValue: ScreenUtil.scaleSize(-150),
					duration: 200,
				}
			)
		]).start(() => {
			this.setState({
				isShow: false,
			})
		})
	}

	open =  function() {
		this.setState({
			isShow: true,
		})
		Animated.parallel([
			Animated.timing(
				this.state.reimbursementBottom,
				{
					toValue: ScreenUtil.scaleSize(300),
					duration: 200,
					delay: 0
				}
			),
			Animated.timing(
				this.state.loanBottom,
				{
					toValue: ScreenUtil.scaleSize(300),
					duration: 200,
					delay: 40,
				}
			),
			Animated.timing(
				this.state.travelBottom,
				{
					toValue: ScreenUtil.scaleSize(300),
					duration: 200,
					delay: 80,
				}
			)
		]).start()
	}

	render() {
		return (
			<Modal
				animationType={"none"}
				//transparent={true}
				visible={this.state.isShow}
			>
				<View
					style={styles.container}
					//ref={(img) => {this.backgroundImage = img}}
				/>
				<Animated.View style={{
					width: ScreenUtil.scaleSize(200),
					alignItems: 'center',
					position: 'absolute',
					bottom: this.state.reimbursementBottom,
					left: ScreenUtil.scaleSize(30),
				}}>
					<TouchableWithoutFeedback onPress={() => {
						this.close();
						this.props.gotoNewReimbursement();
					}}>
						<Image source={require('../../img/mainScreen/reimbursement.png')}
						       style={{
							       width: ScreenUtil.scaleSize(100),
							       height: ScreenUtil.scaleSize(100),
							       resizeMode: 'contain',
						       }}/>
					</TouchableWithoutFeedback>
					<Text style={styles.text}>{Message.REIMBURSEMENT}</Text>
				</Animated.View>
				<Animated.View style={{
					width: ScreenUtil.scaleSize(200),
					alignItems: 'center',
					position: 'absolute',
					bottom: this.state.loanBottom,
					left: ScreenUtil.scaleSize(275),
				}}>
					<TouchableWithoutFeedback onPress={() => {
						this.close();
						this.props.navigateNewLoanOrder();
					}}>
						<Image source={require('../../img/mainScreen/loan.png')}
						       style={{
							       width: ScreenUtil.scaleSize(100),
							       height: ScreenUtil.scaleSize(100),
							       resizeMode: 'contain',
						       }}/>
					</TouchableWithoutFeedback>
					<Text style={styles.text}>{Message.LOAN}</Text>
				</Animated.View>
				<Animated.View style={{
					width: ScreenUtil.scaleSize(200),
					alignItems: 'center',
					position: 'absolute',
					bottom: this.state.travelBottom,
					right: ScreenUtil.scaleSize(30),
				}}>
					<TouchableWithoutFeedback onPress={() => {
						this.close();
						this.props.navigateNewTravelApply();
					}}>
						<Image source={require('../../img/mainScreen/travel.png')}
						       style={{
							       width: ScreenUtil.scaleSize(100),
							       height: ScreenUtil.scaleSize(100),
							       resizeMode: 'contain',
						       }}/>
					</TouchableWithoutFeedback>
					<Text style={styles.text}>{Message.TRAVEL_REIMBURSEMENT}</Text>
				</Animated.View>
				<TouchableOpacity style={{
					width: ScreenUtil.scaleSize(96),
					height: ScreenUtil.scaleSize(96),
					position: 'absolute',
					left: (deviceWidth - ScreenUtil.scaleSize(96)) / 2,
					bottom: 0,
					justifyContent: 'center',
					alignItems: 'center',
				}} onPress={() => {
					this.close();
				}}>
					<Image source={require('../../img/mainScreen/close.png')}
					       style={{
						       width: ScreenUtil.scaleSize(36),
						       height: ScreenUtil.scaleSize(36),
						       resizeMode: 'contain',
					       }}/>
				</TouchableOpacity>
			</Modal>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		height: deviceHeight,
		width: deviceWidth,
		top: 0,
		left: 0,
	},
	absolute: {
		position: "absolute",
		top: 0, left: 0, bottom: 0, right: 0,
	},
	text: {
		color: '#666666',
		fontSize: ScreenUtil.setSpText(8),
		marginTop: ScreenUtil.scaleSize(20),
	}
});