/**
 * Created by Louis.lu on 2018-01-19.
 * 费用分摊
 */
import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    View,
    Platform,
    TouchableOpacity,
    NativeModules,
    TouchableWithoutFeedback,
    FlatList,
    ActivityIndicator,
    PixelRatio,
    ScrollView,
} from "react-native";
import ScreenUtil, {deviceHeight, deviceWidth} from "../../utils/ScreenUtil";
import Message from "../../constant/Message";
import Header from "./../common/CommonHeader";
import CommonLoading from "../common/CommonLoading";
import {
    back,
} from "../../redux/actions/navigator/Navigator";
import Util from "../../utils/Util";
import {
    changeState,
    loadData,
    initData,
    refreshDeptData,
    refreshProjectData,
} from "./../../redux/actions/reimbursement/CostSharing"

class CostSharing extends Component {
    static navigationOptions = ({navigation}) => ({
        header: null
    });

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.initData();
        this.props.loadData();
    }

    //确认选择
    confirmCostSharing() {
        //todo
        this.props.back();
    }

    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        component.props.back();
    }

    //选择项目或者部门
    selectItem(item) {
        if (this.props.state.costCenterTypeCode == 0) {
            if (item.id == this.props.state.selectedDept.id) {
                this.props.changeState({
                    selectedDept: {},
                    selectedProject: {},
                })
            } else {
                this.props.changeState({
                    selectedDept: item,
                    selectedProject: {},
                })
            }
        } else {
            if (item.id == this.props.state.selectedProject.id) {
                this.props.changeState({
                    selectedDept: {},
                    selectedProject: {},
                })
            } else {
                this.props.changeState({
                    selectedDept: {},
                    selectedProject: item,
                })
            }

        }
    }

    //渲染列表项
    renderDataItem(item, index) {
        let img;
        if (this.props.state.costCenterTypeCode == 0) {
            img = item.id == this.props.state.selectedDept.id ? (
                require('./../../img/copyperson/selected.png')
            ) : (
                require('./../../img/copyperson/oval_unselected.png')
            )
        } else {
            img = item.id == this.props.state.selectedProject.id ? (
                require('./../../img/copyperson/selected.png')
            ) : (
                require('./../../img/copyperson/oval_unselected.png')
            )
        }
        return (
            <View style={{
                height: ScreenUtil.scaleSize(80),
                paddingHorizontal: ScreenUtil.scaleSize(40),
                flexDirection: 'row',
                alignItems: 'flex-end',
            }}>
                <TouchableOpacity
                    onPress={() => {
                        this.selectItem(item);
                    }}
                >
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        height: ScreenUtil.scaleSize(40),
                    }}>
                        <Image source={img}
                               style={styles.selectImg}/>
                        <Text style={styles.rowText}>{item.name}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )

    }

    //刷新列表
    refreshData() {
        if (this.props.state.costCenterTypeCode == 0) {
            //this.props.refreshDeptData();
        } else {
            //this.props.refreshProjectData();
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <CommonLoading isShow={this.props.state.isLoading}/>
                <Header
                    titleText={Message.COST_SHARING_TITLE}
                    thisComponent={this}
                    backClick={this.onBack}
                    rightText={Message.CONFIRM}
                    rightClick={this.confirmCostSharing.bind(this)}
                    rightTextStyle={{
                        fontSize: ScreenUtil.setSpText(9),
                        color: '#FFAA00',
                    }}
                    backControl={false}
                />
                <View style={styles.costSharingNavigator}>
                    <TouchableOpacity
                        onPress={() => {
                            this.props.changeState({
                                costCenterTypeCode: "0"
                            })
                        }}
                    >
                        <View style={{
                            width: deviceWidth / 2,
                            height: ScreenUtil.scaleSize(58),
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Text style={{
                                fontSize: ScreenUtil.setSpText(7),
                                color: this.props.state.costCenterTypeCode == '0' ? '#FFAA00' : '#666666'
                            }}>
                                {Message.COST_SHARING_DEPT_LABEL}
                            </Text>
                            {
                                this.props.state.costCenterTypeCode == '0' ? (
                                    <View style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: (deviceWidth / 2 - ScreenUtil.scaleSize(96)) / 2,
                                        height: ScreenUtil.scaleSize(4),
                                        width: ScreenUtil.scaleSize(96),
                                        backgroundColor: '#FFAA00',
                                    }}/>
                                ) : null
                            }
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            this.props.changeState({
                                costCenterTypeCode: "1"
                            })
                        }}
                    >
                        <View style={{
                            width: deviceWidth / 2,
                            height: ScreenUtil.scaleSize(58),
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Text style={{
                                fontSize: ScreenUtil.setSpText(7),
                                color: this.props.state.costCenterTypeCode == '1' ? '#FFAA00' : '#666666'
                            }}>
                                {Message.COST_SHARING_PROJECT_LABEL}
                            </Text>
                            {
                                this.props.state.costCenterTypeCode == '1' ? (
                                    <View style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: (deviceWidth / 2 - ScreenUtil.scaleSize(96)) / 2,
                                        height: ScreenUtil.scaleSize(4),
                                        width: ScreenUtil.scaleSize(96),
                                        backgroundColor: '#FFAA00',
                                    }}/>
                                ) : null
                            }
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.rowSeparator}/>
                <FlatList
                    style={{flex: 1}}
                    data={this.props.state.costCenterTypeCode == 0 ? this.props.state.deptList : this.props.state.projectList}
                    onRefresh={() => {
                        this.refreshData();
                    }}
                    refreshing={this.props.state.isRefreshing}
                    renderItem={({item, index}) => this.renderDataItem(item, index)}
                />
            </View>
        )
    }
}

function mapStateToProps(state) {
    return {
        state: state.CostSharing,
        nav: state.nav,
        appState: state.App,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        back: back,
        changeState: changeState,
        loadData: loadData,
        initData: initData,
        refreshDeptData: refreshDeptData,
        refreshProjectData: refreshProjectData,
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(CostSharing);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    costSharingNavigator: {
        width: deviceWidth,
        flexDirection: 'row',
        height: ScreenUtil.scaleSize(58),
    },
    horizontalLine: {
        width: ScreenUtil.scaleSize(96),
        height: ScreenUtil.scaleSize(4),
    },
    rowSeparator: {
        backgroundColor: '#DEDEDE',
        height: 1 / PixelRatio.get(),
        marginHorizontal: ScreenUtil.scaleSize(30),
    },
    selectImg: {
        width: ScreenUtil.scaleSize(40),
        height: ScreenUtil.scaleSize(40),
        resizeMode: Image.resizeMode.contain,
    },
    rowText: {
        color: '#666666',
        fontSize: ScreenUtil.setSpText(9),
        marginLeft: ScreenUtil.scaleSize(40)
    },
})