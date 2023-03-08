"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var web_module_less_1 = tslib_1.__importDefault(require("./web.module.less"));
var confirm = antd_1.Modal.confirm;
function ItemComponent(props) {
    var id = props.id, label = props.label, type = props.type, onClick = props.onClick, action = props.action;
    if (type === 'button') {
        return ((0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ onClick: function () { return onClick(id, action); } }, { children: label })));
    }
    return (0, jsx_runtime_1.jsx)("a", tslib_1.__assign({ onClick: function () { return onClick(id, action); } }, { children: label }));
}
function Render(props) {
    var methods = props.methods, data = props.data;
    var t = methods.t;
    var id = data.id, oakActions = data.oakActions, onClick = data.onClick, entity = data.entity;
    return ((0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: web_module_less_1.default.panelContainer }, { children: (0, jsx_runtime_1.jsx)(antd_1.Space, { children: oakActions === null || oakActions === void 0 ? void 0 : oakActions.map(function (ele, index) {
                return ((0, jsx_runtime_1.jsx)(ItemComponent, { id: id, label: ele.label || t("common:".concat(ele.action)) || t("".concat(entity, ":action.").concat(ele.action)), action: ele.action, type: "a", onClick: function (id, action) { return onClick(id, action); } }));
            }) }) })));
}
exports.default = Render;
