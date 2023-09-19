"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_mobile_1 = require("antd-mobile");
const mobile_module_less_1 = tslib_1.__importDefault(require("./mobile.module.less"));
// type Width = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
const usefulFn_1 = require("../../utils/usefulFn");
function RenderRow(props) {
    const { type, label, value } = props;
    if (type === 'image') {
        if (value instanceof Array) {
            return ((0, jsx_runtime_1.jsxs)("div", { className: mobile_module_less_1.default.renderRow, children: [(0, jsx_runtime_1.jsx)("div", { className: mobile_module_less_1.default.renderLabel, children: label }), (0, jsx_runtime_1.jsx)(antd_mobile_1.Space, { wrap: true, children: value.map((ele) => ((0, jsx_runtime_1.jsx)(antd_mobile_1.Image, { width: 70, height: 70, src: ele, fit: "contain" }))) })] }));
        }
        else {
            return ((0, jsx_runtime_1.jsxs)("div", { className: mobile_module_less_1.default.renderRow, children: [(0, jsx_runtime_1.jsx)("div", { className: mobile_module_less_1.default.renderLabel, children: label }), (0, jsx_runtime_1.jsx)(antd_mobile_1.Space, { wrap: true, children: (0, jsx_runtime_1.jsx)(antd_mobile_1.Image, { width: 70, height: 70, src: value, fit: "contain" }) })] }));
        }
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: mobile_module_less_1.default.renderRow, children: [(0, jsx_runtime_1.jsx)("div", { className: mobile_module_less_1.default.renderLabel, children: label }), (0, jsx_runtime_1.jsx)("div", { className: mobile_module_less_1.default.renderValue, children: value ? String(value) : '--' })] }));
}
function Render(props) {
    const { methods, data: oakData } = props;
    const { t } = methods;
    const { title, renderData, entity, judgeAttributes, data, } = oakData;
    return ((0, jsx_runtime_1.jsxs)("div", { className: mobile_module_less_1.default.panel, children: [title && ((0, jsx_runtime_1.jsx)("div", { className: mobile_module_less_1.default.title, children: title })), (0, jsx_runtime_1.jsx)("div", { className: mobile_module_less_1.default.panel_content, children: (0, jsx_runtime_1.jsx)(antd_mobile_1.Space, { direction: "vertical", style: { '--gap': '10px' }, children: judgeAttributes && judgeAttributes.map((ele) => {
                        let renderValue = (0, usefulFn_1.getValue)(data, ele.path, ele.entity, ele.attr, ele.attrType, t);
                        let renderLabel = (0, usefulFn_1.getLabel)(ele.attribute, ele.entity, ele.attr, t);
                        const renderType = (0, usefulFn_1.getType)(ele.attribute, ele.attrType);
                        if ([null, '', undefined].includes(renderValue)) {
                            renderValue = t('not_filled_in');
                        }
                        return ((0, jsx_runtime_1.jsx)(RenderRow, { label: renderLabel, value: renderValue, type: renderType }));
                    }) }) })] }));
}
exports.default = Render;
