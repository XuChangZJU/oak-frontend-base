import { Table, Checkbox, Button, Row, Radio, Col } from 'antd';
import { RowWithActions, WebComponentProps } from '../../../types/Page';
import { AuthCascadePath, EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';

type ED = EntityDict & BaseEntityDict;

export default function render(
    props: WebComponentProps<
        ED,
        'directActionAuth',
        true,
        {
            paths: AuthCascadePath<ED>[];
            directActionAuths?: ED['directActionAuth']['OpSchema'][];
            action: string;
        },
        {
            onChange: (checked: boolean, path: AuthCascadePath<ED>, directActionAuth?: ED['directActionAuth']['OpSchema']) => void;
            confirm: () => void;
        }
    >
) {
    const { paths, directActionAuths, action, oakDirty } = props.data;
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
                            const hasDaa = !!directActionAuths?.find(
                                (daa) => !daa.$$deleteAt$$ && daa.path === record[1] && daa.deActions.includes(action)
                            );
                            return (
                                <Checkbox
                                    disabled={!action}
                                    checked={hasDaa}
                                    onChange={({ target }) => {
                                        const { checked } = target;
                                        const daa = directActionAuths?.find(
                                            (daa) => daa.path === record[1]
                                        );

                                        onChange(checked, record, daa);
                                    }}
                                >
                                    {t('allowed')}
                                </Checkbox>
                            )
                        }
                    }
                ]}
                dataSource={paths}
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
    )
}