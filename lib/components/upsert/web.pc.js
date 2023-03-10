"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var TextArea = antd_1.Input.TextArea;
var dayjs_1 = tslib_1.__importDefault(require("dayjs"));
function makeAttrInput(attrRender, onValueChange) {
    var _a = attrRender, value = _a.value, type = _a.type, params = _a.params, label = _a.label, defaultValue = _a.defaultValue, required = _a.required;
    switch (type) {
        case 'string':
        case 'varchar':
        case 'char': {
            return ((0, jsx_runtime_1.jsx)(antd_1.Input, { allowClear: !required, placeholder: "\u8BF7\u8F93\u5165".concat(label), value: value, defaultValue: defaultValue, maxLength: params && params.length, onChange: function (_a) {
                    var value = _a.target.value;
                    onValueChange(value);
                } }));
        }
        case 'text': {
            return ((0, jsx_runtime_1.jsx)(TextArea, { allowClear: !required, placeholder: "\u8BF7\u8F93\u5165".concat(label), defaultValue: defaultValue, value: value, rows: 6, maxLength: params && params.length || 1000, onChange: function (_a) {
                    var value = _a.target.value;
                    onValueChange(value);
                } }));
        }
        case 'int': {
            var SIGNED_THRESHOLDS = {
                1: [-128, 127],
                2: [-32768, 32767],
                4: [-2147483648, 2147483647],
                8: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
            };
            var UNSIGNED_THRESHOLDS = {
                1: [0, 255],
                2: [0, 65535],
                4: [0, 4294967295],
                8: [0, Number.MAX_SAFE_INTEGER],
            };
            var width = ((params === null || params === void 0 ? void 0 : params.width) || 4);
            var min = (params === null || params === void 0 ? void 0 : params.min) !== undefined ? params.min : ((params === null || params === void 0 ? void 0 : params.signed) ? SIGNED_THRESHOLDS[width][0] : UNSIGNED_THRESHOLDS[width][0]);
            var max = (params === null || params === void 0 ? void 0 : params.max) !== undefined ? params.max : ((params === null || params === void 0 ? void 0 : params.signed) ? SIGNED_THRESHOLDS[width][1] : UNSIGNED_THRESHOLDS[width][1]);
            return ((0, jsx_runtime_1.jsx)(antd_1.InputNumber, { min: min, max: max, keyboard: true, defaultValue: defaultValue, value: value, precision: 0, onChange: function (value) { return onValueChange(value); } }));
        }
        case 'decimal': {
            var precision = (params === null || params === void 0 ? void 0 : params.precision) || 10;
            var scale = (params === null || params === void 0 ? void 0 : params.scale) || 0;
            var threshold = Math.pow(10, precision - scale);
            var scaleValue = Math.pow(10, 0 - scale);
            var max = threshold - scaleValue; // 小数在这里可能会有bug
            var min = 0 - max;
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
            return ((0, jsx_runtime_1.jsx)(antd_1.DatePicker, { allowClear: !required, showTime: type === 'datetime', placeholder: "\u8BF7\u9009\u62E9".concat(label), format: "YYYY-MM-DD HH:mm:ss", mode: mode, value: (0, dayjs_1.default)(value), onChange: function (value) {
                    if (value) {
                        onValueChange(value.valueOf());
                    }
                    else {
                        onValueChange(null);
                    }
                } }));
        }
        case 'boolean': {
            return ((0, jsx_runtime_1.jsx)(antd_1.Switch, { checkedChildren: (0, jsx_runtime_1.jsx)(icons_1.CheckOutlined, {}), unCheckedChildren: (0, jsx_runtime_1.jsx)(icons_1.CloseOutlined, {}), checked: value, onChange: function (checked) {
                    onValueChange(checked);
                } }));
        }
        case 'enum': {
            var enumeration = attrRender.enumeration;
            ;
            return ((0, jsx_runtime_1.jsx)(antd_1.Radio.Group, tslib_1.__assign({ value: value, onChange: function (_a) {
                    var target = _a.target;
                    return onValueChange(target.value);
                } }, { children: enumeration.map(function (_a) {
                    var label = _a.label, value = _a.value;
                    return ((0, jsx_runtime_1.jsx)(antd_1.Radio, tslib_1.__assign({ value: value }, { children: label })));
                }) })));
        }
        case 'ref': {
            var mode = attrRender.mode;
        }
        default: {
            throw new Error("\u3010Abstract Update\u3011\u65E0\u6CD5\u652F\u6301\u7684\u6570\u636E\u7C7B\u522B".concat(type, "\u7684\u6E32\u67D3"));
        }
    }
}
function render(props) {
    var _a = props.data, _b = _a.renderData, renderData = _b === void 0 ? [] : _b, children = _a.children;
    var update = props.methods.update;
    return ((0, jsx_runtime_1.jsxs)(antd_1.Form, tslib_1.__assign({ labelCol: { span: 4 }, layout: "horizontal", style: {
            margin: '0px auto',
            maxWidth: 675,
        } }, { children: [renderData.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_1.Form.Item, tslib_1.__assign({ label: ele.label, rules: [
                    {
                        required: ele.required,
                    },
                ] }, { children: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: makeAttrInput(ele, function (value) {
                        var _a;
                        var attr = ele.attr;
                        update((_a = {},
                            _a[attr] = value,
                            _a));
                    }) }) }))); }), children] })));
}
exports.default = render;