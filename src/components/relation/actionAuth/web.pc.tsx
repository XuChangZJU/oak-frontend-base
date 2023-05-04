import { Table, Checkbox, Button, Row, Radio, Col } from 'antd';
import { Typography } from 'antd';
const { Title, Text } = Typography;
import { RowWithActions, WebComponentProps } from '../../../types/Page';
import { AuthCascadePath, EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import assert from 'assert';

type ED = EntityDict & BaseEntityDict;

export default function render(
    props: WebComponentProps<
        ED,
        'actionAuth',
        true,
        {
            entity: string;
            actions: string[];
            action: string;
            cascadeEntityActions: Array<{
                path: AuthCascadePath<ED>;
                relations: ED['relation']['Schema'][];
                actionAuths?: ED['actionAuth']['OpSchema'][];
            }>;
        },
        {
            onChange: (checked: boolean, relationId: string, path: string, actionAuth?: ED['actionAuth']['OpSchema']) => void;
            confirm: () => void;
            onActionSelected: (action: string) => void;
        }
    >
) {
    const { cascadeEntityActions, oakDirty, entity, action, actions } = props.data;
    const { onChange, t, clean, confirm, onActionSelected } = props.methods;

    return (
        <>
            <Row justify="center" style={{ margin: 20, padding: 10 }}>
                <Col span={8}>
                    <Row style={{ width: '100%' }} justify="center" align="middle">
                        <Title level={4}>目标对象：</Title>
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
            <Table
                columns={[
                    {
                        key: '1',
                        title: '源对象',
                        width: 100,
                        render: (value, record) => {
                            const { path } = record;
                            return path[2];
                        },
                    },
                    {
                        key: '1',
                        title: '路径',
                        width: 200,
                        render: (value, record) => {
                            const { path } = record;
                            return path[1];
                        },
                    },
                    {
                        fixed: 'right',
                        title: '相关角色',
                        key: 'operation',
                        width: 300,
                        render: (value, record) => {
                            const { relations, actionAuths, path } = record;
                            return (
                                <div style={{
                                    width: '100%',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                }}>
                                    {
                                        relations?.map(
                                            (r) => (
                                                <Checkbox
                                                    disabled={!action}
                                                    checked={!!action && !!actionAuths?.find(
                                                        ele => !ele.$$deleteAt$$
                                                            && ele.relationId === r.id &&
                                                            ele.deActions.includes(action)
                                                    )}
                                                    onChange={({ target }) => {
                                                        const { checked } = target;
                                                        const actionAuth = actionAuths?.find(
                                                            ele => ele.relationId === r.id
                                                        );

                                                        onChange(checked, r.id, path[1], actionAuth)
                                                    }}
                                                >
                                                    {r.name}
                                                </Checkbox>
                                            )
                                        )
                                    }
                                </div>
                            )
                        }
                    }
                ]}
                dataSource={cascadeEntityActions}
                pagination={{
                    position: ['none', 'none'] as any,
                }}
            />
            <Row justify="end" style={{ marginTop: 20, padding: 5 }}>
                <Button
                    style={{ marginRight: 10 }}
                    type='primary'
                    disabled={!oakDirty}
                    onClick={() => confirm()}
                >
                    {t("confirm")}
                </Button>
                <Button
                    disabled={!oakDirty}
                    onClick={() => clean()}
                >
                    {t("reset")}
                </Button>
            </Row>
        </>
    );
}