"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var lodash_1 = require("oak-domain/lib/utils/lodash");
function render(props) {
    var _a = props.data, paths = _a.paths, directRelationAuths = _a.directRelationAuths, relationIds = _a.relationIds, oakDirty = _a.oakDirty;
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
                            var disabled = relationIds.length === 0;
                            var checked = false, indeterminate = false;
                            if (!disabled && directRelationAuths) {
                                var includedRelationIds = [];
                                try {
                                    for (var directRelationAuths_1 = tslib_1.__values(directRelationAuths), directRelationAuths_1_1 = directRelationAuths_1.next(); !directRelationAuths_1_1.done; directRelationAuths_1_1 = directRelationAuths_1.next()) {
                                        var dra = directRelationAuths_1_1.value;
                                        if (!dra.$$deleteAt$$ && dra.path === record[1]) {
                                            includedRelationIds.push(dra.destRelationId);
                                        }
                                    }
                                }
                                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                                finally {
                                    try {
                                        if (directRelationAuths_1_1 && !directRelationAuths_1_1.done && (_a = directRelationAuths_1.return)) _a.call(directRelationAuths_1);
                                    }
                                    finally { if (e_1) throw e_1.error; }
                                }
                                checked = (0, lodash_1.difference)(relationIds, includedRelationIds).length === 0;
                                indeterminate = !checked && (0, lodash_1.intersection)(relationIds, includedRelationIds).length > 0;
                            }
                            return ((0, jsx_runtime_1.jsx)(antd_1.Checkbox, tslib_1.__assign({ disabled: disabled, checked: checked, indeterminate: indeterminate, onChange: function (_a) {
                                    var target = _a.target;
                                    var checked = target.checked;
                                    var dras = directRelationAuths === null || directRelationAuths === void 0 ? void 0 : directRelationAuths.filter(function (daa) { return daa.path === record[1]; });
                                    onChange(checked, record, dras);
                                } }, { children: t('allowed') })));
                        }
                    }
                ], dataSource: paths, pagination: false }), (0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ justify: "end", style: { marginTop: 20, padding: 5 } }, { children: [(0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ style: { marginRight: 10 }, type: 'primary', disabled: !oakDirty, onClick: function () { return confirm(); } }, { children: t("confirm") })), (0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ disabled: !oakDirty, onClick: function () { return clean(); } }, { children: t("reset") }))] }))] }));
}
exports.default = render;
