import { Table, Checkbox, Button, Row, Radio, Col } from 'antd';
import { RowWithActions, WebComponentProps } from '../../../types/Page';
import { AuthCascadePath, EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';

type ED = EntityDict & BaseEntityDict;

export default function render(
    props: WebComponentProps<
        ED,
        'directRelationAuth',
        true,
        {
            paths: AuthCascadePath<ED>[];
            directRelationAuths?: ED['directRelationAuth']['OpSchema'][];
            relationId: string;
        },
        {
            onChange: (checked: boolean, path: AuthCascadePath<ED>, directRelationAuth?: ED['directRelationAuth']['OpSchema']) => void;
            confirm: () => void;
        }
    >
) {
    const { paths, directRelationAuths, relationId, oakDirty } = props.data;
    const { onChange, confirm, t, clean } = props.methods;

    return (
        <>
            <Table
                columns={[
                    {
                        key: '2',
                        title: t('directActionAuth:attr.sourceEntity'),
                        width: 100,
                        render: (value, record) => {
                            return record[2];
                        },
                    },
                    {
                        key: '1',
                        title: t('directActionAuth:attr.path'),
                        width: 200,
                        render: (value, record) => {
                            return record[1];
                        },
                    },
                    {
                        fixed: 'right',
                        title: t('authority'),
                        key: 'operation',
                        width: 300,
                        render: (value, record) => {
                            const hasDra = !!directRelationAuths?.find(
                                (daa) => !daa.$$deleteAt$$ && daa.path === record[1] && daa.destRelationId === relationId
                            );
                            return (
                                <Checkbox
                                    disabled={!relationId}
                                    checked={hasDra}
                                    onChange={({ target }) => {
                                        const { checked } = target;
                                        const dra = directRelationAuths?.find(
                                            (daa) => daa.path === record[1]
                                        );

                                        onChange(checked, record, dra);
                                    }}
                                >
                                    {t('allowed')}
                                </Checkbox>
                            )
                        }
                    }
                ]}
                dataSource={paths}
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
    )
}