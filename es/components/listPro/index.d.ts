import React from 'react';
import { TableProps } from 'antd';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { OakAbsAttrDef, onActionFnDef, OakExtraActionProps, ListButtonProps, ED, OakAbsAttrJudgeDef } from '../../types/AbstractComponent';
import { RowWithActions } from '../../types/Page';
type Props<ED2 extends ED, T extends keyof ED2> = {
    title?: string;
    buttonGroup?: ListButtonProps[];
    onReload?: () => void;
    entity: T;
    extraActions?: OakExtraActionProps[] | ((row: any) => OakExtraActionProps[]);
    onAction?: onActionFnDef;
    disabledOp?: boolean;
    attributes: OakAbsAttrDef[];
    data: RowWithActions<ED2, T>[];
    loading?: boolean;
    tablePagination?: TableProps<RowWithActions<ED2, T>[]>['pagination'];
    rowSelection?: {
        type: 'checkbox' | 'radio';
        selectedRowKeys?: string[];
        onChange: (selectedRowKeys: string[], row: RowWithActions<ED2, T>[], info?: {
            type: 'single' | 'multiple' | 'none';
        }) => void;
    };
    disableSerialNumber?: boolean;
};
export type TableAttributeType = {
    attribute: OakAbsAttrJudgeDef;
    show: boolean;
    disabled?: boolean;
    disableCheckbox?: boolean;
};
export declare const TableContext: React.Context<{
    tableAttributes: TableAttributeType[] | undefined;
    entity: keyof ED | undefined;
    schema: StorageSchema<ED> | undefined;
    setTableAttributes: ((attributes: TableAttributeType[]) => void) | undefined;
    setSchema: ((schema: any) => void) | undefined;
    onReset: (() => void) | undefined;
}>;
declare const ProList: <ED2 extends ED, T extends keyof ED2>(props: Props<ED2, T>) => React.JSX.Element;
export default ProList;
