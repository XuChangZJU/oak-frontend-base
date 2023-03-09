import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Tag, TableProps } from 'antd';
import type { ColumnsType, ColumnType, ColumnGroupType } from 'antd/es/table';
import assert from 'assert';
import { getAttributes, resolutionPath } from '../../utils/usefulFn';
import { get } from 'oak-domain/lib/utils/lodash';
import dayjs from 'dayjs';
import ActionBtnPanel from '../actionBtnPanel';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ColorDict } from 'oak-domain/lib/types/Style';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { OakAbsAttrDef, ColumnDefProps, AttrRender } from '../../types/AbstractComponent';
import { OakAbsFullAttrDef } from '../../types/AbstractComponent';


type RenderCellProps = {
    entity: string | number;
    attr: string;
    value: string;
    type: string;
    colorDict: string
    t: (key: string) => string;
}

function RenderCell(props: RenderCellProps) {
    const { value, type, entity, color } = props;
    if (!value) {
        return (<div>--</div>);
    }
    // 属性类型是enum要使用标签
    else if (type === 'tag') {
        return (
            <Tag color={color} >
                {value}
            </Tag>
        )
    }
    else if (attrType === 'datetime') {
        return <div>{dayjs(value).format('YYYY-MM-DD HH:mm')}</div>
    }
    return (
        <div>{value}</div>
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
            colorDict: ColorDict<EntityDict & BaseEntityDict>
        },
        {
        }
    >
) {
    const { methods, data: oakData } = props;
    const { t } = methods;
    const [tableColumns, setTabelColumns] = useState([]);
    const {
        oakEntity,
        data,
        columns,
        colorDict,
    } = oakData;
    
    useEffect(() => {
        const tableColumns = columns.map((ele) => ({
            dataIndex: ele.path,
            title: ele.title,
            render: (v: string, row: any) => {
                if (v && ele.renderType === 'text') {
                    return <>{v}</>
                }
                let value = get(row, ele.path);
                let color = 'black';
                if (ele.renderType === 'tag') {
                    value = t(`${ele.entity}:v.${ele.attr}.${value}`);
                    color = colorDict![ele.entity]![ele.attr]![value] as string;
                }
                return (<RenderCell entity={oakEntity} attr={ele.attr} color={color} value={value} type={ele.renderType} t={t} />)
            }
        }))
    }, [data])
    return (
        <Table dataSource={data} scroll={{ x: 1500 }} columns={columns} ></Table>
    );
}
