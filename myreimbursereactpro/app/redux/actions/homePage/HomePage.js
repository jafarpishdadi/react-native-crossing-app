/**
 * Created by sky.qian on 10/27/2017.
 */
import {Platform,NativeModules} from 'react-native';
import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';
import Message from '../../../constant/Message';
import {changeState as changeMainScreenState} from '../mainScreen/MainScreen';
import Store from 'react-native-simple-store';
import {loadInvoiceListDataReimbursement} from '../invoice/Invoice';
import {loadData as loadReportData} from '../report/Report';
import {loadData as loadMineData} from '../mine/Mine';
var UpdateAppModule = NativeModules.UpdateAppModule;

export const changeState = (state) => {
	return {
		type: types.HOME_PAGE_CHANGE_STATE,
		state: state,
	}
}

export const loadCount = () => {
	return {
		type: types.HOME_PAGE_LOAD_COUNT,
	}
}

export const refreshData = () => {
	return dispatch => {
		dispatch(changeState({
			isRefreshing: true,
		}))
		dispatch(loadCompanyData());
	}
}

export const loadData = (loading) => {
	return dispatch => {
		dispatch(changeState({
			isLoading: loading,
		}))
		dispatch(loadCompanyData());
	}
}

export const changeCompany = (item) => {
	return (dispatch, getState) => {
		Store.get('macAddress').then((macAddress) => {
			dispatch(changeState({
				isLoading: true,
			}));
			const interval = setInterval(() => {
				if (!getState().Invoice.isLoading && !getState().Mine.isLoading && !getState().Report.isLoading) {
					clearInterval(interval);
					HttpUtil.postJson(API.CHANGE_ENTERPRISE, {"enterpriseNo": item.enterpriseNo, "mac": macAddress}, dispatch, function(ret, status) {
						if (status) {
							if (ret.status) {
								Store.save('token', ret.data).then(() => {
									dispatch(changeState({
										companyOpen: false,
										isLoading: true,
									}));
									//避免其他接口还未请求又切换企业，导致还未请求的接口报token失效
									setTimeout(() => {
										dispatch(loadData(true));
									}, 1000)
									dispatch(loadReportData());
									dispatch(loadMineData());
								});
							} else {
								dispatch(changeState({
									isLoading: false,
								}));
								if(ret.message == Message.INVALID_ENTERPRISE) {
									Util.showToast(Message.ENTERPRISE_HAS_BEEN_FORBIDDEN);
								}else{
									Util.showToast(ret.message);
								}
							}
						} else {
							dispatch(changeState({
								isLoading: false,
							}));
						}
					})
				}
			}, 1000);
		})
	}
}

export const loadCompanyData = () => {
	return dispatch => {
		return HttpUtil.postJson(API.GET_COMPANY, {}, dispatch, function(ret, status) {
			dispatch(loadMessageData())
			if (status) {
				if (ret.status) {
					dispatch(changeState({
						companyArr: ret.data,
						selectHeightMax: ret.data.length * 81,
					}))

				} else {
					Util.showToast(ret.message);
				}
			}
		})
	}
}

export const loadMessageData = () => {
	return dispatch => {
		return HttpUtil.postJson(API.GET_UNREAD_MESSAGE_COUNT, {}, dispatch, function(ret, status) {
			dispatch(loadApplicationTotalData())
			if (status) {
				if (ret.status) {
					dispatch(changeState({
						unreadMessageCount: parseInt(ret.data),
					}));
				} else {
					Util.showToast(ret.message);
				}
			}
		})
	}
}

export const loadApplicationData = () => {
	return (dispatch, getState) => {
		return HttpUtil.postJson(API.GET_APPLICATION_LIST, {isAppHome: 1}, dispatch, function(ret, status) {
			dispatch(changeState({
				isLoading: false,
				isRefreshing: false,
			}))
			if (status) {
				if (ret.status) {
					if (ret.data != null) {
						dispatch(changeState({
							reimbursementList: ret.data,
						}))
					} else {
						dispatch(changeState({
							reimbursementList: [],
						}))
					}
				} else {
					Util.showToast(ret.message);
				}
			}

			if(!getState().HomePage.upgradeChecked){
				//todo 暂时注掉版本更新
				dispatch(checkUpgrade());
			}

			//开始请求另外3个tab页数据
			if (getState().HomePage.isFirst) {
				dispatch(changeState({
					isFirst: false
				}))
				dispatch(loadInvoiceListDataReimbursement('Y'));
				dispatch(loadReportData());
			}
		})
	}
}

export const loadApplicationTotalData = () => {
	return dispatch => {
		return HttpUtil.postJson(API.GET_APPLICATION_TOTAL, {}, dispatch, function(ret, status) {
			dispatch(loadApprovalTotalData())
			if (status) {
				if (ret.status) {
					dispatch(changeState({
						applicationCount: ret.data.totalNum ? ret.data.totalNum : 0,
						applicationAmount: ret.data.totalAmount ? parseFloat(ret.data.totalAmount).toFixed(2) + '' : 0.00 + '',
					}));
				} else {
					Util.showToast(ret.message);
				}
			}
		})
	}
}

export const loadApprovalTotalData = () => {
	return dispatch => {
		return HttpUtil.postJson(API.GET_APPROVAL_TOTAL, {}, dispatch, function(ret, status) {
			dispatch(loadApplicationData());
			if (status) {
				if (ret.status) {
					dispatch(changeState({
						approvalCount: ret.data.totalNum ? ret.data.totalNum : 0,
						approvalAmount:ret.data.totalAmount ? parseFloat(ret.data.totalAmount).toFixed(2) + '' : 0.00 + '',
					}));
				} else {
					Util.showToast(ret.message);
				}
			}
		})
	}
}

export const checkUpgrade = () => {
	return (dispatch) => {
		var request = {operateSystem:'ANDROID'};
		if (Platform.OS == 'ios') {
			request = {operateSystem:'IOS'};
		}
		return HttpUtil.postJson(API.CHECK_UPGRADE, request, dispatch, function(ret, status) {
			if (status) {
				if (ret.status) {
					dispatch(changeState({
						upgradeChecked:true,
					}))
					UpdateAppModule.check(ret.data.versionNo, (resultCode)=> {
						if (resultCode == '1') {
							//不强制更新  仅提示更新
							dispatch(changeState({
								versionData:ret.data,
								showUpgrade: true,
							}))
						}
					});
				}
			}
		})
	}
}

/**
 * 设置角标个数
 */
export const setMessageCount = (msgCnt) => {
	return (dispatch) => {
		dispatch(changeState({unreadMessageCount:msgCnt}));
	}
}