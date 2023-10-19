import { Table, Checkbox, Button, Row, Radio, Col, Typography, Space, Modal, Badge, Tag } from 'antd';
const { Title, Text } = Typography;
import { RowWithActions, WebComponentProps } from '../../../types/Page';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { difference, intersection, isEqual } from 'oak-domain/lib/utils/lodash';
import { useState, useEffect } from 'react';
import ActionAuthListSingle from '../../relation/single';

type ED = EntityDict & BaseEntityDict;


export default function render(
    props: WebComponentProps<
        ED,
        'actionAuth',
        true,
        {
            cascadeEntityActions: Array<{
                path: any;
                relations: ED['relation']['Schema'][];
                actionAuths?: ED['actionAuth']['Schema'][];
            }>;
            actionAuthList: Array<{
                paths: string[];
                sourceEntity: string;
                relations: ED['actionAuth']['Schema'][],
                relationSelections: Array<{ id: string, name: string }>
            }>;
            actions: string[];
            entity: keyof EntityDict;
        },
        {
            onChange: (checked: boolean, relationId: string, path: string, actionAuth?: ED['actionAuth']['Schema'][]) => void;
            onChange2: (checked: boolean, relationId: string, paths: string[], actionAuths: ED['actionAuth']['Schema'][], actionAuth?: ED['actionAuth']['Schema']) => void;
            confirm: () => void;
        }
    >
) {
    const { cascadeEntityActions, oakDirty, actions, entity, actionAuthList } = props.data;
    const { onChange, t, clean, confirm, onChange2 } = props.methods;
    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <ActionAuthListSingle entity={entity} />
            <Table
                columns={[
                    {
                        key: '1',
                        title: '源对象',
                        width: 100,
                        render: (value, record) => {
                            const { sourceEntity } = record;
                            return sourceEntity;
                        },
                    },
                    {
                        key: '1',
                        title: '路径',
                        width: 200,
                        render: (value, record) => {
                            const { paths } = record;
                            return paths.map((ele, index) => {
                                if (index === 0) {
                                    return ele;
                                } else {
                                    return <><br />{ele}</>
                                }
                            })
                        },
                    },
                    {
                        fixed: 'right',
                        title: '相关角色',
                        key: 'operation',
                        width: 300,
                        render: (value, record) => {
                            // const { relations, actionAuths, path } = record;
                            const { relations, relationSelections } = record;
                            return (
                                <div style={{
                                    width: '100%',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                }}>
                                    {/* {
                                        relations?.map(
                                            (r) => {
                                                let checked = false, indeterminate = false;
                                                // filter出对应path的actionAuth来决定relation的check
                                                // sort deActions长的在后，不然会影响checked
                                                const actionAuthsByPath = actionAuths?.filter((ele) => ele.paths.includes(path[1]))
                                                    .sort((a, b) => b.deActions.length - a.deActions.length);
                                                if (actionAuthsByPath && actions.length > 0) {
                                                    for (const aa of actionAuthsByPath) {
                                                        // 1.relationId相同，deActions也要相同
                                                        // 如果path中存在多对一的情况要使用name进行判断
                                                        if (!aa.$$deleteAt$$ && (aa.relationId === r.id
                                                            || (record.path.includes('$') && aa.relation?.name === r.name))
                                                        ) {
                                                            const { deActions } = aa;
                                                            checked = difference(actions, deActions).length === 0;
                                                            indeterminate = !checked && intersection(actions, deActions).length > 0;
                                                            break;
                                                        }
                                                    }
                                                }
                                                return (
                                                    <Checkbox
                                                        disabled={actions.length === 0}
                                                        checked={checked}
                                                        indeterminate={indeterminate}
                                                        onChange={({ target }) => {
                                                            const { checked } = target;
                                                            const actionAuths2 = actionAuths?.filter(
                                                                ele => ele.relationId === r.id || (record.path.includes('$') && ele.relation?.name === r.name)
                                                            );

                                                            onChange(checked, r.id, path[1], actionAuths2)
                                                        }}
                                                    >
                                                        {r.name}
                                                    </Checkbox>
                                                )
                                            }
                                        )
                                    } */}
                                    {
                                        relationSelections.map(
                                            (ele) => {
                                                let checked = false, indeterminate = false;
                                                if (actions && actions.length > 0) {
                                                    const relation = relations.find((ele2) => ele2.relationId === ele.id && !ele2.$$deleteAt$$);
                                                    if (relation) {
                                                        const { deActions } = relation;
                                                        checked = difference(actions, deActions).length === 0;
                                                        indeterminate = !checked && intersection(actions, deActions).length > 0;
                                                    }
                                                }
                                                return <Checkbox
                                                    disabled={actions.length === 0}
                                                    checked={checked}
                                                    indeterminate={indeterminate}
                                                    onChange={({ target }) => {
                                                        onChange2(target.checked, ele.id, record.paths, relations);
                                                    }}
                                                >
                                                    {ele.name}
                                                </Checkbox>
                                            }
                                        )

                                    }
                                </div>
                            )
                        }
                    }
                ]}
                dataSource={actionAuthList}
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
        </Space>
    );
}