import React, { useState, useEffect, useContext } from 'react';
import { Table, Tag, TableProps, PaginationProps, Space, Button, Avatar } from 'antd';
import type { ColumnsType, ColumnType, ColumnGroupType } from 'antd/es/table';
import assert from 'assert';
import { get } from 'oak-domain/lib/utils/lodash';
import ActionBtn from '../actionBtn';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { ActionDef, WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ColorDict } from 'oak-domain/lib/types/Style';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { OakAbsAttrDef, onActionFnDef, CascadeActionProps, OakAbsDerivedAttrDef, OakExtraActionProps, ListButtonProps } from '../../types/AbstractComponent';
import { getPath, getWidth, getValue, getLabel, resolvePath, getType, getAlign } from '../../utils/usefulFn';
import { DataType } from 'oak-domain/lib/types/schema/DataTypes';
import TableCell from './renderCell';
import Style from './web.module.less';
import { TableContext } from '../listPro';

type ED = EntityDict & BaseEntityDict;


export default function Render(
    props: WebComponentProps<
        EntityDict & BaseEntityDict,
        keyof EntityDict,
        false,
        {
            width: 'xl' | 'lg' | 'md' | 'sm' | 'xs';
            loading: boolean;
            extraActions: OakExtraActionProps[];
            entity: string;
            schema: StorageSchema<EntityDict & BaseEntityDict>;
            attributes: OakAbsAttrDef[],
            data: any[];
            disabledOp: boolean;
            colorDict: ColorDict<EntityDict & BaseEntityDict>;
            tablePagination?: TableProps<any[]>['pagination'];
            onAction?: onActionFnDef;
            rowSelection?: TableProps<any[]>['rowSelection']
            i18n: any;
        },
        {
        }
    >
) {
    const { methods, data: oakData } = props;
    const { t } = methods;
    const {
        loading,
        entity,
        schema,
        extraActions,
        data,
        colorDict,
        disabledOp = false,
        tablePagination,
        onAction,
        rowSelection,
        attributes,
        i18n,
    } = oakData;
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [tableColumns, setTabelColumns] = useState([] as ColumnsType<any>);
    const { tableAttributes, setSchema } = useContext(TableContext);
    // 为了i18更新时能够重新渲染
    const zhCNKeys = i18n?.store?.data?.zh_CN && Object.keys(i18n.store.data.zh_CN).length;

    // 如果字段过多，给table加上
    const showScroll = attributes && attributes.length >= 8;
    useEffect(() => {
        if (schema) {
            setSchema && setSchema(schema);
            let showAttributes = attributes;
            if (tableAttributes) {
                showAttributes = tableAttributes.filter((ele) => ele.show).map((ele) => ele.attribute);
            }
            const tableColumns: ColumnsType<any> = showAttributes && showAttributes.map((ele) => {
                const path = getPath(ele);
                const {attrType, attr, entity: entityI8n } = resolvePath<ED>(schema, entity, path);
                if (entityI8n === 'notExist') {
                    assert((ele as OakAbsDerivedAttrDef).width, `非schema属性${attr}需要自定义width`);
                    assert((ele as OakAbsDerivedAttrDef).type, `非schema属性${attr}需要自定义type`);
                    assert((ele as OakAbsDerivedAttrDef).label, `非schema属性${attr}需要自定义label`);
                }
                const title = getLabel(ele, entityI8n, attr, t);
                const width = getWidth(ele, attrType);
                const type = getType(ele, attrType);
                const align = getAlign(attrType as DataType);
                const column: ColumnType<any> = {
                    key: path,
                    title,
                    align,
                    render: (v: string, row: any) => {
                        const value = getValue(row, path, entityI8n, attr, attrType, t);
                        const stateValue = get(row, path);
                        const color = colorDict && colorDict[entityI8n]?.[attr]?.[stateValue] as string;
                        if (type === 'enum') {
                            assert(color, `${entity}实体${attr}颜色定义缺失`)
                        }
                        return (<TableCell color={color} value={value} type={type!} />)
                    }
                }
                if (width) {
                    Object.assign(column, { width });
                }
                else {
                    // 没有宽度的设置ellipsis
                    Object.assign(column, {
                        ellipsis: {
                            showTitle: false,
                        }
                    })
                }
                return column;
            })
            if (!disabledOp && tableColumns) {
                    tableColumns.push({
                    fixed: 'right',
                    align: 'left',
                    title: '操作',
                    key: 'operation',
                    width: 280,
                    render: (value: any, row: any) => {
                        const oakActions = row?.['#oakLegalActions'] as string[];
                        // assert(!!oakActions, '行数据中不存在#oakLegalActions, 请禁用(disableOp:true)或添加actions')
                        return (
                            <ActionBtn
                                entity={entity}
                                extraActions={extraActions}
                                actions={oakActions || []}
                                cascadeActions={row?.['#oakLegalCascadeActions']}
                                onAction={(action: string, cascadeAction: CascadeActionProps) => onAction && onAction(row, action, cascadeAction)}
                            />
                        )
                    }
                })
            }
            setTabelColumns(tableColumns)
        }
    }, [data, zhCNKeys, schema, tableAttributes])
    return (
        <Table
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
            scroll={showScroll ? {
                scrollToFirstRowOnChange: true,
                x: 1200,
            } : {}}
            onRow={(record) => {
                return {
                    onClick: () => {
                        const index = selectedRowKeys.findIndex((ele) => ele === record.id);
                        let keys = selectedRowKeys;
                        if (rowSelection?.type === 'checkbox') {
                            if (index !== -1) {
                                keys.splice(index, 1)
                            }
                            else {
                                keys.push(record.id)
                            }
                            setSelectedRowKeys([...selectedRowKeys]);
                        }
                        else {
                            keys = [record.id];
                            setSelectedRowKeys([record.id])
                        }
                        const row = data.filter((ele) => keys.includes(ele.id));
                        rowSelection?.onChange && rowSelection?.onChange(keys, row, {type: 'all'});
                    }
                }
            }}
        >
        </Table>
    );
}
