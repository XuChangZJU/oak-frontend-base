import React from 'react';
import { OakAbsAttrDef, onActionFnDef, OakExtraActionProps, ListButtonProps, ED, OakAbsAttrJudgeDef } from '../../types/AbstractComponent';
import { TableProps } from 'antd';
import { RowWithActions } from '../../types/Page';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
declare type Props<ED2 extends ED, T extends keyof ED2> = {
    title?: string;
    buttonGroup?: ListButtonProps[];
    onReload?: () => void;
    entity: T;
    extraActions?: OakExtraActionProps[];
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
};
export declare type TabelAttributeType = {
    attribute: OakAbsAttrJudgeDef;
    show: boolean;
};
export declare const TableContext: React.Context<{
    tableAttributes: TabelAttributeType[] | undefined;
    entity: keyof ED | undefined;
    schema: StorageSchema<ED> | undefined;
    setTableAttributes: ((attributes: TabelAttributeType[]) => void) | undefined;
    setSchema: ((schema: any) => void) | undefined;
    onReset: (() => void) | undefined;
}>;
declare const ProList: <ED2 extends ED, T extends keyof ED2>(props: Props<ED2, T>) => import("react/jsx-runtime").JSX.Element;
export default ProList;
