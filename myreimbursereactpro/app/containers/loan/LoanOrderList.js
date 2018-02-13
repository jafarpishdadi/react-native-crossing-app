/**
 * 我的申请 借款单列表
 * Created by jack.fan on 24/1/2017.
 */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
    StyleSheet,
    View,
    TouchableWithoutFeedback,
    TouchableOpacity,
    FlatList,
    Text,
    Image,
    Platform,
    PixelRatio,
    ActivityIndicator,
} from 'react-native';
import {changeState, deleteLoanOrder, initData, loadData, loadLoanList, refreshLoanList, loadMoreLoan} from "../../redux/actions/loan/LoanOrderList";
import ScreenUtil, {deviceWidth} from "../../utils/ScreenUtil";
import Header from '../../containers/common/CommonHeader';
import {back, navigateLoanOrderDetail} from "../../redux/actions/navigator/Navigator";
import Message from "../../constant/Message";
import Util from "../../utils/Util";
import Dialog from '../../containers/common/Dialog';
import CommonLoading from '../../containers/common/CommonLoading';

class LoanOrderList extends Component{
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
        component.props.changeState({
            showFilter: false,
        });
        component.props.back();
    }

    /**
     * 渲染状态
     * @param code 表单状态
     * @param id 表单id
     */
    renderStatus(code, id) {
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
                color = '#CE1A1A';
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
                {
                    (code == '0') ? (
                        <TouchableOpacity onPress={() => {
                            this._openDeleteModal(id)
                        }}>
                            <Image source={require('../../img/common/trash.png')}
                                   style={{
                                       width: ScreenUtil.scaleSize(29),
                                       height: ScreenUtil.scaleSize(30),
                                       marginRight: ScreenUtil.scaleSize(10),
                                       alignSelf: 'center',
                                       resizeMode:'stretch',
                                   }}/>
                        </TouchableOpacity>
                    ) : (
                        null
                    )
                }
                <Text style={{
                    fontSize: ScreenUtil.setSpText(8),
                    color: color,
                }}>{status}</Text>
            </View>
        )
    }

    /**
     * 打开删除确认框
     */
    _openDeleteModal(id) {
        this.props.changeState({
            deleteModal: true,
            deleteFormId: id,
        })
    }

    //渲染除去日期的基本信息
    renderDesc(item) {
        const desc = JSON.parse(item.formDesc);
        const list = [];
        for (let item in desc) {
            const row = (
                <View style={styles.otherRow}>
                    <Text style={styles.labelText}>{Util.parseLoanOrderLabelJson(item)}</Text>
                        <Text
                            numberOfLines={1}
                            style={styles.inputText}>{desc[item]}</Text>
                </View>
            )
            list.push(row);
        }
        return list;
    }

    /**
     * 筛选
     */
    doFilter(formState) {
        this.props.changeState({
            showFilter: false,
            isLoading: true,
            spState: formState,
            page: 1,
        })
        this.props.loadLoanList({
            spState: formState,
            page: 1,
            rows: 5,
        })
    }

    /**
     * 关闭弹出框
     */
    _closeModal() {
        this.props.changeState({
            deleteModal: false,
        })
    }

    //处理日期格式
    renderApplicationDate (item) {
        if (item.formState === '0') {
            return '';
        } else {
            return Util.checkIsEmptyString(item.applyTimeStr) ? "" : item.applyTimeStr.substring(0,16);
        }
    }

    render() {
        return(
            <TouchableWithoutFeedback onPress={() => {
                this.props.changeState({
                    showFilter: false,
                })
            }}>
                <View style={styles.container}>
                    <CommonLoading isShow={this.props.state.isLoading}/>
                    <Dialog
                        content={Message.LOAN_DELETE_CONFIRM}
                        type={'confirm'}
                        leftBtnText={Message.CANCEL}
                        rightBtnText={Message.CONFIRM}
                        modalVisible={this.props.state.deleteModal}
                        leftBtnStyle={{color: '#ABABAB',}}
                        rightBtnStyle={{color: '#FFAA00',}}
                        onClose={this._closeModal.bind(this)}
                        rightBtnClick={() => {
                            this.props.deleteLoanOrder({
                                expenseNo: this.props.state.deleteFormId
                            }, this.props.state.spState)
                        }}
                        thisComponent={this}
                    />
                    <Header
                        titleText={Message.LOAN_LIST_TITLE}
                        thisComponent={this}
                        backClick={this.onBack}
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
                                height: ScreenUtil.scaleSize(504),
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
                                        <Text style={styles.filterText}>{Message.APPLICATION_NO_COMMIT}</Text>
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
                                        <Text style={styles.filterText}>{Message.APPLICATION_CANCEL}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                                <View style={{
                                    height: 1 / PixelRatio.get(),
                                    backgroundColor: '#5D5D5D',
                                    width: ScreenUtil.scaleSize(230),
                                }}/>
                                <TouchableWithoutFeedback onPress={() => {
                                    this.doFilter('3');
                                }}>
                                    <View style={styles.filterTextView}>
                                        <Text style={styles.filterText}>{Message.APPLICATION_IN_AUDIT}</Text>
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
                                        <Text style={styles.filterText}>{Message.APPLICATION_REJECT}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                                <View style={{
                                    height: 1 / PixelRatio.get(),
                                    backgroundColor: '#5D5D5D',
                                    width: ScreenUtil.scaleSize(230),
                                }}/>
                                <TouchableWithoutFeedback onPress={() => {
                                    this.doFilter('4');
                                }}>
                                    <View style={styles.filterTextView}>
                                        <Text style={styles.filterText}>{Message.APPLICATION_AUDIT_PASS}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            </Image>
                        ) : (
                            null
                        )
                    }

                    <View style={{flex: 1}}>
                        <FlatList
                            onEndReached={() => {
                                if (this.props.state.loadMore) {
                                    this.props.changeState({loadMore: false});
                                    this.props.loadMoreLoan({
                                        spState: this.props.state.spState,
                                        page: this.props.state.page + 1,
                                        rows: 5
                                    }, this.props.state.loanList)
                                }
                            }}
                            onRefresh={() => {
                                this.props.refreshLoanList({
                                    spState: this.props.state.spState,
                                    page: 1,
                                    rows: 5
                                })
                            }}
                            refreshing={this.props.state.isRefreshing}
                            data={this.props.state.loanList}
                            onScroll={() => {
                                this.props.changeState({
                                    showFilter: false,
                                })
                            }}
                            onEndReachedThreshold={0.8}
                            renderItem={({item, index}) => (
                                <TouchableOpacity onPress={() => {
                                    this.props.changeState({
                                        showFilter: false,
                                    });
                                    this.props.navigateLoanOrderDetail({
                                        //formId: item.formId,
                                        source: item.formState == '3' ? 'unapproved' : 'approved',
                                        applyStatus: item.formState
                                    })
                                }}>
                                    <View style={[styles.applicationView, {
                                        marginTop: ScreenUtil.scaleSize(index == 0 ? 20 : 10),
                                        marginBottom: ScreenUtil.scaleSize(index == this.props.state.loanList.length - 1 ? 20 : 10)
                                    }]}>
                                        <View style={styles.firstRow}>
                                            <Text style={{
                                                fontSize: ScreenUtil.setSpText(9),
                                                fontWeight: 'bold',
                                                width: ScreenUtil.scaleSize(500),
                                            }} numberOfLines={1}>{item.formName}</Text>
                                            {this.renderStatus(item.formState, item.formId)}
                                        </View>
                                        {this.renderDesc(item)}

                                        <View style={styles.otherRow}>
                                            <Text style={styles.labelText}>{Message.APPLICATION_DATE}</Text>
                                            <Text style={styles.inputText}>{this.renderApplicationDate(item)}</Text>
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
                </View>
            </TouchableWithoutFeedback>
        )
    }
}

function mapStateToProps(state) {
    return {
        state: state.LoanOrderList,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        changeState: changeState,
        back: back,
        navigateLoanOrderDetail: navigateLoanOrderDetail,
        deleteLoanOrder: deleteLoanOrder,
        initData: initData,
        loadData: loadData,
        loadMoreLoan: loadMoreLoan,
        loadLoanList: loadLoanList,
        refreshLoanList: refreshLoanList,
    },dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(LoanOrderList);

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
        width: ScreenUtil.scaleSize(450)
    },
    filterTextView: {
        height: ScreenUtil.scaleSize(80),
        width: ScreenUtil.scaleSize(230),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    filterText: {
        fontSize: ScreenUtil.setSpText(9),
        color: '#FFFFFF',
    },
})