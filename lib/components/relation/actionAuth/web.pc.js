"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var antd_2 = require("antd");
var Title = antd_2.Typography.Title, Text = antd_2.Typography.Text;
function render(props) {
    var _a = props.data, cascadeEntityActions = _a.cascadeEntityActions, oakDirty = _a.oakDirty, action = _a.action;
    var _b = props.methods, onChange = _b.onChange, t = _b.t, clean = _b.clean, confirm = _b.confirm;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(antd_1.Table, { columns: [
                    {
                        key: '1',
                        title: '源对象',
                        width: 100,
                        render: function (value, record) {
                            var path = record.path;
                            return path[2];
                        },
                    },
                    {
                        key: '1',
                        title: '路径',
                        width: 200,
                        render: function (value, record) {
                            var path = record.path;
                            return path[1];
                        },
                    },
                    {
                        fixed: 'right',
                        title: '相关角色',
                        key: 'operation',
                        width: 300,
                        render: function (value, record) {
                            var relations = record.relations, actionAuths = record.actionAuths, path = record.path;
                            return ((0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ style: {
                                    width: '100%',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                } }, { children: relations === null || relations === void 0 ? void 0 : relations.map(function (r) { return ((0, jsx_runtime_1.jsx)(antd_1.Checkbox, tslib_1.__assign({ disabled: !action, checked: !!action && !!(actionAuths === null || actionAuths === void 0 ? void 0 : actionAuths.find(function (ele) { return !ele.$$deleteAt$$
                                        && ele.relationId === r.id &&
                                        ele.deActions.includes(action); })), onChange: function (_a) {
                                        var target = _a.target;
                                        var checked = target.checked;
                                        var actionAuth = actionAuths === null || actionAuths === void 0 ? void 0 : actionAuths.find(function (ele) { return ele.relationId === r.id; });
                                        onChange(checked, r.id, path[1], actionAuth);
                                    } }, { children: r.name }))); }) })));
                        }
                    }
                ], dataSource: cascadeEntityActions, pagination: {
                    position: ['none', 'none'],
                } }), (0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ justify: "end", style: { marginTop: 20, padding: 5 } }, { children: [(0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ style: { marginRight: 10 }, type: 'primary', disabled: !oakDirty, onClick: function () { return confirm(); } }, { children: t("confirm") })), (0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ disabled: !oakDirty, onClick: function () { return clean(); } }, { children: t("reset") }))] }))] }));
}
exports.default = render;
