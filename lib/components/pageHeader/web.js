"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
const icons_1 = require("@ant-design/icons");
const classnames_1 = tslib_1.__importDefault(require("classnames"));
require("./index.less");
function Render(props) {
    const { style, className, children, title, subTitle, extra, showBack = false, onBack, backIcon, delta, contentMargin = true, contentStyle, contentClassName, tags, showHeader = true, } = props.data;
    const { t, goBack } = props.methods;
    const prefixCls = 'oak';
    return ((0, jsx_runtime_1.jsxs)("div", { style: style, className: (0, classnames_1.default)(`${prefixCls}-pageHeader`, className), children: [showHeader && (title || showBack || subTitle || tags || extra) && ((0, jsx_runtime_1.jsx)("div", { className: `${prefixCls}-pageHeader-header`, children: (0, jsx_runtime_1.jsxs)(antd_1.Row, { justify: "center", children: [(0, jsx_runtime_1.jsxs)(antd_1.Col, { flex: "auto", className: `${prefixCls}-pageHeader-header-col`, children: [showBack && ((0, jsx_runtime_1.jsx)(antd_1.Button, { type: "text", className: `${prefixCls}-pageHeader-header-back`, onClick: () => {
                                        if (typeof onBack === 'function') {
                                            onBack();
                                            return;
                                        }
                                        goBack(delta);
                                    }, children: backIcon || ((0, jsx_runtime_1.jsx)(icons_1.ArrowLeftOutlined, { className: `${prefixCls}-pageHeader-header-backIcon` })) })), title && ((0, jsx_runtime_1.jsx)("span", { className: `${prefixCls}-pageHeader-header-title`, children: title })), subTitle && ((0, jsx_runtime_1.jsx)("span", { className: `${prefixCls}-pageHeader-header-subTitle`, children: subTitle })), tags] }), (0, jsx_runtime_1.jsx)(antd_1.Col, { flex: "auto", children: extra })] }) })), (0, jsx_runtime_1.jsx)("div", { style: contentStyle, className: (0, classnames_1.default)(`${prefixCls}-pageHeader-content`, contentClassName, {
                    [`${prefixCls}-pageHeader-content-margin`]: contentMargin,
                }), children: children })] }));
}
exports.default = Render;
