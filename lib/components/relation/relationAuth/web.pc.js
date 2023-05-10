"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var antd_2 = require("antd");
var Title = antd_2.Typography.Title, Text = antd_2.Typography.Text;
function render(props) {
    var _a = props.data, relationId = _a.relationId, relationAuths = _a.relationAuths, oakDirty = _a.oakDirty, auths = _a.auths, sourceRelations = _a.sourceRelations;
    var _b = props.methods, onChange = _b.onChange, t = _b.t, clean = _b.clean, confirm = _b.confirm;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(antd_1.Table, { columns: [
                    {
                        key: '1',
                        title: t('relationAuth:attr.sourceEntity'),
                        width: 100,
                        render: function (value, record) { return record[2]; },
                    },
                    {
                        key: '1',
                        title: t('relationAuth:attr.path'),
                        width: 200,
                        render: function (value, record) { return record[1]; },
                    },
                    {
                        fixed: 'right',
                        title: t('grantedRoles'),
                        key: 'roles',
                        width: 300,
                        render: function (value, record) {
                            var sourceEntity = record[2];
                            var relations = sourceRelations.filter(function (ele) { return ele.entity === sourceEntity && ele.id !== relationId; });
                            return ((0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ style: {
                                    width: '100%',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                } }, { children: relations === null || relations === void 0 ? void 0 : relations.map(function (r) { return ((0, jsx_runtime_1.jsx)(antd_1.Checkbox, tslib_1.__assign({ disabled: !relationId, checked: !!relationId && !!(relationAuths === null || relationAuths === void 0 ? void 0 : relationAuths.find(function (ele) { return !ele.$$deleteAt$$
                                        && ele.sourceRelationId === r.id &&
                                        ele.destRelationId === relationId &&
                                        ele.path === record[1]; })), onChange: function (_a) {
                                        var target = _a.target;
                                        var checked = target.checked;
                                        var relationAuth = relationAuths === null || relationAuths === void 0 ? void 0 : relationAuths.find(function (ele) { return ele.sourceRelationId === r.id &&
                                            ele.destRelationId === relationId; });
                                        onChange(checked, r.id, record[1], relationAuth);
                                    } }, { children: r.name }))); }) })));
                        }
                    }
                ], dataSource: auths, pagination: false }), (0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ justify: "end", style: { marginTop: 20, padding: 5 } }, { children: [(0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ style: { marginRight: 10 }, type: 'primary', disabled: !oakDirty, onClick: function () { return confirm(); } }, { children: t("confirm") })), (0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ disabled: !oakDirty, onClick: function () { return clean(); } }, { children: t("reset") }))] }))] }));
}
exports.default = render;
