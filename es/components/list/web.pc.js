import React, { useState, useEffect, useContext } from 'react';
import { Table } from 'antd';
import { assert } from 'oak-domain/lib/utils/assert';
import { get } from 'oak-domain/lib/utils/lodash';
import { getWidth, getValue, getLabel, getType, getAlign, getLinkUrl, getFixed } from '../../utils/usefulFn';
import ActionBtn from '../actionBtn';
import TableCell from './renderCell';
import { TableContext } from '../listPro';
export default function Render(props) {
    const { methods, data: oakData } = props;
    const { t } = methods;
    const { loading, entity, schema, extraActions, data, colorDict, disabledOp = false, tablePagination, onAction, rowSelection, attributes, i18n, hideHeader, judgeAttributes, size = 'large', } = oakData;
    const [tableColumns, setTableColumns] = useState([]);
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
                showAttributes = tableAttributes
                    .filter((ele) => ele.show)
                    .map((ele) => ele.attribute);
            }
            const tableColumns = showAttributes &&
                showAttributes.map((ele) => {
                    if (ele.entity === 'notExist') {
                        assert(ele.attribute.width, `非schema属性${ele.attr}需要自定义width`);
                        assert(ele.attribute.type, `非schema属性${ele.attr}需要自定义type`);
                        assert(ele.attribute.label, `非schema属性${ele.attr}需要自定义label`);
                    }
                    const title = getLabel(ele.attribute, ele.entity, ele.attr, t);
                    const width = getWidth(ele.attribute, ele.attrType);
                    const type = getType(ele.attribute, ele.attrType);
                    const align = getAlign(ele.attribute);
                    const fixed = getFixed(ele.attribute);
                    const column = {
                        key: ele.path,
                        title,
                        align,
                        fixed,
                        render: (v, row) => {
                            if (typeof ele.attribute !== 'string' &&
                                ele.attribute.render) {
                                return ele.attribute.render(row);
                            }
                            const value = getValue(row, ele.path, ele.entity, ele.attr, ele.attrType, t);
                            const stateValue = get(row, ele.path);
                            let href = '';
                            if ([null, undefined, ''].includes(stateValue)) {
                                return <></>;
                            }
                            const color = colorDict &&
                                colorDict[ele.entity]?.[ele.attr]?.[stateValue];
                            if (type === 'enum' && !color) {
                                console.warn(color, `${ele.entity}实体${ele.attr}颜色定义缺失`);
                            }
                            if (type === 'link') {
                                href = getLinkUrl(ele.attribute, {
                                    oakId: row?.id,
                                });
                            }
                            return (<TableCell color={color} value={value} type={type} linkUrl={href}/>);
                        },
                    };
                    if (width) {
                        Object.assign(column, { width });
                    }
                    else {
                        // 没有宽度的设置ellipsis
                        Object.assign(column, {
                            ellipsis: {
                                showTitle: false,
                            },
                        });
                    }
                    return column;
                });
            if (!disabledOp && tableColumns) {
                tableColumns.push({
                    fixed: 'right',
                    align: 'left',
                    title: '操作',
                    key: 'operation',
                    width: 140,
                    render: (value, row) => {
                        const oakActions = row?.['#oakLegalActions'];
                        // assert(!!oakActions, '行数据中不存在#oakLegalActions, 请禁用(disableOp:true)或添加actions')
                        let extraActions2;
                        if (typeof extraActions === 'function') {
                            extraActions2 = extraActions(row);
                        }
                        else {
                            extraActions2 = extraActions;
                        }
                        return (<ActionBtn entity={entity} extraActions={extraActions2} actions={oakActions || []} cascadeActions={row?.['#oakLegalCascadeActions']} onAction={(action, cascadeAction) => onAction &&
                                onAction(row, action, cascadeAction)}/>);
                    },
                });
            }
            setTableColumns(tableColumns);
        }
    }, [data, zhCNKeys, schema, tableAttributes]);
    return (<Table rowKey="id" rowSelection={rowSelection?.type && {
            type: rowSelection?.type,
            selectedRowKeys,
            onChange: (selectedRowKeys, row, info) => {
                rowSelection?.onChange &&
                    rowSelection?.onChange(selectedRowKeys, row, info);
            },
        }} size={size} loading={loading} dataSource={data} columns={tableColumns} pagination={tablePagination} scroll={showScroll
            ? {
                scrollToFirstRowOnChange: true,
                x: 1200,
            }
            : {}} onRow={(record) => {
            return {
                onClick: () => {
                    const index = selectedRowKeys.findIndex((ele) => ele === record.id);
                    let keys = selectedRowKeys;
                    if (rowSelection?.type === 'checkbox') {
                        if (index !== -1) {
                            keys.splice(index, 1);
                        }
                        else {
                            keys.push(record.id);
                        }
                    }
                    else {
                        keys = [record.id];
                    }
                    const row = data.filter((ele) => keys.includes(ele.id));
                    rowSelection?.onChange &&
                        rowSelection?.onChange(keys, row, { type: 'all' });
                },
            };
        }} showHeader={!hideHeader}></Table>);
}
