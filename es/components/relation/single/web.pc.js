import React, { useState } from 'react';
import { Row, Col, Space, Button, Modal, Breadcrumb, Tag } from 'antd';
import { Typography } from 'antd';
import ActionAuthList from '../actionAuthList';
const { Title, Text } = Typography;
export default function render(props) {
    const { methods, data } = props;
    const { entity, entityDNode, entitySNode, oakFullpath } = data;
    const { getNodes, checkSelectRelation, resolveP } = methods;
    const [open, setOpen] = useState(false);
    const [breadcrumbItems, setBreadcrumbItems] = useState([]);
    return (<Space direction="vertical" style={{ width: '100%' }}>
            <Button onClick={() => setOpen(true)}>设置</Button>
             <Modal title={`权限设置`} open={open} destroyOnClose={true} footer={null} onCancel={() => {
            setBreadcrumbItems([]);
            setOpen(false);
        }} width={900}>
                <Space direction="vertical" style={{ width: '100%', marginTop: 16 }} size={16}>
                    <Space direction="vertical">
                        <Text style={{ fontSize: 16 }}>路径</Text>
                        <Space style={{ width: '100%' }} wrap>
                            {(breadcrumbItems && breadcrumbItems.length > 0) ? (<>
                                    <Breadcrumb items={breadcrumbItems.map((ele, index) => ({
                title: (<a onClick={() => {
                        if (checkSelectRelation()) {
                            return;
                        }
                        const newItems = breadcrumbItems.slice(0, index + 1);
                        setBreadcrumbItems(newItems);
                        const entity = ele.includes('$') ? ele.split('$')[0] : ele;
                        getNodes(entity);
                    }}>
                                                    {ele}
                                                </a>)
            }))}/>
                                    <Button size="small" type="link" onClick={() => {
                setBreadcrumbItems([]);
                getNodes(entity);
            }}>
                                        清空
                                    </Button>
                                </>) : (<Text type="secondary">请先选择结点</Text>)}
                        </Space>
                    </Space>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Text style={{ fontSize: 16 }}>结点</Text>
                            <Row gutter={24}>
                                <Col span={2}>
                                    <Text style={{ whiteSpace: 'nowrap' }}>外键</Text>
                                </Col>
                                <Col span={22}>
                                    <Space wrap>
                                        {entityDNode.map((ele) => (<Tag style={{ cursor: 'pointer' }} color="processing" bordered={false} onClick={() => {
                if (checkSelectRelation()) {
                    return;
                }
                breadcrumbItems.push(ele);
                setBreadcrumbItems(breadcrumbItems);
                const path = breadcrumbItems.join('.');
                const entity = resolveP(path);
                getNodes(entity);
            }}>
                                                {ele}
                                            </Tag>))}
                                    </Space>
                                </Col>
                            </Row>
                            <Row gutter={24}>
                                <Col span={2}>
                                    <Text style={{ whiteSpace: 'nowrap', marginRight: 16 }}>反指结点</Text>
                                </Col>
                                <Col span={22}>
                                    <Space wrap>
                                        {entitySNode.map((ele) => (<Tag style={{ cursor: 'pointer' }} color={"cyan"} bordered={false} onClick={() => {
                if (checkSelectRelation()) {
                    return;
                }
                const preNode = breadcrumbItems[breadcrumbItems.length - 1] || entity;
                const parentEntity = preNode.includes('$') ? preNode.split('$')[0] : preNode;
                breadcrumbItems.push(`${ele}$${parentEntity}`);
                setBreadcrumbItems(breadcrumbItems);
                getNodes(ele);
            }}>
                                                {ele}
                                            </Tag>))}
                                    </Space>
                                </Col>
                            </Row>
                        </Space>
                    </Space>
                    <ActionAuthList oakPath="$actionAuthList-cpn" entity={entity} path={breadcrumbItems.join('.')} onClose={() => {
            setBreadcrumbItems([]);
            setOpen(false);
        }} oakAutoUnmount={true}/>
                </Space>
            </Modal>
        </Space>);
}
