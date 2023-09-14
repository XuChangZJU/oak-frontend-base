"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_mobile_1 = require("antd-mobile");
var mobile_module_less_1 = tslib_1.__importDefault(require("./mobile.module.less"));
// type Width = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
var usefulFn_1 = require("../../utils/usefulFn");
function RenderRow(props) {
    var type = props.type, label = props.label, value = props.value;
    if (type === 'image') {
        if (value instanceof Array) {
            return ((0, jsx_runtime_1.jsxs)("div", { className: mobile_module_less_1.default.renderRow, children: [(0, jsx_runtime_1.jsx)("div", { className: mobile_module_less_1.default.renderLabel, children: label }), (0, jsx_runtime_1.jsx)(antd_mobile_1.Space, { wrap: true, children: value.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_mobile_1.Image, { width: 70, height: 70, src: ele, fit: "contain" })); }) })] }));
        }
        else {
            return ((0, jsx_runtime_1.jsxs)("div", { className: mobile_module_less_1.default.renderRow, children: [(0, jsx_runtime_1.jsx)("div", { className: mobile_module_less_1.default.renderLabel, children: label }), (0, jsx_runtime_1.jsx)(antd_mobile_1.Space, { wrap: true, children: (0, jsx_runtime_1.jsx)(antd_mobile_1.Image, { width: 70, height: 70, src: value, fit: "contain" }) })] }));
        }
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: mobile_module_less_1.default.renderRow, children: [(0, jsx_runtime_1.jsx)("div", { className: mobile_module_less_1.default.renderLabel, children: label }), (0, jsx_runtime_1.jsx)("div", { className: mobile_module_less_1.default.renderValue, children: value ? String(value) : '--' })] }));
}
function Render(props) {
    var methods = props.methods, oakData = props.data;
    var t = methods.t;
    var title = oakData.title, renderData = oakData.renderData, entity = oakData.entity, judgeAttributes = oakData.judgeAttributes, data = oakData.data;
    return ((0, jsx_runtime_1.jsxs)("div", { className: mobile_module_less_1.default.panel, children: [title && ((0, jsx_runtime_1.jsx)("div", { className: mobile_module_less_1.default.title, children: title })), (0, jsx_runtime_1.jsx)("div", { className: mobile_module_less_1.default.panel_content, children: (0, jsx_runtime_1.jsx)(antd_mobile_1.Space, { direction: "vertical", style: { '--gap': '10px' }, children: judgeAttributes && judgeAttributes.map(function (ele) {
                        var renderValue = (0, usefulFn_1.getValue)(data, ele.path, ele.entity, ele.attr, ele.attrType, t);
                        var renderLabel = (0, usefulFn_1.getLabel)(ele.attribute, ele.entity, ele.attr, t);
                        var renderType = (0, usefulFn_1.getType)(ele.attribute, ele.attrType);
                        if ([null, '', undefined].includes(renderValue)) {
                            renderValue = t('not_filled_in');
                        }
                        return ((0, jsx_runtime_1.jsx)(RenderRow, { label: renderLabel, value: renderValue, type: renderType }));
                    }) }) })] }));
}
exports.default = Render;
