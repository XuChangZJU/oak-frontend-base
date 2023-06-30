import React from 'react';
import { OakAbsAttrDef, onActionFnDef, OakExtraActionProps, ListButtonProps, ED } from '../../types/AbstractComponent';
import { TableProps } from 'antd';
import { RowWithActions } from '../../types/Page';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
declare type Props = {
    title: string;
    buttonGroup?: ListButtonProps[];
    onReload: () => void;
    entity: keyof ED;
    extraActions?: OakExtraActionProps[];
    onAction: onActionFnDef;
    disabledOp?: boolean;
    attributes: OakAbsAttrDef[];
    data: RowWithActions<ED, keyof ED>[];
    loading: boolean;
    tablePagination?: TableProps<RowWithActions<ED, keyof ED>[]>['pagination'];
    rowSelection?: {
        type: 'checkbox' | 'radio';
        selectedRowKeys?: string[];
        onChange: (selectedRowKeys: string[], row: RowWithActions<ED, keyof ED>[], info?: {
            type: 'single' | 'multiple' | 'none';
        }) => void;
    };
};
export declare type TabelAttributeType = {
    attribute: OakAbsAttrDef;
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
declare const ProList: (props: Props) => JSX.Element;
export default ProList;
