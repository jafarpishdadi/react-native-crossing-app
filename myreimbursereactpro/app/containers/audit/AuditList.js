/**
 * 我的审批 审批列表
 * Created by howard.li on 11/8/2017.
 */

import React,{Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Header from '../../containers/common/CommonHeader';
import Message from '../../constant/Message';
import ScreenUtil, {deviceWidth} from '../../utils/ScreenUtil';
import {back, navigateReimbursementDetail} from '../../redux/actions/navigator/Navigator';

import {
    View,
    StyleSheet,
    Platform,
    TouchableOpacity,
    Text,
    FlatList,
    ActivityIndicator,
    Image,
    TouchableWithoutFeedback,
    PixelRatio,
} from 'react-native';
import {
    changeState,
    loadData,
    refreshUnApproved,
    refreshAlreadyApproved,
    loadMoreUnApproved,
    loadMoreAlreadyApproved,
    initData,
} from '../../redux/actions/audit/AuditList';
import CommonLoading from '../../containers/common/CommonLoading';
import Util from '../../utils/Util';

class AuditList extends Component {
    static navigationOptions = ({navigation}) => ({
        header: null,
    });

    componentWillMount() {
        this.props.initData();
    }

    componentDidMount() {
        this.props.loadData();
    }

    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        component.props.back();
    }

    /**
     * 渲染状态
     * @param code 表单状态
     */
    renderStatus(code) {
        let status = '';
        let color = '';
        switch (code) {
            case '0':
                status = Message.REIMBURSEMENT_NO_COMMIT;
                color = '#ABABAB';
                break;
            case '1':
                status = Message.REIMBURSEMENT_CANCEL;
                color = '#CE1A1A';
                break;
            case '2':
                status = Message.REIMBURSEMENT_REJECT;
                color = '#FF8080';
                break;
            case '3':
                status = Message.REIMBURSEMENT_ING;
                color = '#ABABAB';
                break;
            case '4':
                status = Message.REIMBURSEMENT_PASS;
                color = '#FFAA00';
                break;
            default:
        }

        return (
            <View style={{flexDirection: 'row'}}>
                <Text style={{
                    fontSize: ScreenUtil.setSpText(9),
                    color: color,
                }}>{status}</Text>
            </View>
        )
    }

    renderDesc(item) {
        const desc = JSON.parse(item.formDesc);
        const list = [];
        for (let item in desc) {
            const row = (
                <View style={styles.otherRow}>
                    <Text style={styles.labelText}>{desc.applyTypeName == '通用报销单' ? Util.parseReimbursementLabelJson(item) : Util.parseReimbursementLabelJsonForTrip(item)}</Text>
                    {item == "amount"?
                        <Text
                        numberOfLines={1}
                        style={styles.inputText}>{Message.MONEY + parseFloat(desc[item]).toFixed(2)}</Text>:
                        <Text
                        numberOfLines={1}
                        style={styles.inputText}>{desc[item]}</Text>}

                </View>
            )
            list.push(row);
        }
        return list;
    }

    /**
     * 筛选
     */
    doFilter(type) {
        this.props.changeState({
            showFilter: false,
            isLoading: true,
            applyType: type,
            page: 1,
        })
        // todo
    }

    render() {
        let data;
        if (this.props.state.selected == '0') {
            data = this.props.state.unapproved;
        } else if (this.props.state.selected == '1') {
            data = this.props.state.alreadyApproved;
        } else if (this.props.state.selected == '2') {
            data = this.props.state.copyToMe;
        }
        return(
            <View style={styles.container}>
                <CommonLoading isShow={this.props.state.isLoading}/>
                <Header
                    titleText={Message.AUDIT_TITLE}
                    thisComponent={this}
                    backClick={this.onBack.bind(this)}
                    rightClick={(component) => {
                        component.props.changeState({
                            showFilter: !component.props.state.showFilter,
                        })
                    }}
                    rightIcon={require('../../img/common/filter.png')}
                    rightIconStyle={{
                        width: ScreenUtil.scaleSize(35),
                        height: ScreenUtil.scaleSize(40),
                        resizeMode: 'stretch',
                    }}
                />
                {
                    this.props.state.showFilter ? (
                        <Image style={{
                            width: ScreenUtil.scaleSize(290),
                            height: ScreenUtil.scaleSize(340),
                            resizeMode: 'stretch',
                            position: 'absolute',
                            top: ScreenUtil.scaleSize(Platform.OS == 'ios' ? 120 : 85),
                            right: ScreenUtil.scaleSize(10),
                            zIndex: 500,
                            alignItems: 'center',
                            paddingHorizontal: ScreenUtil.scaleSize(30),
                        }} source={require('../../img/reimbursement/filter_back.png')}>
                            <TouchableWithoutFeedback onPress={() => {
                                this.doFilter('');
                            }}>
                                <View style={[styles.filterTextView, {marginTop: ScreenUtil.scaleSize(14)}]}>
                                    <Text style={styles.filterText}>{Message.APPLICATION_ALL}</Text>
                                </View>
                            </TouchableWithoutFeedback>
                            <View style={{
                                height: 1 / PixelRatio.get(),
                                backgroundColor: '#5D5D5D',
                                width: ScreenUtil.scaleSize(230),
                            }}/>
                            <TouchableWithoutFeedback onPress={() => {
                                this.doFilter('0');
                            }}>
                                <View style={styles.filterTextView}>
                                    <Text style={styles.filterText}>{Message.AUDIT_REIMBURSEMENT}</Text>
                                </View>
                            </TouchableWithoutFeedback>
                            <View style={{
                                height: 1 / PixelRatio.get(),
                                backgroundColor: '#5D5D5D',
                                width: ScreenUtil.scaleSize(230),
                            }}/>
                            <TouchableWithoutFeedback onPress={() => {
                                this.doFilter('1');
                            }}>
                                <View style={styles.filterTextView}>
                                    <Text style={styles.filterText}>{Message.AUDIT_LOAN}</Text>
                                </View>
                            </TouchableWithoutFeedback>
                            <View style={{
                                height: 1 / PixelRatio.get(),
                                backgroundColor: '#5D5D5D',
                                width: ScreenUtil.scaleSize(230),
                            }}/>
                            <TouchableWithoutFeedback onPress={() => {
                                this.doFilter('2');
                            }}>
                                <View style={styles.filterTextView}>
                                    <Text style={styles.filterText}>{Message.AUDIT_TRAVEL}</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </Image>
                    ) : (
                        null
                    )
                }
                <View style={styles.tab}>
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={{
                                height: ScreenUtil.scaleSize(73),
                                width: deviceWidth / 3,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onPress={() => {
                            this.props.changeState({
                                selected: '0'
                            })
                        }}>
                            <Text style={{
                                fontSize: ScreenUtil.setSpText(8),
                                color: this.props.state.selected == '0' ? '#FFAA00' : '#666666'
                            }}>
                                {Message.AUDIT_UNAPPROVED}
                            </Text>
                        </TouchableOpacity>
                        {
                            this.props.state.selected == '0' ? (
                                <View style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: (deviceWidth / 3 - ScreenUtil.scaleSize(96)) / 2,
                                    height: ScreenUtil.scaleSize(4),
                                    width: ScreenUtil.scaleSize(96),
                                    backgroundColor: '#FFAA00',
                                }} />
                            ) : null
                        }
                    </View>
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={{
                                height: ScreenUtil.scaleSize(73),
                                width: deviceWidth / 3,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onPress={() => {
                            this.props.changeState({
                                selected: '1'
                            })
                        }}>
                            <Text style={{
                                fontSize: ScreenUtil.setSpText(8),
                                color: this.props.state.selected == '1' ? '#FFAA00' : '#666666'
                            }}>
                                {Message.AUDIT_ALREADY_APPROVED}
                            </Text>
                        </TouchableOpacity>
                        {
                            this.props.state.selected == '1' ? (
                                <View style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: (deviceWidth / 3 - ScreenUtil.scaleSize(96)) / 2,
                                    height: ScreenUtil.scaleSize(4),
                                    width: ScreenUtil.scaleSize(96),
                                    backgroundColor: '#FFAA00',
                                }} />
                            ) : null
                        }
                    </View>
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={{
                                height: ScreenUtil.scaleSize(73),
                                width: deviceWidth / 3,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onPress={() => {
                                this.props.changeState({
                                    selected: '2'
                                })
                            }}>
                            <Text style={{
                                fontSize: ScreenUtil.setSpText(8),
                                color: this.props.state.selected == '2' ? '#FFAA00' : '#666666'
                            }}>
                                {Message.AUDIT_COPY_TO_ME}
                            </Text>
                        </TouchableOpacity>
                        {
                            this.props.state.selected == '2' ? (
                                <View style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: (deviceWidth / 3 - ScreenUtil.scaleSize(96)) / 2,
                                    height: ScreenUtil.scaleSize(4),
                                    width: ScreenUtil.scaleSize(96),
                                    backgroundColor: '#FFAA00',
                                }} />
                            ) : null
                        }
                        {
                            this.props.state.hasCopyToMeMsg ? (
                                <Image style={{
                                    width: ScreenUtil.scaleSize(12),
                                    height: ScreenUtil.scaleSize(12),
                                    resizeMode: 'stretch',
                                    position: 'absolute',
                                    top: ScreenUtil.scaleSize(20),
                                    right: ScreenUtil.scaleSize(70),
                                }} source={require('../../img/homePage/dot.png')} />
                            ) : null
                        }
                    </View>
                </View>
                <FlatList
                    data={data}
                    onRefresh={() => {
                        if (this.props.state.selected == '0') {
                            this.props.refreshUnApproved()
                        } else {
                            this.props.refreshAlreadyApproved()
                        }
                    }}
                    refreshing={this.props.state.isRefreshing}
                    onEndReached={() => {
                        if (this.props.state.selected == '0' && this.props.state.unapprovedLoadMore) {
                            this.props.changeState({unapprovedLoadMore: false});
                            this.props.loadMoreUnApproved({
                                flag: 0,
                                page: this.props.state.unapprovedPage + 1,
                                rows: 5
                            }, this.props.state.unapproved)
                        } else if(this.props.state.selected == '1' && this.props.state.alreadyApprovedLoadMore){
                            this.props.changeState({alreadyApprovedLoadMore: false});
                            this.props.loadMoreAlreadyApproved({
                                flag:1,
                                page: this.props.state.alreadyApprovedPage + 1,
                                rows: 5
                            },this.props.state.alreadyApproved)
                    }}}
                    onEndReachedThreshold={0.5}
                    renderItem={({item, index}) => (
                        <TouchableOpacity onPress={() => {
                            this.props.navigateReimbursementDetail({
                                formId: item.formId,
                                source: this.props.state.selected == '0' ? 'unapproved' : 'approved',
                                taskId: item.id,
                                taskDefKey: item.taskDefKey,
                            })
                        }}>
                            <View style={[styles.applicationView, {
                                marginTop: ScreenUtil.scaleSize(index == 0 ? 20 : 10),
                                marginBottom: ScreenUtil.scaleSize(index == data.length - 1 ? 20 : 10)
                            }]}>
                                <View style={styles.firstRow}>
                                    <Text style={{
                                        fontSize: ScreenUtil.setSpText(9),
                                        fontWeight: 'bold',
                                        width: ScreenUtil.scaleSize(500),
                                    }} numberOfLines={1}>{item.formName}</Text>
                                    {this.renderStatus(item.formState)}
                                </View>
                                {this.renderDesc(item)}
                                <View style={styles.otherRow}>
                                    <Text style={styles.labelText}>{Message.APPLICATION_DATE}</Text>
                                    <Text style={styles.inputText}>{item.createTimeStr.substring(0, 16)}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListFooterComponent={
                        (this.props.state.showLoading) ?
                            <View style={{
                                flex: 1, flexDirection: 'row',
                                alignSelf: 'center',
                                width: ScreenUtil.scaleSize(280),
                                paddingVertical: ScreenUtil.scaleSize(10)}}>
                                <View style={{flex: 1, padding: 0, margin: 0, width: ScreenUtil.scaleSize(25)}}>
                                    <ActivityIndicator
                                        animating={this.props.state.showLoading}
                                        style={{height: ScreenUtil.scaleSize(20)}}
                                        size="small"/>
                                </View>
                                <View style={{
                                    flex: 1, padding: 0, margin: 0,height: ScreenUtil.scaleSize(20),
                                    alignSelf: 'flex-start', justifyContent: 'center'}}>
                                    <Text style={{fontSize: ScreenUtil.setSpText(8), color: '#666666'}}>
                                        {Message.INVOICE_LIST_LOADING}
                                    </Text>
                                </View>
                            </View> : <View/>
                    }
                />
            </View>
        )
    }

}

function mapStateToProps(state) {
    return {
        state: state.AuditList,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changeState: changeState,
        back: back,
        loadData: loadData,
        navigateReimbursementDetail: navigateReimbursementDetail,
        refreshUnApproved: refreshUnApproved,
        refreshAlreadyApproved: refreshAlreadyApproved,
        loadMoreUnApproved: loadMoreUnApproved,
        loadMoreAlreadyApproved: loadMoreAlreadyApproved,
        initData: initData,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AuditList);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F3F3'
    },
    tab: {
        height: ScreenUtil.scaleSize(73),
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
    },
    section: {
        height: ScreenUtil.scaleSize(73),
        width: deviceWidth / 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applicationView: {
        marginLeft: ScreenUtil.scaleSize(20),
        marginRight: ScreenUtil.scaleSize(20),
        marginTop: ScreenUtil.scaleSize(20),
        backgroundColor: '#FFFFFF',
        padding: ScreenUtil.scaleSize(20),
        borderRadius: ScreenUtil.scaleSize(8),

        shadowOffset: {width: 0, height: 1},
        shadowColor: 'rgba(0,0,0,0.3)',
        shadowOpacity: 1,
        shadowRadius: 2,
        elevation: 2,
    },
    firstRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: ScreenUtil.scaleSize(40),
        alignItems: 'center',
    },
    otherRow: {
        flexDirection: 'row',
        marginTop: ScreenUtil.scaleSize(20),
        height: ScreenUtil.scaleSize(40),
        alignItems: 'center',
    },
    labelText: {
        fontSize: ScreenUtil.setSpText(9),
        color: '#ABABAB',
        width: ScreenUtil.scaleSize(210),
    },
    inputText: {
        fontSize: ScreenUtil.setSpText(9),
        color: '#666666',
        width: ScreenUtil.scaleSize(450),
    },
    filterText: {
        fontSize: ScreenUtil.setSpText(9),
        color: '#FFFFFF',
    },
    filterTextView: {
        height: ScreenUtil.scaleSize(80),
        justifyContent: 'center',
        backgroundColor: 'transparent',
    }
});