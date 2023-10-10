import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Table, Checkbox, Button, Row } from 'antd';
import { Typography } from 'antd';
const { Title, Text } = Typography;
export default function render(props) {
    const { cascadeEntityRelations, oakDirty, entity, relationName } = props.data;
    const { onChange, t, clean, confirm } = props.methods;
    return (_jsxs("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            width: '100%'
        }, children: [_jsxs(Row, { justify: "center", style: { margin: 20, padding: 10 }, children: [_jsxs(Row, { style: { marginRight: 10 }, children: [_jsx(Title, { level: 4, children: "\u5F53\u524D\u5BF9\u8C61\uFF1A" }), _jsx(Text, { code: true, children: entity })] }), _jsxs(Row, { children: [_jsx(Title, { level: 4, children: "\u5F53\u524D\u89D2\u8272\uFF1A" }), _jsx(Text, { code: true, children: relationName })] })] }), _jsx(Table, { columns: [
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
                            return (_jsxs("div", { style: {
                                    width: '100%',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                }, children: [relations.map((ele) => {
                                        const authed = relationIdAuthed.includes(ele.id);
                                        return (_jsx(Checkbox, { checked: authed, onChange: ({ target }) => {
                                                const { checked } = target;
                                                const relationAuth = authedRelations.find(ele2 => ele2.destRelationId === ele.id);
                                                if (relationAuth) {
                                                    onChange(ele.id, checked, relationAuth.id);
                                                }
                                                else {
                                                    onChange(ele.id, checked, undefined, path);
                                                }
                                            }, children: ele.display || ele.name }, ele.id));
                                    }), customizedRelationsAuthed.map((ele) => _jsx(Checkbox, { checked: true, disabled: true, children: ele.display || ele.name }, ele.id))] }));
                        }
                    }
                ], dataSource: cascadeEntityRelations, pagination: false }), _jsxs(Row, { justify: "end", style: { marginTop: 20, padding: 5 }, children: [_jsx(Button, { style: { marginRight: 10 }, type: 'primary', disabled: !oakDirty, onClick: () => confirm(), children: t("confirm") }), _jsx(Button, { disabled: !oakDirty, onClick: () => clean(), children: t("reset") })] })] }));
}
