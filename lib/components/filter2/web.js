"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const weekday_1 = tslib_1.__importDefault(require("dayjs/plugin/weekday"));
const localeData_1 = tslib_1.__importDefault(require("dayjs/plugin/localeData"));
dayjs_1.default.extend(weekday_1.default);
dayjs_1.default.extend(localeData_1.default);
const lodash_1 = require("oak-domain/lib/utils/lodash");
const utils_1 = require("./utils");
const refAttr_1 = tslib_1.__importDefault(require("../refAttr"));
function Render(props) {
    const { entity, column, oakFullpath, viewType, options, attrI18n, entityI18n, isCommonI18n, } = props.data;
    const { t, getNamedFilter, setFilterAndResetFilter, } = props.methods;
    const name = (0, utils_1.getFilterName)(column);
    const filter = getNamedFilter(name);
    const { op, attr, placeholder, label: _label } = column;
    // ready中根据attrType判断得到的viewType,不存在viewType直接返回null
    if (!viewType) {
        return null;
    }
    // 拼接过滤项的label
    let label = '';
    if (_label) {
        label = _label;
    }
    else if (isCommonI18n) {
        label = attrI18n ? t(`common::${attrI18n}`) : '';
    }
    else {
        label =
            entityI18n && attrI18n
                ? t(`${entityI18n}:attr.${attrI18n}`)
                : '';
    }
    let V;
    if (column.render) {
        return ((0, jsx_runtime_1.jsx)(antd_1.Form.Item, { label: label, name: name, children: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: column.render }) }));
    }
    switch (viewType) {
        case 'Input': {
            V = ((0, jsx_runtime_1.jsx)(antd_1.Input, { placeholder: placeholder || t('placeholder.input'), onChange: (e) => {
                    const val = e.target.value;
                    setFilterAndResetFilter(viewType, val);
                }, allowClear: true, onPressEnter: () => { } }));
            break;
        }
        case 'Select': {
            const options2 = options.map((ele) => ({
                label: typeof ele.value === 'boolean'
                    ? t(`${ele.value ? 'tip.yes' : 'tip.no'}`)
                    : t(`${entityI18n}:v.${attrI18n}.${ele.value}`),
                value: ele.value,
            }));
            const multiple = ['$in', '$nin'].includes(op || '');
            V = ((0, jsx_runtime_1.jsx)(antd_1.Select, { mode: multiple ? 'multiple' : undefined, allowClear: true, placeholder: placeholder || t('placeholder.select'), onChange: (value) => {
                    let value2 = multiple ? value : [value];
                    if (value === undefined || value === null) {
                        value2 = [];
                    }
                    setFilterAndResetFilter(viewType, value2);
                }, options: options2 }));
            break;
        }
        case 'DatePicker': {
            const { dateProps } = column;
            const { showTime = false } = dateProps || {};
            //assert(op, '选择时间，算子必须传入');
            const unitOfTime = 'day';
            V = ((0, jsx_runtime_1.jsx)(antd_1.DatePicker, { placeholder: placeholder || t('placeholder.select'), style: { width: '100%' }, format: "YYYY-MM-DD", showTime: showTime, onChange: (date, dateString) => {
                    setFilterAndResetFilter(viewType, date);
                } }));
            break;
        }
        case 'DatePicker.RangePicker': {
            const { dateProps } = column;
            const { showTime = false } = dateProps || {};
            V = ((0, jsx_runtime_1.jsx)(antd_1.DatePicker.RangePicker
            // placeholder={placeholder || t('placeholder.select')}
            , { 
                // placeholder={placeholder || t('placeholder.select')}
                style: { width: '100%' }, showTime: showTime, onChange: (dates, dateStrings) => {
                    setFilterAndResetFilter(viewType, dates);
                } }));
            break;
        }
        case 'RefAttr': {
            const ops = ['$in', '$nin', '$eq', '$ne'];
            const filter = getNamedFilter(name);
            const value = (0, lodash_1.get)(filter, (0, utils_1.getOp)(column), '');
            const multiple = ['$in', '$nin'].includes(op || '');
            V = ((0, jsx_runtime_1.jsx)(refAttr_1.default, { placeholder: placeholder || t('placeholder.select'), multiple: multiple, entityIds: value ? (multiple ? value : [value]) : [], pickerRender: Object.assign({}, column.refProps), onChange: (ids) => {
                    setFilterAndResetFilter(viewType, ids);
                } }));
            break;
        }
    }
    return ((0, jsx_runtime_1.jsx)(antd_1.Form.Item, { label: label, name: name, children: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: V }) }));
}
exports.default = Render;
function assertMessage(attr, attrType, op, ops) {
    return `attr为【${attr}】, 传入的算子【${op}】不支持，类型【${attrType}】只支持【${JSON.stringify(ops)}】`;
}
