import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Tag, TableProps, PaginationProps, Space, Button, Avatar } from 'antd';
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
import { getPath, getWidth, getValue, getLabel, resolvePath, getType } from '../../utils/usefulFn';
import ImgBox from '../imgBox';
type ED = EntityDict & BaseEntityDict;
type Width = 'xl' | 'lg' | 'md' | 'sm' | 'xs';

function getDownload(file: { filename: string; url: string }) {
    const aLink = document.createElement('a');
    fetch(file?.url)
        .then((res) => res.blob())
        .then((blob) => {
            // 将链接地址字符内容转变成blob地址
            aLink.href = URL.createObjectURL(blob);
            aLink.download = file?.filename;
            aLink.style.display = 'none';
            document.body.appendChild(aLink);
            aLink.click();
        });
}

type RenderCellProps = {
    value: any;
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
    else if (type === 'img') {
        if (value instanceof Array) {
            return (
                <Space>
                    {value.map((ele) => (
                        <ImgBox src={ele.url} width={120} height={70} />
                    ))}
                </Space>
            )
        }
        return (
            <ImgBox src={value.url} width={120} height={70} />
        )
    }
    else if (type === 'avatar') {
        return (
            <Avatar src={value} />
        )
    }
    else if (type === 'file') {
        if (value instanceof Array) {
            return (
                <Space direction="vertical">
                    {value.map((ele) => (
                        <Button type="dashed" /* icon={} */ onClick={() => getDownload(ele)}>
                            {ele.filename}
                        </Button>
                    ))}
                </Space>
            )
        }
        return (
            <Button type="dashed" /* icon={}  */onClick={() => getDownload(value)}>
                {value.filename}
            </Button>
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
            attributes: OakAbsAttrDef[],
            columns: ColumnDefProps[],
            mobileData: AttrRender[]
            data: any[];
            disabledOp: boolean;
            colorDict: ColorDict<EntityDict & BaseEntityDict>;
            handleClick?: (id: string, action: string) => void;
            tablePagination?: PaginationProps;
            onAction?: onActionFnDef;
            rowSelection?: TableProps<any[]>['rowSelection']
            scroll?: TableProps<any[]>['scroll'],
            i18n: any;
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
        attributes,
        i18n,
    } = oakData;
    // 为了i18更新时能够重新渲染
    const zhCNKeys = i18n?.store?.data?.zh_CN && Object.keys(i18n.store.data.zh_CN).length;
    useEffect(() => {
        if (schema) {
            const tableColumns: ColumnsType<any> = attributes && attributes.map((ele) => {
                const path = getPath(ele);
                const {
                    attrType,
                    attr,
                    attribute,
                    entity: entityI8n,
                } = resolvePath<ED>(schema, entity, path);
                const title = getLabel(ele, entityI8n, attr, t);
                const width = getWidth(ele, attrType, 'table');
                const type = getType(ele, attrType);
                const column: ColumnType<any> = {
                    key: path,
                    title,
                    align: 'center',
                    render: (v: string, row: any) => {
                        const value = getValue(ele, row, path, entityI8n, attr, attrType, t);
                        let color = 'black';
                        if (type === 'tag' && !!value) {
                            assert(!!colorDict?.[entityI8n]?.[attr]?.[value], `${entity}实体iState颜色定义缺失`)
                            color = colorDict![entityI8n]![attr]![value] as string;
                        }
                        return (<RenderCell color={color} value={value} type={type!} />)
                    }
                }
                if (width) {
                    Object.assign(column, { width });
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
        }
    }, [data, zhCNKeys])
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
