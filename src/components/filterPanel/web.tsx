import React, { useEffect, useState } from 'react';
import { Input, Button, Space, Form, Badge, Row, Col } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
import Filter from '../filter';
import { ColSpanType, ColumnProps } from '../../types/Filter';
import { getFilterName } from '../filter/utils';
import Style from './web.module.less';



type Width = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

type ColumnMapType = {
    xxl: ColSpanType;
    xl: ColSpanType;
    lg: ColSpanType;
    md: ColSpanType;
    sm: ColSpanType;
    xs: ColSpanType;
};

const DEFAULT_COLUMN_MAP: ColumnMapType = {
    xxl: 4,
    xl: 4,
    lg: 3,
    md: 2,
    sm: 2,
    xs: 1,
};


function transformColumns<ED2 extends ED>(columns: ColumnProps<ED2, keyof ED2>[]) {
    return columns.map((column, index) => {
        const _filterName = getFilterName(column);

        return {
            ...column,
            filterName: _filterName,
        };
    });
}

function getColumn(column: ColSpanType | ColumnMapType, width: Width) {
    if (typeof column === 'number') {
        return column;
    }

    if (typeof column === 'object') {
        if (column[width] !== undefined) {
            return column[width] || DEFAULT_COLUMN_MAP[width];
        }
    }

    return 3;
}

function getSpan(colSpan: ColSpanType, column: ColSpanType) {
    return colSpan > column ? column : colSpan;
}

export default function Render<ED2 extends ED>(
    props: WebComponentProps<
        ED,
        keyof ED,
        false,
        {
            entity: keyof ED;
            columns: Array<ColumnProps<ED2, keyof ED2>>;
            onSearch: () => void;
            column?: ColSpanType | ColumnMapType;
            width: Width;
        },
        {
            getNamedFilters: () => Record<string, any>[];
        }
    >
) {
    const {
        onSearch,
        columns,
        column = DEFAULT_COLUMN_MAP,
        width,
        entity,
        oakFullpath,
    } = props.data;
    const { t, refresh, getNamedFilters, removeNamedFilterByName } =
        props.methods;
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();

    if (!columns || columns.length === 0) {
        return null;
    }

    const tfColumns = transformColumns(columns);
    const mergedColumn = getColumn(column, width); // 一行放几个
    const gridColumn = Math.ceil(24 / mergedColumn); // 24格 计算一个所需几格
    const totalColSpan = tfColumns.reduce(
        (prev, cur, index, arr) =>
            getSpan(cur.colSpan || 1, mergedColumn) + prev,
        0
    ); //总共多少份
    const rows = Math.ceil(totalColSpan / mergedColumn);
    const showExpandButton = totalColSpan > mergedColumn - 1; //需要显示展开按钮
    const filters = getNamedFilters() || [];
    const filterNames = tfColumns.map((ele) => ele.filterName);
    const filters2 = filters?.filter((ele) =>
        filterNames.includes(ele['#name'])
    );
    const count = filters2?.length || 0; //查询条件个数

    const items: React.JSX.Element[] = [];
    let rowSum = 0;
    let rowSum2 = 0;
    let rows2 = 1;
    let firstItem;
    let _gridColumn = gridColumn;
    tfColumns.forEach((column, index) => {
        const { colSpan } = column;
        const colSpan2 = getSpan(colSpan || 1, mergedColumn);

        const item = (
            <Col
                key={`c_filterPanel_col_${index}`}
                span={gridColumn * colSpan2}
            >
                <Filter
                    column={column as ColumnProps<ED, keyof ED>}
                    entity={entity}
                    oakPath={oakFullpath}
                />
            </Col>
        );

        if (index === 0) {
            firstItem = item;
        }
        if (!open) {
            if (width !== 'xs') {
                rowSum += colSpan2;

                if (mergedColumn === 1) {
                    //一行一个
                    items.push(item);
                } else if (rowSum <= mergedColumn - 1) {
                    items.push(item);
                    rowSum2 = rowSum;

                    if (totalColSpan === mergedColumn - 1) {
                        _gridColumn = gridColumn * 1;
                    } else if (totalColSpan < mergedColumn) {
                        _gridColumn = gridColumn * (mergedColumn - rowSum2);
                    }
                } else {
                    _gridColumn = gridColumn * (mergedColumn - rowSum2);
                }
            }
        } else {
            items.push(item);
            if (
                rowSum + colSpan2 > rows2 * mergedColumn &&
                rowSum < rows2 * mergedColumn
            ) {
                rowSum += rows2 * mergedColumn - rowSum;
                rowSum += colSpan2;
                rows2 += 1;
            } else if (rowSum + colSpan2 === rows2 * mergedColumn) {
                rowSum += colSpan2;
                rows2 += 1;
            } else {
                rowSum += colSpan2;
            }
        }
    });

    if (open) {
        _gridColumn = 24;
        if (rowSum >= mergedColumn) {
            const other = rows * mergedColumn - rowSum;
            if (other > 0) {
                _gridColumn = gridColumn * other;
            }
        } else {
            _gridColumn = gridColumn * (mergedColumn - rowSum);
        }
    } else {
        if (width === 'xs' && !!firstItem) {
            items.push(firstItem);
        }
    }
    type LayoutType = Parameters<typeof Form>[0]['layout'];
    let formLayout: LayoutType = 'horizontal';
    if (['xs', 'sm'].includes(width)) {
        formLayout = 'vertical';
    }
    const formItemLayout =
        formLayout === 'horizontal'
            ? {
                  labelCol: { style: { width: 120 } },
                  wrapperCol: { style: { maxWidth: 'calc(100% - 120px)' } },
              }
            : null;
    const buttonItemLayout =
        formLayout === 'horizontal'
            ? { wrapperCol: { span: 18, offset: 6 } }
            : null;
    items.push(
        <Col key={`c_filterPanel_buttons`} span={_gridColumn}>
            <Form.Item {...buttonItemLayout}>
                <Space className={Style.actionBox}>
                    <Badge count={count}>
                        <Button
                            type="default"
                            onClick={() => {
                                filterNames.forEach((ele) =>
                                    removeNamedFilterByName(ele)
                                );
                                form.resetFields();
                                refresh();
                            }}
                        >
                            {t('common::reset')}
                        </Button>
                    </Badge>
                    <Button
                        type="primary"
                        onClick={() => {
                            if (typeof onSearch === 'function') {
                                onSearch();
                                return;
                            }
                            refresh();
                        }}
                    >
                        {t('common::select')}
                    </Button>
                    {showExpandButton && (
                        <Button
                            type="link"
                            onClick={() => {
                                setOpen(!open);
                            }}
                        >
                            <Space>
                                {open
                                    ? t('common::shrink')
                                    : t('common::expand')}

                                {open ? <UpOutlined /> : <DownOutlined />}
                            </Space>
                        </Button>
                    )}
                </Space>
            </Form.Item>
        </Col>
    );
    return (
        <Form form={form} {...formItemLayout} layout={formLayout}>
            <Row gutter={[16, 16]}>{items}</Row>
        </Form>
    );
}
