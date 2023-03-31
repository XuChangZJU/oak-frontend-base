import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Tag, TableProps, PaginationProps } from 'antd';
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
type ED = EntityDict & BaseEntityDict;
type Width = 'xl' | 'lg' | 'md' | 'sm' | 'xs';


type RenderCellProps = {
    value: string;
    type: string;
    color: string
}

function RenderCell(props: RenderCellProps) {
    const { value, type, color } = props;
    if (!value) {
        return (<>--</>);
    }
    // 属性类型是enum要使用标签
    else if (type === 'tag') {
        return (
            <Tag color={color} >
                {value}
            </Tag>
        )
    }
    return (
        <>{value}</>
    )
}

const sizeForWidth: Record<Width,TableProps<any[]>['size']> = {
    'xl': 'large',
    'lg': 'middle',
    'md': 'small',
    'sm': 'small',
    'xs': 'small',
};

const opSizeForWidth = {
    'xl': 280,
    'lg': 260,
    'md': 200,
    'sm': 180,
    'xs': 180,
}


export default function Render(
    props: WebComponentProps<
        EntityDict & BaseEntityDict,
        keyof EntityDict,
        false,
        {
            width: 'xl' | 'lg' | 'md' | 'sm' | 'xs';
            loading: boolean;
            extraActions: string[];
            entity: string;
            schema: StorageSchema<EntityDict & BaseEntityDict>;
            columns: ColumnDefProps[],
            mobileData: AttrRender[]
            data: any[];
            disabledOp: boolean;
            colorDict: ColorDict<EntityDict & BaseEntityDict>;
            handleClick?: (id: string, action: string) => void;
            tablePagination?: PaginationProps;
            onAction?: onActionFnDef;
            rowSelection?: TableProps<any[]>['rowSelection']
            scroll?: TableProps<any[]>['scroll']
        },
        {
        }
    >
) {
    const { methods, data: oakData } = props;
    const { t } = methods;
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [tableColumns, setTabelColumns] = useState([] as ColumnsType<any>);
    const {
        loading,
        entity,
        schema,
        extraActions,
        oakEntity,
        data,
        columns,
        colorDict,
        disabledOp = false,
        handleClick,
        tablePagination,
        onAction,
        rowSelection,
        width,
        scroll,
    } = oakData;
    useEffect(() => {
        const tableColumns: ColumnsType<any> = columns && columns.map((ele) => {
            const column: ColumnType<any> = {
                dataIndex: ele.path,
                title: ele.title,
                align: 'center',
                render: (v: string, row: any) => {
                    if (v && ele.type === 'text') {
                        return <>{v}</>
                    }
                    let value = get(row, ele.path);
                    let color = 'black';
                    if (ele.type === 'tag' && !!value) {
                        assert(!!colorDict?.[ele.entity]?.[ele.attr]?.[value], `${entity}实体iState颜色定义缺失`)
                        color = colorDict![ele.entity]![ele.attr]![value] as string;
                        value = t(`${ele.entity}:v.${ele.attr}.${value}`);
                    }
                    if (ele.type === 'datetime' && !!value) {
                        value = dayjs(value).format('YYYY-MM-DD HH:mm')
                    }
                    return (<RenderCell color={color} value={value} type={ele.type} />)
                }
            }
            if (ele.width) {
                Object.assign(column, { width: ele.width });
            }
            return column;
        })
        if (!disabledOp && tableColumns) {
                tableColumns.push({
                fixed: 'right',
                align: 'center',
                title: '操作',
                key: 'operation',
                width: opSizeForWidth[width] || 300,
                render: (value: any, row: any) => {
                    const id = row?.id;
                    const oakActions = row?.['#oakLegalActions'] as string[];
                    assert(!!oakActions, '行数据中不存在#oakLegalActions, 请禁用(disableOp:true)或添加actions')
                    return (
                        <ActionBtn
                            entity={entity}
                            extraActions={extraActions}
                            actions={row?.['#oakLegalActions']}
                            cascadeActions={row?.['#oakLegalCascadeActions']}
                            onAction={(action: string, cascadeAction: CascadeActionProps) => onAction && onAction(row, action, cascadeAction)}
                        />
                    )
                }
            })
        }
        setTabelColumns(tableColumns)
    }, [data])
    console.log(tableColumns);
    return (
        <Table
            size={sizeForWidth[width]}
            rowKey="id"
            rowSelection={rowSelection?.type && {
                type: rowSelection?.type,
                selectedRowKeys,
                onChange: (selectedRowKeys, row, info) => {
                    setSelectedRowKeys(selectedRowKeys);
                    rowSelection?.onChange && rowSelection?.onChange(selectedRowKeys, row, info);
                }
            }}
            loading={loading}
            dataSource={data}
            columns={tableColumns}
            pagination={tablePagination}
            scroll={{...scroll}}
            onRow={(record) => {
                return {
                    onClick: () => {
                        const index = selectedRowKeys.findIndex((ele) => ele === record.id);
                        if (rowSelection?.type === 'checkbox') {
                            if (index !== -1) {
                                selectedRowKeys.splice(index, 1)
                            }
                            else {
                                selectedRowKeys.push(record.id)
                            }
                            setSelectedRowKeys([...selectedRowKeys]);
                        }
                        else {
                            setSelectedRowKeys([record.id])
                        }
                        const row = data.filter((ele) => selectedRowKeys.includes(ele.id));
                        rowSelection?.onChange && rowSelection?.onChange(selectedRowKeys, row, {type: 'all'});
                    }
                }
            }}
        >
        </Table>
    );
}
