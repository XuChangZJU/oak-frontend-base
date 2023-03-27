import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Spin } from 'antd';
import type { ColumnsType, ColumnType, ColumnGroupType } from 'antd/es/table';
import assert from 'assert';
import { get } from 'oak-domain/lib/utils/lodash';
import dayjs from 'dayjs';
import ActionBtn from '../actionBtn';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { ActionDef, WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ColorDict } from 'oak-domain/lib/types/Style';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { OakAbsAttrDef, ColumnDefProps, AttrRender, onActionFnDef, CascadeActionProps } from '../../types/AbstractComponent';
import { Action, CascadeActionItem } from 'oak-domain/lib/types';
import { Schema } from 'oak-domain/lib/base-app-domain/UserEntityGrant/Schema';
import styles from './mobile.module.less';
import classnames from 'classnames';
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
            extraActions: string[];
            mobileData: {
                title: any;
                rows: { label: string; value: string }[];
                state: { color: string; value: string };
                record: any,
            }[];
            onAction?: onActionFnDef;
            disabledOp: boolean;
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
    } = data;
    return (
        <div className={styles.container}>
            {oakLoading ? (
                <div className={styles.loadingView}>
                    <Spin size='large' />
                </div>
            ) : (
                <>
                    {mobileData && mobileData.map((ele) => (
                        <div className={styles.card}>
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
                    ))}
                </>
            )}
        </div>
    );
}
