import { Table, Checkbox, Button, Row, Radio, Col, Typography, Space, Modal, Badge, Tag } from 'antd';
const { Title, Text } = Typography;
import { RowWithActions, WebComponentProps } from '../../../types/Page';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { difference, intersection, isEqual } from 'oak-domain/lib/utils/lodash';
import { useState, useEffect } from 'react';
import ActionAuthListSingle from '../../../components/relation/single';

type ED = EntityDict & BaseEntityDict;


export default function render(
    props: WebComponentProps<
        ED,
        'actionAuth',
        true,
        {
            cascadeEntityActions: Array<{
                path:any;
                relations: ED['relation']['Schema'][];
                actionAuths?: ED['actionAuth']['Schema'][];
            }>;
            actions: string[];
            entity: keyof EntityDict;
        },
        {
            onChange: (checked: boolean, relationId: string, path: string, actionAuth?: ED['actionAuth']['Schema'][]) => void;
            confirm: () => void;
        }
    >
) {
    const { cascadeEntityActions, oakDirty, actions, entity } = props.data;
    const { onChange, t, clean, confirm } = props.methods;
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
                                            (r) => {
                                                let checked = false, indeterminate = false;
                                                // filter出对应path的actionAuth来决定relation的check
                                                // sort deActions长的在后，不然会影响checked
                                                const actionAuthsByPath = actionAuths?.filter((ele) => false/* for compile ele.paths.includes(path[1])*/)
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
                                    }
                                </div>
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
        </Space>
    );
}