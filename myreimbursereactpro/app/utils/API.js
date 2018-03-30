/**
 * 后台接口
 * Created by sky.qian on 11/10/2017.
 */

//开发
// var API_DOMAIN = 'http://113.209.71.67:8888';

//测试
var API_DOMAIN = 'http://113.209.71.67:8899';

//预发布
// var API_DOMAIN = 'https://reimburse-pre.ele-cloud.com';

//生产
// var API_DOMAIN = 'https://reimburse.ele-cloud.com';

//版本
var APP_VERSION = '报销二期测试环境20180329';

var VOICE_ADDRESS = 'http://103.235.245.141:8081/server_api/ele_vop';

//域名+项目名
var API_ADDRESS = API_DOMAIN + '';

var API = {
	//7.1首页
	GET_VALIDATION_CODE: API_ADDRESS + '/rest/app/login/userlogin/getVerificationCode',             //7.1.1获取验证码
	GET_VALIDATION_COMPARE: API_ADDRESS + '/rest/app/login/userlogin/getVerificationCompare',       //7.1.2验证码正确性验证
	REGISTER: API_ADDRESS + '/rest/app/login/userlogin/registerUser',                              	//7.1.3注册
	NEW_ENTERPRISE : API_ADDRESS + '/rest/app/org/enterprise/newEnterprise',                        //7.1.4创建企业
	LOGIN: API_ADDRESS + '/rest/app/login/userlogin/userLogin',                              		//7.1.5登录
	CHECK_UPGRADE: API_ADDRESS + '/rest/app/common/version/getLastAppVersion',                      //7.1.6获取app最新版本
	GET_SUBSCRIPT: API_ADDRESS + '/rest/app/system/subscript/getSubscriptNum',                      //7.1.10获取右上角标和首页铃铛处数字
	UPSERT_CHANNEL_ID: API_ADDRESS + '/rest/app/system/subscript/insertOrUpdateChannelId',          //7.1.11保存或更新channelId
	UPDATE_SUBSCRIPT: API_ADDRESS + '/rest/app/system/subscript/updateSubscriptNum',                //7.1.12点击首页铃铛修改角标数
	LOGIN_OUT : API_ADDRESS + '/rest/app/login/userlogin/logout',                                   //7.1.13退出登录
	// GET_COMPANY: API_ADDRESS + '/rest/app/org/enterprise/getUserEnterprises',                       //7.1.14获取员工所在企业列表
	GET_COMPANY: API_ADDRESS + '/rest/app/org/enterprise/getUserEnterprisesV1_1',                   //7.1.15 获取员工所在企业列表（V1_1）
	CHANGE_ENTERPRISE: API_ADDRESS + '/rest/app/org/enterprise/changeEnterprise',                   //7.1.16企业切换
	GET_EMAIL: API_ADDRESS + '/rest/app/user/info/email',                                           //7.1.17获取用户邮箱
	// SEND_EMAIL: API_ADDRESS + '/rest/app/user/info/sendEmail',                                      //7.1.18发送邮件
	SEND_EMAIL: API_ADDRESS + '/rest/app/user/info/sendEmailV1_1',                                  //7.1.19 发送邮件（V1_1）
	// PRINT: API_ADDRESS + '/rest/app/user/info/print',                                               //7.1.20打印报销单
	PRINT: API_ADDRESS + '/rest/app/user/info/printV1_1',                                          //7.1.21 打印报销单接口(V1_1)
	RESET_PASSWORD : API_ADDRESS + '/rest/app/login/userlogin/resetPassword',                       //7.1.22设置密码
	// GET_APPLICATION_LIST: API_ADDRESS + '/rest/app/myApplication/getApplicationList',               //7.1.23我的申请列表
    GET_APPLICATION_LIST: API_ADDRESS + '/rest/app/myApplication/getApplicationListV1_1',
	GET_APPLICATION_LIST_FOR_HOME: API_ADDRESS + '/rest/app/home/getFirstFiveList',                 //7.1.24我的申请列表
	GET_APPLICATION_TOTAL: API_ADDRESS + '/rest/app/myApplication/getApplicationTotal',             //7.1.25统计我的申请报销单个数和金额
	GET_APPROVAL_TOTAL: API_ADDRESS + '/rest/app/myApproval/getApprovalTotal',                      //7.1.26统计待我审批报销单个数和金额
    GET_TRAVEL_APPLY_NUM: API_ADDRESS + '/rest/app/home/getTravelApplyNum',                         //7.1.27统计出差申请审批中的条数
    GET_BORROW_AMOUNT_NUM: API_ADDRESS + '/rest/app/home/getBorrowAmountAndNum',                    //7.1.28统计借款申请单审批中金额及条数.未还款累计金额

	//7.2我的申请
	//7.2.1 同  7.1.10
	DOWNLOAD_ATTACHMENT_BY_DIR: API_ADDRESS + '/rest/app/attachment/downloadAttachmentByDir',       //7.2.4明细下载附件
	GET_APPROVAL_RECORD_LIST: API_ADDRESS + '/rest/app/myApplication/getApprovalRecordList',        //7.2.6明细审批流程关联评论内容关联评论附件接口
	// OPERATE_CANCEL: API_ADDRESS + '/rest/app/myApproval/doApproval',                                //7.2.7明细撤回
	OPERATE_CANCEL: API_ADDRESS + '/rest/app/myApproval/doApprovalV1_1',                            //7.2.8 明细撤回接口(V1_1)
	GET_UNAPPROVED_COUNT: API_ADDRESS + '/rest/app/myApproval/getNotApprovalTotal',                 //未审批个数

	//7.3我的审批
	//GET_APPROVAL_LIST: API_ADDRESS + '/rest/app/myApproval/getApprovalList',
	GET_APPROVAL_LIST: API_ADDRESS + '/rest/app/myApproval/getApprovalListV1_1',
	// DO_APPROVAL: API_ADDRESS + '/rest/app/myApproval/doApproval',                                   //7.3.7 7.3.9 同意驳回接口
	DO_APPROVAL: API_ADDRESS + '/rest/app/myApproval/doApprovalV1_1',                                   //7.3.8 7.3.10 同意驳回接口

    //7.4新建报销单
    //GET_APPLY_TYPE: API_ADDRESS + '/rest/app/applyConfiguration/getApplyTypeByEnterpriseNo',        //7.4.1查询报销类型接口
	GET_ORGANIZATION: API_ADDRESS + '/rest/app/org/organization/all',        						//7.4.2获取组织部门列表
	//GET_EXPENSE_TYPE: API_ADDRESS + '/rest/app/expenseConfiguration/getExpenseTypeByPcode', 	    //7.4.3查询费用类别接口
	UPLOAD_ATTACHMENT: API_ADDRESS + '/rest/app/attachment/uploadAttachment', 						//7.4.5上传附件接口
	SAVE_REIMBURSEMENT: API_ADDRESS + '/rest/app/applicationBill/saveExpenseAccount', 				//7.4.6保存/提交报销单
	GET_REIMBURSEMENT_DETAIL: API_ADDRESS + '/rest/app/applicationBill/getExpenseAccount',          //7.4.7查询报销单
	DELETE_APPLICATION: API_ADDRESS + '/rest/app/applicationBill/deleteExpenseAccount',             //7.4.8删除报销单
	EDIT_REIMBURSEMENT: API_ADDRESS + '/rest/app/applicationBill/updateExpenseAccount',             //7.4.9修改报销单
	GET_APPLY_TYPE: API_ADDRESS + '/rest/app/templateForm/queryTemplateFormList',                   //7.11.2查询报销类型接口
	GET_EXPENSE_TYPE: API_ADDRESS + '/rest/app/templateForm/queryCostType', 	                    //7.11.3查询费用类别接口
	GET_ALL_CITY_LIST: API_ADDRESS+ '/rest/app/cityLevel/queryAllCities',                          //获取城市总数据接口

	//7.5评论
	ADD_COMMENT: API_ADDRESS + '/rest/app/comment/addCommentV1_1',                                      //7.5.1新增评论内容

	//7.6票夹
	GET_INVOICE_LIST_DATA: API_ADDRESS + '/rest/app/common/invoice/select',							//7.6.1发票列表
	GET_INVOICE_DETAIL_DATA: API_ADDRESS + '/rest/app/common/invoice/find',							//7.6.2发票详情
	GET_INVOICE_DELETE: API_ADDRESS + '/rest/app/common/invoice/delete',							//7.6.3删除
	COLLECT_BY_PIC: API_ADDRESS + '/rest/app/common/invoice/collectByPic',							//7.6.4图片方式归集发票
	COLLECT_BY_QRCODE: API_ADDRESS + '/rest/app/common/invoice/collectByQrcode',					//7.6.5扫描二维码归集发票
	UPDATE_INVOICE: API_ADDRESS + '/rest/app/common/invoice/update',								//7.6.6发票内容更新
	COLLECT_OTHER: API_ADDRESS + '/rest/app/common/invoice/collectByOther',							//7.6.7其他发票保存接口
	GET_INVOICE_TOTAL_DATA: API_ADDRESS + '/rest/app/common/invoice/counts',						//7.6.8获取发票汇总数据
	GET_INVOICE_TYPE_LIST_DATA: API_ADDRESS + '/rest/app/common/invoice/invoiceTypeList',			//7.6.9发票类型列表
	GET_INVOICE_IMAGE: API_ADDRESS + '/rest/app/common/invoice/getImg',								//7.6.11获取发票图片

	//7.7我的资料
	GET_USER_INFO: API_ADDRESS + '/rest/app/user/info/find',                                        //7.7.1查询个人信息
	UPDATE_USER_INFO: API_ADDRESS + '/rest/app/user/info/update',                                   //7.7.2修改个人信息
	GET_IS_LINK_STATE: API_ADDRESS + '/rest/app/user/info/isLink',                                  //7.7.3获取同步状态
	UPDATE_IS_LINK_STATE: API_ADDRESS + '/rest/app/user/info/updateIsLink',                         //7.7.4修改同步状态（update）

	//7.8消息
	// GET_MESSAGE_LIST: API_ADDRESS + '/rest/app/message/getMessageList',                              //7.8.1消息列表
	GET_MESSAGE_LIST: API_ADDRESS + '/rest/app/message/getMessageListV1_1',                         //7.8.2 获取消息列表接口(V1_1)
	GET_UNREAD_MESSAGE_COUNT: API_ADDRESS + '/rest/app/message/unreadMessageCount',                 //7.8.3未读消息个数
	GET_READ_MESSAGE: API_ADDRESS + '/rest/app/message/unreadMessageSee',                           //7.8.4更改未读消息状态
	CHECK_IS_APPROVAL_USER: API_ADDRESS + '/rest/app/message/isApprovalUser',                       //7.8.5 判断用户权限接口

	//7.9个人报表
	GET_REPORT_YEAR_STATUS: API_ADDRESS + '/rest/app/report/person/getpersonYearBxTotal',			//7.9.1个人本年度报销情况
	QUERY_REIMBURSEMENT_TOTAL_AMOUNT: API_ADDRESS + '/rest/app/report/person/getPersonTypeQuery',	//7.9.2报销费用总额度统计查询
	REIMBURSEMENT_TOTAL_AMOUNT_CHART: API_ADDRESS + '/rest/app/report/person/getOnClickDataShow',	//7.9.3报销费用总额统计柱状图

    //7.12差旅申请单
    GET_TRAVEL_APPLY_LIST: API_ADDRESS + '/rest/app/myApplication/travelApplyBill/getTravelApplyList',	//7.12.1 出差申请列表接口
    INSERT_TRAVEL_APPLY_BILL: API_ADDRESS + '/rest/app/travelApplyBill/insertTravelApplyBill',	        //7.12.2 保存/提交差旅申请单接口
    FIND_TRAVEL_APPLY_BILL: API_ADDRESS + '/rest/app/travelApplyBill/findTravelApplyBill',	            //7.12.3 查询差旅申请单详情
    DELETE_TRAVEL_APPLY_BILL: API_ADDRESS + '/rest/app/travelApplyBill/deleteTravelApplyBill',	        //7.12.4 删除差旅申请单详情
    APPROVAL_TRAVEL_APPLY_BILL: API_ADDRESS + '/rest/app/travelApplyBill/doApproval',	                //7.12.7/7.12.8 明细驳回/审批通过接口
    UPDATE_TRAVEL_APPLY_BILL: API_ADDRESS + '/rest/app/travelApplyBill/updateTravelApplyBill',	        //7.12.9 修改差旅申请单
    //7.12.10同7.4.2
    GET_ORGANIZATION_USERS: API_ADDRESS + '/rest/app/org/organization/selectUser',	                    //7.12.11 根据部门查询员工列表接口
    GET_ORGANIZATION_USERS_BY_NAME: API_ADDRESS + '/rest/app/user/info/userList',	                    //7.12.12 员工姓名模糊查询列表接口

    //7.13借款单
    GET_BORROW_LIST: API_ADDRESS + '/rest/app/myApplication/borrowBill/getBorrowList',	                //7.13.1 借款申请列表接口
    //7.13.2同7.4.2
    SAVE_BORROW_BILL: API_ADDRESS + '/rest/app/borrowBill/saveBorrowBill',	                            //7.13.3 保存借款单接口
    SUBMIT_BORROW_BILL: API_ADDRESS + '/rest/app/borrowBill/submitBorrowBill',	                        //7.13.4 提交借款单接口
    DELETE_BORROW_BILL: API_ADDRESS + '/rest/app/borrowBill/deleteBorrowBill',	                        //7.13.5 删除借款单接口
    //7.13.6同7.4.5
    //7.13.7同7.4.2
    //7.13.8同7.12.11
    //7.13.9同7.12.12
    GET_BORROW_BILL_BY_NUMBER: API_ADDRESS + '/rest/app/borrowBill/getBorrowBillByNo',	                //7.13.10 根据借款单号查询借款信息接口
    GET_REPAY_RECORD_BY_BORROW_NUMBER: API_ADDRESS + '/rest/app/borrowBill/getRepayRecordByBorrowNo',	//7.13.11 根据借款单号查询还款记录接口
	RE_SAVE_BORROW_BILL: API_ADDRESS + '/rest/app/borrowBill/reSaveBorrowBill',	                        //7.13.18 编辑重新保存借款单
	RE_SUBMIT_BORROW_BILL: API_ADDRESS + '/rest/app/borrowBill/reSubmitBorrowBill',	                    //7.13.19 编辑重新提交借款单

	GET_DEP_TREE: API_ADDRESS + '/rest/app/org/organization/depTree',	                                //组织树（携带人员）接口

	VOICE_API_ADDRESS: VOICE_ADDRESS,

	APP_VERSION:APP_VERSION
}

module.exports = API;