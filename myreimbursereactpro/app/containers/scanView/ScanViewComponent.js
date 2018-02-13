/**
 * Created by Denny.liu on 2017/7/3.
 */
import React, {Component} from "react";
import PropTypes from 'prop-types';
import {requireNativeComponent, View, DeviceEventEmitter} from "react-native";

// 第一个参数是原生模块的名称， 第二个是当前组件的名称
var ScanView = requireNativeComponent('RCTScanView', ScanViewComponent, {
    nativeOnly: {onChange: true, onSelect: true}
});

class ScanViewComponent extends Component {

    constructor(props) {
        super(props);

        this._onResult = this._onResult.bind(this);
        this._onInputPress = this._onInputPress.bind(this);
    }

    /**
     * 扫码结束
     * @param event
     * @private
     */
    _onResult(event) {
        if (!this.props.onResult) {
            return;
        }

        this.props.onResult(event.nativeEvent);
    }

    /**
     * 变更手动输入
     * @param event
     * @private
     */
    _onInputPress(event) {
        if (!this.props.onSelect) {
            return;
        }

        this.props.onSelect(event.nativeEvent);
    }

    render() {
        // onChange事件是JS已经定义好的，对应原生的topChange事件
        return <ScanView {...this.props} onChange={ this._onResult } onSelect={ this._onInputPress }/>;
    }
}

ScanViewComponent.propTypes = {
    scanWidth: PropTypes.number,
    scanHeight: PropTypes.number,
    scanLeft: PropTypes.number,
    scanTop: PropTypes.number,
    doScan: PropTypes.bool,
    doPreview: PropTypes.bool,
    showTips: PropTypes.bool,
    onResult: PropTypes.func,
    onSelect: PropTypes.func,
    ...View.propTypes, // 包含默认的View的属性
};

module.exports = ScanViewComponent;