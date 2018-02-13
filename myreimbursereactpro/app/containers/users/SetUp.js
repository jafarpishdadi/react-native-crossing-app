/**
 * Created by richard.ji on 2017/11/1.
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

import {back} from '../../redux/actions/navigator/Navigator';
import Header from "./../common/CommonHeader";
import {
    setUpAction,
    getIsLinkState,
    updateIsLinkState,
    logoutTo
} from '../../redux/actions/users/SetUp';
import Message from "../../constant/Message";
import {CustomStyles} from '../../css/CustomStyles';
import ScreenUtil from "../../utils/ScreenUtil";
import CommonLoading from '../../containers/common/CommonLoading';

class SetUp extends Component {

    static navigationOptions = ({navigation}) => ({
        header: null,
    })

    componentDidMount() {
        this.props.getIsLinkState()
    }

    selectReminding () {
        if (this.props.setUpState.isRemind) {
            this.props.updateIsLinkState({"is_link" : "N"},this.props.setUpState.isRemind)
        } else {
            this.props.updateIsLinkState({"is_link" : "Y"},this.props.setUpState.isRemind)
        }
    }

    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        component.props.back();
    }

    render () {
        const selectIcon = this.props.setUpState.isRemind ? (
            require('./../../img/common/remind_on.png')
        ) : (
            require('./../../img/common/remind_off.png')
        );

        return (
            <View style={{flex: 1, backgroundColor: '#F3F3F3'}}>
                <CommonLoading isShow={this.props.setUpState.isLoading}/>
                <Header
                    titleText={Message.SET_UP}
                    thisComponent={this}
                    backClick={this.onBack}
                />
                <View style={[styles.rowContainer, {marginTop: ScreenUtil.scaleSize(60)}]}>
                    <Text style={styles.setUpDisplayLabel}>{Message.SET_UP_DISPLAY_INFORMATION}</Text>
                    <TouchableOpacity
                        onPress={this.selectReminding.bind(this)}>
                        <Image
                            style={styles.setUpImageStyle}
                            source={selectIcon} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    onPress={() => {this.props.logoutTo()}}
                    style={{
                        marginTop: ScreenUtil.scaleSize(841)
                    }}
                >
                    <Image
                        style={styles.logoutIcon}
                        source={require('./../../img/login/logout.png')}/>
                </TouchableOpacity>
                <View style={styles.bottomView}>
                    <Text style={styles.bottomText}>{Message.SET_UP_DISPLAY_TIP_INFORMATION}</Text>
                </View>
            </View>
        );
    }
}

function mapStateToProps(state) {
    return {
        setUpState:state.SetUp
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        setUpAction: setUpAction,
        getIsLinkState: getIsLinkState,
        updateIsLinkState: updateIsLinkState,
        back:back,
        logoutTo: logoutTo,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SetUp);

const styles = StyleSheet.create({
    rowContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        height: ScreenUtil.scaleSize(80),
        alignItems: 'center',
        paddingHorizontal: ScreenUtil.scaleSize(30),
    },
    setUpDisplayLabel: {
        fontSize: ScreenUtil.setSpText(9),
        color: '#666666',
        flex: 1,
    },
    setUpImageStyle: {
        width: ScreenUtil.scaleSize(85),
        height: ScreenUtil.scaleSize(58),
        resizeMode: 'stretch',
        marginTop: ScreenUtil.scaleSize(8),
    },
    logoutIcon: {
        width: ScreenUtil.scaleSize(550),
        height: ScreenUtil.scaleSize(75),
        resizeMode: 'stretch',
        alignSelf: 'center',
    },
    bottomView: {
        position: 'absolute',
        bottom: ScreenUtil.scaleSize(20),
        height: ScreenUtil.scaleSize(33),
        alignSelf: 'center',
        justifyContent: 'center',
    },
    bottomText: {
        fontSize: ScreenUtil.setSpText(7),
        color: '#ABABAB',
    }
});