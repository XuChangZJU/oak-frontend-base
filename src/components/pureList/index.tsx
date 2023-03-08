import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Tag, TableProps } from 'antd';
import type { ColumnsType, ColumnType, ColumnGroupType } from 'antd/es/table';
import assert from 'assert';
import useFeatures from '../../hooks/useFeatures';
import { getAttributes } from '../../utils/usefulFn';
import { get } from 'oak-domain/lib/utils/lodash';
import dayjs from 'dayjs';
import ActionBtnPanel from '../actionBtnPanel';

type SelfColumn = {
    path?: string;
}

type Column = SelfColumn & ColumnType<any>;


type Props = {
    entity: string;
    data: any[];
    columns: (Column | string)[];
    disableOp?: boolean;
    tableProps?: TableProps<any>;
    handleClick?: (id: string, action: string) => void;
}
  
type RenderCellProps = {
    content: any;
    entity: string;
    path: string;
    attr: string;
    attrType: string;
}

function decodeTitle(entity: string, attr: string) {
    const { t } = useTranslation();
    if (attr === ('$$createAt$$' || '$$updateAt$$')) {
        return t(`common:${attr}`)
    }
    return t(`${entity}:attr.${attr}`)
}

// 解析路径， 获取属性类型、属性值、以及实体名称
function Fn(entity: string, path: string) {
    let _entity = entity;
    let attr: string;
    assert(!path.includes('['), '数组索引不需要携带[],请使用arr.0.value')
    const features = useFeatures();
    const dataSchema = features.cache.getSchema();
    if (!path.includes('.')) {
        attr = path;
    }
    else {
        const strs = path.split('.');
        // 最后一个肯定是属性
        attr = strs.pop()!;
        // 倒数第二个可能是类名可能是索引
        _entity = strs.pop()!;
        // 判断是否是数组索引
        if (!Number.isNaN(Number(_entity))) {
            _entity = strs.pop()!.split('$')[0];
        }
    }
    const attributes = getAttributes(dataSchema[_entity as keyof typeof dataSchema].attributes);
    const attribute = attributes[attr];
    return {
        entity: _entity,
        attr,
        attribute,
    }
}

function RenderCell(props: RenderCellProps) {
    const { content, entity, path, attr, attrType } = props;
    const value = get(content, path);
    const { t } = useTranslation();
    const feature = useFeatures();
    const colorDict = feature.style.getColorDict();
    if (!value) {
        return (<div>--</div>);
    }
    // 属性类型是enum要使用标签
    else if (attrType === 'enum') {
        return (
            <Tag color={colorDict[entity][attr][String(value)]} >
                {t(`${entity}:v.${attr}.${value}`)}
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

function List(props: Props) {
    const { data, columns, entity, disableOp = false, tableProps } = props;
    const { t } = useTranslation();
    const tableColumns: ColumnsType<any> = columns.map((ele) => {
        let title: string = '';
        let render: (value: any, row: any) => React.ReactNode = () => <></>;
        let path: string | undefined;
        if (typeof ele === 'string') {
            path = ele;
        }
        else {
            path = ele.path;
        }
        const { entity: useEntity, attr, attribute } = Fn(entity, path!) || {};
        title = decodeTitle(useEntity, attr);
        render = (value, row) => (
            <RenderCell entity={entity} content={row} path={path!} attr={attr} attrType={attribute.type} />
        );
        const column = {
            align: 'center',
            title,
            dataIndex: typeof ele === 'string' ? ele : ele.dataIndex,
            render,
        };
        // 类型如果是枚举类型，那么它的宽度一般不超过160
        // if (attribute?.type === 'enum') {
        //     Object.assign(column, {width: 160})
        // }
        return Object.assign(column, typeof ele !== 'string' && ele);
    }) as ColumnsType<any>;
    if (tableColumns && tableColumns) {
        tableColumns.unshift({title: '序号', width: 100, render(value, record, index) {
            return index + 1;
        },})
    }
    if (!disableOp) {
        tableColumns.push({
            fixed: 'right',
            align: 'center',
            title: '操作',
            key: 'operation',
            width: 300,
            render: (value, row) => {
                const id = row?.id;
                const oakActions = row?.oakActions;
                return (
                    <ActionBtnPanel oakId={id} oakActions={oakActions} />
                )
            }
        })
    }
    return (
        <Table dataSource={data} scroll={{ x: 2200 }} columns={tableColumns} ></Table>
    );
}

export default List;
