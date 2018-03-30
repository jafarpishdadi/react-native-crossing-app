/**
 * Created by Louis.lu on 2018-01-15.
 * 选择抄送人
 */
import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
    Image,
    StyleSheet,
    Text,
    View,
    TextInput,
    ScrollView,
    FlatList,
    Platform,
    NativeModules,
    TouchableOpacity,
    TouchableWithoutFeedback,
    BackHandler,
    PixelRatio,
    RefreshControl,
    ActivityIndicator
} from "react-native";
import ScreenUtil from "../../utils/ScreenUtil";
import Util from "../../utils/Util";
import Message from "../../constant/Message";
import Header from "../../containers/common/CommonHeader";
import CommonLoading from "../../containers/common/CommonLoading";
import {back} from "../../redux/actions/navigator/Navigator";
import {
    changeState,
    initData,
    loadData,
    refreshData,
    loadMorePerson,
    refreshPersonList,
    searchPersonList
} from "./../../redux/actions/reimbursement/SelectCopyPerson";
import Store from "react-native-simple-store";
import SafeAreaView from "react-native-safe-area-view";

class SelectCopyPerson extends Component {
    static navigationOptions = ({navigation}) => ({
        header: null
    });

    componentWillMount() {
        this.props.initData();
    }

    componentDidMount() {
        const that = this;
        Store.get('user').then((user) => {
            if (user) {
                that.props.changeState({
                    currentUserId: user.userNo,
                })
            }
        })
        this.props.loadData(this.props.navigation.state.params.selectedPersonList);
    }

    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        const dismissKeyboard = require('dismissKeyboard');
        dismissKeyboard();
        component.props.back();
    }

    /**
     * 确定
     */
    onConfirm() {
        // if (this.props.state.selectedPersonList.length == 0) {
        //     if (this.props.navigation.state.params.code == 0) {
        //         Util.showToast(Message.SELECT_COPY_PERSON_NO_MSG);
        //     } else {
        //         Util.showToast(Message.SELECT_TOGETHER_PERSON_NO_MSG);
        //     }
        //     return;
        // }
        this.props.navigation.state.params.callback(this.props.state.selectedPersonList);
        //this.props.navigation.state.params.callback(this.getPersonName(), this.getPersonId());
        this.props.back();
    }

    /**
     * 渲染部门列表
     * @param item
     */
    renderDep(item) {
        return (
            item.map((item) => {
                return (
                    <View style={{
                        marginLeft: ScreenUtil.scaleSize(20),
                        //marginTop: ScreenUtil.scaleSize(20),
                    }}>
                        <TouchableOpacity onPress={() => {
                            let selectedDep;
                            if (Util.contains(this.props.state.selectedDepList, item.orgDepId)) {
                                selectedDep = Util.removeByValue(this.props.state.selectedDepList, item.orgDepId);
                            } else {
                                selectedDep = this.props.state.selectedDepList;
                                selectedDep.push(item.orgDepId);
                            }
                            this.props.changeState({
                                selectedDepList: selectedDep.concat(),
                            })
                        }}>
                            <View style={{
                                height: ScreenUtil.scaleSize(60),
                                justifyContent: 'flex-end',
                            }}>
                                <View style={{
                                    height: ScreenUtil.scaleSize(40),
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                    {
                                        Util.contains(this.props.state.selectedDepList, item.orgDepId) ? (
                                            <Image source={require('../../img/copyperson/down.png')}
                                                   style={{
                                                       width: ScreenUtil.scaleSize(19),
                                                       height: ScreenUtil.scaleSize(19),
                                                       resizeMode: 'contain',
                                                   }}/>
                                        ) : (
                                            <Image source={require('../../img/copyperson/right.png')}
                                                   style={{
                                                       width: ScreenUtil.scaleSize(19),
                                                       height: ScreenUtil.scaleSize(19),
                                                       resizeMode: 'contain',
                                                   }}/>
                                        )
                                    }

                                    <Text style={{
                                        marginLeft: ScreenUtil.scaleSize(10),
                                        fontSize: ScreenUtil.setSpText(9),
                                        color: '#666666',
                                        width: ScreenUtil.scaleSize(400),
                                    }} numberOfLines={1}>{item.orgDepName}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        {
                            Util.contains(this.props.state.selectedDepList, item.orgDepId) ? (
                                item.user ? (
                                    item.user.map((item) => (
                                        <TouchableOpacity
                                            disabled={this.props.navigation.state.params.code == 1 && item.userNo == this.props.state.currentUserId}
                                            style={{
                                                //marginTop: ScreenUtil.scaleSize(20),
                                                marginLeft: ScreenUtil.scaleSize(40),
                                                height: ScreenUtil.scaleSize(70),
                                                justifyContent: 'flex-end',
                                            }}
                                            onPress={() => {
                                                let selectedPersonId = [];
                                                let selectedPerson = [];
                                                if (Util.contains(this.props.state.selectedPersonIdList, item.userNo)) {
                                                    selectedPersonId = Util.removeByValue(this.props.state.selectedPersonIdList, item.userNo);
                                                    selectedPerson = this.props.state.selectedPersonList.filter((person) => person.userNo != item.userNo);
                                                } else {
                                                    if (this.props.navigation.state.params.code == 0) {
                                                        selectedPersonId.push(item.userNo);
                                                        selectedPerson.push(item);
                                                    } else {
                                                        selectedPersonId = this.props.state.selectedPersonIdList;
                                                        selectedPerson = this.props.state.selectedPersonList;
                                                        if (selectedPersonId.length < 30) {
                                                            selectedPersonId.push(item.userNo);
                                                            selectedPerson.push(item);
                                                        } else {
                                                            Util.showToast(Message.MAX_TRAVEL_PARTNER_COUNT);
                                                        }
                                                    }
                                                }
                                                this.props.changeState({
                                                    selectedPersonIdList: selectedPersonId.concat(),
                                                    selectedPersonList: selectedPerson.concat(),
                                                })
                                            }}>
                                            <View style={{
                                                height: ScreenUtil.scaleSize(40),
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                            }}>
                                                <Image source={
                                                    (this.props.navigation.state.params.code == 1 && item.userNo == this.props.state.currentUserId) ? (
                                                        require('../../img/invoice/disabled_hooked.png')
                                                    ) : (
                                                        Util.contains(this.props.state.selectedPersonIdList, item.userNo) ?
                                                            require('../../img/copyperson/selected.png') :
                                                            require('../../img/copyperson/oval_unselected.png')
                                                    )
                                                }
                                                       style={{
                                                           width: ScreenUtil.scaleSize(40),
                                                           height: ScreenUtil.scaleSize(40),
                                                           resizeMode: 'contain',
                                                       }}/>
                                                <Text style={{
                                                    marginLeft: ScreenUtil.scaleSize(20),
                                                    fontSize: ScreenUtil.setSpText(9),
                                                    color: '#ABABAB',
                                                }}>{item.userName}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                ) : null
                            ) : null
                        }

                        {
                            Util.contains(this.props.state.selectedDepList, item.orgDepId) ? (
                                item.childrenList ? this.renderDep(item.childrenList) : null
                            ) : null
                        }
                    </View>
                )
            })
        )
    }

    /**
     * 树形菜单页面<View style={{paddingHorizontal: ScreenUtil.scaleSize(30)}}>
     */
    renderTreePage() {
        return (
            <ScrollView
                style={{
                    paddingHorizontal: ScreenUtil.scaleSize(30),
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={this.props.state.isRefreshing}
                        onRefresh={() => {
                            this.props.refreshData()
                        }}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {
                    this.renderDep(this.props.state.depTree)
                }
                <View style={{height: ScreenUtil.scaleSize(20)}}/>
            </ScrollView>

        )
    }

    /**
     * 搜索结果页面
     */
    renderSearchPage() {
        return (
            Util.checkListIsEmpty(this.props.state.searchPersonList) ? (
                <View style={{
                    height: ScreenUtil.scaleSize(48),
                    marginTop: ScreenUtil.scaleSize(240),
                    alignSelf: 'center',
                    justifyContent: 'center',
                }}>
                    <Text style={{
                        fontSize: ScreenUtil.setSpText(11),
                        color: '#ABABAB'
                    }}>{Message.SELECT_COPY_PERSON_NO_RESULT}</Text>
                </View>
            ) : (
                <View style={{
                    paddingHorizontal: ScreenUtil.scaleSize(30),
                    marginTop: ScreenUtil.scaleSize(20),
                    flex: 1,
                }}>
                    <FlatList
                        onEndReached={() => {
                            if (this.props.state.loadMore) {
                                this.props.changeState({loadMore: false});
                                this.props.loadMorePerson({
                                    name: this.props.state.searchValue,
                                    page: this.props.state.page + 1,
                                    rows: 50
                                }, this.props.state.searchPersonList)
                            }
                        }}
                        onRefresh={() => {
                            this.props.refreshPersonList({
                                name: this.props.state.searchValue,
                                page: 1,
                                rows: 50
                            })
                        }}
                        refreshing={this.props.state.isRefreshing}
                        data={this.props.state.searchPersonList}
                        onEndReachedThreshold={0.8}
                        renderItem={({item, index}) => (
                            <TouchableOpacity style={{marginTop: ScreenUtil.scaleSize(20)}} onPress={() => {
                                let selectedPersonId = [];
                                let selectedPerson = [];
                                if (Util.contains(this.props.state.selectedPersonIdList, item.userNo)) {
                                    selectedPersonId = Util.removeByValue(this.props.state.selectedPersonIdList, item.userNo);
                                    selectedPerson = this.props.state.selectedPersonList.filter((person) => person.userNo != item.userNo);
                                } else {
                                    if (this.props.navigation.state.params.code == 0) {
                                        selectedPersonId.push(item.userNo);
                                        selectedPerson.push(item);
                                    } else {
                                        selectedPersonId = this.props.state.selectedPersonIdList;
                                        selectedPerson = this.props.state.selectedPersonList;
                                        selectedPersonId.push(item.userNo);
                                        selectedPerson.push(item);
                                    }
                                }
                                this.props.changeState({
                                    selectedPersonIdList: selectedPersonId.concat(),
                                    selectedPersonList: selectedPerson.concat(),
                                })
                            }}>
                                <View style={{
                                    height: ScreenUtil.scaleSize(40),
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                    <Image source={
                                        (this.props.navigation.state.params.code == 1 && item.userNo == this.props.state.currentUserId) ? (
                                            require('../../img/invoice/disabled_hooked.png')
                                        ) : (
                                            Util.contains(this.props.state.selectedPersonIdList, item.userNo) ?
                                                require('../../img/copyperson/selected.png') :
                                                require('../../img/copyperson/oval_unselected.png')
                                        )
                                    }
                                           style={{
                                               width: ScreenUtil.scaleSize(40),
                                               height: ScreenUtil.scaleSize(40),
                                               resizeMode: 'contain',
                                           }}/>
                                    <Text style={{
                                        color: '#666666',
                                        fontSize: ScreenUtil.setSpText(9),
                                        marginLeft: ScreenUtil.scaleSize(20),
                                    }}>{item.userName + '  (' + item.phone + ')'}</Text>
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
        )
    }

    render() {
        const title = this.props.navigation.state.params.code == 0 ? Message.SELECT_COPY_PERSON_TITLE : Message.SELECT_TOGETHER_PERSON_TITLE;
        const dismissKeyboard = require('dismissKeyboard');
        const page = this.props.state.searchValue ? this.renderSearchPage() : this.renderTreePage();
        return (

            <SafeAreaView style={styles.container}>
                <CommonLoading isShow={this.props.state.isLoading}/>
                <Header
                    titleText={title}
                    thisComponent={this}
                    backClick={this.onBack}
                    rightText={Message.CONFIRM}
                    rightTextStyle={{color: '#FFAA00'}}
                    rightClick={this.onConfirm.bind(this)}
                />
                <View style={styles.search}>
                    <Image source={require('../../img/copyperson/search.png')} style={styles.searchImg}/>
                    <TextInput
                        style={{
                            marginLeft: ScreenUtil.scaleSize(30),
                            fontSize: ScreenUtil.setSpText(9),
                            padding: 0,
                            color: '#666666',
                            flex: 1,
                        }}
                        placeholderTextColor="#ABABAB"
                        placeholder={Message.SELECT_COPY_PERSON_SEARCH}
                        underlineColorAndroid="transparent"
                        onChangeText={(text) => {
                            this.props.changeState({
                                searchValue: text,
                            });
                            if (text) {
                                this.props.searchPersonList({
                                    name: text,
                                    page: 1,
                                    rows: 50,
                                })
                            }
                        }}
                        returnKeyType={'done'}
                        value={this.props.state.searchValue}
                    />
                </View>
                <View style={styles.separateLine}/>

                {
                    page
                }


            </SafeAreaView>

        )

    }
}

function mapStateToProps(state) {
    return {
        state: state.SelectCopyPerson,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        back: back,
        initData: initData,
        changeState: changeState,
        loadData: loadData,
        refreshData: refreshData,
        loadMorePerson: loadMorePerson,
        refreshPersonList: refreshPersonList,
        searchPersonList: searchPersonList,
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectCopyPerson);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    search: {
        height: ScreenUtil.scaleSize(80),
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: ScreenUtil.scaleSize(30),
    },
    searchImg: {
        height: ScreenUtil.scaleSize(40),
        width: ScreenUtil.scaleSize(40),
        resizeMode: 'contain'
    },
    separateLine: {
        height: 1 / PixelRatio.get(),
        backgroundColor: '#DEDEDE',
        marginHorizontal: ScreenUtil.scaleSize(30)
    }
})