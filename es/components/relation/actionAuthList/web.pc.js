import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Table, Checkbox, Button, Space, } from 'antd';
import { Typography } from 'antd';
const { Title, Text } = Typography;
export default function render(props) {
    const { data, methods } = props;
    const { rows, relations, actions, path, entity, openTip, oakExecutable, onClose } = data;
    const [datasource, setDatasource] = useState([]);
    useEffect(() => {
        const tableRows = relations.map((ele) => ({
            relationId: ele.id,
            relation: ele.name,
            actions,
        }));
        setDatasource(tableRows);
    }, [relations]);
    return (_jsxs(Space, { direction: "vertical", style: { width: '100%' }, children: [_jsx(Space, { children: _jsx(Text, { style: { fontSize: 16 }, children: "\u6388\u6743" }) }), _jsx(Table, { rowKey: "relationId", dataSource: datasource, columns: [
                    {
                        width: 200,
                        dataIndex: 'relation',
                        title: '角色'
                    },
                    {
                        dataIndex: 'actions',
                        title: '操作权限',
                        render: (value, row) => {
                            const options = value.map((ele) => ({
                                label: ele,
                                value: ele,
                            }));
                            const actionAuth = rows.filter((ele) => ele.relationId === row.relationId)
                                .sort((a, b) => b.deActions.length - a.deActions.length)?.[0];
                            const defaultValue = actionAuth ? actionAuth.deActions : [];
                            return (_jsx(Checkbox.Group, { style: {
                                    width: '100%',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                }, options: options, defaultValue: defaultValue, onChange: (checkedArr) => {
                                    const path2 = path.replaceAll('(user)', '');
                                    if (!actionAuth) {
                                        methods.addItem({
                                            relationId: row.relationId || '',
                                            paths: [path2],
                                            deActions: checkedArr,
                                            destEntity: entity,
                                        });
                                    }
                                    else {
                                        methods.updateItem({
                                            deActions: checkedArr,
                                        }, actionAuth.id);
                                    }
                                    if (!checkedArr.length && actionAuth) {
                                        methods.removeItem(actionAuth.id);
                                    }
                                } }));
                        }
                    }
                ], pagination: false }), _jsx("div", { style: { display: 'flex', width: '100%', justifyContent: 'flex-end', padding: 8 }, children: _jsx(Button, { type: "primary", onClick: () => {
                        methods.execute();
                        onClose();
                    }, children: "\u4FDD\u5B58\u5E76\u5173\u95ED" }) })] }));
}
