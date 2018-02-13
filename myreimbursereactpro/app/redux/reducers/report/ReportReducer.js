/**
 * Created by sky.qian on 10/26/2017.
 */
import * as types from '../../../constant/ActionTypes';

const initialState = {
    isFirst: true,
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

    isLoading: false,

    data: {},
    legend: {
        enabled: true,
        textSize: 14,
        form: 'SQUARE',
        formSize: 14,
        xEntrySpace: 10,
        yEntrySpace: 5,
        formToTextSpace: 5,
        wordWrapEnabled: false,
        maxSizePercent: 0.5
    },
    highlights: [{x: 1}],
    xAxis: {
        valueFormatter: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        granularityEnabled: true,
        granularity: 1,
        axisMaximum: 13,
        axisMinimum: 1,
        centerAxisLabels: true,
        position: 'BOTTOM'
    },
    yAxis: {
        left: {
            axisMinimum: 0,
        },
        right: {
            enabled: false,
            drawAxisLine: false,
            axisLineWidth: 0
        }
    }
}

const reportReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.REPORT_CHANGE_STATE:
            return {...state, ...action.state}
        default:
            return state;
    }
}

export default reportReducer;