import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Tag, TableProps, PaginationProps } from 'antd';
import type { ColumnsType, ColumnType, ColumnGroupType } from 'antd/es/table';
import assert from 'assert';
import { get } from 'oak-domain/lib/utils/lodash';
import dayjs from 'dayjs';
import ActionBtn from '../actionBtn';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ColorDict } from 'oak-domain/lib/types/Style';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { OakAbsAttrDef, ColumnDefProps, AttrRender } from '../../types/AbstractComponent';
import { OakAbsDerivedAttrDef } from '../../types/AbstractComponent';


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
            columns: ColumnDefProps[],
            mobileData: AttrRender[]
            data: any;
            disabledOp: boolean;
            colorDict: ColorDict<EntityDict & BaseEntityDict>;
            handleClick?: (id: string, action: string) => void;
            tablePagination?: PaginationProps;
        },
        {
        }
    >
) {
    const { methods, data: oakData } = props;
    const { t } = methods;
    const [tableColumns, setTabelColumns] = useState([] as ColumnsType<any>);
    const {
        oakEntity,
        data,
        columns,
        colorDict,
        disabledOp = false,
        handleClick,
        tablePagination,
    } = oakData;
    
    useEffect(() => {
        const tableColumns: ColumnsType<any> = columns.map((ele) => {
            const column = {
                dataIndex: ele.path,
                title: ele.title,
                render: (v: string, row: any) => {
                    if (v && ele.type === 'text') {
                        return <>{v}</>
                    }
                    let value = get(row, ele.path);
                    let color = 'black';
                    if (ele.type === 'tag') {
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
        if (!disabledOp) {
                tableColumns.push({
                fixed: 'right',
                align: 'center',
                title: '操作',
                key: 'operation',
                width: 300,
                render: (value: any, row: any) => {
                    const id = row?.id;
                    const oakActions = row?.oakActions;
                    assert(!!oakActions, '行数据中不存在oakActions, 请禁用(disableOp:true)或添加oakActions')
                    return (
                        <ActionBtn entity={oakEntity as string} actions={oakActions} onClick={(action: string) => handleClick && handleClick(id, action)}  />
                    )
                }
            })
        }
        setTabelColumns(tableColumns)
    }, [data])
    return (
        <Table dataSource={data} scroll={{ x: 1500 }} columns={tableColumns} pagination={tablePagination} ></Table>
    );
}
