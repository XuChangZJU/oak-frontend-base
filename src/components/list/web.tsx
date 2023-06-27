import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Spin } from 'antd';
import type { ColumnsType, ColumnType, ColumnGroupType } from 'antd/es/table';
import ActionBtn from '../actionBtn';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { ActionDef, RowWithActions, WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import styles from './mobile.module.less';
import { Checkbox } from 'antd-mobile'
import classnames from 'classnames';
import { CascadeActionProps, onActionFnDef, OakExtraActionProps } from '../../types/AbstractComponent';
type ED = EntityDict & BaseEntityDict;

type CascadeActionDef = {
    [K in keyof EntityDict[keyof EntityDict]['Schema']]?: ActionDef<EntityDict & BaseEntityDict, keyof EntityDict>[];
}

export default function Render(
    props: WebComponentProps<
        EntityDict & BaseEntityDict,
        keyof EntityDict,
        false,
        {
            entity: string;
            extraActions: OakExtraActionProps[];
            mobileData: {
                title: any;
                rows: { label: string; value: string }[];
                state: { color: string; value: string };
                record: any,
            }[];
            onAction?: onActionFnDef;
            disabledOp: boolean;
            rowSelection?: {
                type: 'checkbox' | 'radio',
                selectedRowKeys?: React.Key[],
                onChange: (selectedRowKeys: React.Key[], row: RowWithActions<ED, keyof ED>[], info?: { type: 'single' | 'multiple' | 'none' }) => void,
            },
        },
        {
        }
    >
) {
    const { methods, data } = props;
    const { t } = methods;
    const {
        oakLoading,
        entity,
        extraActions,
        mobileData,
        onAction,
        disabledOp = false,
        rowSelection
    } = data;
    const useSelect = !!rowSelection?.type;
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    return (
        <div className={styles.container}>
            {oakLoading ? (
                <div className={styles.loadingView}>
                    <Spin size='large' />
                </div>
            ) : (
                <>
                    {mobileData && mobileData.map((ele) => (
                        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            {useSelect && (
                                <Checkbox
                                    checked={selectedRowKeys.includes(ele.record.id)}
                                    onChange={(checked) => {
                                        if (checked) {
                                            selectedRowKeys.push(ele.record.id);
                                            setSelectedRowKeys([...selectedRowKeys]);
                                        }
                                        else {
                                            const index = selectedRowKeys.findIndex((ele2) => ele2 === ele.record.id);
                                            selectedRowKeys.splice(index, 1);
                                            setSelectedRowKeys([...selectedRowKeys]);
                                        }
                                    }}
                                />
                            )}
                            <div className={styles.card} onClick={() => {
                                const index = selectedRowKeys.findIndex((ele2) => ele2 === ele.record?.id);
                                let keys = selectedRowKeys;
                                if (rowSelection?.type === 'checkbox') {
                                    if (index !== -1) {
                                        keys.splice(index, 1)
                                    }
                                    else {
                                        keys.push(ele.record?.id)
                                    }
                                    setSelectedRowKeys([...selectedRowKeys]);
                                }
                                else {
                                    keys = [ele.record?.id];
                                    setSelectedRowKeys([ele.record?.id])
                                }
                                rowSelection?.onChange && rowSelection?.onChange(keys, ele.record, {type: rowSelection.type === 'checkbox' ? 'multiple' : 'single'});
                            }}>
                                {ele.title && (
                                    <div className={styles.titleView}>
                                        <div className={styles.title}>
                                            {ele.title}
                                        </div>
                                        {ele.state && (
                                            <div className={styles.stateView}>
                                                <div className={classnames(styles.badge, styles[ele.state.color])}></div>
                                                <div>
                                                    {ele.state.value}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className={styles.cardContent}>
                                    {ele.rows && ele.rows.map((row) => (
                                        <div className={styles.textView}>
                                            <div className={styles.label}>
                                                {row.label}
                                            </div>
                                            <div className={styles.value}>
                                                {row.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {!disabledOp && (
                                    <div style={{ display: 'flex', alignItems: 'center', padding: 10 }}>
                                        <ActionBtn
                                            entity={entity}
                                            extraActions={extraActions}
                                            actions={ele.record?.['#oakLegalActions']}
                                            cascadeActions={ele.record?.['#oakLegalCascadeActions']}
                                            onAction={(action: string, cascadeAction: CascadeActionProps) => onAction && onAction(ele.record, action, cascadeAction)}
                                        />
                                    </div>
                                )}
                            </div> 
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}
