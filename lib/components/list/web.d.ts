import React from 'react';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { RowWithActions, WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { onActionFnDef } from '../../types/AbstractComponent';
declare type ED = EntityDict & BaseEntityDict;
export default function Render(props: WebComponentProps<EntityDict & BaseEntityDict, keyof EntityDict, false, {
    entity: string;
    extraActions: string[];
    mobileData: {
        title: any;
        rows: {
            label: string;
            value: string;
        }[];
        state: {
            color: string;
            value: string;
        };
        record: any;
    }[];
    onAction?: onActionFnDef;
    disabledOp: boolean;
    rowSelection?: {
        type: 'checkbox' | 'radio';
        selectedRowKeys?: React.Key[];
        onChange: (selectedRowKeys: React.Key[], row: RowWithActions<ED, keyof ED>[], info?: {
            type: 'single' | 'multiple' | 'none';
        }) => void;
    };
}, {}>): JSX.Element;
export {};
