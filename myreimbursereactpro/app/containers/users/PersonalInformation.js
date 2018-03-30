/**
 * Created by richard.ji on 2017/10/31.
 */

import React, {Component} from "react";
import {
    View,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Text,
    Platform,
    StyleSheet,
    NativeModules
} from "react-native";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Message from "../../constant/Message";
import {CustomStyles} from "../../css/CustomStyles";
import ScreenUtil from "../../utils/ScreenUtil";
import Util from "../../utils/Util";
import Picker from "react-native-picker";
import {changeState, saveData} from "../../redux/actions/users/PersonalInformation";
import {back} from "../../redux/actions/navigator/Navigator";
import Header from "../../containers/common/CommonHeader";
import BackDialog from "./../common/BackDialog";
import CommonLoading from "../../containers/common/CommonLoading";
import SafeAreaView from "react-native-safe-area-view";
var RNBridgeModule = NativeModules.RNBridgeModule;

class PersonalInformation extends Component {
    static navigationOptions = ({navigation}) => ({
        header: null,
    })

    componentDidMount() {
        const {sex, birthday, area} = this.props.navigation.state.params;
        let sexStr = '';
        if (sex == 0) {
            sexStr = Message.FEMALE;
        } else if (sex == 1) {
            sexStr = Message.MALE;
        }
        this.props.changeState({
            sex: sex,
            birthday: birthday ? birthday : '',
            area: area ? area.replace(',', ' ') : '',
            sexStr: sexStr,
        })
    }

    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        Picker.hide();
        component.props.back();
    }

    /**
     * 地区选择器
     */
    createAreaPicker() {

        Picker.init({
            pickerData: Util.createAreaData(),
            selectedValue: this.props.state.area.split(' '),
            pickerConfirmBtnText: Message.COMPLETE,
            pickerCancelBtnText: Message.CANCEL,
            pickerConfirmBtnColor: [255, 170, 0, 1],
            pickerCancelBtnColor: [255, 170, 0, 1],
            pickerToolBarBg: [255, 255, 255, 1],
            pickerBg: [255, 255, 255, 1],
            pickerFontColor: [102, 102, 102, 1],
            pickerTitleText: '',
            pickerFontSize: 17,
            onPickerConfirm: data => {
                var areaStr = '';
                for (var i = 0; i < data.length; i++) {
                    areaStr += data[i];
                    if (i < data.length - 1) {
                        areaStr += ' ';
                    }
                }
                this.props.changeState({area: areaStr, showPickerShadow: false});
                this.props.saveData({
                    birthday: this.props.state.birthday,
                    area: areaStr.replace(' ', ','),
                    areaId: "1,8",//后台无验证，待后台添加验证统一规则后完善
                    sex: this.props.state.sex,
                })
            },
            onPickerCancel: () => {
                this.props.changeState({showPickerShadow: false});
            }
        });
    }

    /**
     * 性别选择器
     */
    createGenderPicker() {
        Picker.init({
            pickerData: this.props.state.genderArr,
            selectedValue: [this.props.state.sexStr],
            pickerConfirmBtnText: Message.COMPLETE,
            pickerCancelBtnText: Message.CANCEL,
            pickerConfirmBtnColor: [255, 170, 0, 1],
            pickerCancelBtnColor: [255, 170, 0, 1],
            pickerToolBarBg: [255, 255, 255, 1],
            pickerBg: [255, 255, 255, 1],
            pickerFontColor: [102, 102, 102, 1],
            pickerTitleText: '',
            pickerFontSize: 17,
            onPickerConfirm: data => {
                var genderStr = '';
                var sex ='';
                for (var i = 0; i < data.length; i++) {
                    if(data[i] == "" || data[i] == '<null>'){
                        genderStr = this.props.state.genderArr[0];
                    }else{
                        genderStr += data[i];}
                }
                if (genderStr == '') {
                    sex = '1';
                    this.props.changeState({
                        sex: sex,
                        sexStr: Message.MALE,
                        showPickerShadow: false
                    });
                }
                if (genderStr == Message.MALE) {
                    var sex = '1';
                    this.props.changeState({
                        sex: sex,
                        sexStr: genderStr,
                        showPickerShadow: false
                    });
                } else {
                    sex = '0';
                    this.props.changeState({
                        sex: sex,
                        sexStr: genderStr,
                        showPickerShadow: false
                    });
                }
                this.props.saveData({
                    birthday: this.props.state.birthday,
                    area: this.props.state.area.replace(' ', ','),
                    areaId: "1,8",//后台无验证，待后台添加验证统一规则后完善
                    sex: sex,
                })
            },
            onPickerCancel: () => {
                this.props.changeState({showPickerShadow: false});
            }
        });
    }

    /**
     * 日期选择器
     */
    createDatePicker() {
        const d = new Date();
        const year = d.getFullYear() + '';
        const month = '' + (d.getMonth() + 1);
        const day = d.getDate() + '';
        const arr = this.props.state.birthday.split('-').map(item => parseInt(item) + '');
        Picker.init({
            pickerData: Util.createDateData1(),
            selectedValue: this.props.state.birthday ? arr : [year, month, day],
            pickerConfirmBtnText: Message.COMPLETE,
            pickerCancelBtnText: Message.CANCEL,
            pickerConfirmBtnColor: [255, 170, 0, 1],
            pickerCancelBtnColor: [255, 170, 0, 1],
            pickerToolBarBg: [255, 255, 255, 1],
            pickerBg: [255, 255, 255, 1],
            pickerFontColor: [102, 102, 102, 1],
            pickerTitleText: '',
            pickerFontSize: 17,
            onPickerConfirm: (data) => {
                var date = '';
                var str = '';
                for (var i = 0; i < data.length; i++) {
                    str = data[i] < 10 ? '0' + data[i] : data[i];
                    date = date + str + '-';
                }
                date = date.substring(0, date.length - 1)
                this.props.changeState({
                    birthday: date,
                    showPickerShadow: false
                })
                this.props.saveData({
                    birthday: date,
                    area: this.props.state.area.replace(' ', ','),
                    areaId: "1,8",//后台无验证，待后台添加验证统一规则后完善
                    sex: this.props.state.sex,
                })
            },
            onPickerCancel: () => {
                this.props.changeState({showPickerShadow: false});
            }
        });
    }

    render () {
        const dismissKeyboard = require('dismissKeyboard');
        return (
            <TouchableWithoutFeedback onPress={() => {
                dismissKeyboard();
                Picker.hide();
            }}>
                <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
                    <View style={{flex: 1, backgroundColor: '#F3F3F3'}}>
                        <BackDialog
                            thisComponent={this}
                            isShow={this.props.state.showPickerShadow}
                            backgroundClick={
                                (component) => {
                                    Picker.hide();
                                    component.props.changeState({showPickerShadow: false});
                                }
                            }/>
                        <CommonLoading isShow={this.props.state.isLoading}/>
                        <Header
                            titleText={Message.PERSONAL_INFORMATION}
                            thisComponent={this}
                            backClick={this.onBack.bind(this)}
                        />
                        <View style={styles.personalInfoContainer}>
                            <TouchableOpacity
                                onPress={() => {
                                    if (Platform.OS === 'android') {
                                        RNBridgeModule.checkFloatWindowOpAllowed((result)=> {
                                            this.props.changeState({showPickerShadow: true});
                                            this.createGenderPicker();
                                            Picker.show();
                                        });
                                    } else {
                                        this.props.changeState({showPickerShadow: true});
                                        this.createGenderPicker();
                                        Picker.show();
                                    }
                                }}>
                                <View style={styles.rowContainer}>
                                    <Text style={[styles.textView, {flex: 1}]}>{Message.GENDER}</Text>
                                    <Text style={styles.textView}>
                                        {this.props.state.sexStr}
                                    </Text>
                                    <Image
                                        style={styles.arrowIcon}
                                        source={require('./../../img/common/arrow.png')}/>
                                </View>
                            </TouchableOpacity>

                            <View style={CustomStyles.separatorLine}/>
                            <TouchableOpacity
                                onPress={() => {
                                    if (Platform.OS === 'android') {
                                        RNBridgeModule.checkFloatWindowOpAllowed((result)=> {
                                            this.props.changeState({showPickerShadow: true});
                                            this.createDatePicker();
                                            Picker.show();
                                        });
                                    } else {
                                        this.props.changeState({showPickerShadow: true});
                                        this.createDatePicker();
                                        Picker.show();
                                    }
                                }}>
                                <View style={[styles.rowContainer]}>
                                    <Text style={[styles.textView, {flex: 1}]}>{Message.BIRTHDAY}</Text>
                                    <Text style={styles.textView}>{this.props.state.birthday}</Text>
                                <Image
                                    style={styles.arrowIcon}
                                    source={require('./../../img/common/arrow.png')}/>
                            </View>
                            </TouchableOpacity>
                            <View style={CustomStyles.separatorLine}/>
                            <TouchableOpacity
                                onPress={() => {
                                    if (Platform.OS === 'android') {
                                        RNBridgeModule.checkFloatWindowOpAllowed((result)=> {
                                            this.props.changeState({showPickerShadow: true});
                                            this.createAreaPicker();
                                            Picker.show();
                                        });
                                    } else {
                                        this.props.changeState({showPickerShadow: true});
                                        this.createAreaPicker();
                                        Picker.show();
                                    }
                                }}>
                                <View style={styles.rowContainer}>
                                    <Text style={[styles.textView, {flex: 1}]}>{Message.REGION}</Text>
                                    <Text style={styles.textView}>{this.props.state.area}</Text>
                                    <Image
                                        style={styles.arrowIcon}
                                        source={require('./../../img/common/arrow.png')}/>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </TouchableWithoutFeedback>
        );
    }
}

function mapStateToProps(state) {
    return {
        state:state.PersonalInformation
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changeState: changeState,
        back: back,
        saveData: saveData,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PersonalInformation);

const styles = StyleSheet.create({
    headSeparatorLine: {
        backgroundColor: 'black',
        height: ScreenUtil.scaleSize(1),
        paddingHorizontal: ScreenUtil.scaleSize(30)
    },
    separatorLine: {
        backgroundColor: '#DEDEDE',
        height: ScreenUtil.scaleSize(1),
    },
    personalInfoContainer: {
        paddingHorizontal: ScreenUtil.scaleSize(30),
        backgroundColor: '#FFFFFF',
    },
    rowContainer: {
        flexDirection: 'row',
        height:ScreenUtil.scaleSize(80),
        alignItems: 'center'
    },
    textDisplayLabelViewStyle: {
        width: ScreenUtil.scaleSize(60),
        alignItems: 'flex-start'
    },
    textView: {
        color: '#666666',
        fontSize: ScreenUtil.setSpText(9)
    },
    textDisplayViewStyle: {
        flex: 1,
        alignItems: 'flex-end'
    },
    imageView: {
        marginTop: ScreenUtil.scaleSize(34)
    },
    arrowIcon: {
        width: ScreenUtil.scaleSize(19),
        height: ScreenUtil.scaleSize(32),
        resizeMode: Image.resizeMode.contain,
        marginLeft: ScreenUtil.scaleSize(30),
    },
});