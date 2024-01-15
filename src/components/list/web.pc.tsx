import React, { useState, useEffect, useContext } from 'react';
import { Table, Tag, TableProps, PaginationProps, Space, Button, Avatar } from 'antd';
import type { ColumnsType, ColumnType, ColumnGroupType } from 'antd/es/table';
import { assert } from 'oak-domain/lib/utils/assert';
import { get } from 'oak-domain/lib/utils/lodash';
import ActionBtn from '../actionBtn';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { ActionDef, WebComponentProps } from '../../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ColorDict } from 'oak-domain/lib/types/Style';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { OakAbsAttrDef, onActionFnDef, CascadeActionProps, OakAbsDerivedAttrDef, OakExtraActionProps, OakAbsAttrJudgeDef } from '../../types/AbstractComponent';
import { getPath, getWidth, getValue, getLabel, resolvePath, getType, getAlign, getLinkUrl } from '../../utils/usefulFn';
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
            extraActions: OakExtraActionProps[] | ((row: any) => OakExtraActionProps[]);
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
            hideHeader?: boolean;
            judgeAttributes: OakAbsAttrJudgeDef[];
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
        hideHeader,
        judgeAttributes,
    } = oakData;
    const [tableColumns, setTabelColumns] = useState([] as ColumnsType<any>);
    const { tableAttributes, setSchema } = useContext(TableContext);
    // 为了i18更新时能够重新渲染
    const zhCNKeys = i18n?.store?.data?.zh_CN && Object.keys(i18n.store.data.zh_CN).length;
    const selectedRowKeys = rowSelection?.selectedRowKeys || [];

    // 如果字段过多，给table加上
    const showScroll = attributes && attributes.length >= 8;
    useEffect(() => {
        if (schema) {
            setSchema && setSchema(schema);
            let showAttributes = judgeAttributes;
            if (tableAttributes) {
                showAttributes = tableAttributes.filter((ele) => ele.show).map((ele) => ele.attribute);
            }
            const tableColumns: ColumnsType<any> = showAttributes && showAttributes.map((ele) => {
                if (ele.entity === 'notExist') {
                    assert((ele.attribute as OakAbsDerivedAttrDef).width, `非schema属性${ele.attr}需要自定义width`);
                    assert((ele.attribute as OakAbsDerivedAttrDef).type, `非schema属性${ele.attr}需要自定义type`);
                    assert((ele.attribute as OakAbsDerivedAttrDef).label, `非schema属性${ele.attr}需要自定义label`);
                }
                const title = getLabel(ele.attribute, ele.entity, ele.attr, t);
                const width = getWidth(ele.attribute, ele.attrType);
                const type = getType(ele.attribute, ele.attrType);
                const align = getAlign(ele.attrType as DataType);
                const column: ColumnType<any> = {
                    key: ele.path,
                    title,
                    align,
                    render: (v: string, row: any) => {
                        const value = getValue(row, ele.path, ele.entity, ele.attr, ele.attrType, t);
                        const stateValue = get(row, ele.path);
                        let href = '';
                        if ([null, undefined, ''].includes(stateValue)) {
                            return <></>
                        }
                        const color = colorDict && colorDict[ele.entity]?.[ele.attr]?.[stateValue] as string;
                        if (type === 'enum' && !color) {
                            console.warn(color, `${ele.entity}实体${ele.attr}颜色定义缺失`)
                        }
                        if (type === 'link') {
                            href = getLinkUrl(ele.attribute, { oakId: row?.id });
                        }
                        return (<TableCell color={color} value={value} type={type!} linkUrl={href} />)
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
                        let extraActions2: OakExtraActionProps[];
                        if (typeof extraActions === 'function') {
                            extraActions2 =  extraActions(row);
                        }
                        else {
                            extraActions2 = extraActions;
                        }
                        return (
                            <ActionBtn
                                entity={entity}
                                extraActions={extraActions2}
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
            rowSelection={
                rowSelection?.type && {
                    type: rowSelection?.type,
                    selectedRowKeys,
                    onChange: (selectedRowKeys, row, info) => {
                        rowSelection?.onChange &&
                            rowSelection?.onChange(selectedRowKeys, row, info);
                    },
                }
            }
            loading={loading}
            dataSource={data}
            columns={tableColumns}
            pagination={tablePagination}
            scroll={
                showScroll
                    ? {
                          scrollToFirstRowOnChange: true,
                          x: 1200,
                      }
                    : {}
            }
            onRow={(record) => {
                return {
                    onClick: () => {
                        const index = selectedRowKeys.findIndex(
                            (ele) => ele === record.id
                        );
                        let keys = selectedRowKeys;
                        if (rowSelection?.type === 'checkbox') {
                            if (index !== -1) {
                                keys.splice(index, 1);
                            } else {
                                keys.push(record.id);
                            }
                        } else {
                            keys = [record.id];
                        }
                        const row = data.filter((ele) => keys.includes(ele.id));
                        rowSelection?.onChange &&
                            rowSelection?.onChange(keys, row, { type: 'all' });
                    },
                };
            }}
            showHeader={!hideHeader}
        ></Table>
    );
}
