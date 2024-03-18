import React, { useState } from 'react';
import { Row, Col, Tabs, Checkbox } from 'antd';
import { Typography } from 'antd';
import ActionAuth from '../actionAuth';
import Styles from './web.pc.module.less';
const { Title, Text } = Typography;
export default function render(props) {
    const { oakFullpath, entity, actions, checkedActions, hasDirectActionAuth, hasDirectRelationAuth, dras, daas, relationIds, relations, deduceRelationAttr, } = props.data;
    const { onActionsSelected, onRelationsSelected, t } = props.methods;
    const [tab, setTab] = useState('actionAuth');
    const items = deduceRelationAttr
        ? [
            {
                label: 'deduceRelation',
                key: 'deduceRelation',
                children: (<div style={{
                        width: '100%',
                        height: '100%',
                        minHeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                          对象的actionAuth已被deduce到[
                          <b>{deduceRelationAttr}</b>]属性上
                      </div>),
            },
        ]
        : [
            {
                label: 'actionAuth',
                key: 'actionAuth',
                children: (<ActionAuth entity={entity} oakPath={oakFullpath && `${oakFullpath}.actionAuths`} actions={checkedActions}/>),
            },
        ];
    /* if (hasDirectActionAuth) {
        items.push(
            {
                label: 'directActionAuth',
                key: 'directActionAuth',
                children: (
                    <Table
                        columns={[
                            {
                                key: '2',
                                title: t('sourceEntity'),
                                width: 100,
                                render: (value, record) => {
                                    return record[2];
                                },
                            },
                            {
                                key: '1',
                                title: t('path'),
                                width: 200,
                                render: (value, record) => {
                                    return record[1];
                                },
                            },
                        ]}
                        dataSource={daas}
                        pagination={false}
                    />
                )
            }
        );
    } */
    // if (relations?.length > 0) {
    //     items.push(
    //         {
    //             label: 'relationAuth',
    //             key: 'relationAuth',
    //             children: (
    //                 <RelationAuth
    //                     entity={entity}
    //                     oakPath={oakFullpath && `${oakFullpath}.relationAuths`}
    //                     relationIds={relationIds}
    //                 />
    //             )
    //         }
    //     );
    // }
    const ActionSelector = actions && (<Row style={{ width: '100%' }} justify="center" align="middle">
            <Text strong>{t('action')}:</Text>
            <Row style={{ flex: 1, marginLeft: 10 }} justify="start" align="middle" wrap>
                <Checkbox.Group options={actions} value={checkedActions} onChange={(value) => onActionsSelected(value)} style={{
            display: 'flex',
            flexWrap: 'wrap',
        }}/>
            </Row>
        </Row>);
    const RelationSelector = relations && (<Row style={{ width: '100%' }} justify="center" align="middle">
            <Text strong>{t('relation')}:</Text>
            <Row style={{ flex: 1, marginLeft: 10 }} justify="start" align="middle" wrap>
                <Checkbox.Group options={relations.map((ele) => ({
            label: ele.name,
            value: ele.id,
        }))} value={relationIds} onChange={(value) => onRelationsSelected(value)} style={{
            display: 'flex',
            flexWrap: 'wrap',
        }}/>
            </Row>
        </Row>);
    const showActionSelector = ['actionAuth', 'directActionAuth'].includes(tab);
    const showRelationSelector = [
        'relationAuth',
        'directRelationAuth',
    ].includes(tab);
    return (<div className={Styles.container}>
            <Row justify="center" style={{ margin: 20, padding: 10, minHeight: 100 }} align="middle">
                <Col span={8}>
                    <Row style={{ width: '100%' }} justify="center" align="middle">
                        <Text strong>{t('actionAuth:attr.destEntity')}:</Text>
                        <Text code style={{ marginLeft: 10 }}>
                            {entity}
                        </Text>
                    </Row>
                </Col>
                <Col span={12}>
                    {showActionSelector
            ? ActionSelector
            : showRelationSelector && RelationSelector}
                </Col>
            </Row>
            <Tabs defaultActiveKey="1" type="card" size="large" items={items} onChange={(key) => setTab(key)}/>
        </div>);
}
