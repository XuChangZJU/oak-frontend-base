"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
const antd_2 = require("antd");
const { Title, Text } = antd_2.Typography;
function render(props) {
    const { cascadeEntityRelations, oakDirty, entity, relationName } = props.data;
    const { onChange, t, clean, confirm } = props.methods;
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            width: '100%'
        }, children: [(0, jsx_runtime_1.jsxs)(antd_1.Row, { justify: "center", style: { margin: 20, padding: 10 }, children: [(0, jsx_runtime_1.jsxs)(antd_1.Row, { style: { marginRight: 10 }, children: [(0, jsx_runtime_1.jsx)(Title, { level: 4, children: "\u5F53\u524D\u5BF9\u8C61\uFF1A" }), (0, jsx_runtime_1.jsx)(Text, { code: true, children: entity })] }), (0, jsx_runtime_1.jsxs)(antd_1.Row, { children: [(0, jsx_runtime_1.jsx)(Title, { level: 4, children: "\u5F53\u524D\u89D2\u8272\uFF1A" }), (0, jsx_runtime_1.jsx)(Text, { code: true, children: relationName })] })] }), (0, jsx_runtime_1.jsx)(antd_1.Table, { columns: [
                    {
                        key: '1',
                        title: '对象',
                        width: 100,
                        render: (value, record) => {
                            const { entity } = record;
                            return entity;
                        },
                    },
                    {
                        key: '1',
                        title: '路径',
                        width: 200,
                        render: (value, record) => {
                            const { path } = record;
                            return path;
                        },
                    },
                    {
                        fixed: 'right',
                        title: '角色',
                        key: 'operation',
                        width: 300,
                        render: (value, record) => {
                            const { relations, authedRelations, path } = record;
                            // 可能存在定制的relation
                            const customizedRelationsAuthed = [];
                            const relationIdAuthed = [];
                            authedRelations.forEach((ele) => {
                                if (!ele.$$deleteAt$$) {
                                    if (relations.find(ele2 => ele2.id === ele.destRelationId)) {
                                        relationIdAuthed.push(ele.destRelationId);
                                    }
                                    else {
                                        customizedRelationsAuthed.push(ele.destRelation);
                                    }
                                }
                            });
                            return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                    width: '100%',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                }, children: [relations.map((ele) => {
                                        const authed = relationIdAuthed.includes(ele.id);
                                        return ((0, jsx_runtime_1.jsx)(antd_1.Checkbox, { checked: authed, onChange: ({ target }) => {
                                                const { checked } = target;
                                                const relationAuth = authedRelations.find(ele2 => ele2.destRelationId === ele.id);
                                                if (relationAuth) {
                                                    onChange(ele.id, checked, relationAuth.id);
                                                }
                                                else {
                                                    onChange(ele.id, checked, undefined, path);
                                                }
                                            }, children: ele.display || ele.name }, ele.id));
                                    }), customizedRelationsAuthed.map((ele) => (0, jsx_runtime_1.jsx)(antd_1.Checkbox, { checked: true, disabled: true, children: ele.display || ele.name }, ele.id))] }));
                        }
                    }
                ], dataSource: cascadeEntityRelations, pagination: false }), (0, jsx_runtime_1.jsxs)(antd_1.Row, { justify: "end", style: { marginTop: 20, padding: 5 }, children: [(0, jsx_runtime_1.jsx)(antd_1.Button, { style: { marginRight: 10 }, type: 'primary', disabled: !oakDirty, onClick: () => confirm(), children: t("confirm") }), (0, jsx_runtime_1.jsx)(antd_1.Button, { disabled: !oakDirty, onClick: () => clean(), children: t("reset") })] })] }));
}
exports.default = render;
