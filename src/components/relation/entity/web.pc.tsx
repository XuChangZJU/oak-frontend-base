import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { Row, Radio, Col, Tabs } from 'antd';
import { Typography } from 'antd';
const { Title, Text } = Typography;
import ActionAuth from '../actionAuth';
import DirectActionAuth from '../directActionAuth';
import { WebComponentProps } from '../../../types/Page';


type ED = EntityDict & BaseEntityDict;

export default function render(props: WebComponentProps<ED, keyof ED, false, {
    entity: keyof ED;
    actions: string[];
    action: string;
    hasDirectActionAuth: boolean;
}, {
    onActionSelected: (action: string) => void;
}>) {
    const { oakFullpath, entity, actions, action, hasDirectActionAuth } = props.data;
    const { onActionSelected, t } = props.methods;

    const items = [
        {
            label: 'relationalActionAuth',
            key: '1',
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
                key: '2',
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
    return (
        <>
            <Row justify="center" style={{ margin: 20, padding: 10 }}>
                <Col span={8}>
                    <Row style={{ width: '100%' }} justify="center" align="middle">
                        <Title level={4}>{t('actionAuth:attr.destEntity')}</Title>
                        <Text code>{entity}</Text>
                    </Row>
                </Col>
                <Col span={12}>
                    <Row style={{ width: '100%' }} justify="center" align="middle" wrap>
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
                </Col>
            </Row>
            <Tabs
                defaultActiveKey="1"
                type="card"
                size="large"
                items={items}
            />
        </>
    );
}