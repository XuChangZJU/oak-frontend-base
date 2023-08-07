import React, {createContext, useEffect, useMemo, useState} from 'react';

import { Space, Tag, Tooltip, Typography } from 'antd';

import { OakAbsAttrDef, onActionFnDef, OakExtraActionProps, ListButtonProps, ED } from '../../types/AbstractComponent';

import { TableProps, PaginationProps } from 'antd';
import { RowWithActions, ReactComponentProps } from '../../types/Page';
import List from '../list';
import ToolBar from '../list/toolBar';
import ButtonGroup from '../list/buttonGroup';
import Style from './index.module.less';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { useWidth } from '../../platforms/web/responsive/useWidth';
import { useTranslation } from 'react-i18next';

type Props<ED2 extends ED, T extends keyof ED2> = {
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
    tablePagination?: TableProps<
        RowWithActions<ED2, T>[]
    >['pagination'];
    rowSelection?: {
        type: 'checkbox' | 'radio';
        selectedRowKeys?: string[];
        onChange: (
            selectedRowKeys: string[],
            row: RowWithActions<ED2, T>[],
            info?: { type: 'single' | 'multiple' | 'none' }
        ) => void;
    };
}

export type TabelAttributeType = {
    attribute: OakAbsAttrDef,
    show: boolean;
}

export const TableContext = createContext<{
    tableAttributes: TabelAttributeType[] | undefined,
    entity: keyof ED | undefined,
    schema: StorageSchema<ED> | undefined,
    setTableAttributes: ((attributes: TabelAttributeType[]) => void) | undefined,
    setSchema: ((schema: any) => void) | undefined,
    onReset: (() => void) | undefined, // 重置tableAttributes为传入的attributes
}>({
    tableAttributes: undefined,
    entity: undefined,
    schema: undefined,
    setTableAttributes: undefined,
    setSchema: undefined,
    onReset: undefined,
})

const ProList = <ED2 extends ED, T extends keyof ED2>(props: Props<ED2, T>) => {
    const {
        title, buttonGroup, entity, extraActions, onAction, disabledOp, attributes,
        data, loading, tablePagination, rowSelection, onReload,
    } = props;
    const [tableAttributes, setTableAttributes] = useState<TabelAttributeType[]>([]);
    useEffect(() => {
        const newTabelAttributes: TabelAttributeType[] = attributes.map((ele) => ({attribute: ele, show: true}))
        setTableAttributes(newTabelAttributes)
    }, [attributes])
    const [schema, setSchema] = useState(undefined);
    const width = useWidth();
    const isMobile = width === 'xs';
    const { t } = useTranslation();

    return (
        <TableContext.Provider
            value={{
                tableAttributes,
                entity: entity as string,
                schema,
                setTableAttributes,
                setSchema,
                onReset: () => {
                    const newTableAttr: TabelAttributeType[] = attributes.map((ele) => ({ attribute: ele, show: true }));
                    setTableAttributes(newTableAttr);
                }
            }}>
            <div className={Style.listContainer}>
                {!isMobile && (
                    <ToolBar
                        title={title || (t(`${entity as string}:name`) + t('list'))}
                        buttonGroup={buttonGroup}
                        reload={() => {
                            onReload && onReload();
                        }}
                    />
                )}
                {isMobile && (
                    <ButtonGroup
                        items={buttonGroup}
                    />
                )}
                <List
                    entity={entity}
                    extraActions={extraActions}
                    onAction={onAction}
                    disabledOp={disabledOp}
                    attributes={attributes}
                    data={data}
                    loading={loading}
                    tablePagination={tablePagination}
                    rowSelection={rowSelection}
                />
            </div>
        </TableContext.Provider>
    )
}

export default ProList;