/**
 * 我的审批 审批列表
 * Created by howard.li on 11/8/2017.
 */

import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Header from "../../containers/common/CommonHeader";
import Message from "../../constant/Message";
import ScreenUtil, {deviceWidth} from "../../utils/ScreenUtil";
import {
    back,
    navigateReimbursementDetail,
    navigateLoanOrderDetail,
    navigateTravelApplyDetail
} from "../../redux/actions/navigator/Navigator";
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
    PixelRatio
} from "react-native";
import {
    changeState,
    loadData,
    refreshUnApproved,
    refreshAlreadyApproved,
    loadMoreUnApproved,
    loadMoreAlreadyApproved,
    initData,
    loadUnapproved,
    loadAlreadyApproved,
    loadCopyList,
    refreshCopyList,
    loadMoreCopy,
    getUnapprovedCount
} from "../../redux/actions/audit/AuditList";
import CommonLoading from "../../containers/common/CommonLoading";
import Util from "../../utils/Util";
import {BlurView} from "react-native-blur";
import SafeAreaView from "react-native-safe-area-view";

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
    renderStatus(item) {
        let status = '';
        let color = '';
        let isLoanApplication = false;
        switch (item.formState) {
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
                if (item.formTypeCode == '100003') {
                    isLoanApplication = true;
                }
                break;
            default:
        }

        return (
            <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                {
                    isLoanApplication ? (<View style={{marginRight: ScreenUtil.scaleSize(30)}}>
                        {
                            item.repay ?
                                (
                                    <Text
                                        style={{
                                            fontSize: ScreenUtil.setSpText(6.6),
                                            color: '#A5A5A5'
                                        }}
                                    >
                                        {Message.HAVE_REPAY}
                                    </Text>
                                ) : (
                                <Text
                                    style={{
                                        fontSize: ScreenUtil.setSpText(6.6),
                                        color: '#FF8080'
                                    }}
                                >
                                    {Message.NO_REPAY}
                                </Text>
                            )
                        }
                    </View>) : (null)
                }
                <View>
                    <Text style={{
                        fontSize: ScreenUtil.setSpText(6.6),
                        color: color,
                    }}>{status}</Text>
                </View>
            </View>
        )
    }

    renderDesc(item) {
        const desc = JSON.parse(item.formDesc);
        const list = [];
        for (let item in desc) {
            const row = (
                <View style={styles.otherRow}>
                    <Text style={styles.labelText}>{Util.parseReimbursementLabelJson(item)}</Text>
                    {item == "amount" || item == "borrowAmount" || item == "planCost" ?
                        <Text
                            numberOfLines={1}
                            style={styles.inputText}>{desc[item] == '' ? '' : Message.MONEY + parseFloat(desc[item]).toFixed(2)}</Text> :
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

        //this.props.getUnapprovedCount();

        this.props.loadUnapproved({
            flag: 0,
            page: 1,
            rows: 5,
            formTypeCode: type,
        }, true);

        this.props.loadAlreadyApproved({
            flag: 1,
            page: 1,
            rows: 5,
            formTypeCode: type,
        }, true);

        this.props.loadCopyList({
            flag: 2,
            page: 1,
            rows: 5,
            formTypeCode: type,
        });
        this.props.changeState({
            unapprovedPage: 1,
            alreadyApprovedPage: 1,
            copyToMePage: 1,
        });
    }

    render() {
        const count = this.props.state.unapprovedCount > 999 ? '999+' : this.props.state.unapprovedCount;
        let data;
        if (this.props.state.selected == '0') {
            data = this.props.state.unapproved;
        } else if (this.props.state.selected == '1') {
            data = this.props.state.alreadyApproved;
        } else if (this.props.state.selected == '2') {
            data = this.props.state.copyToMe;
        }
        return (
            <SafeAreaView style={styles.container}>
                <View style={[styles.container, {backgroundColor: '#F3F3F3'}]}>
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
                            <View style={{
                                width: ScreenUtil.scaleSize(290),
                                height: ScreenUtil.scaleSize(340),
                                resizeMode: 'stretch',
                                position: 'absolute',
                                top: ScreenUtil.scaleSize(Platform.OS == 'ios' ? 120 : 85),
                                right: ScreenUtil.scaleSize(10),
                                zIndex: 500,
                                alignItems: 'center',
                                paddingHorizontal: ScreenUtil.scaleSize(30),
                                elevation: 4,
                            }}>
                                <View style={{
                                    height: ScreenUtil.scaleSize(14),
                                    backgroundColor: 'transparent',
                                    width: ScreenUtil.scaleSize(290),
                                }}>
                                    <Image style={{
                                        width: ScreenUtil.scaleSize(38),
                                        height: ScreenUtil.scaleSize(14),
                                        resizeMode: 'contain',
                                        position: 'absolute',
                                        bottom: 0,
                                        right: ScreenUtil.scaleSize(30),
                                    }} source={require('../../img/reimbursement/triangle.png')}/>
                                </View>
                                <View style={{
                                    position: "absolute",
                                    top: ScreenUtil.scaleSize(13),
                                    left: 0, bottom: 0, right: 0,
                                    borderRadius: ScreenUtil.scaleSize(8),
                                    backgroundColor: Platform.OS == 'ios' ? 'transparent' : 'rgba(0, 0, 0, 0.8)',
                                }}>
                                    <BlurView
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0, bottom: 0, right: 0,
                                            borderRadius: ScreenUtil.scaleSize(8),
                                        }}
                                        viewRef={this.props.state.viewRef}
                                        blurType="dark"
                                        blurAmount={10}
                                    />
                                </View>
                                <TouchableWithoutFeedback onPress={() => {
                                    this.doFilter('');
                                }}>
                                    <View style={styles.filterTextView}>
                                        <Text style={styles.filterText}>{Message.APPLICATION_ALL}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                                <View style={styles.filterLine}/>
                                <TouchableWithoutFeedback onPress={() => {
                                    this.doFilter('2');
                                }}>
                                    <View style={styles.filterTextView}>
                                        <Text style={styles.filterText}>{Message.AUDIT_REIMBURSEMENT}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                                <View style={styles.filterLine}/>
                                <TouchableWithoutFeedback onPress={() => {
                                    this.doFilter('100003');
                                }}>
                                    <View style={styles.filterTextView}>
                                        <Text style={styles.filterText}>{Message.AUDIT_LOAN}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                                <View style={styles.filterLine}/>
                                <TouchableWithoutFeedback onPress={() => {
                                    this.doFilter('100004');
                                }}>
                                    <View style={styles.filterTextView}>
                                        <Text style={styles.filterText}>{Message.AUDIT_TRAVEL}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
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
                                    }}/>
                                ) : null
                            }
                            <View style={{
                                position: 'absolute',
                                top: ScreenUtil.scaleSize(10),
                                left: (deviceWidth / 6 + ScreenUtil.scaleSize(96) / 2),
                                height: ScreenUtil.scaleSize(53),
                                justifyContent: 'center',
                            }}>
                                <Text style={{
                                    fontSize: ScreenUtil.setSpText(8),
                                    color: this.props.state.selected == '0' ? '#FFAA00' : '#666666'
                                }}>
                                    {'(' + count + ')'}
                                </Text>
                            </View>
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
                                    }}/>
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
                                    }}/>
                                ) : null
                            }
                        </View>
                    </View>
                    <FlatList
                        data={data}
                        onRefresh={() => {
                            const requestData = {
                                flag: this.props.state.selected,
                                page: 1,
                                rows: 5,
                                formTypeCode: this.props.state.applyType
                            }
                            if (this.props.state.selected == '0') {
                                this.props.refreshUnApproved(requestData)
                            } else if (this.props.state.selected == '1') {
                                this.props.refreshAlreadyApproved(requestData)
                            } else {
                                this.props.refreshCopyList(requestData)
                            }
                        }}
                        refreshing={this.props.state.isRefreshing}
                        onEndReached={() => {
                            if (this.props.state.selected == '0' && this.props.state.unapprovedLoadMore) {
                                this.props.changeState({unapprovedLoadMore: false});
                                this.props.loadMoreUnApproved({
                                    flag: 0,
                                    page: this.props.state.unapprovedPage + 1,
                                    rows: 5,
                                    formTypeCode: this.props.state.applyType,
                                }, this.props.state.unapproved)
                            } else if (this.props.state.selected == '1' && this.props.state.alreadyApprovedLoadMore) {
                                this.props.changeState({alreadyApprovedLoadMore: false});
                                this.props.loadMoreAlreadyApproved({
                                    flag: 1,
                                    page: this.props.state.alreadyApprovedPage + 1,
                                    rows: 5,
                                    formTypeCode: this.props.state.applyType,
                                }, this.props.state.alreadyApproved)
                            } else if (this.props.state.selected == '2' && this.props.state.copyToMeLoadMore) {
                                this.props.changeState({copyToMeLoadMore: false});
                                this.props.loadMoreCopy({
                                    flag: 2,
                                    page: this.props.state.copyToMePage + 1,
                                    rows: 5,
                                    formTypeCode: this.props.state.applyType,
                                }, this.props.state.copyToMe)
                            }
                        }}
                        onEndReachedThreshold={0.5}
                        renderItem={({item, index}) => (
                            <TouchableOpacity onPress={() => {
                                //报销单
                                if (item.formTypeCode == '100001' || item.formTypeCode == '1') {
                                    this.props.navigateReimbursementDetail({
                                        formId: item.formId,
                                        source: this.props.state.selected == '0' ? 'unapproved' : 'approved',
                                        taskId: item.taskId,
                                        taskDefKey: item.taskDefKey,
                                    })
                                }
                                //借款单
                                if (item.formTypeCode == '100003') {
                                    this.props.navigateLoanOrderDetail({
                                        formId: item.formId,
                                        source: this.props.state.selected == '0' ? 'unapproved' : 'approved',
                                        taskId: item.taskId,
                                        taskDefKey: item.taskDefKey,
                                    })
                                }
                                //差旅申请单
                                if (item.formTypeCode == '100004') {
                                    this.props.navigateTravelApplyDetail({
                                        travelApplyDetail: item.formId,
                                        formId: item.formId,
                                        source: this.props.state.selected == '0' ? 'unapproved' : 'approved',
                                        taskId: item.taskId,
                                        taskDefKey: item.taskDefKey,
                                    })
                                }
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
                                        {this.renderStatus(item)}
                                    </View>
                                    {this.renderDesc(item)}
                                    <View style={styles.otherRow}>
                                        <Text style={styles.labelText}>{Message.APPLICATION_DATE}</Text>
                                        <Text style={styles.inputText}>{item.applyTimeStr.substring(0, 16)}</Text>
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
            </SafeAreaView>
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
        navigateLoanOrderDetail: navigateLoanOrderDetail,
        navigateTravelApplyDetail: navigateTravelApplyDetail,
        loadUnapproved: loadUnapproved,
        loadAlreadyApproved: loadAlreadyApproved,
        loadCopyList: loadCopyList,
        refreshCopyList: refreshCopyList,
        loadMoreCopy: loadMoreCopy,
        getUnapprovedCount: getUnapprovedCount,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AuditList);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
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
    },
    filterLine: {
        height: 1 / PixelRatio.get(),
        backgroundColor: Platform.OS == 'ios' ? '#696868' : '#5D5D5D',
        width: ScreenUtil.scaleSize(230),
    }
});