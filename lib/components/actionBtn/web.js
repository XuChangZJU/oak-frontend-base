"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var mobile_module_less_1 = tslib_1.__importDefault(require("./mobile.module.less"));
function Render(props) {
    var _a, _b;
    var methods = props.methods, data = props.data;
    var t = methods.t, makeItems = methods.makeItems;
    var width = data.width, items = data.items, moreItems = data.moreItems, i18n = data.i18n;
    var isMobile = width.includes('xs');
    var zhCNKeys = ((_b = (_a = i18n === null || i18n === void 0 ? void 0 : i18n.store) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.zh_CN) && Object.keys(i18n.store.data.zh_CN).length;
    (0, react_1.useEffect)(function () {
        makeItems(isMobile);
    }, [zhCNKeys]);
    return ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: mobile_module_less_1.default.container }, { children: [items && items.map(function (ele, index) { return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.btn, onClick: ele.onClick }, { children: (0, jsx_runtime_1.jsx)(antd_1.Typography.Link, { children: ele.label }) })), index !== items.length - 1 && ((0, jsx_runtime_1.jsx)(antd_1.Divider, { type: "vertical" }))] })); }), moreItems && moreItems.length > 0 && ((0, jsx_runtime_1.jsx)(antd_1.Divider, { type: "vertical" })), moreItems && moreItems.length > 0 && ((0, jsx_runtime_1.jsx)(antd_1.Popover, tslib_1.__assign({ placement: 'topRight', content: (0, jsx_runtime_1.jsx)(antd_1.Space, tslib_1.__assign({ direction: "vertical" }, { children: moreItems.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ size: "small", type: "link", onClick: ele.onClick }, { children: ele.label }))); }) })), trigger: "click" }, { children: (0, jsx_runtime_1.jsx)(antd_1.Button, { type: 'link', icon: (0, jsx_runtime_1.jsx)(icons_1.MoreOutlined, {}) }) })))] })));
}
exports.default = Render;
