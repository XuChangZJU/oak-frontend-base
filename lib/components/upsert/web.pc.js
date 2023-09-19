"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const antd_1 = require("antd");
const icon_1 = tslib_1.__importDefault(require("../icon"));
const { TextArea } = antd_1.Input;
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const refAttr_1 = tslib_1.__importDefault(require("../refAttr"));
const location_1 = tslib_1.__importDefault(require("../map/location"));
const map_1 = tslib_1.__importDefault(require("../map/map"));
function makeAttrInput(attrRender, onValueChange, t, label) {
    const [sl, setSl] = (0, react_1.useState)(false);
    const [poi, setPoi] = (0, react_1.useState)(undefined);
    const { value, type, params, defaultValue, enumeration, required, placeholder, min, max, maxLength, } = attrRender;
    switch (type) {
        case 'string':
        case 'varchar':
        case 'char':
        case 'poiName': {
            return ((0, jsx_runtime_1.jsx)(antd_1.Input, { allowClear: !required, placeholder: placeholder || `请输入${label}`, value: value, defaultValue: defaultValue, maxLength: maxLength, onChange: ({ target: { value } }) => {
                    onValueChange(value);
                } }));
        }
        case 'text': {
            return ((0, jsx_runtime_1.jsx)(TextArea, { allowClear: !required, placeholder: `请输入${label}`, defaultValue: defaultValue, value: value, rows: 6, maxLength: maxLength || 1000, onChange: ({ target: { value } }) => {
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
            return ((0, jsx_runtime_1.jsx)(antd_1.InputNumber, { min: min, max: max, keyboard: true, defaultValue: defaultValue, value: value, precision: 0, onChange: (value) => onValueChange(value) }));
        }
        case 'decimal': {
            const precision = params?.precision || 10;
            const scale = params?.scale || 0;
            const scaleValue = Math.pow(10, 0 - scale);
            /*
            const threshold = Math.pow(10, precision - scale);
            const max = threshold - scaleValue;     // 小数在这里可能会有bug
            const min = 0 - max; */
            return ((0, jsx_runtime_1.jsx)(antd_1.InputNumber, { min: min, max: max, keyboard: true, defaultValue: defaultValue, value: value, precision: scale, step: scaleValue, onChange: (value) => onValueChange(value) }));
        }
        case 'money': {
            // money在数据上统一用分来存储
            const valueShowed = parseFloat((value / 100).toFixed(2));
            const defaultValueShowed = parseFloat((defaultValue / 100).toFixed(2));
            return ((0, jsx_runtime_1.jsx)(antd_1.InputNumber, { min: 0, keyboard: true, defaultValue: defaultValueShowed, value: valueShowed, precision: 2, step: 0.01, addonAfter: "\uFFE5", onChange: (value) => {
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
            return ((0, jsx_runtime_1.jsx)(antd_1.DatePicker, { allowClear: !required, showTime: type === 'datetime', placeholder: placeholder, format: "YYYY-MM-DD HH:mm:ss", mode: mode, value: (0, dayjs_1.default)(value), onChange: (value) => {
                    if (value) {
                        onValueChange(value.valueOf());
                    }
                    else {
                        onValueChange(null);
                    }
                } }));
        }
        case 'boolean': {
            return ((0, jsx_runtime_1.jsx)(antd_1.Switch, { checkedChildren: (0, jsx_runtime_1.jsx)(icon_1.default, { name: "right" }), unCheckedChildren: (0, jsx_runtime_1.jsx)(icon_1.default, { name: "close" }), checked: value, onChange: (checked) => {
                    onValueChange(checked);
                } }));
        }
        case 'enum': {
            return ((0, jsx_runtime_1.jsx)(antd_1.Radio.Group, { value: value, onChange: ({ target }) => onValueChange(target.value), children: enumeration.map(({ label, value }) => ((0, jsx_runtime_1.jsx)(antd_1.Radio, { value: value, children: t(label) }))) }));
        }
        case 'ref': {
            return ((0, jsx_runtime_1.jsx)(refAttr_1.default, { multiple: false, entityId: value, pickerRender: attrRender, onChange: (value) => {
                    onValueChange(value[0]);
                } }));
        }
        case 'coordinate': {
            const { coordinate } = value || {};
            const { extra } = attrRender;
            const poiNameAttr = extra?.poiName || 'poiName';
            const areaIdAttr = extra?.areaId || 'areaId';
            return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(antd_1.Modal, { width: "80vw", open: sl, closable: false, onCancel: () => setSl(false), okText: "\u786E\u8BA4", cancelText: "\u53D6\u6D88", okButtonProps: {
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
                        }, children: (0, jsx_runtime_1.jsx)(location_1.default, { coordinate: coordinate, onLocated: (poi) => setPoi(poi) }) }), (0, jsx_runtime_1.jsx)("div", { style: {
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                        }, children: (0, jsx_runtime_1.jsxs)(antd_1.Space, { direction: "vertical", size: 8, children: [(0, jsx_runtime_1.jsx)(antd_1.Space, { align: "center", children: (0, jsx_runtime_1.jsx)(antd_1.Button, { type: "dashed", onClick: () => {
                                            setSl(true);
                                        }, children: value ? '重选位置' : '选择位置' }) }), (0, jsx_runtime_1.jsx)("div", { style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        width: '100%',
                                    }, children: (0, jsx_runtime_1.jsx)(map_1.default, { undragable: true, disableWheelZoom: true, style: { height: 300 }, autoLocate: true, center: coordinate, markers: coordinate ? [coordinate] : undefined }) })] }) })] }));
        }
        default: {
            throw new Error(`【Abstract Update】无法支持的数据类别${type}的渲染`);
        }
    }
}
function render(props) {
    const { renderData = [], helps, entity } = props.data;
    const { update, t } = props.methods;
    return ((0, jsx_runtime_1.jsx)(antd_1.Form, { labelCol: { span: 4 }, layout: "horizontal", children: renderData.map((ele) => {
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
            return ((0, jsx_runtime_1.jsx)(antd_1.Form.Item, { label: label2, rules: [
                    {
                        required: !!required,
                    },
                ], help: helps && helps[attr], name: required ? attr : '', children: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: makeAttrInput(ele, (value, extra) => {
                        const { attr } = ele;
                        update({
                            [attr]: value,
                            ...extra,
                        });
                    }, t, label2) }) }));
        }) }));
}
exports.default = render;
