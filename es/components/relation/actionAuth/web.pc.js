import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Table, Checkbox, Button, Row, Typography, Space } from 'antd';
const { Title, Text } = Typography;
import { difference, intersection } from 'oak-domain/lib/utils/lodash';
import ActionAuthListSingle from '../../relation/single';
export default function render(props) {
    const { cascadeEntityActions, oakDirty, actions, entity, actionAuthList } = props.data;
    const { onChange, t, clean, confirm, onChange2 } = props.methods;
    return (_jsxs(Space, { direction: "vertical", style: { width: '100%' }, children: [_jsx(ActionAuthListSingle, { entity: entity }), _jsx(Table, { columns: [
                    {
                        key: '1',
                        title: '源对象',
                        width: 100,
                        render: (value, record) => {
                            const { sourceEntity } = record;
                            return sourceEntity;
                        },
                    },
                    {
                        key: '1',
                        title: '路径',
                        width: 200,
                        render: (value, record) => {
                            const { paths } = record;
                            return paths.map((ele, index) => {
                                if (index === 0) {
                                    return ele;
                                }
                                else {
                                    return _jsxs(_Fragment, { children: [_jsx("br", {}), ele] });
                                }
                            });
                        },
                    },
                    {
                        fixed: 'right',
                        title: '相关角色',
                        key: 'operation',
                        width: 300,
                        render: (value, record) => {
                            // const { relations, actionAuths, path } = record;
                            const { relations, relationSelections } = record;
                            return (_jsx("div", { style: {
                                    width: '100%',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                }, children: relationSelections.map((ele) => {
                                    let checked = false, indeterminate = false;
                                    if (actions && actions.length > 0) {
                                        const relation = relations.find((ele2) => ele2.relationId === ele.id && !ele2.$$deleteAt$$);
                                        if (relation) {
                                            const { deActions } = relation;
                                            checked = difference(actions, deActions).length === 0;
                                            indeterminate = !checked && intersection(actions, deActions).length > 0;
                                        }
                                    }
                                    return _jsx(Checkbox, { disabled: actions.length === 0, checked: checked, indeterminate: indeterminate, onChange: ({ target }) => {
                                            onChange2(target.checked, ele.id, record.paths, relations);
                                        }, children: ele.name });
                                }) }));
                        }
                    }
                ], dataSource: actionAuthList, pagination: false }), _jsxs(Row, { justify: "end", style: { marginTop: 20, padding: 5 }, children: [_jsx(Button, { style: { marginRight: 10 }, type: 'primary', disabled: !oakDirty, onClick: () => confirm(), children: t("confirm") }), _jsx(Button, { disabled: !oakDirty, onClick: () => clean(), children: t("reset") })] })] }));
}
