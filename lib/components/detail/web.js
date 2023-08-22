"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_mobile_1 = require("antd-mobile");
var mobile_module_less_1 = tslib_1.__importDefault(require("./mobile.module.less"));
var dayjs_1 = tslib_1.__importDefault(require("dayjs"));
function RenderRow(props) {
    var type = props.type, label = props.label, value = props.value;
    if (type === 'image') {
        if (value instanceof Array) {
            return ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: mobile_module_less_1.default.renderRow }, { children: [(0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.renderLabel }, { children: label })), (0, jsx_runtime_1.jsx)(antd_mobile_1.Space, tslib_1.__assign({ wrap: true }, { children: value.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Image, { width: 70, height: 70, src: ele, fit: "contain" })); }) }))] })));
        }
        else {
            return ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: mobile_module_less_1.default.renderRow }, { children: [(0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.renderLabel }, { children: label })), (0, jsx_runtime_1.jsx)(antd_mobile_1.Space, tslib_1.__assign({ wrap: true }, { children: (0, jsx_runtime_1.jsx)(antd_mobile_1.Image, { width: 70, height: 70, src: value, fit: "contain" }) }))] })));
        }
    }
    return ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: mobile_module_less_1.default.renderRow }, { children: [(0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.renderLabel }, { children: label })), (0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.renderValue }, { children: value ? String(value) : '--' }))] })));
}
function Render(props) {
    var methods = props.methods, oakData = props.data;
    var t = methods.t;
    var title = oakData.title, renderData = oakData.renderData, entity = oakData.entity;
    return ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: mobile_module_less_1.default.panel }, { children: [title && ((0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.title }, { children: title }))), (0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.panel_content }, { children: (0, jsx_runtime_1.jsx)(antd_mobile_1.Space, tslib_1.__assign({ direction: "vertical", style: { '--gap': '10px' } }, { children: renderData && renderData.map(function (ele) {
                        var renderValue = ele.value;
                        if (ele.type === 'enum') {
                            renderValue = ele.value && t("".concat(entity, ":v.").concat(ele.attr, ".").concat(ele.value));
                        }
                        if (ele.type === 'datetime') {
                            renderValue = ele.value && (0, dayjs_1.default)(ele.value).format('YYYY-MM-DD');
                        }
                        return ((0, jsx_runtime_1.jsx)(RenderRow, { label: ele.label, value: renderValue, type: ele.type }));
                    }) })) }))] })));
}
exports.default = Render;
