"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
// @ts-ignore
var react_router_dom_1 = require("react-router-dom");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var classnames_1 = tslib_1.__importDefault(require("classnames"));
require("./index.less");
exports.default = (0, react_1.memo)(function (props) {
    var _a;
    var style = props.style, className = props.className, children = props.children, title = props.title, subTitle = props.subTitle, extra = props.extra, _b = props.showBack, showBack = _b === void 0 ? false : _b, onBack = props.onBack, backIcon = props.backIcon, delta = props.delta, _c = props.contentMargin, contentMargin = _c === void 0 ? true : _c, contentStyle = props.contentStyle, contentClassName = props.contentClassName, tags = props.tags, _d = props.showHeader, showHeader = _d === void 0 ? true : _d;
    var prefixCls = 'oak';
    var navigate = (0, react_router_dom_1.useNavigate)();
    return ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ style: style, className: (0, classnames_1.default)("".concat(prefixCls, "-pageHeader"), className) }, { children: [showHeader && (title || showBack || subTitle || tags || extra) && ((0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: "".concat(prefixCls, "-pageHeader-header") }, { children: (0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ justify: "center" }, { children: [(0, jsx_runtime_1.jsxs)(antd_1.Col, tslib_1.__assign({ flex: "auto", className: "".concat(prefixCls, "-pageHeader-header-col") }, { children: [showBack && ((0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ type: "text", className: "".concat(prefixCls, "-pageHeader-header-back"), onClick: function () {
                                        if (typeof onBack === 'function') {
                                            onBack();
                                            return;
                                        }
                                        navigate(delta || -1);
                                    } }, { children: backIcon || ((0, jsx_runtime_1.jsx)(icons_1.ArrowLeftOutlined, { className: "".concat(prefixCls, "-pageHeader-header-backIcon") })) }))), title && ((0, jsx_runtime_1.jsx)("span", tslib_1.__assign({ className: "".concat(prefixCls, "-pageHeader-header-title") }, { children: title }))), subTitle && ((0, jsx_runtime_1.jsx)("span", tslib_1.__assign({ className: "".concat(prefixCls, "-pageHeader-header-subTitle") }, { children: subTitle }))), tags] })), (0, jsx_runtime_1.jsx)(antd_1.Col, tslib_1.__assign({ flex: "auto" }, { children: extra }))] })) }))), (0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ style: contentStyle, className: (0, classnames_1.default)("".concat(prefixCls, "-pageHeader-content"), contentClassName, (_a = {},
                    _a["".concat(prefixCls, "-pageHeader-content-margin")] = contentMargin,
                    _a)) }, { children: children }))] })));
});
