"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var antd_2 = require("antd");
var Title = antd_2.Typography.Title, Text = antd_2.Typography.Text;
var lodash_1 = require("oak-domain/lib/utils/lodash");
function render(props) {
    var _a = props.data, relationIds = _a.relationIds, relationAuths = _a.relationAuths, oakDirty = _a.oakDirty, auths = _a.auths, sourceRelations = _a.sourceRelations;
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
                            var relations = sourceRelations.filter(function (ele) { return ele.entity === sourceEntity && !relationIds.includes(ele.id); });
                            return ((0, jsx_runtime_1.jsx)("div", { style: {
                                    width: '100%',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                }, children: relations === null || relations === void 0 ? void 0 : relations.map(function (r) {
                                    var e_1, _a;
                                    var disabled = relationIds.length === 0;
                                    var checked = false, indeterminate = false;
                                    if (!disabled && relationAuths) {
                                        var includedRelationIds = [];
                                        try {
                                            for (var relationAuths_1 = tslib_1.__values(relationAuths), relationAuths_1_1 = relationAuths_1.next(); !relationAuths_1_1.done; relationAuths_1_1 = relationAuths_1.next()) {
                                                var auth = relationAuths_1_1.value;
                                                if (!auth.$$deleteAt$$ && auth.sourceRelationId === r.id && auth.path === record[1]) {
                                                    includedRelationIds.push(auth.destRelationId);
                                                }
                                            }
                                        }
                                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                                        finally {
                                            try {
                                                if (relationAuths_1_1 && !relationAuths_1_1.done && (_a = relationAuths_1.return)) _a.call(relationAuths_1);
                                            }
                                            finally { if (e_1) throw e_1.error; }
                                        }
                                        checked = (0, lodash_1.difference)(relationIds, includedRelationIds).length === 0;
                                        indeterminate = !checked && (0, lodash_1.intersection)(relationIds, includedRelationIds).length > 0;
                                    }
                                    return ((0, jsx_runtime_1.jsx)(antd_1.Checkbox, { disabled: disabled, checked: checked, indeterminate: indeterminate, onChange: function (_a) {
                                            var target = _a.target;
                                            var checked = target.checked;
                                            var refRelationAuths = relationAuths === null || relationAuths === void 0 ? void 0 : relationAuths.filter(function (ele) { return ele.sourceRelationId === r.id && ele.path === record[1]
                                                && relationIds.includes(ele.destRelationId); });
                                            onChange(checked, r.id, record[1], refRelationAuths);
                                        }, children: r.name }));
                                }) }));
                        }
                    }
                ], dataSource: auths, pagination: false }), (0, jsx_runtime_1.jsxs)(antd_1.Row, { justify: "end", style: { marginTop: 20, padding: 5 }, children: [(0, jsx_runtime_1.jsx)(antd_1.Button, { style: { marginRight: 10 }, type: 'primary', disabled: !oakDirty, onClick: function () { return confirm(); }, children: t("confirm") }), (0, jsx_runtime_1.jsx)(antd_1.Button, { disabled: !oakDirty, onClick: function () { return clean(); }, children: t("reset") })] })] }));
}
exports.default = render;
