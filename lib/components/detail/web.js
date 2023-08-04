"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_mobile_1 = require("antd-mobile");
var mobile_module_less_1 = tslib_1.__importDefault(require("./mobile.module.less"));
var DEFAULT_COLUMN_MAP = {
    xxl: 4,
    xl: 4,
    lg: 4,
    md: 3,
    sm: 2,
    xs: 1,
};
// function getColumn(column: ColSpanType | ColumnMapType, width: Width) {
//     if (typeof column === 'number') {
//         return column;
//     }
//     if (typeof column === 'object') {
//         if (column[width] !== undefined) {
//             return column[width] || DEFAULT_COLUMN_MAP[width];
//         }
//     }
//     return 3;
// }
function RenderRow(props) {
    var type = props.type, label = props.label, value = props.value;
    if (type === 'img') {
        if (value instanceof Array) {
            return ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: mobile_module_less_1.default.renderRow }, { children: [(0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.renderLabel }, { children: label })), (0, jsx_runtime_1.jsx)(antd_mobile_1.Space, tslib_1.__assign({ wrap: true }, { children: value.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Image, { width: 70, height: 70, src: ele, fit: "contain" })); }) }))] })));
        }
        else {
            return ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: mobile_module_less_1.default.renderRow }, { children: [(0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.renderLabel }, { children: label })), (0, jsx_runtime_1.jsx)(antd_mobile_1.Space, tslib_1.__assign({ wrap: true }, { children: (0, jsx_runtime_1.jsx)(antd_mobile_1.Image, { width: 70, height: 70, src: value, fit: "contain" }) }))] })));
        }
    }
    return ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: mobile_module_less_1.default.renderRow }, { children: [(0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.renderLabel }, { children: label })), (0, jsx_runtime_1.jsx)(antd_mobile_1.Ellipsis, { direction: 'end', content: value })] })));
}
function Render(props) {
    var methods = props.methods, oakData = props.data;
    var t = methods.t;
    var title = oakData.title, renderData = oakData.renderData;
    return ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: mobile_module_less_1.default.panel }, { children: [title && ((0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.title }, { children: title }))), (0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.panel_content }, { children: renderData && renderData.map(function (ele) { return ((0, jsx_runtime_1.jsx)(RenderRow, { label: ele.label, value: ele.value, type: ele.type })); }) }))] })));
}
exports.default = Render;
