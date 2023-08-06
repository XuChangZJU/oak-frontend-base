import React, {useState, useEffect} from 'react';
import { Table, Checkbox, Button, Row, Space, Tooltip, } from 'antd';
import { Typography } from 'antd';
const { Title, Text } = Typography;
import { RowWithActions, WebComponentProps } from '../../../types/Page';
import { AuthCascadePath, EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import assert from 'assert';

type ED = EntityDict & BaseEntityDict;
type TableData = {
    relationId: string;
    relation: string;
    actions: string[];
}

export default function render(
    props: WebComponentProps<
        ED,
        'actionAuth',
        true,
        {
            relations: EntityDict['relation']['Schema'][],
            actions: string[];
            datasource: TableData[];
            rows: EntityDict['actionAuth']['Schema'][];
            path: string;
            entity: keyof ED;
            openTip: boolean;
            onClose: () => void;
        },
        {
          
        }
    >
) {
    const { data, methods } = props;
    const { rows, relations, actions, path, entity, openTip, oakExecutable, onClose } = data;
    const [datasource, setDatasource] = useState<TableData[]>([]);
    useEffect(() => {
        const tableRows: TableData[] = relations.map((ele) => ({
            relationId: ele.id,
            relation: ele.name,
            actions,
        }))
        setDatasource(tableRows);
    }, [relations])
    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
                <Text style={{fontSize: 16}}>授权</Text>
            </Space>
            <Table
                rowKey={"relationId"}
                dataSource={datasource}
                columns={[
                    {
                        width: 200,
                        dataIndex: 'relation',
                        title: '角色'
                    },
                    {
                        dataIndex: 'actions',
                        title: '操作权限',
                        render: (value: string[], row: TableData) => {
                            const options = value.map((ele) => ({
                                label: ele,
                                value: ele,
                            }))
                            const actionAuth = rows.find((ele) => ele.relationId === row.relationId);
                            const defaultValue = actionAuth ? actionAuth.deActions : [];
                            return (
                                <Checkbox.Group
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                    }}
                                    options={options}
                                    defaultValue={defaultValue}
                                    onChange={(checkedArr) => {
                                        const path2 = path.replaceAll('(user)', '');
                                        if (!actionAuth) {
                                            methods.addItem({
                                                relationId: row.relationId || '',
                                                path: path2,
                                                deActions: checkedArr as string[],
                                                destEntity: entity as string,
                                            })
                                        }
                                        else {
                                            methods.updateItem({
                                                deActions: checkedArr as string[],
                                            }, actionAuth.id)
                                        }
                                        if (!checkedArr.length && actionAuth) {
                                            methods.removeItem(actionAuth.id);
                                        }
                                    }}
                                />
                            )
                        }
                    }
                ]}
                pagination={false}
            ></Table>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end', padding: 8 }}>
                <Button
                    type="primary"
                    onClick={() => {
                        methods.execute();
                        onClose();
                    }}
                >
                    保存并关闭
                </Button>
            </div>
        </Space>
    );
}