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

type SelfColumn = {
    path?: string;
}

type Column = SelfColumn & ColumnType<any>;

  
type RenderCellProps = {
    content: any;
    entity: string;
    path: string;
    attr: string;
    attrType: string;
    t: (value: string) => string;
    colorDict: ColorDict<EntityDict & BaseEntityDict>
}

function decodeTitle(entity: string, attr: string) {
    const { t } = useTranslation();
    if (attr === ('$$createAt$$' || '$$updateAt$$')) {
        return t(`common:${attr}`)
    }
    return t(`${entity}:attr.${attr}`)
}


function RenderCell(props: RenderCellProps) {
    const { content, entity, path, attr, attrType, t, colorDict } = props;
    const value = get(content, path);
    if (!value) {
        return (<div>--</div>);
    }
    // 属性类型是enum要使用标签
    else if (attrType === 'enum') {
        return (
            <Tag color={colorDict![entity]![attr]![String(value)]} >
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

export default function Render(
    props: WebComponentProps<
        EntityDict & BaseEntityDict,
        keyof EntityDict,
        false,
        {
            entity: string;
            data: any[];
            columns: (Column | string)[];
            disableOp?: boolean;
            tableProps?: TableProps<any>;
            handleClick?: (id: string, action: string) => void;
            colorDict: ColorDict<EntityDict & BaseEntityDict>;
            dataSchema: StorageSchema<EntityDict>;
        },
        {
        }
    >
) {
    const { methods, data: oakData } = props;
    const { t } = methods;
    const {
        entity,
        data,
        columns,
        disableOp = false,
        tableProps,
        handleClick,
        colorDict,
        dataSchema,
    } = oakData;
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
        const { entity: useEntity, attr, attribute } = resolutionPath(dataSchema, entity, path!) || {};
        title = decodeTitle(useEntity, attr);
        render = (value, row) => (
            <RenderCell entity={entity} content={row} path={path!} attr={attr} attrType={attribute?.type} t={t} colorDict={colorDict} />
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
                assert(!!oakActions, '行数据中不存在oakActions, 请禁用(disableOp:true)或添加oakActions')
                return (
                    <ActionBtnPanel oakId={id} entity={entity} oakActions={oakActions} onClick={(id: string, action: string) => handleClick && handleClick(id, action)}  />
                )
            }
        })
    }
    return (
        <Table dataSource={data} scroll={{ x: 2200 }} columns={tableColumns} {...tableProps} ></Table>
    );
}
