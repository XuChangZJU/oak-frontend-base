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
        'relationAuth',
        true,
        {
            entity: string;
            relationName: string;
            cascadeEntityRelations: Array<{
                entity: keyof ED;
                path: string;
                relations: ED['relation']['Schema'][];
                authedRelations: ED['relationAuth']['Schema'][];
            }>;
        },
        {
            onChange: (relationId: string, checked: boolean, relationAuthId?: string, path?: string) => void;
            confirm: () => void;
        }
    >
) {
    const { cascadeEntityRelations, oakDirty, entity, relationName } = props.data;
    const { onChange, t, clean, confirm } = props.methods;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            width: '100%'
        }}>
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
                        title: '对象',
                        width: 100,
                        render: (value, record) => {
                            const { entity } = record;
                            return entity;
                        },
                    },
                    {
                        key: '1',
                        title: '路径',
                        width: 200,
                        render: (value, record) => {
                            const { path } = record;
                            return path;
                        },
                    },
                    {
                        fixed: 'right',
                        title: '角色',
                        key: 'operation',
                        width: 300,
                        render: (value, record) => {
                            const { relations, authedRelations, path } = record;
                            // 可能存在定制的relation
                            const customizedRelationsAuthed: ED['relation']['Schema'][] = [];
                            const relationIdAuthed: string[] = [];
                            authedRelations.forEach(
                                (ele) => {
                                    if (!ele.$$deleteAt$$) {
                                        if (relations.find(ele2 => ele2.id === ele.destRelationId)) {
                                            relationIdAuthed.push(ele.destRelationId);
                                        }
                                        else {
                                            customizedRelationsAuthed.push(ele.destRelation!);
                                        }
                                    }
                                }
                            );

                            return (
                                <div style={{
                                    width: '100%',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                }}>
                                    {relations.map(
                                        (ele) => {
                                            const authed = relationIdAuthed.includes(ele.id);
                                            return (
                                                <Checkbox
                                                    key={ele.id!}
                                                    checked={authed}
                                                    onChange={({ target }) => {
                                                        const { checked } = target;
                                                        const relationAuth = authedRelations.find(ele2 => ele2.destRelationId === ele.id);
                                                        if (relationAuth) {
                                                            onChange(ele.id, checked, relationAuth.id);
                                                        }
                                                        else {
                                                            onChange(ele.id, checked, undefined, path);
                                                        }
                                                    }}
                                                >
                                                    {ele.display || ele.name}
                                                </Checkbox>
                                            );
                                        }
                                    )}
                                    {customizedRelationsAuthed.map(
                                        (ele) => <Checkbox
                                            key={ele.id!}
                                            checked={true}
                                            disabled={true}
                                        >
                                            {ele.display || ele.name}
                                        </Checkbox>
                                    )}
                                </div>
                            );
                        }
                    }
                ]}
                dataSource={cascadeEntityRelations}
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
        </div>
    );
}