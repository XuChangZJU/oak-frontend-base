import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Form, Input, InputNumber, Radio, Modal, Button, DatePicker, Space, Switch, } from 'antd';
import OakIcon from '../icon';
const { TextArea } = Input;
import dayjs from 'dayjs';
import RefAttr from '../refAttr';
import Location from '../map/location';
import Map from '../map/map';
function makeAttrInput(attrRender, onValueChange, t, label) {
    const [sl, setSl] = useState(false);
    const [poi, setPoi] = useState(undefined);
    const { value, type, params, defaultValue, enumeration, required, placeholder, min, max, maxLength, } = attrRender;
    switch (type) {
        case 'string':
        case 'varchar':
        case 'char':
        case 'poiName': {
            return (_jsx(Input, { allowClear: !required, placeholder: placeholder || `请输入${label}`, value: value, defaultValue: defaultValue, maxLength: maxLength, onChange: ({ target: { value } }) => {
                    onValueChange(value);
                } }));
        }
        case 'text': {
            return (_jsx(TextArea, { allowClear: !required, placeholder: `请输入${label}`, defaultValue: defaultValue, value: value, rows: 6, maxLength: maxLength || 1000, onChange: ({ target: { value } }) => {
                    onValueChange(value);
                } }));
        }
        case 'int': {
            /* const SIGNED_THRESHOLDS = {
                1: [-128, 127],
                2: [-32768, 32767],
                4: [-2147483648, 2147483647],
                8: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
            };
            const UNSIGNED_THRESHOLDS = {
                1: [0, 255],
                2: [0, 65535],
                4: [0, 4294967295],
                8: [0, Number.MAX_SAFE_INTEGER],
            }; */
            return (_jsx(InputNumber, { min: min, max: max, keyboard: true, defaultValue: defaultValue, value: value, precision: 0, onChange: (value) => onValueChange(value) }));
        }
        case 'decimal': {
            const precision = params?.precision || 10;
            const scale = params?.scale || 0;
            const scaleValue = Math.pow(10, 0 - scale);
            /*
            const threshold = Math.pow(10, precision - scale);
            const max = threshold - scaleValue;     // 小数在这里可能会有bug
            const min = 0 - max; */
            return (_jsx(InputNumber, { min: min, max: max, keyboard: true, defaultValue: defaultValue, value: value, precision: scale, step: scaleValue, onChange: (value) => onValueChange(value) }));
        }
        case 'money': {
            // money在数据上统一用分来存储
            const valueShowed = parseFloat((value / 100).toFixed(2));
            const defaultValueShowed = parseFloat((defaultValue / 100).toFixed(2));
            return (_jsx(InputNumber, { min: 0, keyboard: true, defaultValue: defaultValueShowed, value: valueShowed, precision: 2, step: 0.01, addonAfter: "\uFFE5", onChange: (value) => {
                    if (value !== null) {
                        const v2 = Math.round(value * 100);
                        onValueChange(v2);
                    }
                    else {
                        onValueChange(value);
                    }
                } }));
        }
        case 'datetime':
        case 'date':
        case 'time': {
            const mode = type === 'time' ? 'time' : 'date';
            return (_jsx(DatePicker, { allowClear: !required, showTime: type === 'datetime', placeholder: placeholder, format: "YYYY-MM-DD HH:mm:ss", mode: mode, value: dayjs(value), onChange: (value) => {
                    if (value) {
                        onValueChange(value.valueOf());
                    }
                    else {
                        onValueChange(null);
                    }
                } }));
        }
        case 'boolean': {
            return (_jsx(Switch, { checkedChildren: _jsx(OakIcon, { name: "right" }), unCheckedChildren: _jsx(OakIcon, { name: "close" }), checked: value, onChange: (checked) => {
                    onValueChange(checked);
                } }));
        }
        case 'enum': {
            return (_jsx(Radio.Group, { value: value, onChange: ({ target }) => onValueChange(target.value), children: enumeration.map(({ label, value }) => (_jsx(Radio, { value: value, children: t(label) }))) }));
        }
        case 'ref': {
            return (_jsx(RefAttr, { multiple: false, entityId: value, pickerRender: attrRender, onChange: (value) => {
                    onValueChange(value[0]);
                } }));
        }
        case 'coordinate': {
            const { coordinate } = value || {};
            const { extra } = attrRender;
            const poiNameAttr = extra?.poiName || 'poiName';
            const areaIdAttr = extra?.areaId || 'areaId';
            return (_jsxs(_Fragment, { children: [_jsx(Modal, { width: "80vw", open: sl, closable: false, onCancel: () => setSl(false), okText: "\u786E\u8BA4", cancelText: "\u53D6\u6D88", okButtonProps: {
                            disabled: !poi,
                        }, onOk: () => {
                            if (poi) {
                                const { poiName, coordinate, areaId } = poi;
                                onValueChange({
                                    type: 'point',
                                    coordinate,
                                }, {
                                    [poiNameAttr]: poiName,
                                    [areaIdAttr]: areaId,
                                });
                            }
                            setSl(false);
                        }, children: _jsx(Location, { coordinate: coordinate, onLocated: (poi) => setPoi(poi) }) }), _jsx("div", { style: {
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                        }, children: _jsxs(Space, { direction: "vertical", size: 8, children: [_jsx(Space, { align: "center", children: _jsx(Button, { type: "dashed", onClick: () => {
                                            setSl(true);
                                        }, children: value ? '重选位置' : '选择位置' }) }), _jsx("div", { style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        width: '100%',
                                    }, children: _jsx(Map, { undragable: true, disableWheelZoom: true, style: { height: 300 }, autoLocate: true, center: coordinate, markers: coordinate ? [coordinate] : undefined }) })] }) })] }));
        }
        default: {
            throw new Error(`【Abstract Update】无法支持的数据类别${type}的渲染`);
        }
    }
}
export default function render(props) {
    const { renderData = [], helps, entity } = props.data;
    const { update, t } = props.methods;
    return (_jsx(Form, { labelCol: { span: 4 }, layout: "horizontal", children: renderData.map((ele) => {
            // 因为i18n渲染机制的缘故，t必须放到这里来计算
            const { label, attr, type, required } = ele;
            let label2 = label;
            // if (!label2) {
            //     if (type === 'ref') {
            //         const { entity: refEntity } =
            //             ele as OakAbsRefAttrPickerRender<ED, keyof ED>;
            //         if (attr === 'entityId') {
            //             // 反指
            //             label2 = t(`${refEntity}:name`);
            //         } else {
            //             label2 = t(`${entity}:attr.${attr}`);
            //         }
            //     } else {
            //         label2 = t(`${entity}:attr.${attr}`);
            //     }
            // }
            return (_jsx(Form.Item, { label: label2, rules: [
                    {
                        required: !!required,
                    },
                ], help: helps && helps[attr], name: required ? attr : '', children: _jsx(_Fragment, { children: makeAttrInput(ele, (value, extra) => {
                        const { attr } = ele;
                        update({
                            [attr]: value,
                            ...extra,
                        });
                    }, t, label2) }) }));
        }) }));
}
