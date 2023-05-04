"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var antd_2 = require("antd");
var Title = antd_2.Typography.Title, Text = antd_2.Typography.Text;
function render(props) {
    var _a = props.data, cascadeEntityActions = _a.cascadeEntityActions, oakDirty = _a.oakDirty, entity = _a.entity, relationName = _a.relationName;
    var _b = props.methods, onChange = _b.onChange, t = _b.t, clean = _b.clean, confirm = _b.confirm;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ justify: "center", style: { margin: 20, padding: 10 } }, { children: [(0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ style: { marginRight: 10 } }, { children: [(0, jsx_runtime_1.jsx)(Title, tslib_1.__assign({ level: 4 }, { children: "\u5F53\u524D\u5BF9\u8C61\uFF1A" })), (0, jsx_runtime_1.jsx)(Text, tslib_1.__assign({ code: true }, { children: entity }))] })), (0, jsx_runtime_1.jsxs)(antd_1.Row, { children: [(0, jsx_runtime_1.jsx)(Title, tslib_1.__assign({ level: 4 }, { children: "\u5F53\u524D\u89D2\u8272\uFF1A" })), (0, jsx_runtime_1.jsx)(Text, tslib_1.__assign({ code: true }, { children: relationName }))] })] })), (0, jsx_runtime_1.jsx)(antd_1.Table, { columns: [
                    {
                        key: '1',
                        title: '目标对象',
                        width: 100,
                        render: function (value, record) {
                            var path = record.path;
                            return path[0];
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
                        title: '操作',
                        key: 'operation',
                        width: 300,
                        render: function (value, record) {
                            var actions = record.actions, actionAuth = record.actionAuth, path = record.path;
                            return ((0, jsx_runtime_1.jsx)(antd_1.Checkbox.Group, { style: {
                                    width: '100%',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                }, options: actions, value: actionAuth === null || actionAuth === void 0 ? void 0 : actionAuth.deActions, onChange: function (value) { return onChange(value, path, actionAuth); } }));
                        }
                    }
                ], dataSource: cascadeEntityActions, pagination: {
                    position: ['none', 'none'],
                } }), (0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ justify: "end", style: { marginTop: 20, padding: 5 } }, { children: [(0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ style: { marginRight: 10 }, type: 'primary', disabled: !oakDirty, onClick: function () { return confirm(); } }, { children: t("confirm") })), (0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ disabled: !oakDirty, onClick: function () { return clean(); } }, { children: t("reset") }))] }))] }));
}
exports.default = render;
