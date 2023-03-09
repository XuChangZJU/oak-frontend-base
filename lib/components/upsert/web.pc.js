"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var TextArea = antd_1.Input.TextArea;
var dayjs_1 = tslib_1.__importDefault(require("dayjs"));
function makeAttrInput(attrRender, onValueChange) {
    var value = attrRender.value, type = attrRender.type, params = attrRender.params, ref = attrRender.ref, label = attrRender.label, defaultValue = attrRender.defaultValue, notNull = attrRender.notNull;
    switch (type) {
        case 'string': {
            return ((0, jsx_runtime_1.jsx)(antd_1.Input, { allowClear: !notNull, placeholder: "\u8BF7\u8F93\u5165".concat(label), value: value, defaultValue: defaultValue, maxLength: params && params.length, onChange: function (_a) {
                    var value = _a.target.value;
                    onValueChange(value);
                } }));
        }
        case 'text': {
            return ((0, jsx_runtime_1.jsx)(TextArea, { allowClear: !notNull, placeholder: "\u8BF7\u8F93\u5165".concat(label), defaultValue: defaultValue, value: value, rows: 6, maxLength: params && params.length || 1000, onChange: function (_a) {
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
            return ((0, jsx_runtime_1.jsx)(antd_1.DatePicker, { allowClear: !notNull, showTime: type === 'datetime', placeholder: "\u8BF7\u9009\u62E9".concat(label), format: "YYYY-MM-DD HH:mm:ss", mode: mode, value: (0, dayjs_1.default)(value), onChange: function (value) {
                    if (value) {
                        onValueChange(value.valueOf());
                    }
                    else {
                        onValueChange(null);
                    }
                } }));
        }
        case 'boolean': {
        }
    }
}
function render(props) {
    var renderData = props.data.renderData;
    return ((0, jsx_runtime_1.jsx)(antd_1.Form, tslib_1.__assign({ labelCol: { span: 4 }, layout: "horizontal", style: {
            margin: '0px auto',
            maxWidth: 675,
        } }, { children: renderData.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_1.Form.Item, { label: ele.label, rules: [
                {
                    required: ele.required,
                },
            ] })); }) })));
}
exports.default = render;
