/**
 * 报表页
 * Created by sky.qian on 10/26/2017.
 */
import React, {Component} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    TextInput,
    View,
    Platform,
    Image,
    ImageBackground,
    TouchableOpacity,
    FlatList,
    PixelRatio,
    processColor,
    DeviceEventEmitter
} from 'react-native';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {BarChart} from 'react-native-charts-wrapper';
import Header from '../../containers/common/CommonHeader';
import ScreenUtil, {deviceWidth, deviceHeight} from '../../utils/ScreenUtil';
import Message from '../../constant/Message';
import {CustomStyles} from '../../css/CustomStyles';
import Picker from "react-native-picker";
import BackDialog from "./../common/BackDialog";
import Util from '../../utils/Util';
import {
    changeState,
    loadData,
    queryReimbursementAmount,
    loadReimbursementTotalAmountProportion,
    loadChartData,
    changeToReportTab
} from '../../redux/actions/report/Report';
import ModalDropdown from 'react-native-modal-dropdown';
import CommonLoading from "./../common/CommonLoading";

class Report extends Component {
    static navigationOptions = {
        tabBarLabel: Message.REPORT,
        tabBarIcon: ({tintColor, focused}) => (
            <Image
                source={focused ? require('../../img/mainScreen/report_selected.png') : require('../../img/mainScreen/report_unselected.png')}
                style={CustomStyles.icon}
            />
        ),
        tabBarOnPress: ({route, index}, jumpToIndex) => {
            if (route.routeName === 'Report') {
                DeviceEventEmitter.emit('reloadReport');
            }
            jumpToIndex(index);
        }
    }

    componentDidMount() {
        if (!this.props.state.isFirst) {
            //加载数据
            this.props.loadData();
        }
        //监听报表
        this.reportEventListener = DeviceEventEmitter.addListener('reloadReport', this.props.changeToReportTab);
    }

    constructor(props) {
        super(props);
    }

    componentWillUnmount(){
        this.reportEventListener.remove();
    }

    handleSelect(event) {
        let entry = event.nativeEvent;
        if (entry == null) {
            this.setState({...this.state, selectedEntry: null})
        } else {
            this.setState({...this.state, selectedEntry: JSON.stringify(entry)})
        }
    }

    /**
     * 显示当前月份
     * @returns {string}
     */
    showEmptyDateData() {
        return (
            this.props.state.selectedYear === '' && this.props.state.selectedMonth === ''
                ?
                (this.props.state.defaultDate) : (this.props.state.selectedYear + '' +
            this.props.state.selectedMonth)
        );
    }

    /**
     * 日期选择器
     */
    createDatePicker() {
        const d = new Date();
        const year = d.getFullYear() + '年';
        const month = '' + (d.getMonth() + 1) + '月';
        const selectedYear = this.props.state.selectedYear;
        const selectedMonth = this.props.state.selectedMonth;

        Picker.init({
            pickerData: Util.createDateDataWithoutDay(),
            selectedValue: (selectedYear == '' || selectedMonth == '') ? [year, month] : [selectedYear, selectedMonth],
            pickerConfirmBtnText: Message.COMPLETE,
            pickerCancelBtnText: Message.CANCEL,
            pickerConfirmBtnColor: [255, 170, 0, 1],
            pickerCancelBtnColor: [255, 170, 0, 1],
            pickerToolBarBg: [255, 255, 255, 1],
            pickerBg: [255, 255, 255, 1],
            pickerFontColor: [102, 102, 102, 1],
            pickerTitleText: '',
            pickerFontSize: 17,
            onPickerConfirm: (pickedValue, pickedIndex) => {
                var yearFormat;
                var monthFormat;
                var selectedDateStr;
                yearFormat = pickedValue[0].substring(0, 4);
                if (pickedValue[1].length == 2) {
                    monthFormat = '0' + pickedValue[1].substring(0, 1);
                } else {
                    monthFormat = pickedValue[1].substring(0, 2);
                }
                selectedDateStr = yearFormat + '-' + monthFormat;
                this.props.changeState({
                    selectedYear: pickedValue[0],
                    selectedMonth: pickedValue[1],
                    selectedDateStr: selectedDateStr,
                    name: selectedDateStr,
                    showPickerShadow: false
                });
                this._show(selectedDateStr, this.props.state.seriesName);
            },
            onPickerCancel: (pickedValue, pickedIndex) => {
                this.props.changeState({showPickerShadow: false});
            },
            onPickerSelect: (pickedValue, pickedIndex) => {
                console.log('date', pickedValue, pickedIndex);
            }
        });
    }

    //是否请求查询所选月份的报销类型
    _show(name, seriesName) {
        if (name !== '' && seriesName !== '') {
            this.props.changeState({isOpen: true, isLoading: true});
            this.props.loadChartData(name, seriesName);
        } else {
            this.props.changeState({isOpen: false, reimbursementAmountChartData: []});
        }
    }

    _showText() {
        return this.props.state.selectedMonth === ''
            ? this.props.state.defaultMonth + this.props.state.seriesName + Message.REPORT_DETAIL_TITLE
            : this.props.state.selectedMonth + this.props.state.seriesName + Message.REPORT_DETAIL_TITLE;
    }

    renderEstimateItem(item, index) {
        return (
            <View style={styles.rowEstimateItem}>
                <Text style={styles.estimateTypeText}>{item.bxType}</Text>
                <Text style={styles.estimateAmountText}>{item.amount.toFixed(2)}</Text>
                <Text style={styles.estimateProportionText}>{item.proportion}</Text>
            </View>
        )
    }

    showSelectedMonthData() {
        return (
            this.props.state.isOpen
                ?
                (<FlatList
                        style={{
                            flex: 1, paddingBottom: ScreenUtil.scaleSize(16)
                        }}
                        data={
                            this.props.state.reimbursementAmountChartData}
                        renderItem={({item, index}) => this.renderEstimateItem(item, index)}/>
                )
                :
                (<View/>)
        );
    }

    moneyFormat(money) {
        var result = parseFloat(money).toFixed(2);
        return result;
    }

    _header = () => {
        return (
            <View style={{flex: 1}}>
                <ImageBackground
                    style={{width: deviceWidth, height: ScreenUtil.scaleSize(280)}}
                    source={require('../../img/report/report_header_icon.png')}>
                    <View>
                        <Text style={styles.quarterReimbursementTitle}>{Message.REPORT_YEAR_TITLE}</Text>
                        <Text
                            style={styles.quarterCompletedReimbursementText}>{Message.REPORT_REIMBURSEMENT_DONE}</Text>
                        <Text
                            style={styles.quarterCompletedReimbursement}>{this.moneyFormat(this.props.state.ybxtotal)}</Text>
                        <View style={styles.reimbursementTotalLabelView}>
                            <Text
                                style={styles.quarterReimbursementTotalText}>{Message.REPORT_REIMBURSEMENT_TOTAL}</Text>
                        </View>
                        <View style={styles.quarterReimbursementView}>
                            <Text
                                style={styles.quarterReimbursementTotal}>{this.moneyFormat(this.props.state.bxzetotal)}</Text>
                        </View>
                        <View style={styles.inAuditLabelView}>
                            <Text style={styles.inAuditText}>{Message.REPORT_REIMBURSEMENT_DOING}</Text>
                        </View>
                        <View style={styles.inAuditView}>
                            <Text style={styles.inAudit}>{this.moneyFormat(this.props.state.spztotal)}</Text>
                        </View>
                    </View>
                </ImageBackground>
            </View>
        );
    };

    _renderItem = (item, index) => {
        const isData = this.props.state.isdata;
        return (isData === 0 ?
            (<View style={styles.container}>
                <View style={{flex: 1, alignItems: 'center', marginTop: ScreenUtil.scaleSize(200)}}>
                    <Image
                        style={{
                            width: ScreenUtil.scaleSize(110),
                            height: ScreenUtil.scaleSize(101)
                        }}
                        source={require('../../img/report/empty_report_icon.png')}/>
                    <View style={{marginTop: ScreenUtil.scaleSize(20)}}>
                        <Text style={{
                            fontSize: ScreenUtil.setSpText(9),
                            color: '#ABABAB'
                        }}>{Message.REPORT_REIMBURSEMENT_EMPTY_DATA}</Text>
                    </View>
                </View>
            </View>)
            :
            (<View style={styles.container}>
                <View style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    paddingVertical: ScreenUtil.scaleSize(20)
                }}>
                    <BarChart
                        style={styles.chart}
                        data={this.props.state.data}
                        xAxis={this.props.state.xAxis}
                        yAxis={this.props.state.yAxis}
                        animation={{durationX: 2000}}
                        legend={this.props.state.legend}
                        gridBackgroundColor={processColor('white')}
                        drawBarShadow={false}
                        drawValueAboveBar={true}
                        drawHighlightArrow={false}
                        onSelect={this.handleSelect.bind(this)}
                        highlights={this.props.state.highlights}
                        onChange={null}
                        chartDescription={{text: '', positionX: 0, positionY: 0,}}
                        marker={{
                            enabled: true,
                            markerColor: processColor('black'),
                            textColor: processColor('white'),
                            textSize: 14,
                        }}
                        scaleEnabled={false}
                        dragEnabled={false}
                        pinchZoom={false}
                        doubleTapToZoomEnabled={false}
                        scaleXEnabled={false}
                        scaleYEnabled={false}
                    />
                </View>
                <View style={styles.rowCalender}>
                    <Image
                        style={styles.calenderIcon}
                        source={require('./../../img/invoice/calendar.png')}/>
                    <TouchableOpacity
                        style={{
                            marginHorizontal: ScreenUtil.scaleSize(30)
                        }}
                        onPress={() => {
                            this.props.changeState({showPickerShadow: true});
                            this.createDatePicker();
                            Picker.show();
                        }}>
                        <View style={{
                            width: ScreenUtil.scaleSize(200),
                            height: ScreenUtil.scaleSize(40),
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            borderWidth: ScreenUtil.scaleSize(1),
                            borderColor: '#DEDEDE',
                            borderRadius: ScreenUtil.scaleSize(6)
                        }}>
                            <Text style={{
                                fontSize: ScreenUtil.setSpText(9),
                                color: '#666666',
                                marginLeft: ScreenUtil.scaleSize(20)
                            }}>
                                {this.showEmptyDateData()}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <ModalDropdown
                        options={['审批中', '审批通过']}
                        defaultIndex={1}
                        defaultValue={'审批通过'}
                        style={{
                            borderWidth: ScreenUtil.scaleSize(1),
                            borderColor: '#DEDEDE',
                            height: ScreenUtil.scaleSize(40),
                            width: ScreenUtil.scaleSize(200),
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            borderRadius: ScreenUtil.scaleSize(6)
                        }
                        }
                        textStyle={{
                            fontSize: ScreenUtil.setSpText(9), color: '#666666',
                            marginLeft: ScreenUtil.scaleSize(20)
                        }}
                        showsVerticalScrollIndicator={false}
                        dropdownStyle={{
                            borderWidth: ScreenUtil.scaleSize(1),
                            borderColor: '#ABABAB',
                            width: ScreenUtil.scaleSize(200),
                            paddingLeft: 0,
                            height: ScreenUtil.scaleSize(85),
                            marginLeft: Platform.OS === 'android' ? 0 : ScreenUtil.scaleSize(-3),
                            marginTop: Platform.OS === 'android' ? 0 : ScreenUtil.scaleSize(4)
                        }}
                        onSelect={(index, value) => {
                            this.props.changeState({seriesName: value, selectedIndex: index});
                            this._show(this.props.state.name, value);
                        }}
                        renderRow={(rowData, rowID) => {
                            let highlighted = rowID == this.props.state.selectedIndex;
                            return (
                                <TouchableOpacity>
                                    <View style={{
                                        height: ScreenUtil.scaleSize(40),
                                        justifyContent: 'center'
                                    }}>
                                        <Text style={
                                            highlighted ? styles.highlightedRowText : styles.rowText}
                                        >
                                            {rowData}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
                <View style={styles.estimateContainer}>
                    <View style={styles.estimateTitle}>
                        <Text style={{color: '#666666', fontSize: ScreenUtil.setSpText(9)}}>{this._showText()}</Text>
                    </View>
                    <View style={styles.rowHeaderText}>
                        <Text style={styles.estimateTypeText}>{Message.REPORT_REIMBURSEMENT_TYPE}</Text>
                        <Text style={styles.estimateAmountText}>{Message.REPORT_REIMBURSEMENT_AMOUNT}</Text>
                        <Text style={styles.estimateProportionText}>{Message.REPORT_REIMBURSEMENT_PERCENT}</Text>
                    </View>
                    <View style={[CustomStyles.separatorLine,
                        {marginHorizontal: ScreenUtil.scaleSize(30)}]}/>
                    {this.showSelectedMonthData()}
                </View>
            </View>));
    }

    render() {
        return (
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
                    titleText={Message.REPORT}
                    thisComponent={this}
                    showBackIcon={false}
                />
                <FlatList
                    style={{flex: 1}}
                    data={[this.props.state.showFlatList]}
                    ListHeaderComponent={this._header}
                    renderItem={this._renderItem}
                />
            </View>
        );
    }
}

function mapStateToProps(state) {
    return {
        state: state.Report,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changeState: changeState,
        loadData: loadData,
        queryReimbursementAmount: queryReimbursementAmount,
        loadReimbursementTotalAmountProportion: loadReimbursementTotalAmountProportion,
        loadChartData: loadChartData,
        changeToReportTab
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Report);

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    icon: {
        width: 26,
        height: 26,
    },
    quarterReimbursementTitle: {
        color: '#FFFFFF',
        marginLeft: ScreenUtil.scaleSize(30),
        marginTop: ScreenUtil.scaleSize(20),
        backgroundColor: 'transparent',
        fontSize: ScreenUtil.setSpText(10),
        fontWeight: 'bold'
    },
    quarterCompletedReimbursementText: {
        color: '#FFFFFF',
        position: 'absolute',
        top: ScreenUtil.scaleSize(80),
        alignSelf: 'center',
        backgroundColor: 'transparent',
        fontSize: ScreenUtil.setSpText(10),
        fontWeight: 'bold'
    },
    quarterCompletedReimbursement: {
        color: '#FFFFFF',
        position: 'absolute',
        top: ScreenUtil.scaleSize(140),
        alignSelf: 'center',
        backgroundColor: 'transparent',
        fontSize: ScreenUtil.setSpText(10),
        fontWeight: 'bold'
    },
    reimbursementTotalLabelView: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        left: ScreenUtil.scaleSize(72),
        top: ScreenUtil.scaleSize(120),
        width: ScreenUtil.scaleSize(200)
    },
    quarterReimbursementTotalText: {
        color: '#FFFFFF',
        backgroundColor: 'transparent',
        fontSize: ScreenUtil.setSpText(10),
        fontWeight: 'bold'
    },
    quarterReimbursementView: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        left: ScreenUtil.scaleSize(37),
        top: ScreenUtil.scaleSize(180),
        width: ScreenUtil.scaleSize(270)
    },
    quarterReimbursementTotal: {
        color: '#FFFFFF',
        backgroundColor: 'transparent',
        fontSize: ScreenUtil.setSpText(10),
        fontWeight: 'bold'
    },
    inAuditLabelView: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        right: ScreenUtil.scaleSize(65),
        top: ScreenUtil.scaleSize(130),
        width: ScreenUtil.scaleSize(200)
    },
    inAuditText: {
        color: '#FFFFFF',
        backgroundColor: 'transparent',
        fontSize: ScreenUtil.setSpText(10),
        fontWeight: 'bold'
    },
    inAuditView: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        right: ScreenUtil.scaleSize(30),
        top: ScreenUtil.scaleSize(190),
        width: ScreenUtil.scaleSize(270)
    },
    inAudit: {
        color: '#FFFFFF',
        backgroundColor: 'transparent',
        fontSize: ScreenUtil.setSpText(10),
        fontWeight: 'bold'
    },
    rowCalender: {
        flexDirection: 'row',
        alignItems: 'center',
        height: ScreenUtil.scaleSize(53),
        marginTop: ScreenUtil.scaleSize(20),
        backgroundColor: '#FFFFFF'
    },
    calenderIcon: {
        width: ScreenUtil.scaleSize(35),
        height: ScreenUtil.scaleSize(40),
        marginLeft: ScreenUtil.scaleSize(30)
    },
    inputText: {
        flex: 1,
        marginHorizontal: ScreenUtil.scaleSize(30),
        padding: 0,
        borderWidth: ScreenUtil.scaleSize(1),
        borderColor: '#DEDEDE',
        borderRadius: ScreenUtil.scaleSize(6)
    },
    selectIcon: {
        width: ScreenUtil.scaleSize(16),
        height: ScreenUtil.scaleSize(8),
        resizeMode: 'contain',
        marginLeft: ScreenUtil.scaleSize(10),
    },
    estimateContainer: {
        marginTop: ScreenUtil.scaleSize(20),
        backgroundColor: '#FFFFFF',
        flex: 1
    },
    estimateTitle: {
        alignSelf: 'center',
        marginTop: ScreenUtil.scaleSize(20),
        height: ScreenUtil.scaleSize(33)
    },
    rowHeaderText: {
        flexDirection: 'row',
        marginHorizontal: ScreenUtil.scaleSize(80),
        marginTop: ScreenUtil.scaleSize(32),
        marginBottom: ScreenUtil.scaleSize(18),
        alignItems: 'center',
        height: ScreenUtil.scaleSize(33)
    },
    estimateTypeText: {
        flex: 1,
        color: '#666666',
        textAlign: 'left',
        fontSize: ScreenUtil.setSpText(9)
    },
    estimateAmountText: {
        flex: 1,
        color: '#666666',
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(9)
    },
    estimateProportionText: {
        flex: 1,
        color: '#666666',
        textAlign: 'center',
        fontSize: ScreenUtil.setSpText(9)
    },
    rowEstimateItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: ScreenUtil.scaleSize(80),
        marginTop: ScreenUtil.scaleSize(20),
    },
    rowText: {
        fontSize: ScreenUtil.setSpText(9),
        color: 'gray',
        backgroundColor: 'white',
        textAlignVertical: 'center',
        marginLeft: ScreenUtil.scaleSize(20)
    },
    highlightedRowText: {
        fontSize: ScreenUtil.setSpText(9),
        color: 'black',
        backgroundColor: 'white',
        textAlignVertical: 'center',
        marginLeft: ScreenUtil.scaleSize(20)
    },
    chart: {
        width: deviceWidth,
        height: ScreenUtil.scaleSize(500)
    }
});
