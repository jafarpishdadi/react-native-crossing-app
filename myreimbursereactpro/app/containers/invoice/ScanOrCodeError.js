/**
 * Created by sky.qian on 11/23/2017.
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
	FlatList,
	Platform,
} from 'react-native';
import LinearGradien from 'react-native-linear-gradient'

import Message from '../../constant/Message';
import ScreenUtil, {deviceWidth} from '../../utils/ScreenUtil';
import {back} from '../../redux/actions/navigator/Navigator';
import Header from '../../containers/common/CommonHeader';
import CommonLoading from '../../containers/common/CommonLoading';
import SafeAreaView from "react-native-safe-area-view";

class ScanOrCodeError extends Component {
	static navigationOptions = ({navigation}) => ({
		header: null,
	})

	componentDidMount() {
	}


	/**
	 * 返回
	 * @param component 当前组件
	 */
	onBack(component) {
		component.props.back();
	}

	render() {
		return(
			<SafeAreaView style={styles.container}>
				<Header
					titleText={Message.SCAN_MSG_TITLE}
					thisComponent={this}
					backClick={this.onBack}
				/>
				<View style={{
					flex: 1,
					backgroundColor: '#FFFFFF',
					alignItems: 'center',
				}}>
					<LinearGradien colors={['#E6E4E4', '#EEECEC', '#F3F1F1', '#F8F5F5', '#FCFAFA']} style={{
						height: ScreenUtil.scaleSize(4),
						width: deviceWidth,
						zIndex: -1,
						position: 'absolute',
					}}/>
					<Image source={require('../../img/invoice/error.png')}
						style={{
							width: ScreenUtil.scaleSize(140),
							height: ScreenUtil.scaleSize(140),
							marginTop: ScreenUtil.scaleSize(100),
							resizeMode: 'contain'
						}}/>
					<Text style={{
						fontSize: ScreenUtil.setSpText(9),
						color: '#666666',
						marginTop: ScreenUtil.scaleSize(60)
					}}>{Message.SCAN_QR_CODE_ERROR_MSG}</Text>
					<TouchableOpacity onPress={()=>{}}
						style={{
							marginTop: ScreenUtil.scaleSize(180)
						}}>
						<Image source={require('../../img/invoice/collect_next.png')}
							style={{
								width: ScreenUtil.scaleSize(550),
								height: ScreenUtil.scaleSize(75),
								resizeMode: 'stretch',
							}}/>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		)
	}
}

function mapStateToProps(state) {
	return {
	}
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({
		back: back,
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ScanOrCodeError);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white'
	},
});