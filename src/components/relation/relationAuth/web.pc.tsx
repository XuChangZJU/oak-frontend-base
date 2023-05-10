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
        'relationAuth',
        true,
        {
            relationId: string;
            relationAuths: ED['relationAuth']['OpSchema'][];
            auths: AuthCascadePath<ED>[];
            sourceRelations: ED['relation']['OpSchema'][];
        },
        {
            onChange: (checked: boolean, relationId: string, path: string, relationAuth?: ED['relationAuth']['OpSchema']) => void;
            confirm: () => void;
        }
    >
) {
    const { relationId, relationAuths, oakDirty, auths, sourceRelations } = props.data;
    const { onChange, t, clean, confirm } = props.methods;

    return (
        <>
            <Table
                columns={[
                    {
                        key: '1',
                        title: t('relationAuth:attr.sourceEntity'),
                        width: 100,
                        render: (value, record) => record[2],
                    },
                    {
                        key: '1',
                        title: t('relationAuth:attr.path'),
                        width: 200,
                        render: (value, record) => record[1],
                    },
                    {
                        fixed: 'right',
                        title: t('grantedRoles'),
                        key: 'roles',
                        width: 300,
                        render: (value, record) => {
                            const sourceEntity = record[2];
                            const relations = sourceRelations.filter(
                                ele => ele.entity === sourceEntity && ele.id !== relationId
                            );
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
                                                    disabled={!relationId}
                                                    checked={!!relationId && !!relationAuths?.find(
                                                        ele => !ele.$$deleteAt$$
                                                            && ele.sourceRelationId === r.id &&
                                                            ele.destRelationId === relationId &&
                                                            ele.path === record[1]
                                                            
                                                    )}
                                                    onChange={({ target }) => {
                                                        const { checked } = target;
                                                        const relationAuth = relationAuths?.find(
                                                            ele => ele.sourceRelationId === r.id &&
                                                            ele.destRelationId === relationId
                                                        );

                                                        onChange(checked, r.id, record[1], relationAuth)
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
                dataSource={auths}
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