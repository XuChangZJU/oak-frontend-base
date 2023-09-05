import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { Input, Form, Select, DatePicker, } from 'antd';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
dayjs.extend(weekday);
dayjs.extend(localeData);
import { get } from 'oak-domain/lib/utils/lodash';
import { getFilterName, getOp } from './utils';
import RefAttr from '../refAttr';
export default function Render(props) {
    const { entity, column, oakFullpath, viewType, options, attrI18n, entityI18n, isCommonI18n, } = props.data;
    const { t, getNamedFilter, setFilterAndResetFilter, } = props.methods;
    const name = getFilterName(column);
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
        return (_jsx(Form.Item, { label: label, name: name, children: _jsx(_Fragment, { children: column.render }) }));
    }
    switch (viewType) {
        case 'Input': {
            V = (_jsx(Input, { placeholder: placeholder || t('placeholder.input'), onChange: (e) => {
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
            V = (_jsx(Select, { mode: multiple ? 'multiple' : undefined, allowClear: true, placeholder: placeholder || t('placeholder.select'), onChange: (value) => {
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
            V = (_jsx(DatePicker, { placeholder: placeholder || t('placeholder.select'), style: { width: '100%' }, format: "YYYY-MM-DD", showTime: showTime, onChange: (date, dateString) => {
                    setFilterAndResetFilter(viewType, date);
                } }));
            break;
        }
        case 'DatePicker.RangePicker': {
            const { dateProps } = column;
            const { showTime = false } = dateProps || {};
            V = (_jsx(DatePicker.RangePicker
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
            const value = get(filter, getOp(column), '');
            const multiple = ['$in', '$nin'].includes(op || '');
            V = (_jsx(RefAttr, { placeholder: placeholder || t('placeholder.select'), multiple: multiple, entityIds: value ? (multiple ? value : [value]) : [], pickerRender: Object.assign({}, column.refProps), onChange: (ids) => {
                    setFilterAndResetFilter(viewType, ids);
                } }));
            break;
        }
    }
    return (_jsx(Form.Item, { label: label, name: name, children: _jsx(_Fragment, { children: V }) }));
}
function assertMessage(attr, attrType, op, ops) {
    return `attr为【${attr}】, 传入的算子【${op}】不支持，类型【${attrType}】只支持【${JSON.stringify(ops)}】`;
}
