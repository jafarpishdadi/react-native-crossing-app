/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from "react";
import {StackNavigator, addNavigationHelpers} from "react-navigation";
import {connect} from "react-redux";
import {Platform, BackHandler, ToastAndroid,BackAndroid,NativeModules} from "react-native";
import {bindActionCreators} from "redux";
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
import {back} from "../redux/actions/navigator/Navigator";
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
import {changeState as changeNewLoanOrderState} from '../redux/actions/loan/NewLoanOrder';
var RNBridgeModule = NativeModules.RNBridgeModule;
import SelectCity from "./reimbursement/SelectCity";
import NewLoanOrder from "./loan/NewLoanOrder";
import SelectTravelApply from "./travelApply/SelectTravelApply";
import LoanOrderDetail from "./loan/LoanOrderDetail";
import NewTravelApply from "./travelApply/NewTravelApply";
import Picker from "react-native-picker";
import LoanOrderList from "./loan/LoanOrderList";
import TravelApplyDetail from "./travelApply/TravelApplyDetail";
import TravelApplyList from "./travelApply/TravelApplyList";
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
            height: ScreenUtil.scaleSize(Platform.OS == 'ios' ? 128 : 93),
            backgroundColor: '#FFFFFF',
        },
        gesturesEnabled: false
    }
},)

class App extends Component {
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid.bind(this));
    }


    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', () => {
            //function
        });
        lastBackPressed = null;
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
            });
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
            });
            return true;
        }
        if (nav.routes[nav.index].routeName == 'NewLoanOrder') {
            this.props.changeNewLoanOrderState({
                saveModalVisible: true,
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
        if (nav.routes[nav.index].routeName == 'MainScreen' || nav.routes[nav.index].routeName == 'Login') {
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
    }, dispatch);
}

//将App交由redux控制
export default connect(mapStateToProps, mapDispatchToProps)(App);

