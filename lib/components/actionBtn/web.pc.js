"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var antd_1 = require("antd");
var web_module_less_1 = tslib_1.__importDefault(require("./web.module.less"));
var confirm = antd_1.Modal.confirm;
function ItemComponent(props) {
    var label = props.label, type = props.type, onClick = props.onClick;
    if (type === 'button') {
        return ((0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ onClick: function () { return onClick(); } }, { children: label })));
    }
    return (0, jsx_runtime_1.jsx)("a", tslib_1.__assign({ onClick: function (e) {
            onClick();
            e.stopPropagation();
            return false;
        } }, { children: label }));
}
function Render(props) {
    var _a, _b;
    var methods = props.methods, data = props.data;
    var t = methods.t, makeItems = methods.makeItems;
    var schema = data.schema, actions = data.actions, onAction = data.onAction, entity = data.entity, cascadeActions = data.cascadeActions, items = data.items, i18n = data.i18n;
    var zhCNKeys = ((_b = (_a = i18n === null || i18n === void 0 ? void 0 : i18n.store) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.zh_CN) && Object.keys(i18n.store.data.zh_CN).length;
    (0, react_1.useEffect)(function () {
        makeItems();
    }, [zhCNKeys]);
    return ((0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: web_module_less_1.default.panelContainer }, { children: (0, jsx_runtime_1.jsx)(antd_1.Space, tslib_1.__assign({ align: 'center', style: { width: '100%' } }, { children: (0, jsx_runtime_1.jsx)(antd_1.Space, tslib_1.__assign({ align: 'center' }, { children: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: items === null || items === void 0 ? void 0 : items.map(function (ele, index) {
                        return ((0, jsx_runtime_1.jsx)(ItemComponent, { label: ele.label, type: "a", onClick: ele.onClick }));
                    }) }) })) })) })));
}
exports.default = Render;
