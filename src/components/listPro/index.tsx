import React, { createContext, useEffect, useMemo, useState } from 'react';
import { TableProps, PaginationProps } from 'antd';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import {
    OakAbsAttrDef,
    onActionFnDef,
    OakExtraActionProps,
    ListButtonProps,
    ED,
    OakAbsAttrJudgeDef,
} from '../../types/AbstractComponent';
import { translateAttributes } from '../../utils/usefulFn';
import { RowWithActions, ReactComponentProps } from '../../types/Page';
import List from '../list';
import ToolBar from '../list/toolBar';
import ButtonGroup from '../list/buttonGroup';
import Style from './index.module.less';
import { useWidth } from '../../platforms/web/responsive/useWidth';
import { useFeatures } from '../../platforms/web';
import { Locales } from '../../features/locales';

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
        onChange: (
            selectedRowKeys: string[],
            row: RowWithActions<ED2, T>[],
            info?: { type: 'single' | 'multiple' | 'none' }
        ) => void;
    };
    disableSerialNumber?: boolean; //是否禁用序号 默认启用
};

export type TableAttributeType = {
    attribute: OakAbsAttrJudgeDef;
    show: boolean;
    disabled?: boolean;
    disableCheckbox?: boolean;
};

export const TableContext = createContext<{
    tableAttributes: TableAttributeType[] | undefined;
    entity: keyof ED | undefined;
    schema: StorageSchema<ED> | undefined;
    setTableAttributes:
        | ((attributes: TableAttributeType[]) => void)
        | undefined;
    setSchema: ((schema: any) => void) | undefined;
    onReset: (() => void) | undefined; // 重置tableAttributes为传入的attributes
}>({
    tableAttributes: undefined,
    entity: undefined,
    schema: undefined,
    setTableAttributes: undefined,
    setSchema: undefined,
    onReset: undefined,
});

const ProList = <ED2 extends ED, T extends keyof ED2>(props: Props<ED2, T>) => {
    const {
        title,
        buttonGroup,
        entity,
        extraActions,
        onAction,
        disabledOp,
        attributes,
        data,
        loading,
        tablePagination,
        rowSelection,
        onReload,
        disableSerialNumber,
    } = props;
    const features = useFeatures<{
        locales: Locales<any, any, any, any>;
    }>();

    const [tableAttributes, setTableAttributes] = useState<
        TableAttributeType[]
    >([]);
    const [schema, setSchema] = useState(undefined);
    const width = useWidth();
    const isMobile = width === 'xs';

    const initTableAttributes = () => {
        if (schema) {
            const judgeAttributes = translateAttributes(
                schema,
                entity as string,
                attributes
            );
            const newTableAttributes: TableAttributeType[] =
                judgeAttributes.map((ele) => ({
                    attribute: ele,
                    show: true,
                }));
            if (tablePagination && !disableSerialNumber) {
                // 存在分页配置 启用#序号
                newTableAttributes.unshift({
                    attribute: {
                        path: '#',
                        attribute: {
                            label: '#',
                            path: '#',
                        },
                        attrType: 'number',
                        attr: '#',
                        entity: entity as string,
                    },
                    show: true,
                    disabled: true,
                    disableCheckbox: true,
                });
            }
            setTableAttributes(newTableAttributes);
        }
    };

    useEffect(() => {
        initTableAttributes();
    }, [attributes, schema]);

    const showTotal: PaginationProps['showTotal'] = (total) => {
        const totalStr = features.locales.t('total number of rows');
        return `${totalStr}：${total > 999 ? `${total} +` : total}`;
    };

    return (
        <TableContext.Provider
            value={{
                tableAttributes,
                entity: entity as string,
                schema,
                setTableAttributes,
                setSchema,
                onReset: () => {
                    initTableAttributes();
                },
            }}
        >
            <div className={Style.container}>
                {!isMobile && (
                    <ToolBar
                        title={title}
                        buttonGroup={buttonGroup}
                        reload={() => {
                            onReload && onReload();
                        }}
                    />
                )}
                {isMobile && <ButtonGroup items={buttonGroup} />}
                <List
                    entity={entity}
                    extraActions={extraActions}
                    onAction={onAction}
                    disabledOp={disabledOp}
                    attributes={attributes}
                    data={
                        !disableSerialNumber
                            ? data?.map((ele, index) => {
                                  if (tablePagination) {
                                      const total = tablePagination.total || 0;
                                      const pageSize =
                                          tablePagination.pageSize || 20; //条数
                                      const current =
                                          tablePagination.current || 1; //当前页
                                      (ele as any)['#'] =
                                          pageSize * (current - 1) +
                                          (index + 1);
                                  }
                                  return ele;
                              })
                            : data
                    }
                    loading={loading}
                    tablePagination={Object.assign(
                        {
                            showTotal,
                        },
                        tablePagination
                    )}
                    rowSelection={rowSelection}
                />
            </div>
        </TableContext.Provider>
    );
};

export default ProList;
