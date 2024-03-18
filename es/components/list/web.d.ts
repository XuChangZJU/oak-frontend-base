import React from 'react';
import { RowWithActions, WebComponentProps } from '../../types/Page';
import { onActionFnDef, OakExtraActionProps, ED } from '../../types/AbstractComponent';
import { DataType } from 'oak-domain/lib/types/schema/DataTypes';
export default function Render(props: WebComponentProps<ED, keyof ED, false, {
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
