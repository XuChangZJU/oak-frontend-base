"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var antd_2 = require("antd");
var Title = antd_2.Typography.Title, Text = antd_2.Typography.Text;
function render(props) {
    var _a = props.data, cascadeEntityRelations = _a.cascadeEntityRelations, oakDirty = _a.oakDirty, entity = _a.entity, relationName = _a.relationName;
    var _b = props.methods, onChange = _b.onChange, t = _b.t, clean = _b.clean, confirm = _b.confirm;
    return ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            width: '100%'
        } }, { children: [(0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ justify: "center", style: { margin: 20, padding: 10 } }, { children: [(0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ style: { marginRight: 10 } }, { children: [(0, jsx_runtime_1.jsx)(Title, tslib_1.__assign({ level: 4 }, { children: "\u5F53\u524D\u5BF9\u8C61\uFF1A" })), (0, jsx_runtime_1.jsx)(Text, tslib_1.__assign({ code: true }, { children: entity }))] })), (0, jsx_runtime_1.jsxs)(antd_1.Row, { children: [(0, jsx_runtime_1.jsx)(Title, tslib_1.__assign({ level: 4 }, { children: "\u5F53\u524D\u89D2\u8272\uFF1A" })), (0, jsx_runtime_1.jsx)(Text, tslib_1.__assign({ code: true }, { children: relationName }))] })] })), (0, jsx_runtime_1.jsx)(antd_1.Table, { columns: [
                    {
                        key: '1',
                        title: '对象',
                        width: 100,
                        render: function (value, record) {
                            var entity = record.entity;
                            return entity;
                        },
                    },
                    {
                        key: '1',
                        title: '路径',
                        width: 200,
                        render: function (value, record) {
                            var path = record.path;
                            return path;
                        },
                    },
                    {
                        fixed: 'right',
                        title: '角色',
                        key: 'operation',
                        width: 300,
                        render: function (value, record) {
                            var relations = record.relations, authedRelations = record.authedRelations, path = record.path;
                            // 可能存在定制的relation
                            var customizedRelationsAuthed = [];
                            var relationIdAuthed = [];
                            authedRelations.forEach(function (ele) {
                                if (!ele.$$deleteAt$$) {
                                    if (relations.find(function (ele2) { return ele2.id === ele.destRelationId; })) {
                                        relationIdAuthed.push(ele.destRelationId);
                                    }
                                    else {
                                        customizedRelationsAuthed.push(ele.destRelation);
                                    }
                                }
                            });
                            return ((0, jsx_runtime_1.jsxs)("div", tslib_1.__assign({ style: {
                                    width: '100%',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                } }, { children: [relations.map(function (ele) {
                                        var authed = relationIdAuthed.includes(ele.id);
                                        return ((0, jsx_runtime_1.jsx)(antd_1.Checkbox, tslib_1.__assign({ checked: authed, onChange: function (_a) {
                                                var target = _a.target;
                                                var checked = target.checked;
                                                var relationAuth = authedRelations.find(function (ele2) { return ele2.destRelationId === ele.id; });
                                                if (relationAuth) {
                                                    onChange(ele.id, checked, relationAuth.id);
                                                }
                                                else {
                                                    onChange(ele.id, checked, undefined, path);
                                                }
                                            } }, { children: ele.display || ele.name }), ele.id));
                                    }), customizedRelationsAuthed.map(function (ele) { return (0, jsx_runtime_1.jsx)(antd_1.Checkbox, tslib_1.__assign({ checked: true, disabled: true }, { children: ele.display || ele.name }), ele.id); })] })));
                        }
                    }
                ], dataSource: cascadeEntityRelations, pagination: {
                    position: ['none', 'none'],
                } }), (0, jsx_runtime_1.jsxs)(antd_1.Row, tslib_1.__assign({ justify: "end", style: { marginTop: 20, padding: 5 } }, { children: [(0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ style: { marginRight: 10 }, type: 'primary', disabled: !oakDirty, onClick: function () { return confirm(); } }, { children: t("confirm") })), (0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ disabled: !oakDirty, onClick: function () { return clean(); } }, { children: t("reset") }))] }))] })));
}
exports.default = render;
