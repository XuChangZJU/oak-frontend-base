"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const antd_1 = require("antd");
const web_module_less_1 = tslib_1.__importDefault(require("./web.module.less"));
const { confirm } = antd_1.Modal;
function ItemComponent(props) {
    const { label, type, onClick } = props;
    if (type === 'button') {
        return ((0, jsx_runtime_1.jsx)(antd_1.Button, { onClick: () => onClick(), children: label }));
    }
    return (0, jsx_runtime_1.jsx)("a", { onClick: (e) => {
            onClick();
            e.stopPropagation();
            return false;
        }, children: label });
}
function Render(props) {
    const { methods, data } = props;
    const { t, makeItems } = methods;
    const { schema, actions, onAction, entity, cascadeActions, items, i18n, extraActions, } = data;
    const zhCNKeys = i18n?.store?.data?.zh_CN && Object.keys(i18n.store.data.zh_CN).length;
    (0, react_1.useEffect)(() => {
        makeItems();
    }, [zhCNKeys, actions, cascadeActions, extraActions]);
    return ((0, jsx_runtime_1.jsx)("div", { className: web_module_less_1.default.panelContainer, children: (0, jsx_runtime_1.jsx)(antd_1.Space, { align: 'center', style: { width: '100%' }, children: (0, jsx_runtime_1.jsx)(antd_1.Space, { align: 'center', size: 12, children: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: items?.map((ele, index) => {
                        return ((0, jsx_runtime_1.jsx)(ItemComponent, { label: ele.label, type: "a", onClick: ele.onClick }));
                    }) }) }) }) }));
}
exports.default = Render;
