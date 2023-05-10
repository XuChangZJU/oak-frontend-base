"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var lodash_1 = require("oak-domain/lib/utils/lodash");
function render(props) {
    var _a = props.data, paths = _a.paths, directActionAuths = _a.directActionAuths, actions = _a.actions, oakDirty = _a.oakDirty;
    var _b = props.methods, onChange = _b.onChange, confirm = _b.confirm, t = _b.t, clean = _b.clean;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(antd_1.Table, { columns: [
                    {
                        key: '2',
                        title: t('directActionAuth:attr.sourceEntity'),
                        width: 100,
                        render: function (value, record) {
                            return record[2];
                        },
                    },
                    {
                        key: '1',
                        title: t('directActionAuth:attr.path'),
                        width: 200,
                        render: function (value, record) {
                            return record[1];
                        },
                    },
                    {
                        fixed: 'right',
                        title: t('authority'),
                        key: 'operation',
                        width: 300,
                        render: function (value, record) {
                            var e_1, _a;
                            var checked = false, indeterminate = false;
                            if (directActionAuths && actions.length > 0) {
                                try {
                                    for (var directActionAuths_1 = tslib_1.__values(directActionAuths), directActionAuths_1_1 = directActionAuths_1.next(); !directActionAuths_1_1.done; directActionAuths_1_1 = directActionAuths_1.next()) {
                                        var daa = directActionAuths_1_1.value;
                                        if (!daa.$$deleteAt$$ && daa.path === record[1]) {
                                            var deActions = daa.deActions;
                                            checked = (0, lodash_1.difference)(actions, deActions).length === 0;
                                            indeterminate = !checked && (0, lodash_1.intersection)(actions, deActions).length > 0;
                                            break;
                                        }
                                    }
                                }
                                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                                finally {
                                    try {
                                        if (directActionAuths_1_1 && !directActionAuths_1_1.done && (_a = directActionAuths_1.return)) _a.call(directActionAuths_1);
                                    }
                                    finally { if (e_1) throw e_1.error; }
                                }
                            }
                            return ((0, jsx_runtime_1.jsx)(antd_1.Checkbox, tslib_1.__assign({ disabled: actions.length === 0, checked: checked, indeterminate: indeterminate, onChange: function (_a) {
                                    var target = _a.target;
                                    var checked = target.checked;
                                    var daa = directActionAuths === null || directActionAuths === void 0 ? void 0 : directActionAuths.find(function (daa) { return daa.path === record[1]; });
                                    onChange(checked, record, daa);
                                } }, { children: t('allowed') })));
                        }
                    }
                ], dataSource: paths, pagination: false }), (0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ justify: "end", style: { marginTop: 20, padding: 5 } }, { children: [(0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ style: { marginRight: 10 }, type: 'primary', disabled: !oakDirty, onClick: function () { return confirm(); } }, { children: t("confirm") })), (0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ disabled: !oakDirty, onClick: function () { return clean(); } }, { children: t("reset") }))] }))] }));
}
exports.default = render;
