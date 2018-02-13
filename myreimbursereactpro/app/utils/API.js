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
//var API_DOMAIN = 'https://reimburse.ele-cloud.com';

//版本
var APP_VERSION = 'V1.0.0';

var VOICE_ADDRESS = 'http://103.235.245.141:8081/server_api/ele_vop';

//域名+项目名
var API_ADDRESS = API_DOMAIN + '';

var API = {
	//6.1首页
	GET_VALIDATION_CODE: API_ADDRESS + '/rest/app/login/userlogin/getVerificationCode',             //6.1.1获取验证码
	GET_VALIDATION_COMPARE: API_ADDRESS + '/rest/app/login/userlogin/getVerificationCompare',       //6.1.2验证码正确性验证
	REGISTER: API_ADDRESS + '/rest/app/login/userlogin/registerUser',                              	//6.1.3注册
	NEW_ENTERPRISE : API_ADDRESS + '/rest/app/org/enterprise/newEnterprise',                        //6.1.4创建企业
	LOGIN: API_ADDRESS + '/rest/app/login/userlogin/userLogin',                              		//6.1.5登录
	CHECK_UPGRADE: API_ADDRESS + '/rest/app/common/version/getLastAppVersion',                      //7.1.6获取app最新版本
	LOGIN_OUT : API_ADDRESS + '/rest/app/login/userlogin/logout',                                   //6.1.6退出登录
	GET_COMPANY: API_ADDRESS + '/rest/app/org/enterprise/getUserEnterprises',                       //6.1.7获取员工所在企业列表
	CHANGE_ENTERPRISE: API_ADDRESS + '/rest/app/org/enterprise/changeEnterprise',                   //6.1.8企业切换
	GET_EMAIL: API_ADDRESS + '/rest/app/user/info/email',                                           //6.1.9获取用户邮箱
	SEND_EMAIL: API_ADDRESS + '/rest/app/user/info/sendEmail',                                      //6.1.10发送邮件
	PRINT: API_ADDRESS + '/rest/app/user/info/print',                                               //6.1.11打印报销单
	RESET_PASSWORD : API_ADDRESS + '/rest/app/login/userlogin/resetPassword',                       //6.1.12设置密码
	GET_APPLICATION_LIST: API_ADDRESS + '/rest/app/myApplication/getApplicationList',               //6.1.13我的申请列表
	GET_APPLICATION_TOTAL: API_ADDRESS + '/rest/app/myApplication/getApplicationTotal',             //6.1.14统计我的申请报销单个数和金额
	GET_APPROVAL_TOTAL: API_ADDRESS + '/rest/app/myApproval/getApprovalTotal',                      //6.1.15统计待我审批报销单个数和金额

	//6.2我的申请
	//6.2.1 同  6.1.10
	DOWNLOAD_ATTACHMENT_BY_DIR: API_ADDRESS + '/rest/app/attachment/downloadAttachmentByDir',       //6.2.4明细下载附件
	GET_APPROVAL_RECORD_LIST: API_ADDRESS + '/rest/app/myApplication/getApprovalRecordList',        //6.2.5明细审批流程关联评论内容关联评论附件接口
	OPERATE_CANCEL: API_ADDRESS + '/rest/app/myApproval/doApproval',                                //6.2.7明细撤回

	//6.3我的审批
	GET_APPROVAL_LIST: API_ADDRESS + '/rest/app/myApproval/getApprovalList',
	DO_APPROVAL: API_ADDRESS + '/rest/app/myApproval/doApproval',                                   //6.3.7 6.3.8 同意驳回接口

    //6.4新建报销单
    //GET_APPLY_TYPE: API_ADDRESS + '/rest/app/applyConfiguration/getApplyTypeByEnterpriseNo',        //6.4.1查询报销类型接口
	GET_ORGANIZATION: API_ADDRESS + '/rest/app/org/organization/all',        						//6.4.2获取组织部门列表
	//GET_EXPENSE_TYPE: API_ADDRESS + '/rest/app/expenseConfiguration/getExpenseTypeByPcode', 	    //6.4.3查询费用类别接口
	UPLOAD_ATTACHMENT: API_ADDRESS + '/rest/app/attachment/uploadAttachment', 						//6.4.5上传附件接口
	SAVE_REIMBURSEMENT: API_ADDRESS + '/rest/app/applicationBill/saveExpenseAccount', 				//6.4.6保存/提交报销单
	GET_REIMBURSEMENT_DETAIL: API_ADDRESS + '/rest/app/applicationBill/getExpenseAccount',          //6.4.7查询报销单
	DELETE_APPLICATION: API_ADDRESS + '/rest/app/applicationBill/deleteExpenseAccount',             //6.4.8删除报销单
	EDIT_REIMBURSEMENT: API_ADDRESS + '/rest/app/applicationBill/updateExpenseAccount',             //6.4.9修改报销单
	GET_APPLY_TYPE: API_ADDRESS + '/rest/app/templateForm/queryTemplateFormList',                   //6.11.2查询报销类型接口
	GET_EXPENSE_TYPE: API_ADDRESS + '/rest/app/templateForm/queryCostType', 	                    //6.11.3查询费用类别接口

	//6.5评论
	ADD_COMMENT: API_ADDRESS + '/rest/app/comment/addComment',                                      //6.5.1新增评论内容

	//6.6票夹
	GET_INVOICE_LIST_DATA: API_ADDRESS + '/rest/app/common/invoice/select',							//6.6.1发票列表
	GET_INVOICE_DETAIL_DATA: API_ADDRESS + '/rest/app/common/invoice/find',							//6.6.2发票详情
	GET_INVOICE_DELETE: API_ADDRESS + '/rest/app/common/invoice/delete',							//6.6.3删除
	COLLECT_BY_PIC: API_ADDRESS + '/rest/app/common/invoice/collectByPic',							//6.6.4图片方式归集发票
	COLLECT_BY_QRCODE: API_ADDRESS + '/rest/app/common/invoice/collectByQrcode',					//6.6.5扫描二维码归集发票
	UPDATE_INVOICE: API_ADDRESS + '/rest/app/common/invoice/update',								//6.6.6发票内容更新
	COLLECT_OTHER: API_ADDRESS + '/rest/app/common/invoice/collectByOther',							//6.6.7其他发票保存接口
	GET_INVOICE_TOTAL_DATA: API_ADDRESS + '/rest/app/common/invoice/counts',						//6.6.8获取发票汇总数据
	GET_INVOICE_TYPE_LIST_DATA: API_ADDRESS + '/rest/app/common/invoice/invoiceTypeList',			//6.6.9发票类型列表
	GET_INVOICE_IMAGE: API_ADDRESS + '/rest/app/common/invoice/getImg',								//6.6.11获取发票图片

	//6.7我的资料
	GET_USER_INFO: API_ADDRESS + '/rest/app/user/info/find',                                        //6.7.1查询个人信息
	UPDATE_USER_INFO: API_ADDRESS + '/rest/app/user/info/update',                                   //6.7.2修改个人信息
	GET_IS_LINK_STATE: API_ADDRESS + '/rest/app/user/info/isLink',                                        //6.7.3获取同步状态
	UPDATE_IS_LINK_STATE: API_ADDRESS + '/rest/app/user/info/updateIsLink',                             //6.7.4修改同步状态（update）

	//6.8消息
	GET_MESSAGE_LIST: API_ADDRESS + '/rest/app/message/getMessageList',                             //6.8.1消息列表
	GET_UNREAD_MESSAGE_COUNT: API_ADDRESS + '/rest/app/message/unreadMessageCount',                 //6.8.2未读消息个数
	GET_READ_MESSAGE: API_ADDRESS + '/rest/app/message/unreadMessageSee',                           //6.8.3更改未读消息状态
	CHECK_IS_APPROVAL_USER: API_ADDRESS + '/rest/app/message/isApprovalUser',                       //6.8.4 判断用户权限接口

	//6.9个人报表
	GET_REPORT_YEAR_STATUS: API_ADDRESS + '/rest/app/report/person/getpersonYearBxTotal',			//6.9.1个人本年度报销情况
	QUERY_REIMBURSEMENT_TOTAL_AMOUNT: API_ADDRESS + '/rest/app/report/person/getPersonTypeQuery',	//6.9.2报销费用总额度统计查询
	REIMBURSEMENT_TOTAL_AMOUNT_CHART: API_ADDRESS + '/rest/app/report/person/getOnClickDataShow',	//6.9.3报销费用总额统计柱状图

	VOICE_API_ADDRESS: VOICE_ADDRESS,

	APP_VERSION:APP_VERSION
}

module.exports = API;