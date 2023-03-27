"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var mobile_module_less_1 = tslib_1.__importDefault(require("./mobile.module.less"));
var usefulFn_1 = require("../../utils/usefulFn");
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
    var schema = data.schema, actions = data.actions, onAction = data.onAction, entity = data.entity, cascadeActions = data.cascadeActions;
    var items = actions.map(function (ele) { return ({
        label: getLabel(ele, entity, t),
        onClick: function () { return onAction(typeof ele !== 'string' ? ele.action : ele, undefined); },
    }); });
    cascadeActions && Object.keys(cascadeActions).map(function (key, index) {
        var cascadeActionArr = cascadeActions[key];
        if (cascadeActionArr && cascadeActionArr.length) {
            cascadeActionArr.forEach(function (ele) {
                items.push({
                    label: getLabel2(schema, key, ele, entity, t),
                    onClick: function () { return onAction(undefined, { path: key, action: typeof ele !== 'string' ? ele.action : ele }); },
                });
            });
        }
    });
    var moreItems = items.splice(2);
    return ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ className: mobile_module_less_1.default.container }, { children: [items && items.map(function (ele, index) { return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: mobile_module_less_1.default.btn, onClick: ele.onClick }, { children: (0, jsx_runtime_1.jsx)(antd_1.Typography.Link, { children: ele.label }) })), index !== items.length - 1 && ((0, jsx_runtime_1.jsx)(antd_1.Divider, { type: "vertical" }))] })); }), (0, jsx_runtime_1.jsx)(antd_1.Divider, { type: "vertical" }), moreItems && moreItems.length > 0 && ((0, jsx_runtime_1.jsx)(antd_1.Popover, tslib_1.__assign({ placement: 'topRight', content: (0, jsx_runtime_1.jsx)(antd_1.Space, tslib_1.__assign({ direction: "vertical" }, { children: moreItems.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ size: "small", type: "link", onClick: ele.onClick }, { children: ele.label }))); }) })), trigger: "click" }, { children: (0, jsx_runtime_1.jsx)(antd_1.Button, { type: 'link', icon: (0, jsx_runtime_1.jsx)(icons_1.MoreOutlined, {}) }) })))] })));
}
exports.default = Render;
