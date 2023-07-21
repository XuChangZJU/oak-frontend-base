import { AuthCascadePath, EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { Row, Badge, Col, Tabs, Checkbox, Table, Space, Button, Modal, Card, Breadcrumb, Tag } from 'antd';
import { Typography } from 'antd';
const { Title, Text } = Typography;
import { WebComponentProps } from '../../../types/Page';
import { useState, useEffect } from 'react';
import ActionAuthList from '../actionAuthList';


type ED = EntityDict & BaseEntityDict;

export default function render(props: WebComponentProps<ED, keyof ED, false, {
    rows: EntityDict['actionAuth']['Schema'][];
    entity: keyof ED;
    entityDNode: string[];
    entitySNode: string[];
    showExecuteTip: boolean;
}, {
    getNodes: (entity: keyof ED) => void;
}>) {
    const { methods, data } = props;
    const { entity, entityDNode, entitySNode, oakFullpath, showExecuteTip, rows } = data;
    const { getNodes } = methods;
    const [open, setOpen] = useState(false);
    const [openTip, setOpenTip] = useState(false);
    const [breadcrumbItems, setBreadcrumbItems] = useState<string[]>([])
    useEffect(() => {
        if (!showExecuteTip) {
            setOpenTip(false);
        }
    }, [showExecuteTip]);
    const checkExecute = () => {
        if (showExecuteTip) {
            methods.setMessage({
                content: '有未保存的权限设置，请先保存',
                type: 'warning',
            })
            setOpenTip(true);
            return true;
        }
    }
    return (
        <Space direction="vertical" style={{width: '100%'}}>
            <Button onClick={() => setOpen(true)}>设置</Button>
             <Modal
                title={`权限设置(${entity})`}
                open={open}
                destroyOnClose={true}
                footer={(
                    <Button onClick={() => setOpen(false)}>
                        取消
                    </Button>
                )}
                onCancel={() => setOpen(false)}
                width={1000}
            >
                <Space direction="vertical" style={{ width: '100%', marginTop: 16 }} size={16}>
                    <Space direction="vertical">
                        <Text style={{fontSize: 16}}>路径</Text>
                        <Space style={{ width: '100%' }} wrap>
                            {(breadcrumbItems && breadcrumbItems.length > 0) ? (
                                <>
                                    <Breadcrumb
                                        items={breadcrumbItems.map((ele, index) => ({
                                            title: (
                                                <a
                                                    onClick={() => {
                                                        if (checkExecute()) {
                                                            return;
                                                        }
                                                        const newItems = breadcrumbItems.slice(0, index + 1)
                                                        setBreadcrumbItems(newItems);
                                                        const entity = ele.includes('$') ? ele.split('$')[0] : ele;
                                                        getNodes(entity);
                                                    }}
                                                >
                                                    {ele}
                                                </a>
                                            )
                                        }))}
                                    />
                                    <Button
                                        size="small"
                                        type="link"
                                        onClick={() => {
                                            setBreadcrumbItems([]);
                                            getNodes(entity);
                                        }}
                                    >
                                        清空
                                    </Button>
                                </>
                            ) : (
                                <Text type="secondary">请先选择结点</Text>
                            )}
                        </Space>
                    </Space>
                    <Space direction="vertical">
                        <Space align="center">
                            <Text style={{ fontSize: 16 }}>结点</Text>
                            <Badge color={"var(--oak-color-primary)"} text="外键" style={{color: 'rgba(0, 0, 0, 0.45)'}} />
                            <Badge color="cyan" text="反指结点" style={{color: 'rgba(0, 0, 0, 0.45)'}} />
                        </Space>
                        <Space wrap>
                            {entityDNode.map((ele) => (
                                <Tag
                                    style={{cursor: 'pointer'}}
                                    color="processing"
                                    bordered={false}
                                    onClick={() => {
                                        if (checkExecute()) {
                                            return;
                                        }
                                        breadcrumbItems.push(ele);
                                        setBreadcrumbItems(breadcrumbItems)
                                        getNodes(ele)
                                    }}
                                >
                                    {ele}
                                </Tag>
                            ))}
                            {entitySNode.map((ele) => (
                                <Tag
                                    style={{cursor: 'pointer'}}
                                    color={"cyan"}
                                    bordered={false}
                                    onClick={() => {
                                        if (checkExecute()) {
                                            return;
                                        }
                                        breadcrumbItems.push(`${ele}$${entity}`);
                                        setBreadcrumbItems(breadcrumbItems)
                                        getNodes(ele)
                                    }}
                                >
                                    {ele}
                                </Tag>
                            ))}
                        </Space>
                    </Space>
                    <ActionAuthList
                        oakPath="$actionAuthList-cpn"
                        entity={entity}
                        path={breadcrumbItems.join('.')}
                        openTip={openTip}
                    />
                </Space>
            </Modal>
            <Table
                rowKey={"relationId"}
                dataSource={rows}
                columns={[
                    {
                        width: 400,
                        dataIndex: 'path',
                        title: '路径',
                    },
                    {
                        dataIndex: 'relation',
                        title: '角色',
                        render: (value, row) => row.relation?.name, 
                    },
                    {
                        dataIndex: 'deActions',
                        title: '权限',
                        render: (value: string[]) => {
                            return value.map((ele) => (
                                <Tag>{ele}</Tag>
                            ))
                        }
                    },
                    {
                        title: '操作',
                        render: (value, row, index) => {
                            return (
                                <a
                                    onClick={() => {
                                        const path = row?.path as string;
                                        const items = path.split('.');
                                        setBreadcrumbItems(items);
                                        setOpen(true);
                                    }}
                                >
                                    编辑
                                </a>
                            )
                        }
                    }
                ]}
                pagination={false}
            ></Table>
        </Space>
    );
}