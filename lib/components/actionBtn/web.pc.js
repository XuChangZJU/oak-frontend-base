"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var web_module_less_1 = tslib_1.__importDefault(require("./web.module.less"));
var usefulFn_1 = require("../../utils/usefulFn");
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
function getLabel(actionItem, entity, t) {
    if (typeof actionItem !== 'string') {
        return actionItem.label;
    }
    else {
        if (['update', 'create', 'detail'].includes(actionItem)) {
            return t("common:action.".concat(actionItem));
        }
        else {
            return t("".concat(entity, ":action.").concat(actionItem));
        }
    }
}
function getLabel2(schema, path, actionItem, entity, t) {
    if (typeof actionItem !== 'string') {
        return actionItem.label;
    }
    var entityI18n = (0, usefulFn_1.resolvePath)(schema, entity, path).entity;
    var label = t("".concat(entityI18n, ":action.").concat(actionItem));
    return label;
}
function Render(props) {
    var methods = props.methods, data = props.data;
    var t = methods.t;
    var schema = data.schema, actions = data.actions, onAction = data.onAction, entity = data.entity, cascadeActions = data.cascadeActions, items = data.items;
    return ((0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: web_module_less_1.default.panelContainer }, { children: (0, jsx_runtime_1.jsx)(antd_1.Space, tslib_1.__assign({ align: 'center', style: { width: '100%' } }, { children: (0, jsx_runtime_1.jsx)(antd_1.Space, tslib_1.__assign({ align: 'center' }, { children: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: items === null || items === void 0 ? void 0 : items.map(function (ele, index) {
                        return ((0, jsx_runtime_1.jsx)(ItemComponent, { label: ele.label, type: "a", onClick: ele.onClick }));
                    }) }) })) })) })));
}
exports.default = Render;