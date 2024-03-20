import React, { useState, useEffect } from 'react';
import { Table, Checkbox, Button, Space, } from 'antd';
import { Typography } from 'antd';
const { Title, Text } = Typography;
export default function render(props) {
    const { data, methods } = props;
    const { rows, relations, actions, path, entity, openTip, oakExecutable, onClose, } = data;
    const [datasource, setDatasource] = useState([]);
    useEffect(() => {
        const tableRows = relations.map((ele) => ({
            relationId: ele.id,
            relation: ele.name,
            actions,
        }));
        setDatasource(tableRows);
    }, [relations]);
    return (<Space direction="vertical" style={{ width: '100%' }}>
            <Space>
                <Text style={{ fontSize: 16 }}>授权</Text>
            </Space>
            <Table rowKey={'relationId'} dataSource={datasource} columns={[
            {
                width: 200,
                dataIndex: 'relation',
                title: '角色',
            },
            {
                dataIndex: 'actions',
                title: '操作权限',
                render: (value, row) => {
                    const options = value.map((ele) => ({
                        label: ele,
                        value: ele,
                    }));
                    const actionAuth = rows
                        .filter((ele) => ele.relationId === row.relationId)
                        .sort((a, b) => b.deActions.length - a.deActions.length)?.[0];
                    const defaultValue = actionAuth
                        ? actionAuth.deActions
                        : [];
                    return (<Checkbox.Group style={{
                            width: '100%',
                            display: 'flex',
                            flexWrap: 'wrap',
                        }} options={options} defaultValue={defaultValue} onChange={(checkedArr) => {
                            const path2 = path.replaceAll('(user)', '');
                            if (!actionAuth) {
                                /* methods.addItem({
                                    relationId:
                                        row.relationId || '',
                                    paths: [path2],
                                    deActions:
                                        checkedArr as string[],
                                    destEntity: entity as string,
                                }); */
                            }
                            else {
                                methods.updateItem({
                                    deActions: checkedArr,
                                }, actionAuth.id);
                            }
                            if (!checkedArr.length && actionAuth) {
                                methods.removeItem(actionAuth.id);
                            }
                        }}/>);
                },
            },
        ]} pagination={false}></Table>
            <div style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'flex-end',
            padding: 8,
        }}>
                <Button disabled={!path} type="primary" onClick={() => {
            methods.execute();
            onClose();
        }}>
                    保存并关闭
                </Button>
            </div>
        </Space>);
}
