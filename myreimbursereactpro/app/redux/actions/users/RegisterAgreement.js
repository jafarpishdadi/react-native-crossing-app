/**
 * Created by Richard.ji on 2017/11/14.
 */

import {navigateRegisterAgreement} from '../../actions/navigator/Navigator';

export const registerAgreementAction = () => {
    return (dispatch) => {
        dispatch(navigateRegisterAgreement())
    }
}