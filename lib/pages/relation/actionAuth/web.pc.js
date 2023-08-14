"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var Title = antd_1.Typography.Title, Text = antd_1.Typography.Text;
var lodash_1 = require("oak-domain/lib/utils/lodash");
var single_1 = tslib_1.__importDefault(require("../../../components/relation/single"));
function render(props) {
    var _a = props.data, cascadeEntityActions = _a.cascadeEntityActions, oakDirty = _a.oakDirty, actions = _a.actions, entity = _a.entity;
    var _b = props.methods, onChange = _b.onChange, t = _b.t, clean = _b.clean, confirm = _b.confirm;
    return ((0, jsx_runtime_1.jsxs)(antd_1.Space, tslib_1.__assign({ direction: "vertical", style: { width: '100%' } }, { children: [(0, jsx_runtime_1.jsx)(single_1.default, { entity: entity }), (0, jsx_runtime_1.jsx)(antd_1.Table, { columns: [
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
                                } }, { children: relations === null || relations === void 0 ? void 0 : relations.map(function (r) {
                                    var e_1, _a;
                                    var _b;
                                    var checked = false, indeterminate = false;
                                    // filter出对应path的actionAuth来决定relation的check
                                    // sort deActions长的在后，不然会影响checked
                                    var actionAuthsByPath = actionAuths === null || actionAuths === void 0 ? void 0 : actionAuths.filter(function (ele) { return ele.paths.includes(path[1]); }).sort(function (a, b) { return b.deActions.length - a.deActions.length; });
                                    if (actionAuthsByPath && actions.length > 0) {
                                        try {
                                            for (var actionAuthsByPath_1 = tslib_1.__values(actionAuthsByPath), actionAuthsByPath_1_1 = actionAuthsByPath_1.next(); !actionAuthsByPath_1_1.done; actionAuthsByPath_1_1 = actionAuthsByPath_1.next()) {
                                                var aa = actionAuthsByPath_1_1.value;
                                                // 1.relationId相同，deActions也要相同
                                                // 如果path中存在多对一的情况要使用name进行判断
                                                if (!aa.$$deleteAt$$ && (aa.relationId === r.id
                                                    || (record.path.includes('$') && ((_b = aa.relation) === null || _b === void 0 ? void 0 : _b.name) === r.name))) {
                                                    var deActions = aa.deActions;
                                                    checked = (0, lodash_1.difference)(actions, deActions).length === 0;
                                                    indeterminate = !checked && (0, lodash_1.intersection)(actions, deActions).length > 0;
                                                    break;
                                                }
                                            }
                                        }
                                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                                        finally {
                                            try {
                                                if (actionAuthsByPath_1_1 && !actionAuthsByPath_1_1.done && (_a = actionAuthsByPath_1.return)) _a.call(actionAuthsByPath_1);
                                            }
                                            finally { if (e_1) throw e_1.error; }
                                        }
                                    }
                                    return ((0, jsx_runtime_1.jsx)(antd_1.Checkbox, tslib_1.__assign({ disabled: actions.length === 0, checked: checked, indeterminate: indeterminate, onChange: function (_a) {
                                            var target = _a.target;
                                            var checked = target.checked;
                                            var actionAuths2 = actionAuths === null || actionAuths === void 0 ? void 0 : actionAuths.filter(function (ele) { var _a; return ele.relationId === r.id || (record.path.includes('$') && ((_a = ele.relation) === null || _a === void 0 ? void 0 : _a.name) === r.name); });
                                            onChange(checked, r.id, path[1], actionAuths2);
                                        } }, { children: r.name })));
                                }) })));
                        }
                    }
                ], dataSource: cascadeEntityActions, pagination: false }), (0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ justify: "end", style: { marginTop: 20, padding: 5 } }, { children: [(0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ style: { marginRight: 10 }, type: 'primary', disabled: !oakDirty, onClick: function () { return confirm(); } }, { children: t("confirm") })), (0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ disabled: !oakDirty, onClick: function () { return clean(); } }, { children: t("reset") }))] }))] })));
}
exports.default = render;
