"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var antd_2 = require("antd");
var Title = antd_2.Typography.Title, Text = antd_2.Typography.Text;
var actionAuth_1 = tslib_1.__importDefault(require("../actionAuth"));
var directActionAuth_1 = tslib_1.__importDefault(require("../directActionAuth"));
function render(props) {
    var _a = props.data, oakFullpath = _a.oakFullpath, entity = _a.entity, actions = _a.actions, action = _a.action;
    var _b = props.methods, onActionSelected = _b.onActionSelected, t = _b.t;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ justify: "center", style: { margin: 20, padding: 10 } }, { children: [(0, jsx_runtime_1.jsx)(antd_1.Col, tslib_1.__assign({ span: 8 }, { children: (0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ style: { width: '100%' }, justify: "center", align: "middle" }, { children: [(0, jsx_runtime_1.jsx)(Title, tslib_1.__assign({ level: 4 }, { children: t('actionAuth:attrs.destEntity') })), (0, jsx_runtime_1.jsx)(Text, tslib_1.__assign({ code: true }, { children: entity }))] })) })), (0, jsx_runtime_1.jsx)(antd_1.Col, tslib_1.__assign({ span: 12 }, { children: (0, jsx_runtime_1.jsx)(antd_1.Row, tslib_1.__assign({ style: { width: '100%' }, justify: "center", align: "middle", wrap: true }, { children: actions === null || actions === void 0 ? void 0 : actions.map(function (a) { return ((0, jsx_runtime_1.jsx)(antd_1.Radio, tslib_1.__assign({ checked: a === action, onChange: function (_a) {
                                    var target = _a.target;
                                    if (target.checked) {
                                        onActionSelected(a);
                                    }
                                } }, { children: a }))); }) })) }))] })), (0, jsx_runtime_1.jsx)(antd_1.Tabs, { defaultActiveKey: "1", type: "card", size: "large", items: [
                    {
                        label: 'relationalAuth',
                        key: '1',
                        children: ((0, jsx_runtime_1.jsx)(actionAuth_1.default, { entity: entity, oakPath: oakFullpath && "".concat(oakFullpath, ".actionAuths"), action: action }))
                    },
                    {
                        label: 'directRelationAuth',
                        key: '2',
                        children: ((0, jsx_runtime_1.jsx)(directActionAuth_1.default, { entity: entity, oakPath: oakFullpath && "".concat(oakFullpath, ".directActionAuths"), action: action }))
                    }
                ] })] }));
}
exports.default = render;
