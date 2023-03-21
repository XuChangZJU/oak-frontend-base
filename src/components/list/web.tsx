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


export default function Render(
    props: WebComponentProps<
        EntityDict & BaseEntityDict,
        keyof EntityDict,
        false,
        {
            loading: boolean;
            extraActions: string[];
            entity: string;
            schema: StorageSchema<EntityDict & BaseEntityDict>;
            columns: ColumnDefProps[],
            mobileData: AttrRender[]
            data: any;
            disabledOp: boolean;
            colorDict: ColorDict<EntityDict & BaseEntityDict>;
            handleClick?: (id: string, action: string) => void;
            tablePagination?: PaginationProps;
            onAction?: onActionFnDef;
        },
        {
        }
    >
) {
    const { methods, data: oakData } = props;
    const { t } = methods;
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
                    if (ele.type === 'tag' && value) {
                        value = t(`${ele.entity}:v.${ele.attr}.${value}`);
                        color = colorDict![ele.entity]![ele.attr]![value] as string;
                    }
                    return (<RenderCell color={color} value={value} type={ele.type} />)
                }
            }
            if (ele.width) {
                Object.assign(ele, { width: ele.width });
            }
            return column;
        })
        if (!disabledOp && tableColumns) {
                tableColumns.push({
                fixed: 'right',
                align: 'center',
                title: '操作',
                key: 'operation',
                width: 300,
                render: (value: any, row: any) => {
                    const id = row?.id;
                    const oakActions = row?.['#oakLegalActions'] as string[];
                    assert(!!oakActions, '行数据中不存在oakActions, 请禁用(disableOp:true)或添加oakActions')
                    if (extraActions && extraActions.length) {
                        oakActions.unshift(...extraActions)
                    }
                    return (
                        <ActionBtn
                            schema={schema}
                            entity={entity}
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
    return (
        <Table loading={loading} dataSource={data} scroll={{ x: 1500 }} columns={tableColumns} pagination={tablePagination} ></Table>
    );
}
