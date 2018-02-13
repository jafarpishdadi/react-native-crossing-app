import {Platform} from "react-native";
import fetch from "react-native-fetch-polyfill";
import Util from '../utils/Util';
import API from '../utils/API';
import Message from '../constant/Message';
import Store from 'react-native-simple-store';
import {backLogin} from '../redux/actions/navigator/Navigator';


const responseTimeout = 8;
var token = '';

Store.get('token').then((tokenStr) => {
    if (tokenStr) {
        token = tokenStr;
    }
})

export default class HttpUtil {

    /**
     * Post请求
     *url :请求地址
     *data:参数(Json对象)
     *callback:回调函数
     */
    static postJson(url, data, dispatch, callback) {
        var that = this;
        Store.get('token').then((token) => {
            var fetchOptions = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Client_Type': this.getClientType(),
                    //json形式
                    'Content-Type': 'application/json',
                    'token': token
                },
                timeout: responseTimeout * 1000,
                body: JSON.stringify(data)
            };
            that.fetchData(url, fetchOptions, dispatch, callback);
        })
    }

    /**
     * Post请求
     *url :请求地址
     *data:参数(Json对象)
     *callback:回调函数
     * create:创建企业专用参数
     */
    static postJson1(url, data, create, dispatch, callback) {
        var that = this;
        Store.get('token').then((token) => {
            var fetchOptions = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Client_Type': this.getClientType(),
                    //json形式
                    'Content-Type': 'application/json',
                    'token': token
                },
                timeout: responseTimeout * 1000,
                body: JSON.stringify(data)
            };
            that.fetchData1(url, fetchOptions, create, dispatch, callback);
        })
    }

    /**
     * Post请求
     *url :请求地址
     *data:参数(Json对象)
     *callback:回调函数
     */
    static postForm(url, data, dispatch, callback) {
        var that = this;
        Store.get('token').then((token) => {
            var fetchOptions = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Client_Type': this.getClientType(),
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'token': token
                },
                timeout: responseTimeout * 1000,
                body: data
            };

            that.fetchData(url, fetchOptions, dispatch, callback);
        })
    }

    /**
     * Post文件表单请求
     *url :请求地址
     *data:参数(Json对象)
     *callback:回调函数
     */
    static postFileForm(url, data, dispatch, callback) {
        var that = this;
        Store.get('token').then((token) => {
            var fetchOptions = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Client_Type': this.getClientType(),
                    //multipart/form-data形式
                    'Content-Type': 'multipart/form-data',
                    'token': token
                },
                timeout: responseTimeout * 1000,
                body: data
            };

            that.fetchData(url, fetchOptions, dispatch, callback);
        })
    }

    /**
     * Get请求
     *url :请求地址
     *callback:回调函数
     */
    static get(url, dispatch, callback) {
        var that = this;
        Store.get('token').then((token) => {
            var fetchOptions = {
                timeout: responseTimeout * 1000,
                headers: {
                    'Client_Type': this.getClientType(),
                    'token': token
                }
            };

            that.fetchData(url, fetchOptions, dispatch, callback);
        });
    }

    /**
     * Post请求
     *url :请求地址
     *data:参数(Json对象)
     *callback:回调函数
     */
    static postJsonForFile(url, data, callback) {
        var that = this;
        Store.get('token').then((token) => {
            var fetchOptions = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Client_Type': this.getClientType(),
                    //json形式
                    'Content-Type': 'application/json',
                    'token': token
                },
                timeout: responseTimeout * 1000,
                body: JSON.stringify(data)
            };
            fetch(url, fetchOptions);
        })
    }

    /**
     * fetch
     * @param url 请求地址
     * @param options 请求参数
     * @param callback 回调函数
     */
    static fetchData(url, options, dispatch, callback) {
        if(url == API.DOWNLOAD_ATTACHMENT_BY_DIR || url == API.UPLOAD_ATTACHMENT
            || url == API.COLLECT_BY_PIC|| url == API.GET_INVOICE_IMAGE){
            options.timeout = 60000;
        }
        fetch(url, options)
            .then((response) => response.text())
            .then((responseText) => {

                const ret = Util.jsonParse(responseText);
                if (!ret) {
                    Util.showToast(Message.NETWORK_DATA_ERROR);
                    callback(ret, false);
                } else if(ret.message == "invalidToken"){
                    Util.showToast(Message.INVALID_TOKEN);
                    Store.delete('token');
                    Store.delete('userInfo').then(()=>{
                        dispatch(backLogin())
                    });
                    //dispatch(backLogin());
                    //跳转到登录页面
                }
                else{
                    callback(ret, true);
                }
            })
            .catch((error) => {
                Util.showToast(Message.NETWORK_ERROR)
                callback('', false);
            });
    }

    /**
     * fetch
     * @param url 请求地址
     * @param options 请求参数
     * @param callback 回调函数
     * @param 创建企业专用参数
     */
    static fetchData1(url, options, create, dispatch, callback) {
        fetch(url, options)
            .then((response) => response.text())
            .then((responseText) => {
                const ret = Util.jsonParse(responseText);
                if (!ret) {
                    Util.showToast(Message.NETWORK_DATA_ERROR);
                    callback(ret, false);
                } else if(ret.message == "invalidToken"){
                    Store.delete('token');
                    Store.delete('userInfo').then(()=>{
                        dispatch(backLogin())
                    });
                    //dispatch(backLogin());
                    //跳转到登录页面
                }
                else{
                    callback(ret, true);
                }
            })
            .catch((error) => {
                Util.showToast(Message.NETWORK_ERROR)
                callback('', false);
            });
    }

    /**
     * 根据设备类型获取请求头 字符串
     * @returns {*}
     * @private
     */
    static getClientType() {
        if (Platform.OS === 'ios') {
            return 'app-ios';
        } else {
            return 'app-android';
        }
    }
}