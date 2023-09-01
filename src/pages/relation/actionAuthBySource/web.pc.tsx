import { Table, Checkbox, Button, Row } from 'antd';
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
            relationName: string;
            cascadeEntityActions: Array<{
                path: AuthCascadePath<ED>;
                actions: string[];
                actionAuth?: ED['actionAuth']['OpSchema'];
            }>;
        },
        {
            onChange: (actions: string[], path: AuthCascadePath<ED>, actionAuth?: ED['actionAuth']['OpSchema']) => void;
            confirm: () => void;
        }
    >
) {
    const { cascadeEntityActions, oakDirty, entity, relationName } = props.data;
    const { onChange, t, clean, confirm } = props.methods;

    return (
        <>
            <Row justify="center" style={{ margin: 20, padding: 10 }}>
                <Row style={{ marginRight: 10 }}>
                    <Title level={4}>当前对象：</Title>
                    <Text code>{entity}</Text>
                </Row>
                <Row>
                    <Title level={4}>当前角色：</Title>
                    <Text code>{relationName}</Text>
                </Row>
            </Row>
            <Table
                columns={[
                    {
                        key: '1',
                        title: '目标对象',
                        width: 100,
                        render: (value, record) => {
                            const { path } = record;
                            return path[0];
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
                        title: '操作',
                        key: 'operation',
                        width: 300,
                        render: (value, record) => {
                            const { actions, actionAuth, path } = record;
                            return (
                                <Checkbox.Group
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                    }}
                                    options={actions}
                                    value={actionAuth?.deActions}
                                    onChange={(value) => onChange(value as string[], path, actionAuth)}
                                />
                            )
                        }
                    }
                ]}
                dataSource={cascadeEntityActions}
                pagination={false}
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