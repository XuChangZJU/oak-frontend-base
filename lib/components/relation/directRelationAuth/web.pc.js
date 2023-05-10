"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
function render(props) {
    var _a = props.data, paths = _a.paths, directRelationAuths = _a.directRelationAuths, relationId = _a.relationId, oakDirty = _a.oakDirty;
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
                            var hasDra = !!(directRelationAuths === null || directRelationAuths === void 0 ? void 0 : directRelationAuths.find(function (daa) { return !daa.$$deleteAt$$ && daa.path === record[1] && daa.destRelationId === relationId; }));
                            return ((0, jsx_runtime_1.jsx)(antd_1.Checkbox, tslib_1.__assign({ disabled: !relationId, checked: hasDra, onChange: function (_a) {
                                    var target = _a.target;
                                    var checked = target.checked;
                                    var dra = directRelationAuths === null || directRelationAuths === void 0 ? void 0 : directRelationAuths.find(function (daa) { return daa.path === record[1]; });
                                    onChange(checked, record, dra);
                                } }, { children: t('allowed') })));
                        }
                    }
                ], dataSource: paths, pagination: false }), (0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ justify: "end", style: { marginTop: 20, padding: 5 } }, { children: [(0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ style: { marginRight: 10 }, type: 'primary', disabled: !oakDirty, onClick: function () { return confirm(); } }, { children: t("confirm") })), (0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ disabled: !oakDirty, onClick: function () { return clean(); } }, { children: t("reset") }))] }))] }));
}
exports.default = render;
