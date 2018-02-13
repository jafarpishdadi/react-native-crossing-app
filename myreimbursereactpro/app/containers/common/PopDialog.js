/**
 * Created by Richard.ji on 2017/11/15.
 */

import React, {Component} from "react";
import PropTypes from 'prop-types';
import {
    View,
    Text,
    Image,
    StyleSheet,
    StatusBar,
    Platform,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    PixelRatio,
} from "react-native";
// import Modal from 'react-native-modalbox';
import ScreenUtil, {deviceWidth} from "../../utils/ScreenUtil";
import Message from "./../../constant/Message";

export default class PopDialog extends React.Component {
    static propTypes = {
        showVisible: PropTypes.bool,        // 是否显示
        thisComponent: PropTypes.object,    // 当前Component
        scanClick: PropTypes.func,          // 点击扫描
        photoClick: PropTypes.func,         // 点击拍照
        albumClick: PropTypes.func,         // 点击相册
        thirdItemName:PropTypes.string,     // 第三个选项的标题
        cancelClick: PropTypes.func,        // 点击取消
    };

    static defaultProps = {
        thirdItemName:Message.INVOICE_LIST_ALBUM,
        showVisible: false,
    };

    constructor(props) {
        super(props);

        this._onScanClick = this._onScanClick.bind(this);
        this._onPhotoClick = this._onPhotoClick.bind(this);
        this._onAlbumClick = this._onAlbumClick.bind(this);
        this._onClose = this._onClose.bind(this);
    }

    // 点击开始扫描
    _onScanClick () {
        if (this.props.scanClick) {
            this.props.scanClick(this.props.thisComponent);
        }
    }

    // 点击进行拍照
    _onPhotoClick () {
        if (this.props.photoClick) {
            this.props.photoClick(this.props.thisComponent);
        }
    }

    // 点击打开相册
    _onAlbumClick () {
        if (this.props.albumClick) {
            this.props.albumClick(this.props.thisComponent);
        }
    }

    // 点击触发关闭弹窗
    _onClose () {
        if (this.props.cancelClick) {
            this.props.cancelClick(this.props.thisComponent);
            this.props.showVisible = false;
        }
    }

    renderContent = () => {
        return (
            <View style={styles.background}>
                <TouchableOpacity
                    style={styles.itemClick}
                    onPress={() => {this._onScanClick()}}>
                    <Text style={styles.itemText}>{Message.INVOICE_LIST_SCAN}</Text>
                </TouchableOpacity>
                <View style={styles.separatorLine}/>
                <TouchableOpacity
                    style={styles.itemClick}
                    onPress={() => {this._onPhotoClick()}}>
                    <Text style={styles.itemText}>{Message.INVOICE_LIST_PHOTO}</Text>
                </TouchableOpacity>
                <View style={styles.separatorLine}/>
                <TouchableOpacity
                    style={styles.itemClick}
                    onPress={() => {this._onAlbumClick()}}>
                    <Text style={styles.itemText}>{this.props.thirdItemName}</Text>
                </TouchableOpacity>
                <View style={styles.separatorLine}/>
                <TouchableOpacity
                    style={styles.itemClick}
                    onPress={() => {this._onClose()}}>
                    <Text style={styles.cancelText}>{Message.CANCEL}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    render () {
        return (
            <Modal
                visible={this.props.showVisible}
                transparent={true}
                onRequestClose={() => {this._onClose()}}
            >
                <TouchableWithoutFeedback
                    style={{flex:1}}
                    onPress={() => {
                        this._onClose()
                    }}
                >
                    <View style={styles.container}>
                        {this.renderContent()}
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        zIndex: 999
    },
    background: {
        flex:1,
        height: ScreenUtil.scaleSize(326),
        backgroundColor: '#FFFFFF',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    itemClick: {
        width: deviceWidth,
        paddingTop: ScreenUtil.scaleSize(20),
        paddingBottom: ScreenUtil.scaleSize(20),
        alignItems: 'center'
    },
    itemText: {
        fontSize: ScreenUtil.setSpText(9),
        color: '#FFAA00'
    },
    cancelText: {
        fontSize: ScreenUtil.setSpText(9),
        color: '#ABABAB'
    },
    separatorLine: {
        width: deviceWidth - ScreenUtil.scaleSize(30) * 2,
        paddingHorizontal: ScreenUtil.scaleSize(30),
        height: 1/PixelRatio.get(),
        backgroundColor: '#DEDEDE',
    }
});