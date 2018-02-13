/**
 *工具的实现
 */
import {ToastAndroid, Platform} from "react-native";
import Toast from "react-native-root-toast";
import Message from '../constant/Message';
import Area from './area.json';
import {loadData as loadReportData} from '../redux/actions/report/Report';
const yearStart = 1950;
const yearEnd = 2050;
export default class Util {

    static YEAR_START = yearStart;
    static YEAR_END = yearEnd;

    /**
     * 显示弱提示
     */
    static showToast(content, duration) {
        //判断是否是android的，是则直接显示toast
        if (Platform.OS == 'android') {
            ToastAndroid.show(content, ToastAndroid.SHORT);
            return;
        }

        //ios判断上一个toast是否结束显示，没有则隐藏
        if (this.toast != null && this.toast != undefined) {
            Toast.hide(this.toast);
        }

        //显示toast
        this.toast = Toast.show(content.toString(), {
            duration: duration ? duration : Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0
        });
    }

    /**
     * 生成随机id
     */
    static randomStr() {
        return Math.random().toString(36).substr(2);
    }

    /**
     * 判断是否为空
     */
    static checkIsEmptyString(str) {
        if (str === null || str === undefined || str === '') {
            return true;
        }

        return false;
    }

    /**
     * 创建时间选择器时间
     */
    static createDateData() {
        let date = [];
        for (let i = yearStart; i < yearEnd; i++) {
            let month = [];
            for (let j = 1; j < 13; j++) {
                let day = [];
                if (j === 2) {
                    for (let k = 1; k < 29; k++) {
                        day.push(k + '日');
                    }
                    //Leap day for years that are divisible by 4, such as 2000, 2004
                    if (i % 4 === 0) {
                        day.push(29 + '日');
                    }
                }
                else if (j in {1: 1, 3: 1, 5: 1, 7: 1, 8: 1, 10: 1, 12: 1}) {
                    for (let k = 1; k < 32; k++) {
                        day.push(k + '日');
                    }
                }
                else {
                    for (let k = 1; k < 31; k++) {
                        day.push(k + '日');
                    }
                }
                let _month = {};
                _month[j + '月'] = day;
                month.push(_month);
            }
            let _date = {};
            _date[i + '年'] = month;
            date.push(_date);
        }
        return date;
    }

    /**
     * 创建时间选择器时间
     */
    static createDateData1() {
        let date = [];
        for (let i = yearStart; i < yearEnd; i++) {
            let month = [];
            for (let j = 1; j < 13; j++) {
                let day = [];
                if (j === 2) {
                    for (let k = 1; k < 29; k++) {
                        day.push(k);
                    }
                    //Leap day for years that are divisible by 4, such as 2000, 2004
                    if (i % 4 === 0) {
                        day.push(29);
                    }
                }
                else if (j in {1: 1, 3: 1, 5: 1, 7: 1, 8: 1, 10: 1, 12: 1}) {
                    for (let k = 1; k < 32; k++) {
                        day.push(k);
                    }
                }
                else {
                    for (let k = 1; k < 31; k++) {
                        day.push(k);
                    }
                }
                let _month = {};
                _month[j] = day;
                month.push(_month);
            }
            let _date = {};
            _date[i] = month;
            date.push(_date);
        }
        return date;
    }

    /**
     * 创建时间选择器时间
     */
    static createDateDataWithoutDay() {
        let date = [];
        for (let i = yearStart; i < yearEnd; i++) {
            let month = [];
            for (let j = 1; j < 13; j++) {
                month.push(j + '月');
            }
            let _date = {};
            _date[i + '年'] = month;
            date.push(_date);
        }
        return date;
    }

    //创建年月日时分时间
    static createTime() {
        let years = [],
            months = [],
            days = [],
            hours = [],
            minutes = [];

        for (let i = 1; i < 102; i++) {
            years.push(i + 1949 + '年');
        }
        for (let i = 1; i < 13; i++) {
            if (i < 10) {
                i = '0' + i;
            }
            months.push(i + '月');
        }
        for (let i = 1; i < 32; i++) {
            if (i < 10) {
                i = '0' + i;
            }
            days.push(i + '日');
        }

        for (let i = 0; i < 24; i++) {
            if (i < 10) {
                i = '0' + i;
            }
            hours.push(i + '时');
        }

        for (let i = 0; i < 60; i++) {
            if (i < 10) {
                i = '0' + i;
            }
            minutes.push(i + '分');
        }
        let pickerData = [years, months, days, hours, minutes];
        return pickerData;
    }

    //创建年月日时间
    static createDataWithYMD() {
        let years = [],
            months = [],
            days = [];
        for (let i = 1; i < 102; i++) {
            years.push(i + 1949);
        }
        for (let i = 1; i < 13; i++) {
            months.push(i);
        }
        for (let i = 1; i < 32; i++) {
            days.push(i);
        }
        let pickerData = [years, months, days];
        return pickerData;
    }

    /**
     * 首页列表title显示
     * @param item 列表单行数据
     * @returns {*} 返回列表单行title
     */
    static getReimbursementTitle(item) {
        let formDesc = this.jsonParse(item.formDesc);
        switch (item.formState) {
            case '0':
                return formDesc.applyTypeName + item.formTypeName;
            default:
                let createTimeStr = item.createTimeStr;
                let date = createTimeStr.substring(0, 11);
                return date + ' ' + formDesc.applyTypeName + item.formTypeName;
        }
    }

    /**
     * 根据表单状态code获取名称
     * @param formStateCode 表单状态code
     * @returns {string} 表单状态名称
     */
    static getFormStateName(formStateCode) {
        let name = '';
        switch (formStateCode) {
            case '0':
                name = Message.REIMBURSEMENT_NO_COMMIT;
                break;
            case '1':
                name = Message.REIMBURSEMENT_CANCEL;
                break;
            case '2':
                name = Message.REIMBURSEMENT_REJECT;
                break;
            case '3':
                name = Message.REIMBURSEMENT_ING;
                break;
            case '4':
                name = Message.REIMBURSEMENT_PASS;
                break;
            default:
        }
        return name;
    }

    /**
     * 根据发票种类code获取名称
     * @param invoiceTypeCode 发票种类code
     * @returns {string} 发票种类名称
     */
    static getInvoiceTypeName(invoiceTypeCode) {
        let name = '';
        switch (invoiceTypeCode) {
            case '01':
                name = Message.INVOICE_TYPE_NAME_01;
                break;
            case '04':
                name = Message.INVOICE_TYPE_NAME_04;
                break;
            case '10':
                name = Message.INVOICE_TYPE_NAME_10;
                break;
            case '11':
                name = Message.INVOICE_TYPE_NAME_11;
                break;
            case '03':
                name = Message.INVOICE_TYPE_NAME_03;
                break;
            case '02':
                name = Message.INVOICE_TYPE_NAME_02;
                break;
            case '91':
                name = Message.INVOICE_TYPE_NAME_91;
                break;
            case '92':
                name = Message.INVOICE_TYPE_NAME_92;
                break;
            case '93':
                name = Message.INVOICE_TYPE_NAME_93;
                break;
            case '94':
                name = Message.INVOICE_TYPE_NAME_94;
                break;
            case '95':
                name = Message.INVOICE_TYPE_NAME_95;
                break;
            case '96':
                name = Message.INVOICE_TYPE_NAME_96;
                break;
            case '00':
                name = Message.INVOICE_TYPE_NAME_00;
                break;
            case '97':
                name = Message.INVOICE_TYPE_NAME_97;
                break;
            case '98':
                name = Message.INVOICE_TYPE_NAME_98;
                break;
            default:
        }
        return name;
    }

    /**
     * 根据发票种类名称获取code
     * @param invoiceTypeName 发票种类名称
     * @returns {string} 发票种类code
     */
    static getInvoiceTypeCode(invoiceTypeName) {
        let code = '';
        switch (invoiceTypeName) {
            case Message.INVOICE_TYPE_NAME_01:
                code = '01';
                break;
            case Message.INVOICE_TYPE_NAME_04:
                code = '04';
                break;
            case Message.INVOICE_TYPE_NAME_10:
                code = '10';
                break;
            case Message.INVOICE_TYPE_NAME_11:
                code = '11';
                break;
            case Message.INVOICE_TYPE_NAME_03:
                code = '03';
                break;
            case Message.INVOICE_TYPE_NAME_02:
                code = '02';
                break;
            case Message.INVOICE_TYPE_NAME_91:
                code = '91';
                break;
            case Message.INVOICE_TYPE_NAME_92:
                code = '92';
                break;
            case Message.INVOICE_TYPE_NAME_93:
                code = '93';
                break;
            case Message.INVOICE_TYPE_NAME_94:
                code = '94';
                break;
            case Message.INVOICE_TYPE_NAME_95:
                code = '95';
                break;
            case Message.INVOICE_TYPE_NAME_96:
                code = '96';
                break;
            case Message.INVOICE_TYPE_NAME_00:
                code = '00';
                break;
            case Message.INVOICE_TYPE_NAME_97:
                code = '97';
                break;
            case Message.INVOICE_TYPE_NAME_98:
                code = '98';
                break;
            default:
        }
        return code;
    }

    //判断数组是否包含指定元素
    static contains(arr, obj) {
        var i = arr.length;
        while (i--) {
            if (arr[i] === obj) {
                return true;
            }
        }
        return false;
    }

    //判断数组是否包含指定元素
    static idContains(arr, obj) {
        var i = arr.length;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].invoiceUUID === obj.invoiceUUID) {
                return true;
            }
        }
        return false;
    }

    /**
     * 判断2个字符串是否相等
     * @param obj1  字符串1
     * @param obj2  字符串2
     * @returns {boolean} 返回布尔值TRUE or FALSE
     */
    static objEquals(obj1, obj2) {
        if (obj1 == obj2) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 处理新建报销单-发票详情-编辑发票-保存，更新新建报销单该发票信息的情况,
     * 如不是如此，请谨慎使用该方法，不推荐共用
     * @param arr
     * @param obj
     * @returns {boolean}
     */
    static elementContains(arr, obj) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].invoiceUUID === obj.invoiceUUID &&
                arr[i].invoiceDate === obj.invoiceDate &&
                arr[i].invoiceCount === obj.invoiceCount &&
                arr[i].invoiceAmount === obj.invoiceAmount) {
                return true;
            } else {
                return false;
            }
        }
    }

    //json格式转换
    static jsonParse(str) {
        if (!this.checkIsEmptyString(str)) {
            var value = JSON.parse(str);

            if (!this.checkIsEmptyString(value)) {
                return value;
            }
        }
        return null;
    }

    //数字或字母
    static checkString(str) {
        var reg = /^[a-zA-Z0-9_]+$/;

        return reg.test(str);
    }


    //验证手机
    static checkPhone(phone) {
        var reg = /^1[3|4|5|7|8][0-9]\d{8}$/;

        if (!reg.test(phone)) {
            return false;
        }

        return true;
    }

    //验证密码
    static checkPassword(password) {
        return (password.length >= 6 && password.length <= 12 && this.checkString(password));
    }

    //格式化日期  YYYYMMDD to YYYY-MM-DD
    static formatDate(date) {
        var pattern = /(\d{4})(\d{2})(\d{2})/;
        return date.replace(pattern, '$1-$2-$3');
    }

    //格式化日期  YYYYMMDD to YYYY年MM月DD日
    static formatDate1(date) {
        var pattern = /(\d{4})(\d{2})(\d{2})/;
        return date.replace(pattern, '$1年$2月$3日');
    }

    //格式化日期  YYYY年MM月DD日 hh:mm:ss to YYYY/MM/DD hh:mm:ss
    static formateDate2(date) {
        return date.replace("年", "/").replace("月", "/").replace("日", "");
    }

    //格式化日期  YYYY-MM-DD hh:mm:ss to YYYY/MM/DD hh:mm:ss
    static formateDate3(date) {
        return date.replace("-", "/").replace("-", "/");
    }

    //验证密码，是否包含字母和数字，长度为6-12
    static checkCorrectPassword(str) {
        var reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,12}$/;
        return reg.test(str);
    }

    //生成地区json
    static createAreaData() {
        return Area.map((item) => {
            const data = {};
            data[item.areaName] = item.data.map(city => city.areaName);
            return data;
        })
    }

    //差旅费报销列表字段解析
    static parseReimbursementLabelJsonForTrip(name) {
        const str = '{"expenseDesc":"报销说明:","applyTypeName":"报销类别:","expenseDname":"部门:","amount":"报销金额:"}';
        const json = JSON.parse(str);
        return json[name];
    }

    //报销列表字段解析
    static parseReimbursementLabelJson(name) {
        const str = '{"expenseDesc":"报销事由:","applyTypeName":"报销类别:","expenseDname":"部门:","amount":"报销金额:"}';
        const json = JSON.parse(str);
        return json[name];
    }

    //借款单列表字段解析
    static parseLoanOrderLabelJson(name) {
        const str = '{"expenseDesc":"借款事由:","expenseDname":"部门:","amount":"借款金额:"}';
        const json = JSON.parse(str);
        return json[name];
    }

    //差旅申请列表字段解析
    static parseTravelApplyLabelJson(name) {
        const str = '{"expenseDesc":"出差事由:","expenseTargetCity":"目的城市:","expectedCostAmount":"预计花费:","expenseDname":"部门:"}';
        const json = JSON.parse(str);
        return json[name];
    }

    //删除数组指定元素
    static removeByValue(arr, val) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == val) {
                arr.splice(i, 1);
                return arr;
            }
        }
        return arr;
    }

    //验证数字
    static checkNumber(number) {
        var reg = /^\d+$/;

        return reg.test(number) == true;
    }

    //验证正浮点数
    static checkFloatNumber(number) {
        if (number) {
            return !isNaN(number) && parseFloat(number) >= 0;
        }
        return true;
    }

    //验证正浮点数,7位整数，2位小数
    static checkFloatNumber2(number) {
        if (number) {
            if (!isNaN(number) && parseFloat(number) >= 0) {
                const arr = number.split('.');
                if (parseFloat(arr[0]) < 10000000) {
                    if(arr[1]) {
                        return arr[1].length <= 2;
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
        return true;
    }

    //验证浮点数
    static checkAllFloatNumber(number) {
        return !isNaN(number) || (number.toString() === '-');
    }

    //去掉前后空格
    static trim(str) {
        return str.replace(/(^\s*)|(\s*$)/g, '');
    }

    //验证email
    static checkEmail(email) {
        var reg = /^[A-Za-z0-9]+([-_.][A-Za-z0-9]+)*@([A-Za-z0-9]+[-.])+[A-Za-z0-9]{2,5}$/;

        if (!reg.test(this.trim(email))) {
            return false;
        }

        return true;
    }

    //二进制流转base64
    static binToBase64(bitString) {
        var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split(""); //索引表

        var result = "";
        var tail = bitString.length % 6;
        var bitStringTemp1 = bitString.substr(0, bitString.length - tail);
        var bitStringTemp2 = bitString.substr(bitString.length - tail, tail);
        for (var i = 0; i < bitStringTemp1.length; i += 6) {
            var index = parseInt(bitStringTemp1.substr(i, 6), 2);
            result += code[index];
        }
        bitStringTemp2 += new Array(7 - tail).join("0");
        if (tail) {
            result += code[parseInt(bitStringTemp2, 2)];
            result += new Array((6 - tail) / 2 + 1).join("=");
        }
        return result;
    }

    //判断数组是否为空
    static checkListIsEmpty(array) {
        if (array === undefined || array.length == 0) {
            return true;
        }
        return false;
    }

    static checkPermission(permission) {
        var flag = (permission != 'authorized');
        if (Platform.OS == 'ios') {
            flag = (permission != 'authorized' && permission != 'undetermined');
        }

        return !flag;
    }

    /**
     * 切换到报表tab时，加载刷新报表数据
     */
    static loadData () {
        loadReportData();
    }
}