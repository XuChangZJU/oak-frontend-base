"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const antd_1 = require("antd");
const icons_1 = require("@ant-design/icons");
const mobile_module_less_1 = tslib_1.__importDefault(require("./mobile.module.less"));
function Render(props) {
    const { methods, data } = props;
    const { t, makeItems } = methods;
    const { width, items, moreItems, i18n, } = data;
    const isMobile = width.includes('xs');
    const zhCNKeys = i18n?.store?.data?.zh_CN && Object.keys(i18n.store.data.zh_CN).length;
    (0, react_1.useEffect)(() => {
        makeItems(isMobile);
    }, [zhCNKeys]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: mobile_module_less_1.default.container, children: [items && items.map((ele, index) => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: mobile_module_less_1.default.btn, onClick: ele.onClick, children: (0, jsx_runtime_1.jsx)(antd_1.Typography.Link, { children: ele.label }) }), index !== items.length - 1 && ((0, jsx_runtime_1.jsx)(antd_1.Divider, { type: "vertical" }))] }))), moreItems && moreItems.length > 0 && ((0, jsx_runtime_1.jsx)(antd_1.Divider, { type: "vertical" })), moreItems && moreItems.length > 0 && ((0, jsx_runtime_1.jsx)(antd_1.Popover, { placement: 'topRight', content: (0, jsx_runtime_1.jsx)(antd_1.Space, { direction: "vertical", children: moreItems.map((ele) => ((0, jsx_runtime_1.jsx)(antd_1.Button, { size: "small", type: "link", onClick: ele.onClick, children: ele.label }))) }), trigger: "click", children: (0, jsx_runtime_1.jsx)(antd_1.Button, { type: "link", icon: ((0, jsx_runtime_1.jsx)(icons_1.MoreOutlined, {})) }) }))] }));
}
exports.default = Render;
