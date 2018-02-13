import * as types from '../../../constant/ActionTypes';
import HttpUtil from '../../../network/HttpUtil';
import API from '../../../utils/API';
import Util from '../../../utils/Util';

export const changeState = (state) => {
    return {
        type: types.REPORT_CHANGE_STATE,
        state: state,
    }
}

export const loadData = () => {
    return dispatch => {
        dispatch(loadReportYearData());
    }
}

export const changeToReportTab = () => {
    return dispatch => {
        return HttpUtil.postJson(API.GET_REPORT_YEAR_STATUS, {}, dispatch, function (ret, status) {
            if (status) {
                dispatch(changeState({
                    ybxtotal: ret.data.ybxtotal.toString(),
                    spztotal: ret.data.spztotal.toString(),
                    bxzetotal: ret.data.bxzetotal.toString()
                }));
                return HttpUtil.postJson(API.QUERY_REIMBURSEMENT_TOTAL_AMOUNT, {bblx: 'costtrends'}, dispatch, function (ret, status) {
                    if (status) {
                        var shenpinlistData = [];
                        var shenpasslistData = [];
                        var inAuditData = [];
                        var passedAuditData = [];
                        const d = new Date();
                        const year = d.getFullYear();
                        const month = '' + (d.getMonth() + 1);
                        var name = '';
                        if (month < 10) {
                            name = year + '-0' + month;
                        } else {
                            name = year + '-' + month;
                        }
                        inAuditData[0] = 1.00;
                        passedAuditData[0] = 1.00;
                        for (var i = 0; i < ret.data.shenpinlist.length; i++) {
                            shenpinlistData.push(parseFloat(ret.data.shenpinlist[i]).toFixed(2));
                            inAuditData[i + 1] = {
                                y: ret.data.shenpinlist[i],
                                marker: i + 1 + '月审批中\n' + parseFloat(ret.data.shenpinlist[i]).toFixed(2) + '元'
                            };
                        }
                        for (var k = 0; k < ret.data.shenpasslist.length; k++) {
                            shenpasslistData.push(parseFloat(ret.data.shenpasslist[k]).toFixed(2));
                            passedAuditData[k + 1] = {
                                y: ret.data.shenpasslist[k],
                                marker: k + 1 + '月审批通过\n' + parseFloat(ret.data.shenpasslist[k]).toFixed(2) + '元'
                            };
                        }
                        dispatch(changeState({
                            shenpinlist: shenpinlistData,
                            shenpasslist: shenpasslistData,
                            monthlist: ret.data.monthlist,
                            maxamount: ret.data.maxamount,
                            isdata: ret.data.isdata,
                            data: {
                                dataSets: [{
                                    values: inAuditData,
                                    label: '审批中',
                                    config: {
                                        drawValues: false,
                                        colors: [-482976],
                                    }
                                },
                                    {
                                        values: passedAuditData,
                                        label: '审批通过',
                                        config: {
                                            drawValues: false,
                                            colors: [-12333442],
                                        }
                                    }
                                ],
                                config: {
                                    barWidth: 0.4,
                                    group: {
                                        fromX: 0,
                                        groupSpace: 0,
                                        barSpace: 0.1,
                                    }
                                }
                            }
                        }));
                        return HttpUtil.postJson(API.REIMBURSEMENT_TOTAL_AMOUNT_CHART, {
                            name: name,
                            seriesName: '审批通过',
                            bxtypeqf: 'costtrends'
                        }, dispatch, function (ret, status) {
                            if (status) {
                                const d = new Date();
                                const year = d.getFullYear();
                                const month = '' + (d.getMonth() + 1);
                                if (ret.data == null) {
                                    dispatch(changeState({reimbursementAmountChartData: []}));
                                } else {
                                    dispatch(changeState({
                                        defaultDate: year + '年' + month + '月',
                                        defaultMonth: month + '月',
                                        name: name,
                                        reimbursementAmountChartData: ret.data,
                                        isLoading: false
                                    }));
                                }
                            } else {
                                dispatch(changeState({
                                    isLoading: false
                                }));
                            }
                        })
                    } else {
                        dispatch(changeState({
                            isLoading: false
                        }));
                    }
                })
            } else {
                dispatch(changeState({
                    isLoading: false
                }));
            }
        })
    }
}

/**
 * 个人年度报销状况统计
 * @returns {function(*)}
 */
export const loadReportYearData = () => {
    return dispatch => {
        dispatch(changeState({
            isLoading: true,
            isFirst: false,
            showFlatList: [0, 0],

            ybxtotal: 0,            //已报销金额
            spztotal: 0,            //审批中金额
            bxzetotal: 0,           //报销总额
            name: '',               //月份
            seriesName: '审批通过',         //审批状态,默认审批通过状态
            bxtypeqf: '',           //报表类型区分
            reimbursementAmountChartData: [],
            shenpinlist: [],         //审批中
            shenpasslist: [],        //审批通过
            monthlist: [],           //X轴显示月份
            maxamount: '',           //最大金额
            isdata: 0,               //1表示有数据，直接显示柱状图，0表示无数据，直接显示暂无统计数据

            selectedYear: '',
            selectedMonth: '',
            selectedDateStr: '',
            defaultMonth: '',
            defaultDate: '',
            defaultSeriesName: '审批通过',

            isOpen: true,

            selectedIndex: 1,

            showPickerShadow: false,   //是否显示选择器阴影
        }));
        return HttpUtil.postJson(API.GET_REPORT_YEAR_STATUS, {}, dispatch, function (ret, status) {
            if (status) {
                dispatch(changeState({
                    ybxtotal: ret.data.ybxtotal.toString(),
                    spztotal: ret.data.spztotal.toString(),
                    bxzetotal: ret.data.bxzetotal.toString()
                }));
                dispatch(queryReimbursementAmount());
            } else {
                dispatch(changeState({
                    isLoading: false
                }));
            }
        })
    }
}

/**
 * 报销总金额占比,根据点击的月份，查询相关数据
 * 例如：我在柱状图中点击了8月份，那么该函数传入参数
 * （8 月，审批中，costtrends）
 * 返回查询的数据，显示在eCharts的下方UI中,
 * 上述举例中参数，
 * 第一个为月份
 * 第二个为审批状态，分为审批中和审批通过2种
 * 第三个为报表类型区分，目前只有costtrends1种
 * @returns {function(*)}
 */
export const loadReimbursementTotalAmountProportion = (name, seriesName) => {
    return dispatch => {
        return HttpUtil.postJson(API.REIMBURSEMENT_TOTAL_AMOUNT_CHART, {
            name: name,
            seriesName: seriesName,
            bxtypeqf: 'costtrends'
        }, dispatch, function (ret, status) {
            if (status) {
                const d = new Date();
                const year = d.getFullYear();
                const month = '' + (d.getMonth() + 1);
                if (ret.data == null) {
                    dispatch(changeState({reimbursementAmountChartData: []}));
                } else {
                    dispatch(changeState({
                        defaultDate: year + '年' + month + '月',
                        defaultMonth: month + '月',
                        name: name,
                        reimbursementAmountChartData: ret.data,
                        isLoading: false
                    }));
                }
            } else {
                dispatch(changeState({
                    isLoading: false
                }));
            }
        })
    }
}

/**
 * 报销费用总额统计查询
 * 为eCharts提供数据支持
 * 参数bblx为报表类型
 * 仅为costtrends报表类型
 * @returns {function(*)}
 */
export const queryReimbursementAmount = () => {
    return dispatch => {
        return HttpUtil.postJson(API.QUERY_REIMBURSEMENT_TOTAL_AMOUNT, {bblx: 'costtrends'}, dispatch, function (ret, status) {
            if (status) {
                var shenpinlistData = [];
                var shenpasslistData = [];
                var inAuditData = [];
                var passedAuditData = [];
                const d = new Date();
                const year = d.getFullYear();
                const month = '' + (d.getMonth() + 1);
                var name = '';
                if (month < 10) {
                    name = year + '-0' + month;
                } else {
                    name = year + '-' + month;
                }
                inAuditData[0] = 1.00;
                passedAuditData[0] = 1.00;
                for (var i = 0; i < ret.data.shenpinlist.length; i++) {
                    shenpinlistData.push(parseFloat(ret.data.shenpinlist[i]).toFixed(2));
                    inAuditData[i + 1] = {
                        y: ret.data.shenpinlist[i],
                        marker: i + 1 + '月审批中\n' + parseFloat(ret.data.shenpinlist[i]).toFixed(2) + '元'
                    };
                }
                for (var k = 0; k < ret.data.shenpasslist.length; k++) {
                    shenpasslistData.push(parseFloat(ret.data.shenpasslist[k]).toFixed(2));
                    passedAuditData[k + 1] = {
                        y: ret.data.shenpasslist[k],
                        marker: k + 1 + '月审批通过\n' + parseFloat(ret.data.shenpasslist[k]).toFixed(2) + '元'
                    };
                }
                dispatch(changeState({
                    shenpinlist: shenpinlistData,
                    shenpasslist: shenpasslistData,
                    monthlist: ret.data.monthlist,
                    maxamount: ret.data.maxamount,
                    isdata: ret.data.isdata,
                    data: {
                        dataSets: [{
                            values: inAuditData,
                            label: '审批中',
                            config: {
                                drawValues: false,
                                colors: [-482976],
                            }
                        },
                            {
                                values: passedAuditData,
                                label: '审批通过',
                                config: {
                                    drawValues: false,
                                    colors: [-12333442],
                                }
                            }
                        ],
                        config: {
                            barWidth: 0.4,
                            group: {
                                fromX: 0,
                                groupSpace: 0,
                                barSpace: 0.1,
                            }
                        }
                    }
                }));
                dispatch(loadReimbursementTotalAmountProportion(name, '审批通过'));
            } else {
                dispatch(changeState({
                    isLoading: false
                }));
            }
        })
    }
}

/**
 * 报表页面选择日期或者审批状态时，刷新页面
 * @param name
 * @param seriesName
 * @returns {function(*=)}
 */
export const loadChartData = (name, seriesName) => {
    return dispatch => {
        return HttpUtil.postJson(API.REIMBURSEMENT_TOTAL_AMOUNT_CHART, {
            name: name,
            seriesName: seriesName,
            bxtypeqf: 'costtrends'
        }, dispatch, function (ret, status) {
            if (status) {
                const d = new Date();
                const year = d.getFullYear();
                const month = '' + (d.getMonth() + 1);
                if (ret.data == null) {
                    dispatch(changeState({reimbursementAmountChartData: []}));
                } else {
                    dispatch(changeState({
                        defaultDate: year + '年' + month + '月',
                        defaultMonth: month + '月',
                        name: name,
                        reimbursementAmountChartData: ret.data,
                        isLoading: false
                    }));
                    return HttpUtil.postJson(API.GET_REPORT_YEAR_STATUS, {}, dispatch, function (ret, status) {
                        if (status) {
                            dispatch(changeState({
                                ybxtotal: ret.data.ybxtotal.toString(),
                                spztotal: ret.data.spztotal.toString(),
                                bxzetotal: ret.data.bxzetotal.toString()
                            }));
                            return HttpUtil.postJson(API.QUERY_REIMBURSEMENT_TOTAL_AMOUNT, {bblx: 'costtrends'}, dispatch, function (ret, status) {
                                if (status) {
                                    var shenpinlistData = [];
                                    var shenpasslistData = [];
                                    var inAuditData = [];
                                    var passedAuditData = [];
                                    inAuditData[0] = 1.00;
                                    passedAuditData[0] = 1.00;
                                    for (var i = 0; i < ret.data.shenpinlist.length; i++) {
                                        shenpinlistData.push(parseFloat(ret.data.shenpinlist[i]).toFixed(2));
                                        inAuditData[i + 1] = {
                                            y: ret.data.shenpinlist[i],
                                            marker: i + 1 + '月审批中\n' + parseFloat(ret.data.shenpinlist[i]).toFixed(2) + '元'
                                        };
                                    }
                                    for (var k = 0; k < ret.data.shenpasslist.length; k++) {
                                        shenpasslistData.push(parseFloat(ret.data.shenpasslist[k]).toFixed(2));
                                        passedAuditData[k + 1] = {
                                            y: ret.data.shenpasslist[k],
                                            marker: k + 1 + '月审批通过\n' + parseFloat(ret.data.shenpasslist[k]).toFixed(2) + '元'
                                        };
                                    }
                                    dispatch(changeState({
                                        shenpinlist: shenpinlistData,
                                        shenpasslist: shenpasslistData,
                                        monthlist: ret.data.monthlist,
                                        maxamount: ret.data.maxamount,
                                        isdata: ret.data.isdata,
                                        data: {
                                            dataSets: [{
                                                values: inAuditData,
                                                label: '审批中',
                                                config: {
                                                    drawValues: false,
                                                    colors: [-482976]

                                                }
                                            },
                                                {
                                                    values: passedAuditData,
                                                    label: '审批通过',
                                                    config: {
                                                        drawValues: false,
                                                        colors: [-12333442],
                                                    }
                                                }
                                            ],
                                            config: {
                                                barWidth: 0.4,
                                                group: {
                                                    fromX: 0,
                                                    groupSpace: 0,
                                                    barSpace: 0.1,
                                                }
                                            }
                                        }
                                    }));
                                } else {
                                    dispatch(changeState({
                                        isLoading: false
                                    }));
                                }
                            })
                        } else {
                            dispatch(changeState({
                                isLoading: false
                            }));
                        }
                    })
                }
            } else {
                dispatch(changeState({
                    isLoading: false
                }));
            }
        })
    }
}