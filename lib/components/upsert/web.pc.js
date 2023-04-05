"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var antd_1 = require("antd");
var icon_1 = tslib_1.__importDefault(require("../icon"));
var TextArea = antd_1.Input.TextArea;
var dayjs_1 = tslib_1.__importDefault(require("dayjs"));
var refAttr_1 = tslib_1.__importDefault(require("../refAttr"));
var location_1 = tslib_1.__importDefault(require("../map/location"));
var map_1 = tslib_1.__importDefault(require("../map/map"));
function makeAttrInput(attrRender, onValueChange, t, label) {
    var _a = tslib_1.__read((0, react_1.useState)(false), 2), sl = _a[0], setSl = _a[1];
    var _b = tslib_1.__read((0, react_1.useState)(undefined), 2), poi = _b[0], setPoi = _b[1];
    var _c = attrRender, value = _c.value, type = _c.type, params = _c.params, defaultValue = _c.defaultValue, enumeration = _c.enumeration, required = _c.required, placeholder = _c.placeholder, min = _c.min, max = _c.max, maxLength = _c.maxLength;
    switch (type) {
        case 'string':
        case 'varchar':
        case 'char':
        case 'poiName': {
            return ((0, jsx_runtime_1.jsx)(antd_1.Input, { allowClear: !required, placeholder: placeholder || "\u8BF7\u8F93\u5165".concat(label), value: value, defaultValue: defaultValue, maxLength: maxLength, onChange: function (_a) {
                    var value = _a.target.value;
                    onValueChange(value);
                } }));
        }
        case 'text': {
            return ((0, jsx_runtime_1.jsx)(TextArea, { allowClear: !required, placeholder: "\u8BF7\u8F93\u5165".concat(label), defaultValue: defaultValue, value: value, rows: 6, maxLength: maxLength || 1000, onChange: function (_a) {
                    var value = _a.target.value;
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
            return ((0, jsx_runtime_1.jsx)(antd_1.InputNumber, { min: min, max: max, keyboard: true, defaultValue: defaultValue, value: value, precision: 0, onChange: function (value) { return onValueChange(value); } }));
        }
        case 'decimal': {
            var precision = (params === null || params === void 0 ? void 0 : params.precision) || 10;
            var scale = (params === null || params === void 0 ? void 0 : params.scale) || 0;
            var scaleValue = Math.pow(10, 0 - scale);
            /*
            const threshold = Math.pow(10, precision - scale);
            const max = threshold - scaleValue;     // 小数在这里可能会有bug
            const min = 0 - max; */
            return ((0, jsx_runtime_1.jsx)(antd_1.InputNumber, { min: min, max: max, keyboard: true, defaultValue: defaultValue, value: value, precision: scale, step: scaleValue, onChange: function (value) { return onValueChange(value); } }));
        }
        case 'money': {
            // money在数据上统一用分来存储
            var valueShowed = parseFloat((value / 100).toFixed(2));
            var defaultValueShowed = parseFloat((defaultValue / 100).toFixed(2));
            return ((0, jsx_runtime_1.jsx)(antd_1.InputNumber, { min: 0, keyboard: true, defaultValue: defaultValueShowed, value: valueShowed, precision: 2, step: 0.01, addonAfter: "\uFFE5", onChange: function (value) {
                    if (value !== null) {
                        var v2 = Math.round(value * 100);
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
            var mode = type === 'time' ? 'time' : 'date';
            return ((0, jsx_runtime_1.jsx)(antd_1.DatePicker, { allowClear: !required, showTime: type === 'datetime', placeholder: placeholder, format: "YYYY-MM-DD HH:mm:ss", mode: mode, value: (0, dayjs_1.default)(value), onChange: function (value) {
                    if (value) {
                        onValueChange(value.valueOf());
                    }
                    else {
                        onValueChange(null);
                    }
                } }));
        }
        case 'boolean': {
            return ((0, jsx_runtime_1.jsx)(antd_1.Switch, { checkedChildren: (0, jsx_runtime_1.jsx)(icon_1.default, { name: "right" }), unCheckedChildren: (0, jsx_runtime_1.jsx)(icon_1.default, { name: "close" }), checked: value, onChange: function (checked) {
                    onValueChange(checked);
                } }));
        }
        case 'enum': {
            return ((0, jsx_runtime_1.jsx)(antd_1.Radio.Group, tslib_1.__assign({ value: value, onChange: function (_a) {
                    var target = _a.target;
                    return onValueChange(target.value);
                } }, { children: enumeration.map(function (_a) {
                    var label = _a.label, value = _a.value;
                    return ((0, jsx_runtime_1.jsx)(antd_1.Radio, tslib_1.__assign({ value: value }, { children: t(label) })));
                }) })));
        }
        case 'ref': {
            return ((0, jsx_runtime_1.jsx)(refAttr_1.default, { multiple: false, entityId: value, pickerRender: attrRender, onChange: function (value) {
                    onValueChange(value);
                } }));
        }
        case 'coordinate': {
            var coordinate = (value || {}).coordinate;
            var extra = attrRender.extra;
            var poiNameAttr_1 = (extra === null || extra === void 0 ? void 0 : extra.poiName) || 'poiName';
            var areaIdAttr_1 = (extra === null || extra === void 0 ? void 0 : extra.areaId) || 'areaId';
            return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(antd_1.Modal, tslib_1.__assign({ width: "80vw", open: sl, closable: false, onCancel: function () { return setSl(false); }, okText: "\u786E\u8BA4", cancelText: "\u53D6\u6D88", okButtonProps: {
                            disabled: !poi,
                        }, onOk: function () {
                            var _a;
                            if (poi) {
                                var poiName = poi.poiName, coordinate_1 = poi.coordinate, areaId = poi.areaId;
                                onValueChange({
                                    type: 'point',
                                    coordinate: coordinate_1,
                                }, (_a = {},
                                    _a[poiNameAttr_1] = poiName,
                                    _a[areaIdAttr_1] = areaId,
                                    _a));
                            }
                            setSl(false);
                        } }, { children: (0, jsx_runtime_1.jsx)(location_1.default, { coordinate: coordinate, onLocated: function (poi) { return setPoi(poi); } }) })), (0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ style: {
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                        } }, { children: (0, jsx_runtime_1.jsxs)(antd_1.Space, tslib_1.__assign({ direction: "vertical", size: 8 }, { children: [(0, jsx_runtime_1.jsx)(antd_1.Space, tslib_1.__assign({ align: "center" }, { children: (0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ type: "dashed", onClick: function () {
                                            setSl(true);
                                        } }, { children: value ? '重选位置' : '选择位置' })) })), (0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        width: '100%',
                                    } }, { children: (0, jsx_runtime_1.jsx)(map_1.default, { undragable: true, disableWheelZoom: true, style: { height: 300 }, autoLocate: true, center: coordinate, markers: coordinate ? [coordinate] : undefined }) }))] })) }))] }));
        }
        default: {
            throw new Error("\u3010Abstract Update\u3011\u65E0\u6CD5\u652F\u6301\u7684\u6570\u636E\u7C7B\u522B".concat(type, "\u7684\u6E32\u67D3"));
        }
    }
}
function render(props) {
    var _a = props.data, _b = _a.renderData, renderData = _b === void 0 ? [] : _b, helps = _a.helps, entity = _a.entity;
    var _c = props.methods, update = _c.update, t = _c.t;
    console.log(renderData);
    return ((0, jsx_runtime_1.jsx)(antd_1.Form, tslib_1.__assign({ labelCol: { span: 4 }, layout: "horizontal", style: {
            margin: '0px auto',
            maxWidth: '100%',
        } }, { children: renderData.map(function (ele) {
            // 因为i18n渲染机制的缘故，t必须放到这里来计算
            var label = ele.label, attr = ele.attr, type = ele.type, required = ele.required;
            var label2 = label;
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
            return ((0, jsx_runtime_1.jsx)(antd_1.Form.Item, tslib_1.__assign({ label: label2, rules: [
                    {
                        required: !!required,
                    },
                ], help: helps && helps[attr], name: required ? attr : '' }, { children: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: makeAttrInput(ele, function (value, extra) {
                        var _a;
                        var attr = ele.attr;
                        update(tslib_1.__assign((_a = {}, _a[attr] = value, _a), extra));
                    }, t, label2) }) })));
        }) })));
}
exports.default = render;
