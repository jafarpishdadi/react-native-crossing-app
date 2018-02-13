/**
 * Created by caixiaowei on 17/10/24.
 */

import {NavigationActions} from 'react-navigation';

import {AppNavigator} from '../../../containers/App';
import * as types from '../../../constant/ActionTypes';

function paramsEqual(params1, params2) {
    if (params1 == params2) {
        return true
    }

    if (!params1 || !params2 || Object.keys(params1).length != Object.keys(params2).length) {
        return false
    }

    for (let [key, value] of Object.entries(params1)) {
        if (value !== params2[key]) {
            return false
        }
    }

    return true
}

function getRouteName(type) {
    let routeName = '';
    switch (type) {
        case types.NAVIGATOR_LOGIN:
            routeName = 'Login';
            break;
        case types.NAVIGATOR_MAINSCREEN:
            routeName = 'MainScreen';
            break;
        case types.NAVIGATOR_REGISTER:
            routeName = 'Register';
            break;
        case types.NAVIGATOR_AGREEMENT:
            routeName = 'RegisterAgreement';
            break;
        case types.NAVIGATOR_REGISTER_PASSWORD:
            routeName = 'RegisterPassword';
            break;
        case types.NAVIGATOR_OPEN_ENTERPRISE:
            routeName = 'OpenEnterprise';
            break;
        case types.NAVIGATOR_OPEN_ENTERPRISE_WITH_PARAMS:
            routeName = 'OpenEnterprise';
            break;
        case types.NAVIGATOR_SUCCESS_OPEN_ENTERPRISE:
            routeName = 'SuccessOpenEnterprise';
            break;
        case types.NAVIGATOR_PERSONAL_INFORMATION:
            routeName = 'PersonalInformation';
            break;
        case types.NAVIGATOR_SET_UP:
            routeName = 'SetUp';
            break;
        case types.NAVIGATOR_ABOUT_US:
            routeName = 'AboutUs';
            break;
        case types.NAVIGATOR_MY_NOTICES:
            routeName = 'MyNotices';
            break;
        case types.BACK_LOGIN:
            routeName = 'Login';
            break;
        case types.NAVIGATOR_NEW_REIMBURSEMENT:
            routeName = 'NewReimbursement';
            break;
        case types.NAVIGATOR_FIND_PASSWORD:
            routeName = 'FindPassword';
            break;
        case types.NAVIGATOR_APPLICATION_LIST:
            routeName = 'ReimbursementList';
            break;
        case types.NAVIGATOR_REIMBURSEMENT_DETAIL:
            routeName = 'ReimbursementDetail';
            break;
        case types.NAVIGATOR_REIMBURSEMENT_REPLY:
            routeName = 'CommentReply';
            break;
        case types.NAVIGATOR_INVOICE_DETAIL:
            routeName = 'InvoiceDetails';
            break;
        case types.NAVIGATOR_MODIFY_PASSWORD_VERIFICATION:
            routeName = 'ModifyPasswordVerification';
            break;
        case types.NAVIGATOR_LOAN_ORDER_DETAIL:
            routeName = 'LoanOrderDetail';
            break;
        case types.NAVIGATOR_LOAN_ORDER_LIST:
            routeName = 'LoanOrderList';
            break;
        case types.NAVIGATE_SELECT_CITY:
            routeName = 'SelectCity';
            break;
        case types.NAVIGATE_NEW_LOAN_ORDER:
            routeName = 'NewLoanOrder';
            break;
        case types.NAVIGATOR_MODIFY_PASSWORD:
            routeName = 'ModifyPassword';
            break;
        case types.NAVIGATOR_CREATE_NEW_PASSWORD:
            routeName = 'CreateNewPassword';
            break;
        case types.NAVIGATOR_NEW_INVOICE:
            routeName = 'NewInvoice';
            break;
        case types.NAVIGATOR_EDIT_INVOICE:
            routeName = 'EditInvoice';
            break;
        case types.NAVIGATOR_AUDIT_LIST:
            routeName = 'AuditList';
            break;
        case types.NAVIGATOR_SCAN_QRCODE:
            routeName = 'ScanQrCode';
            break;
        case types.NAVIGATOR_SCAN_QRCODE_ERROR:
            routeName = 'ScanQrCodeError';
            break;
        case types.NAVIGATOR_INVOICE_LIST:
            routeName = 'Invoice';
            break;
        case types.SELECT_COPY_PERSON:
            routeName = 'SelectCopyPerson';
            break;
        case types.COST_SHARING:
            routeName = 'CostSharing';
            break;
        case types.SELECT_WRITE_OFF_LOAN:
            routeName = 'SelectWriteOffLoan';
            break;
        case types.SELECT_TRAVEL_APPLY:
            routeName = 'SelectTravelApply';
            break;
        case types.NEW_TRAVEL_APPLY:
            routeName = "NewTravelApply";
            break;
        case types.TRAVEL_APPLY_DETAIL:
            routeName = 'TravelApplyDetail';
            break;
        case types.TRAVEL_APPLY_LIST:
            routeName = 'TravelApplyList';
            break;
    }
    return routeName;
}

//默认页面
const initialState = AppNavigator.router.getStateForAction(AppNavigator.router.getActionForPathAndParams('Login'));

export default nav = (state = initialState, action) => {
    let nextState;
    if (action.type != types.BACK) {
        const currentRoute = state.routes[state.index]

        // TODO: Is this correct for nested navigators (action != null)?
        //if (currentRoute.routeName == getRouteName(action.type) && paramsEqual(currentRoute.params, action.params)) {
        if (currentRoute.routeName == getRouteName(action.type)) {
            return state
        }
    }

    switch (action.type) {
        case types.NAVIGATOR_LOGIN: {
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.reset({
                    index: 0,
                    actions: [
                        NavigationActions.navigate({routeName: 'Login'})
                    ]
                }),
                state
            );
            /*nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({routeName: 'Login'}),
                state
            );*/
            break;
        }
        case types.NAVIGATOR_MAINSCREEN:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.reset({
                    index: 0,
                    actions: [
                        NavigationActions.navigate({
                            routeName: 'MainScreen',
                            params: action.params,
                        })
                    ]
                }),
                state
            );
            break;
        case types.NAVIGATOR_REGISTER:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({routeName: 'Register'}),
                state
            );
            break;
        case types.NAVIGATOR_AGREEMENT:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({routeName: 'RegisterAgreement'}),
                state
            );
            break;
        case types.NAVIGATOR_REGISTER_PASSWORD:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({routeName: 'RegisterPassword'}),state
            );
            break;
        case types.NAVIGATOR_OPEN_ENTERPRISE:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({routeName: 'OpenEnterprise'}), state
            );
            break;
        case types.NAVIGATOR_OPEN_ENTERPRISE_WITH_PARAMS:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'OpenEnterprise',
                    params: action.params,}), state
            );
            break;
        case types.NAVIGATOR_SUCCESS_OPEN_ENTERPRISE:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'SuccessOpenEnterprise',
                }),
                state
            );
            break;
        case types.NAVIGATOR_PERSONAL_INFORMATION:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'PersonalInformation',
                    params: action.params,
                }), state
            );
            break;
        case types.NAVIGATOR_SET_UP:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({routeName: 'SetUp'}), state
            );
            break;
        case types.NAVIGATOR_ABOUT_US:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({routeName: 'AboutUs'}), state
            );
            break;
        case types.NAVIGATOR_MINE:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({routeName: 'Mine'}), state
            );
            break;
        case types.NAVIGATOR_MY_NOTICES:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({routeName: 'MyNotices'}), state
            );
            break;
        case types.BACK_LOGIN:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.reset({
                    index: 0,
                    actions: [
                        NavigationActions.navigate({routeName: 'Login'})
                    ]
                }),
                state
            );
            break;

        case types.NAVIGATOR_NEW_REIMBURSEMENT:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'NewReimbursement',
                    params: action.params,}),
                state
            );
            break;

        case types.NAVIGATOR_FIND_PASSWORD:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({routeName: 'FindPassword'}),
                state
            );
            break;

        case types.BACK:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.back(),
                state
            );
            break;

        case types.NAVIGATOR_APPLICATION_LIST:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({routeName: 'ReimbursementList'}),
                state
            );
            break;

        case types.RESET_APPLICATION_LIST:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.reset({
                    index: 1,
                    actions: [
                        NavigationActions.navigate({routeName: 'MainScreen'}),
                        NavigationActions.navigate({routeName: 'ReimbursementList'})
                    ]
                }),
                state
            );
            break;

        case types.NAVIGATOR_REIMBURSEMENT_DETAIL:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'ReimbursementDetail',
                    params: action.params,
                }),
                state
            );
            break;

        case types.NAVIGATOR_REIMBURSEMENT_REPLY:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'CommentReply',
                    params: action.params
                }),
                state
            );
            break;

        case types.NAVIGATOR_INVOICE_DETAIL:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'InvoiceDetails',
                    params: action.params
                }),
                state
            );
            break;

        case types.NAVIGATOR_MODIFY_PASSWORD_VERIFICATION:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'ModifyPasswordVerification',
                    params: action.params,
                }),
                state
            );
            break;

        case types.NAVIGATOR_LOAN_ORDER_DETAIL:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'LoanOrderDetail',
                    params: action.params,
                }),
                state
            );
            break;

        case types.NAVIGATOR_LOAN_ORDER_LIST:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'LoanOrderList',
                    params:action.params,
                }),
                state
            );
            break;

        case types.NAVIGATE_SELECT_CITY:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'SelectCity',
                    params: action.params,
                }),
                state
            );
            break;

        case types.NAVIGATE_NEW_LOAN_ORDER:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'NewLoanOrder',
                    params: action.params,
                }),
                state
            );
            break;

        case types.NAVIGATOR_MODIFY_PASSWORD:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'ModifyPassword',
                    params: action.params,
                }),
                state
            );
            break;

        case types.NAVIGATOR_CREATE_NEW_PASSWORD:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'CreateNewPassword',
                    params: action.params,
                }),
                state
            );
            break;

        case types.NAVIGATOR_NEW_INVOICE:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'NewInvoice',
                    params: action.params,
                }),
                state
            );
            break;

        case types.NAVIGATOR_EDIT_INVOICE:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'EditInvoice',
                    params: action.params,
                }),
                state
            );
            break;

        case types.NAVIGATOR_ADD_INVOICE:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'AddInvoice',
                    params: action.params}),
                state
            );
            break;

        case types.NAVIGATOR_AUDIT_LIST:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({routeName: 'AuditList'}),
                state
            );
            break;

        case types.NAVIGATOR_SCAN_QRCODE:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'ScanQrCode',
                    params: action.params
                }),
                state
            );
            break;

        case types.NAVIGATOR_SCAN_QRCODE_ERROR:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({routeName: 'ScanQrCodeError'}),
                state
            );
            break;

        case types.NAVIGATOR_INVOICE_LIST:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'Invoice',
                    params: action.params,
                }),
                state
            );
            break;

        case types.RESET_NEW_REIMBURSEMENT:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.reset({
                    index: 1,
                    actions: [
                        NavigationActions.navigate({routeName: 'MainScreen',params:{tab:'Invoice'}}),
                        NavigationActions.navigate({
                            routeName: 'NewReimbursement',
                            params: action.params,})
                    ]
                }),
                state
            );
            break;
        case types.RESET_INVOICE_LIST:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.reset({
                    index: 1,
                    actions: [
                        NavigationActions.navigate({routeName: 'Login'}),
                        NavigationActions.navigate({routeName: 'MainScreen',params:{tab:'Invoice'}}),
                    ]
                }),
                state
            );
            break;
        case types.SELECT_COPY_PERSON:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'SelectCopyPerson',
                    params: action.params,
                }),
                state
            );
            break;
        case types.COST_SHARING:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'CostSharing',
                    params: action.params,
                }),
                state
            );
            break;
        case types.SELECT_WRITE_OFF_LOAN:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'SelectWriteOffLoan',
                    params: action.params,
                }),
                state
            );
            break;
        case types.SELECT_TRAVEL_APPLY:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'SelectTravelApply',
                    params: action.params,
                }),
                state
            );
            break;
        case types.NEW_TRAVEL_APPLY:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'NewTravelApply',
                    params: action.params,
                }),
                state
            );
            break;
        case types.TRAVEL_APPLY_DETAIL:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'TravelApplyDetail',
                    params: action.params,
                }),
                state
            );
            break;
        case types.TRAVEL_APPLY_LIST:
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'TravelApplyList',
                    params: action.params,
                }),
                state
            );
            break;
        default:
            nextState = AppNavigator.router.getStateForAction(action, state);
            break;
    }

    return nextState || state;
}