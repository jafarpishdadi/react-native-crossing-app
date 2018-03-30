/**
 * 我的申请 借款单列表
 * Created by jack.fan on 24/1/2017.
 */
import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
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
    findNodeHandle
} from "react-native";
import {
    changeState,
    deleteLoanOrder,
    initData,
    loadData,
    loadLoanList,
    refreshLoanList,
    loadMoreLoan
} from "../../redux/actions/loan/LoanOrderList";
import ScreenUtil from "../../utils/ScreenUtil";
import Header from "../../containers/common/CommonHeader";
import {back, navigateLoanOrderDetail} from "../../redux/actions/navigator/Navigator";
import Message from "../../constant/Message";
import Util from "../../utils/Util";
import Dialog from "../../containers/common/Dialog";
import CommonLoading from "../../containers/common/CommonLoading";
import {BlurView} from "react-native-blur";
import SafeAreaView from "react-native-safe-area-view";

class LoanOrderList extends Component{
    static navigationOptions = ({navigation}) => ({
        header: null,
    })

    componentWillMount() {
        this.props.initData();
    }

    componentDidMount() {
        this.props.loadData();
        this.props.changeState({
            viewRef: findNodeHandle(this.backgroundImage)
        });
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
     * @param repay 是否还完
     */
    renderStatus(code, id, repay) {
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
            <View style={{
                flexDirection: 'row',
                height: ScreenUtil.scaleSize(40),
                alignItems: 'center'
            }}>
                {
                    (code == '0') ? (
                        <TouchableOpacity style={{
                            marginRight: ScreenUtil.scaleSize(20),
                        }} onPress={() => {
                            this._openDeleteModal(id)
                        }}>
                            <View style={{
                                height: ScreenUtil.scaleSize(40),
                                justifyContent: 'center',
                                width: ScreenUtil.scaleSize(40),
                                alignItems: 'flex-end',
                            }}>
                                <Image source={require('../../img/common/trash.png')}
                                       style={{
                                           width: ScreenUtil.scaleSize(29),
                                           height: ScreenUtil.scaleSize(30),
                                           //marginRight: ScreenUtil.scaleSize(10),
                                           alignSelf: 'center',
                                           resizeMode:'stretch',
                                       }}/>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        null
                    )
                }
                {
                    code == '4' ? (
                        repay == 1 ? (
                            <Text style={{
                                fontSize: ScreenUtil.setSpText(7),
                                color: '#A5A5A5',
                                marginRight: ScreenUtil.scaleSize(20),
                            }}>{Message.HAVE_REPAY}</Text>
                        ) : (
                            <Text style={{
                                fontSize: ScreenUtil.setSpText(7),
                                color: '#FF8080',
                                marginRight: ScreenUtil.scaleSize(20),
                            }}>{Message.NO_REPAY}</Text>
                        )
                    ) : null
                }
                <Text style={{
                    fontSize: ScreenUtil.setSpText(7),
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
        if (item.borrowStateCode === '0') {
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
                <SafeAreaView style={styles.container}>
                    <View style={[styles.container, {backgroundColor: '#F3F3F3'}]}>
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
                                    borrowNo: this.props.state.deleteFormId
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
                                <View style={{
                                    width: ScreenUtil.scaleSize(290),
                                    height: ScreenUtil.scaleSize(504),
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
                                        <View style={[styles.filterTextView]}>
                                            <Text style={styles.filterText}>{Message.APPLICATION_ALL}</Text>
                                        </View>
                                    </TouchableWithoutFeedback>
                                    <View style={styles.filterLine}/>
                                    <TouchableWithoutFeedback onPress={() => {
                                        this.doFilter('0');
                                    }}>
                                        <View style={styles.filterTextView}>
                                            <Text style={styles.filterText}>{Message.APPLICATION_NO_COMMIT}</Text>
                                        </View>
                                    </TouchableWithoutFeedback>
                                    <View style={styles.filterLine}/>
                                    <TouchableWithoutFeedback onPress={() => {
                                        this.doFilter('1');
                                    }}>
                                        <View style={styles.filterTextView}>
                                            <Text style={styles.filterText}>{Message.APPLICATION_CANCEL}</Text>
                                        </View>
                                    </TouchableWithoutFeedback>
                                    <View style={styles.filterLine}/>
                                    <TouchableWithoutFeedback onPress={() => {
                                        this.doFilter('3');
                                    }}>
                                        <View style={styles.filterTextView}>
                                            <Text style={styles.filterText}>{Message.APPLICATION_IN_AUDIT}</Text>
                                        </View>
                                    </TouchableWithoutFeedback>
                                    <View style={styles.filterLine}/>
                                    <TouchableWithoutFeedback onPress={() => {
                                        this.doFilter('2');
                                    }}>
                                        <View style={styles.filterTextView}>
                                            <Text style={styles.filterText}>{Message.APPLICATION_REJECT}</Text>
                                        </View>
                                    </TouchableWithoutFeedback>
                                    <View style={styles.filterLine}/>
                                    <TouchableWithoutFeedback onPress={() => {
                                        this.doFilter('4');
                                    }}>
                                        <View style={styles.filterTextView}>
                                            <Text style={styles.filterText}>{Message.APPLICATION_AUDIT_PASS}</Text>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
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
                                            formId: item.borrowNo,
                                            source: 'apply',
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
                                                }} numberOfLines={1}>{item.borrowName}</Text>
                                                {this.renderStatus(item.borrowStateCode, item.borrowNo, item.repay)}
                                            </View>
                                            <View style={styles.otherRow}>
                                                <Text style={styles.labelText}>{Message.LOAN_REASON}</Text>
                                                <Text
                                                    numberOfLines={1}
                                                    style={styles.inputText}>{item.borrowDesc}</Text>
                                            </View>
                                            <View style={styles.otherRow}>
                                                <Text style={styles.labelText}>{Message.LOAN_AMOUNT}</Text>
                                                <Text
                                                    numberOfLines={1}
                                                    style={styles.inputText}>{item.borrowAmount ? Message.MONEY + parseFloat(item.borrowAmount).toFixed(2) : ''}</Text>
                                            </View>
                                            <View style={styles.otherRow}>
                                                <Text style={styles.labelText}>{Message.DEPARTMENT}</Text>
                                                <Text
                                                    numberOfLines={1}
                                                    style={styles.inputText}>{item.borrowDname}</Text>
                                            </View>

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
                                            paddingVertical: ScreenUtil.scaleSize(10)
                                        }}>
                                            <View style={{
                                                flex: 1,
                                                padding: 0,
                                                margin: 0,
                                                width: ScreenUtil.scaleSize(25)
                                            }}>
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
                    </View>
                </SafeAreaView>
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
        backgroundColor: 'white'
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
    filterLine: {
        height: 1 / PixelRatio.get(),
        backgroundColor: Platform.OS == 'ios' ? '#696868' : '#5D5D5D',
        width: ScreenUtil.scaleSize(230),
    }
})