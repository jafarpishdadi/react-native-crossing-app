/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from "react";
import Store from "react-native-simple-store";
import {
    AppState,
    Platform,
    BackHandler,
    ToastAndroid,
    BackAndroid,
    NativeModules,
    NativeEventEmitter,
    DeviceEventEmitter
} from "react-native";
import {StackNavigator, addNavigationHelpers} from "react-navigation";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Util from "../utils/Util";
import Login from "./users/Login";
import MainScreen from "./mainScreen/MainScreen";
import Register from "./users/Register";
import RegisterAgreement from "./users/RegisterAgreement";
import RegisterPassword from "./users/RegisterPassword";
import OpenEnterprise from "./users/OpenEnterprise";
import SuccessOpenEnterprise from "./users/SuccessOpenEnterprise";
import PersonalInformation from "./users/PersonalInformation";
import SetUp from "./users/SetUp";
import AboutUs from "./users/AboutUs";
import Mine from "./mainScreen/Mine";
import ModifyPassword from "./users/ModifyPassword";
import ModifyPasswordVerification from "./users/ModifyPasswordVerification";
import CreateNewPassword from "./users/CreateNewPassword";
import MyNotices from "./mainScreen/MyNotices";
import NewReimbursement from "./reimbursement/NewReimbursement";
import FindPassword from "./users/FindPassword";
import ScreenUtil from "../utils/ScreenUtil";
import ReimbursementList from "./reimbursement/ReimbursementList";
import ReimbursementDetail from "./reimbursement/ReimbursementDetail";
import Invoice from "./mainScreen/Invoice";
import InvoiceDetails from "./invoice/InvoiceDetails";
import ScanQrCode from "./invoice/ScanQrCode";
import CommentReply from "./reimbursement/CommentReply";
import NewInvoice from "./invoice/NewInvoice";
import AddInvoice from "./invoice/AddInvoice";
import EditInvoice from "./invoice/EditInvoice";
import AuditList from "./audit/AuditList";
import ScanQrCodeError from "./invoice/ScanOrCodeError";
import SelectCopyPerson from "./reimbursement/SelectCopyPerson";
import CostSharing from "./reimbursement/CostSharing";
import SelectWriteOffLoan from "./loan/SelectWriteOffLoan";
import {back, navigateMyNotices} from "../redux/actions/navigator/Navigator";
import {changeState} from "../redux/actions/App";
import {changeState as changeEditInvoiceState} from "../redux/actions/invoice/EditInvoice";
import {changeState as changeScanQrCodeState} from "../redux/actions/invoice/ScanQrCode";
import {doInitialise} from "../redux/actions/invoice/AddInvoice";
import {changeState as changeNewInvoiceState} from "../redux/actions/invoice/NewInvoice";
import {changeState as changeNewReimbursementState} from "../redux/actions/reimbursement/Reimbursement";
import {changeState as changeReimbursementDetailState} from "../redux/actions/reimbursement/ReimbursementDetail";
import {changeState as changeReimbursementListState} from "../redux/actions/reimbursement/ReimbursementList";
import {changeState as changePersonalInformationState} from "../redux/actions/users/PersonalInformation";
import {changeState as changeNewTravelApplyState} from "../redux/actions/travelApply/NewTravelApply";
import {changeState as changeNewLoanOrderState} from "../redux/actions/loan/NewLoanOrder";
import {changeState as changeLoanOrderListState} from "../redux/actions/loan/LoanOrderList";
import {changeState as changeLoanOrderDetailState} from "../redux/actions/loan/LoanOrderDetail";
import {changeState as changeSelectCityState} from "../redux/actions/reimbursement/SelectCity";
import {loadCompanyData} from "../redux/actions/homePage/HomePage";
import SelectCity from "./reimbursement/SelectCity";
import NewLoanOrder from "./loan/NewLoanOrder";
import SelectTravelApply from "./travelApply/SelectTravelApply";
import LoanOrderDetail from "./loan/LoanOrderDetail";
import NewTravelApply from "./travelApply/NewTravelApply";
import Picker from "react-native-picker";
import LoanOrderList from "./loan/LoanOrderList";
import TravelApplyDetail from "./travelApply/TravelApplyDetail";
import TravelApplyList from "./travelApply/TravelApplyList";

var RNBridgeModule = NativeModules.RNBridgeModule;

var nativeBridge = NativeModules.RNIOSExportJsToReact;//你的类名
const NativeModule = new NativeEventEmitter(nativeBridge);
let lastBackPressed = null;

//App路由栈配置
export const AppNavigator = StackNavigator({
    Login: {screen: Login},
    MainScreen: {screen: MainScreen},
    Register: {screen: Register},
    RegisterAgreement: {screen: RegisterAgreement},
    RegisterPassword: {screen: RegisterPassword},
    OpenEnterprise: {screen: OpenEnterprise},
    SuccessOpenEnterprise: {screen: SuccessOpenEnterprise},
    PersonalInformation: {screen: PersonalInformation},
    SetUp: {screen: SetUp},
    Mine: {screen: Mine},
    ModifyPassword: {screen: ModifyPassword},
    ModifyPasswordVerification: {screen: ModifyPasswordVerification},
    CreateNewPassword: {screen: CreateNewPassword},
    MyNotices: {screen: MyNotices},
    NewReimbursement: {screen: NewReimbursement},
    FindPassword: {screen: FindPassword},
    ReimbursementList: {screen: ReimbursementList},
    ReimbursementDetail: {screen: ReimbursementDetail},
    InvoiceDetails: {screen: InvoiceDetails},
    CommentReply: {screen: CommentReply},
    NewInvoice: {screen: NewInvoice},
    ScanQrCode: {screen: ScanQrCode},
    AuditList: {screen: AuditList},
    AddInvoice: {screen: AddInvoice},
    EditInvoice: {screen: EditInvoice},
    Invoice: {screen: Invoice},
    ScanQrCodeError: {screen: ScanQrCodeError},
    SelectCopyPerson: {screen: SelectCopyPerson},
    SelectCity: {screen: SelectCity},
    CostSharing: {screen: CostSharing},
    NewLoanOrder:{screen: NewLoanOrder},
    SelectWriteOffLoan:{screen: SelectWriteOffLoan},
    SelectTravelApply:{screen: SelectTravelApply},
    LoanOrderDetail: {screen: LoanOrderDetail},
    NewTravelApply: {screen: NewTravelApply},
    LoanOrderList: {screen: LoanOrderList},
    TravelApplyDetail: {screen: TravelApplyDetail},
    AboutUs: {screen: AboutUs},
    TravelApplyList: {screen: TravelApplyList},
}, {
    //initialRouteName: 'Login',
    navigationOptions: {
        headerTitleStyle: {
            alignSelf: 'center',
            fontSize: ScreenUtil.setSpText(12),
            fontWeight: '400',
            color: '#666666'
        },
        headerStyle: {
            height: ScreenUtil.scaleSize(Platform.OS == 'ios' ? (Util.isIphoneX() ? 93 : 128) : 93),
            backgroundColor: '#FFFFFF',
        },
        gesturesEnabled: false
    }
},)

class App extends Component {
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid.bind(this));
        AppState.addEventListener('change', this.handleAppStateChange.bind(this));
        if(Platform.OS == 'ios'){
            NativeModule.addListener('BPush_Resp', (data)=>this.updateIosBadge(data));
        }else{
            this.bpushSubscription = DeviceEventEmitter.addListener('BPush_Resp', this.updateAndroidBadge.bind(this));
        }
    }

    handleAppStateChange(nextAppState) {
        if (nextAppState === 'active') {
            Store.get('userInfo').then((userInfo) => {
                if (userInfo != null) {
                    this.props.loadCompanyData();
                }
            })
        }
    }

    //（app开启中接收到通知），更新角标
    updateIosBadge(pushInfo) {
        if (pushInfo) {
            //this.props.setMessageCount(pushInfo.aps.badge);
            //RNBridgeModule.updateBadge(pushInfo.aps.badge);
            this.props.loadCompanyData();
            if (pushInfo.isActive) {
                this.props.navigateMyNotices();
            }
        }
    }

    //（app开启中接收到通知），更新角标
    updateAndroidBadge(pushInfo) {
        if (pushInfo) {
            // this.props.setMessageCount(10);
            // RNBridgeModule.updateBadge(20);
            this.props.loadCompanyData();
            if (pushInfo.isActive) {
                this.props.navigateMyNotices();
            }
        }
    }


    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', () => {
            //function
        });
        lastBackPressed = null;

        this.bpushSubscription.remove();
    }

    onBackAndroid() {
        try{
            Picker.hide();
        }catch(e){
            //do nothing
        }
        const dismissKeyboard = require('dismissKeyboard');
        dismissKeyboard();

        //关闭页面选择器遮罩
        this.props.changePersonalInformationState({
            showPickerShadow: false,
        });

        const {nav} = this.props;
        const that = this;
        if (nav.routes[nav.index].routeName == 'EditInvoice') {
            this.props.changeEditInvoiceState({
                previewShow: false,
            })
            if(this.props.editInvoiceState.dataSaved){
                setTimeout(
                    () => {
                        that.props.changeScanQrCodeState({readQrCodeEnable: true});
                    },
                    20
                );
                that.props.back();
            }else{
                that.props.changeEditInvoiceState({
                    saveModalVisible: true,
                });
            }
            return true;
        }
        if (nav.routes[nav.index].routeName == 'AddInvoice') {
            this.props.back();
            this.props.doInitialise();
            return true;
        }
        if (nav.routes[nav.index].routeName == 'ScanQrCode') {
            this.props.changeScanQrCodeState({readQrCodeEnable:false});
            this.props.back();
            return true;
        }
        if (nav.routes[nav.index].routeName == 'InvoiceDetails') {
            setTimeout(
                () => {
                    that.props.changeScanQrCodeState({readQrCodeEnable: true});
                },
                20
            );
            that.props.back();
            return true;
        }
        if (nav.routes[nav.index].routeName == 'NewInvoice') {
            that.props.changeNewInvoiceState({
                previewShow: false,
            });
            if (this.props.newInvoiceState.dataSaved) {
                setTimeout(
                    () => {
                        that.props.changeScanQrCodeState({readQrCodeEnable: true});
                    },
                    20
                );
                that.props.back();
            } else {
                that.props.changeNewInvoiceState({
                    saveModalVisible: true,
                });
            }
            return true;
        }
        if (nav.routes[nav.index].routeName == 'NewReimbursement') {
            this.props.changeNewReimbursementState({
                saveModalVisible: true,
                showPickerShadow: false,
            });
            return true;
        }
        if (nav.routes[nav.index].routeName == 'SelectCity') {
            this.props.changeSelectCityState({
                newJsonData:[]
            })
            this.props.back();
            return true;
        }
        if (nav.routes[nav.index].routeName == 'ReimbursementDetail') {
            this.props.changeReimbursementDetailState({
                showRejectDialog: false,
                showCommentDialog: false,
                showEmailDialog: false,
            })
            this.props.back();
            return true;
        }
        if (nav.routes[nav.index].routeName == 'ReimbursementList') {
            this.props.changeReimbursementListState({
                showFilter: false,
            });
            this.props.back();
            return true;
        }
        if (nav.routes[nav.index].routeName == 'NewTravelApply') {
            this.props.changeNewTravelApplyState({
                saveModalVisible: true,
                showPickerShadow: false,
            });
            return true;
        }
        if (nav.routes[nav.index].routeName == 'NewLoanOrder') {
            this.props.changeNewLoanOrderState({
                saveModalVisible: true,
                showPickerShadow: false,
            });
            return true;
        }

        if (nav.routes[nav.index].routeName == 'TravelApplyList') {
            this.props.changeNewLoanOrderState({
                showFilter: false,
            });
            this.props.back();
            return true;
        }
        if (nav.routes[nav.index].routeName == 'LoanOrderList') {
            this.props.changeLoanOrderListState({
                showFilter: false,
            });
            this.props.back();
            return true;
        }
        if (nav.routes[nav.index].routeName == 'LoanOrderDetail') {
            this.props.changeLoanOrderDetailState({
                showRejectDialog: false,
                showCommentDialog: false,
                showEmailDialog: false,
            })
            this.props.back();
            return true;
        }
        if (nav.routes[nav.index].routeName == 'MainScreen' || nav.routes[nav.index].routeName == 'Login') {
            DeviceEventEmitter.emit('InvoiceList');
            var dateNow = (new Date()).valueOf();
            if (lastBackPressed && lastBackPressed + 2000 >= dateNow) {
                RNBridgeModule.exitApp();
                return false;
            }
            lastBackPressed = dateNow;
            ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
            return true;
        }
        this.props.back();
        return true;
    }

    render() {
        return (
            <AppNavigator navigation={addNavigationHelpers({
                dispatch: this.props.dispatch,
                state: this.props.nav
            })}
            />
        );
    }
}


//注入redux nav reducer
const mapStateToProps = state => ({
    nav: state.nav,
    state: state.App,
    editInvoiceState: state.EditInvoice,
    newInvoiceState: state.NewInvoice,
});

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        back: back,
        navigateMyNotices: navigateMyNotices,
        changeState: changeState,
        changeEditInvoiceState: changeEditInvoiceState,
        changeScanQrCodeState: changeScanQrCodeState,
        doInitialise: doInitialise,
        changeNewInvoiceState: changeNewInvoiceState,
        changeNewReimbursementState: changeNewReimbursementState,
        changeReimbursementDetailState: changeReimbursementDetailState,
        changeReimbursementListState: changeReimbursementListState,
        changePersonalInformationState: changePersonalInformationState,
        changeNewTravelApplyState: changeNewTravelApplyState,
        changeNewLoanOrderState: changeNewLoanOrderState,
        loadCompanyData: loadCompanyData,
        changeLoanOrderListState: changeLoanOrderListState,
        changeLoanOrderDetailState: changeLoanOrderDetailState,
        changeSelectCityState:changeSelectCityState,
    }, dispatch);
}

//将App交由redux控制
export default connect(mapStateToProps, mapDispatchToProps)(App);

