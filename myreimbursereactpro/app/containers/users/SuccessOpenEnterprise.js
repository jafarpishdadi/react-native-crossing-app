/**
 * Created by richard.ji on 2017/10/31.
 */

import React, {Component} from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Text,
    Platform,
    StyleSheet
} from 'react-native';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {navigateMainScreen, back} from '../../redux/actions/navigator/Navigator';
import {loginAction} from '../../redux/actions/users/Login';
import Header from "./../common/CommonHeader";
import Message from "../../constant/Message";
import {CustomStyles} from '../../css/CustomStyles';
import ScreenUtil from "../../utils/ScreenUtil";
import Store from 'react-native-simple-store';
import Util from "../../utils/Util";

class SuccessOpenEnterprise extends Component {

    static navigationOptions = ({navigation}) => ({
        header: null,
    })

    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        component.props.back();
    }

    PCAddress () {
        const pcAddress = this.props.state.pcAddress;
        return '(' + pcAddress + ')';
    }


    render () {
        const dismissKeyboard = require('dismissKeyboard');
        return (
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={{flex: 1, backgroundColor: '#FFFFFF'}}>

                    <Header
                        titleText={''}
                        thisComponent={this}
                        showBackIcon={false}
                        backClick={this.onBack}
                    />

                    <View style={styles.viewDisplayStyle}>
                        <Image
                            style={styles.successImageStyle}
                            source={require('./../../img/register/success.png')}/>
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.TextDisplayViewStyle}>{Message.SUCCESS_OPEN_ENTERPRISE_TIP}</Text>
                    </View>
                    {Util.checkIsEmptyString(this.props.state.pcAddress) ? <View/> : <View style={styles.textContainer}>
                        <Text style={styles.TextDisplayViewStyle}>{this.PCAddress()}</Text>
                    </View>}
                    <View style={styles.textContainer}>
                        <Text style={styles.TextDisplayViewStyle}>{Message.PC_ADD_EMPLOYEE}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.experienceFunctionStyle}
                        onPress={() => {
                            Store.get('token').then((token) => {
                                if (token != null) {
                                    this.props.navigateToMain()
                                }
                            })
                        }}>
                        <Text style={styles.experienceFunctionLabelStyle}>{Message.EXPERIENCE_FUNCTION}</Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

function mapStateToProps(state) {
    return {
        state:state.SuccessOpenEnterprise
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        back:back,
        doLogin: loginAction,
        navigateToMain: navigateMainScreen,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SuccessOpenEnterprise);

const styles = StyleSheet.create({
    viewDisplayStyle: {
        marginTop: ScreenUtil.scaleSize(100),
        // marginLeft: ScreenUtil.scaleSize(305),
        // marginRight: ScreenUtil.scaleSize(305),
        alignSelf: 'center'
    },
    headSeparatorLine: {
        backgroundColor: 'black',
        height: ScreenUtil.scaleSize(1),
        paddingHorizontal: ScreenUtil.scaleSize(30)
    },
    successImageStyle: {
        width: ScreenUtil.scaleSize(140),
        height: ScreenUtil.scaleSize(140)
    },
    TextDisplayViewStyle: {
        color: '#666666',
        fontSize: ScreenUtil.setSpText(9),
    },
    textContainer: {
        alignSelf: 'center'
    },
    experienceFunctionStyle: {
        marginTop: ScreenUtil.scaleSize(653),
        height: ScreenUtil.scaleSize(33),
        justifyContent: 'center',
        alignSelf: 'center'
    },
    experienceFunctionLabelStyle: {
        color: '#ABABAB',
        fontSize: ScreenUtil.setSpText(9)
    },
});