import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { Row, Radio, Col, Tabs } from 'antd';
import { Typography } from 'antd';
const { Title, Text } = Typography;
import ActionAuth from '../actionAuth';
import DirectActionAuth from '../directActionAuth';
import FreeActionAuth from '../freeActionAuth';
import RelationAuth from '../relationAuth';
import DirectRelationAuth from '../directRelationAuth';
import { WebComponentProps } from '../../../types/Page';
import { useState } from 'react';


type ED = EntityDict & BaseEntityDict;

export default function render(props: WebComponentProps<ED, keyof ED, false, {
    entity: keyof ED;
    actions: string[];
    action: string;
    relations: ED['relation']['OpSchema'][];
    relationId: string;
    hasDirectActionAuth: boolean;
    hasDirectRelationAuth: boolean;
    deduceRelationAttr?: string;
}, {
    onActionSelected: (action: string) => void;
    onRelationSelected: (relationId: string) => void;
}>) {
    const { oakFullpath, entity, actions, action, hasDirectActionAuth, hasDirectRelationAuth, relationId, relations, deduceRelationAttr } = props.data;
    const { onActionSelected, onRelationSelected, t } = props.methods;
    const [ tab, setTab ] = useState('freeActionAuth');

    const items = deduceRelationAttr ? [
        {
            label: 'deduceRelation',
            key: 'deduceRelation',
            children: (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        minHeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    对象的actionAuth已被deduce到[<b>{deduceRelationAttr}</b>]属性上
                </div>
            )
        },
    ] : [
        {
            label: 'freeActionAuth',
            key: 'freeActionAuth',
            children: (
                <FreeActionAuth
                    entity={entity}
                    oakPath={oakFullpath && `${oakFullpath}.freeActionAuths`}
                />
            )
        },
        {
            label: 'actionAuth',
            key: 'actionAuth',
            children: (
                <ActionAuth
                    entity={entity}
                    oakPath={oakFullpath && `${oakFullpath}.actionAuths`}
                    action={action}
                />
            )
        }
    ];

    if (hasDirectActionAuth) {
        items.push(
            {
                label: 'directActionAuth',
                key: 'directActionAuth',
                children: (
                    <DirectActionAuth
                        entity={entity}
                        oakPath={oakFullpath && `${oakFullpath}.directActionAuths`}
                        action={action}
                    />
                )
            }
        );
    }

    if (relations?.length > 0) {
        items.push(
            {
                label: 'relationAuth',
                key: 'relationAuth',
                children: (
                    <RelationAuth
                        entity={entity}
                        oakPath={oakFullpath && `${oakFullpath}.relationAuths`}
                        relationId={relationId}
                    />
                )
            }
        );
    }

    if (hasDirectRelationAuth) {
        items.push(
            {
                label: 'directRelationAuth',
                key: 'directRelationAuth',
                children: (
                    <DirectRelationAuth
                        entity={entity}
                        oakPath={oakFullpath && `${oakFullpath}.directRelationAuths`}
                        relationId={relationId}
                    />
                )
            }
        );
    }

    const ActionSelector = (
        <Row style={{ width: '100%' }} justify="center" align="middle">
            <Text strong>{t('action')}:</Text>
            <Row style={{ flex: 1, marginLeft: 10 }} justify="start" align="middle" wrap>
                {
                    actions?.map(
                        (a) => (
                            <Radio
                                checked={a === action}
                                onChange={({ target }) => {
                                    if (target.checked) {
                                        onActionSelected(a);
                                    }
                                }}
                            >
                                {a}
                            </Radio>
                        )
                    )
                }
            </Row>
        </Row>
    );
    const RelationSelector = (
        <Row style={{ width: '100%' }} justify="center" align="middle">
            <Text strong>{t('relation')}:</Text>
            <Row style={{ flex: 1, marginLeft: 10 }} justify="start" align="middle" wrap>
                {
                    relations?.map(
                        (r) => (
                            <Radio
                                checked={r.id === relationId}
                                onChange={({ target }) => {
                                    if (target.checked) {
                                        onRelationSelected(r.id);
                                    }
                                }}
                            >
                                {r.name}
                            </Radio>
                        )
                    )
                }
            </Row>
        </Row>
    );
    const showActionSelector = ['actionAuth', 'directActionAuth'].includes(tab);
    const showRelationSelector = ['relationAuth', 'directRelationAuth'].includes(tab);

    return (
        <>
            <Row justify="center" style={{ margin: 20, padding: 10, minHeight: 100 }} align="middle">
                <Col span={8}>
                    <Row style={{ width: '100%' }} justify="center" align="middle">
                        <Text strong>{t('actionAuth:attr.destEntity')}:</Text>
                        <Text code style={{ marginLeft: 10 }}>{entity}</Text>
                    </Row>
                </Col>
                <Col span={12}>
                    {showActionSelector ? ActionSelector : (showRelationSelector && RelationSelector)}
                </Col>
            </Row>
            <Tabs
                defaultActiveKey="1"
                type="card"
                size="large"
                items={items}
                onChange={(key) => setTab(key)}
            />
        </>
    );
}