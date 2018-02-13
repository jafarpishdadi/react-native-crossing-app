/**
 * Created by caixiaowei on 17/10/24.
 */


import {combineReducers} from 'redux';
import Login from '../reducers/users/LoginReducer';
import Register from '../reducers/users/RegisterReducer';
import RegisterAgreement from '../reducers/users/RegisterAgreementReducer';
import RegisterPassword from '../reducers/users/RegisterPasswordReducer';
import OpenEnterprise from '../reducers/users/OpenEnterpriseReducer';
import SuccessOpenEnterprise from '../reducers/users/SuccessOpenEnterpriseReducer';
import PersonalInformation from '../reducers/users/PersonalInformationReducer';
import SetUp from '../reducers/users/SetUpReducer';
import nav from '../reducers/navigator/NavigatorReducer';
import HomePage from '../reducers/homePage/HomePageReducer';
import Invoice from '../reducers/invoice/InvoiceReducer';
import InvoiceDetails from '../reducers/invoice/InvoiceDetailsReducer';
import Report from '../reducers/report/ReportReducer';
import Mine from '../reducers/mine/MineReducer';
import ModifyPassword from '../reducers/users/ModifyPasswordReducer';
import ModifyPasswordVerification from '../reducers/users/ModifyPasswordVerificationReducer';
import CreateNewPassword from '../reducers/users/CreateNewPasswordReducer';
import MyNotices from '../reducers/mine/MyNoticesReducer';
import FindPassword from '../reducers/users/FindPasswordReducer';
import Reimbursement from '../reducers/reimbursement/ReimbursementReducer';
import ReimbursementDetail from '../reducers/reimbursement/ReimbursementDetailReducer';
import ReimbursementList from '../reducers/reimbursement/ReimbursementListReducer';
import CommentReply from '../reducers/reimbursement/CommentReplyReducer';
import NewInvoice from '../reducers/invoice/NewInvoiceReducer';
import EditInvoice from '../reducers/invoice/EditInvoiceReducer';
import AddInvoice from '../reducers/invoice/AddInvoiceReducer';
import ScanQrCode from '../reducers/invoice/ScanQrCodeReducer';
import AuditList from '../reducers/audit/AuditListReducer';
import MainScreen from '../reducers/mainScreen/MainScreenReducer';
import App from '../reducers/AppReducer';
import SelectCopyPerson from '../reducers/reimbursement/SelectCopyPersonReducer';
import CostSharing from './reimbursement/CostSharingReducer';
import SelectCity from '../reducers/reimbursement/SelectCityReducer';
import NewLoanOrder from '../reducers/loan/NewLoanOrderReducer';
import SelectWriteOffLoan from "./loan/SelectWriteOffLoanReducer";
import SelectTravelApply from "./travelApply/SelectTravelApplyReducer";
import LoanOrderDetail from '../reducers/loan/LoanOrderDetailReducer';
import NewTravelApply from "./travelApply/NewTravelApplyReducer";
import LoanOrderList from "../reducers/loan/LoanOrderListReducer"
import TravelApplyDetail from "./travelApply/TravelApplyDetailReducer";
import TravelApplyList from "./travelApply/TravelApplyListReducer";

//通过combineReducers 合并所有reducer
export default combineReducers({
    Login,
    Register,
    RegisterAgreement,
    RegisterPassword,
    OpenEnterprise,
    SuccessOpenEnterprise,
    PersonalInformation,
    SetUp,
    nav,
    HomePage,
    Invoice,
    InvoiceDetails,
    AddInvoice,
    Report,
    Mine,
    ModifyPassword,
    ModifyPasswordVerification,
    CreateNewPassword,
    MyNotices,
    FindPassword,
    Reimbursement,
    ReimbursementDetail,
    ReimbursementList,
    CommentReply,
    NewInvoice,
    EditInvoice,
    ScanQrCode,
    AuditList,
    MainScreen,
    App,
    SelectCopyPerson,
    SelectCity,
    CostSharing,
    NewLoanOrder,
    SelectWriteOffLoan,
    SelectTravelApply,
    LoanOrderDetail,
    NewTravelApply,
    LoanOrderList,
    TravelApplyDetail,
    TravelApplyList,
})
