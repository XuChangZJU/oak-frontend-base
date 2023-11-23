import React from 'react';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { RowWithActions, WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { onActionFnDef, OakExtraActionProps } from '../../types/AbstractComponent';
import { DataType } from 'oak-domain/lib/types/schema/DataTypes';
type ED = EntityDict & BaseEntityDict;
export default function Render(props: WebComponentProps<EntityDict & BaseEntityDict, keyof EntityDict, false, {
    entity: string;
    extraActions: OakExtraActionProps[];
    mobileData: {
        data: {
            label: string;
            value: string | string[];
            type: DataType | 'ref' | 'image';
        }[];
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
}, {}>): React.JSX.Element;
export {};
