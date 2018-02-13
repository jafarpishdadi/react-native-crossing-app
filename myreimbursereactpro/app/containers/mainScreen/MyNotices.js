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
    FlatList,
    Platform,
    StyleSheet,
    ActivityIndicator
} from 'react-native';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import Message from "../../constant/Message";
import ScreenUtil from "../../utils/ScreenUtil";
import Util from '../../utils/Util';
import CommonLoading from '../../containers/common/CommonLoading';
import {
    changeState,
    loadData,
    updateMessageStatus,
    checkApprovalUserAction,
    refreshMyNotices,
    loadMoreMyNotices,
    initData,
} from '../../redux/actions/mine/MyNotices';
import {navigateReimbursementDetail, back} from '../../redux/actions/navigator/Navigator';
import {loadMessageData, changeState as homePageChangeState} from '../../redux/actions/homePage/HomePage';
import Header from "./../common/CommonHeader";

class MyNotices extends Component {
    static navigationOptions = ({navigation}) => ({
        header: null,
    })

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
     * 渲染未读消息
     * @returns {XML}
     */
    renderReading(item) {
        if (item[7] === "0") {
            return (<View style={styles.dotRow}>
                    <Image
                        style={styles.dotIcon}
                        source={require('./../../img/mine/oval.png')}/>
                </View>
            )
        }

    }

    /**
     * 渲染状态
     * @param statusCode 状态码
     * （0表示被评论，1表示已撤回，2表示已驳回，3表示待审批，4审批中，5表示审批通过）
     */
    renderStatus(status) {
        let statusName = '';
        let color = '';

        switch (status) {
            case '0':
            case '被评论':
                statusName = Message.MESSAGE_COMMENTED;
                color = '#66CC00';
                break;
            case '1':
            case '已撤回':
                statusName = Message.MESSAGE_CANCEL;
                color = '#CE1A1A';
                break;
            case '2':
            case'已驳回':
                statusName = Message.MESSAGE_REJECT;
                color = '#FF8080';
                break;
            case '3':
            case '待审批':
                statusName = Message.MESSAGE_NO_AUDIT;
                color = '#ABABAB';
                break;
            case '4':
            case'审批中':
                statusName = Message.MESSAGE_IN_AUDIT;
                color = '#ABABAB';
                break;
            case '5':
            case'审批通过':
                statusName = Message.MESSAGE_AUDIT_PASSED;
                color = '#FFAA00';
                break;
            case '6':
            case'被回复':
                statusName = Message.MESSAGE_REPLY;
                color = '#66CC00';
            default:
        }

        return (
            <Text style={[styles.statusText, {color: color}]}>
                {statusName}
            </Text>
        )
    }

    getMessageDescriptionArray() {
        var data = this.props.state.messageData;
        var prepareData = [];
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                var dataDescription = '';
                var subDataDescription = '';
                var copyData = [];
                //消息主键id
                copyData[0] = data[i].id;
                //消息详情信息编号
                copyData[1] = data[i].detailId;
                //消息类型
                copyData[2] = data[i].noticeType;
                //消息描述
                dataDescription = data[i].noticeDesc;

                subDataDescription = Util.jsonParse(dataDescription);

                //消息-报销金额
                copyData[3] = subDataDescription.amount;
                //消息-报销类型名称
                copyData[4] = subDataDescription.applyTypeName;
                //消息-报销状态
                copyData[5] = subDataDescription.expenseState;
                //消息-报销title
                copyData[6] = subDataDescription.title;
                //是否查看 0没查看1已查看
                copyData[7] = data[i].isView;
                //用来判断审批权限
                copyData[8] = subDataDescription.isApplicant;

                prepareData.splice(i, 1, copyData);
            }
        }
        return prepareData;
    }

    /**
     * 点击未读消息，去除红点
     * @param item
     */
    updateMessage(item) {
        var data = this.props.state.messageData;
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                if (item[0] === data[i].id) {
                    //是否查看 0没查看1已查看
                    data[i].isView = item[7];
                }
            }
        }
        this.props.changeState({
            messageData: data
        });
    }

    /**
     * 金额保留2位小数
     * @returns {string}
     */
    moneyFormat(money, flag) {
        if (Util.checkIsEmptyString(money)) {
            money = 0;
        }
        var result = '';
        switch (flag) {
            case 1:
                result = parseFloat(this.props.state.totalAmount).toFixed(2) + '';
                return result;
            case 2:
                result = ((parseFloat(money).toFixed(2) + '') == 'NaN') ? '' : (parseFloat(money).toFixed(2) + '');
                return result;
            default:
        }
    }

    render() {
        let that = this;
        return (
            <View style={styles.container}>
                <CommonLoading isShow={this.props.state.isLoading}/>
                <Header
                    titleText={Message.MY_NOTICES}
                    thisComponent={this}
                    backClick={this.onBack}
                />
                <FlatList
                    onRefresh={() => {
                        this.props.refreshMyNotices();
                    }}
                    refreshing={this.props.state.isRefreshing}
                    onEndReached={() => {
                        if (this.props.state.loadMore) {
                            this.props.changeState({loadMore: false});
                            this.props.loadMoreMyNotices({
                                page: this.props.state.page + 1,
                                rows: 10
                            }, this.props.state.messageData)
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    data={this.getMessageDescriptionArray()}
                    renderItem={({item, index}) => (
                        <TouchableOpacity
                            onPress={() => {
                                that.props.checkApprovalUserAction({
                                    expenseNo: item[1],
                                    isApplicant: item[8] ? item[8] : '',
                                }, () => {
                                    that.props.updateMessageStatus(
                                        {
                                            "id": item[0],
                                            "isView": item[7]
                                        }, () => {
                                            that.props.loadMessageData();
                                            if (item[7] == "0") {
                                                item[7] = "1";
                                                that.updateMessage(item);
                                            }
                                        }
                                    );
                                });
                            }}>
                            <View
                                style={[styles.applicationView, {marginTop: ScreenUtil.scaleSize(index == 0 ? 20 : 10)}]}>
                                {this.renderReading(item)}
                                <View style={{
                                    flexDirection: 'row', alignItems: 'space-between',
                                    justifyContent: 'space-between', height: ScreenUtil.scaleSize(40)
                                }}>
                                    <View style={styles.firstRow}>
                                        <Text style={{
                                            fontSize: ScreenUtil.setSpText(9),
                                            fontWeight: 'bold',
                                        }} numberOfLines={1}>{item[6]}</Text>
                                    </View>
                                    <View style={{
                                        marginTop: 0, paddingTop: 0,
                                        height: ScreenUtil.scaleSize(40)
                                    }}>
                                        {this.renderStatus(item[5])}
                                    </View>
                                </View>
                                <View style={styles.otherRow}>
                                    <Text style={styles.labelText}>{Message.REIMBURSEMENT_CATEGORY}</Text>
                                    <Text style={styles.inputText}>{item[4]}</Text>
                                </View>
                                <View style={styles.otherRow}>
                                    <Text style={styles.labelText}>{Message.REIMBURSEMENT_AMOUNT_NOTICE}</Text>
                                    <Text style={styles.inputText}>{Message.MONEY + this.moneyFormat(item[3], 2)}</Text>
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
                                paddingVertical: ScreenUtil.scaleSize(10)
                            }}>
                                <View style={{flex: 1, padding: 0, margin: 0, width: ScreenUtil.scaleSize(25)}}>
                                    <ActivityIndicator
                                        animating={this.props.state.showLoading}
                                        style={{height: ScreenUtil.scaleSize(20)}}
                                        size="small"/>
                                </View>
                                <View style={{
                                    flex: 1, padding: 0, margin: 0, height: ScreenUtil.scaleSize(20),
                                    alignSelf: 'flex-start', justifyContent: 'center'
                                }}>
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
        state: state.MyNotices,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changeState: changeState,
        navigateReimbursementDetail: navigateReimbursementDetail,
        loadData: loadData,
        back: back,
        updateMessageStatus: updateMessageStatus,
        checkApprovalUserAction: checkApprovalUserAction,
        refreshMyNotices: refreshMyNotices,
        loadMoreMyNotices: loadMoreMyNotices,
        initData: initData,
        loadMessageData: loadMessageData,
        homePageChangeState: homePageChangeState,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MyNotices);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F3F3'
    },
    applicationView: {
        marginLeft: ScreenUtil.scaleSize(20),
        marginRight: ScreenUtil.scaleSize(20),
        marginTop: ScreenUtil.scaleSize(10),
        marginBottom: ScreenUtil.scaleSize(10),
        backgroundColor: '#FFFFFF',
        padding: ScreenUtil.scaleSize(20),
        borderRadius: ScreenUtil.scaleSize(8),

        shadowOffset: {width: 0, height: 1},
        shadowColor: 'rgba(0,0,0,0.3)',
        shadowOpacity: 1,
        shadowRadius: 2,
        elevation: 2,
    },
    dotRow: {
        flexDirection: 'row',
        position: 'absolute',
        left: ScreenUtil.scaleSize(4),
        top: ScreenUtil.scaleSize(4)
    },
    dotIcon: {
        width: ScreenUtil.scaleSize(15),
        height: ScreenUtil.scaleSize(15)
    },
    firstRow: {
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
        color: '#666666'
    },
    statusText: {
        fontSize: ScreenUtil.setSpText(6.6),
        color: '#666666'
    }
});