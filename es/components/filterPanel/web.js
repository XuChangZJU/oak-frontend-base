import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button, Space, Form, Badge, Row, Col } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import Filter from '../filter2';
import { getFilterName } from '../filter2/utils';
import Style from './web.module.less';
const DEFAULT_COLUMN_MAP = {
    xxl: 4,
    xl: 4,
    lg: 3,
    md: 2,
    sm: 2,
    xs: 1,
};
function transformColumns(columns) {
    return columns.map((column, index) => {
        const _filterName = getFilterName(column);
        return {
            ...column,
            filterName: _filterName,
        };
    });
}
function getColumn(column, width) {
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
function getSpan(colSpan, column) {
    return colSpan > column ? column : colSpan;
}
export default function Render(props) {
    const { onSearch, columns, column = DEFAULT_COLUMN_MAP, width, entity, oakFullpath, } = props.data;
    const { t, refresh, getNamedFilters, removeNamedFilterByName } = props.methods;
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    if (!columns || columns.length === 0) {
        return null;
    }
    const tfColumns = transformColumns(columns);
    const mergedColumn = getColumn(column, width); // 一行放几个
    const gridColumn = Math.ceil(24 / mergedColumn); // 24格 计算一个所需几格
    const totalColSpan = tfColumns.reduce((prev, cur, index, arr) => getSpan(cur.colSpan || 1, mergedColumn) + prev, 0); //总共多少份
    const rows = Math.ceil(totalColSpan / mergedColumn);
    const showExpandButton = totalColSpan > mergedColumn - 1; //需要显示展开按钮
    const filters = getNamedFilters() || [];
    const filterNames = tfColumns.map((ele) => ele.filterName);
    const filters2 = filters?.filter((ele) => filterNames.includes(ele['#name']));
    const count = filters2?.length || 0; //查询条件个数
    const items = [];
    let rowSum = 0;
    let rowSum2 = 0;
    let rows2 = 1;
    let firstItem;
    let _gridColumn = gridColumn;
    tfColumns.forEach((column, index) => {
        const { colSpan } = column;
        const colSpan2 = getSpan(colSpan || 1, mergedColumn);
        const item = (_jsx(Col, { span: gridColumn * colSpan2, children: _jsx(Filter, { column: column, entity: entity, oakPath: oakFullpath }) }));
        if (index === 0) {
            firstItem = item;
        }
        if (!open) {
            if (width !== 'xs') {
                rowSum += colSpan2;
                if (mergedColumn === 1) {
                    //一行一个
                    items.push(item);
                }
                else if (rowSum <= mergedColumn - 1) {
                    items.push(item);
                    rowSum2 = rowSum;
                    if (totalColSpan === mergedColumn - 1) {
                        _gridColumn = gridColumn * 1;
                    }
                    else if (totalColSpan < mergedColumn) {
                        _gridColumn = gridColumn * (mergedColumn - rowSum2);
                    }
                }
                else {
                    _gridColumn = gridColumn * (mergedColumn - rowSum2);
                }
            }
        }
        else {
            items.push(item);
            if (rowSum + colSpan2 > rows2 * mergedColumn &&
                rowSum < rows2 * mergedColumn) {
                rowSum += rows2 * mergedColumn - rowSum;
                rowSum += colSpan2;
                rows2 += 1;
            }
            else if (rowSum + colSpan2 === rows2 * mergedColumn) {
                rowSum += colSpan2;
                rows2 += 1;
            }
            else {
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
        }
        else {
            _gridColumn = gridColumn * (mergedColumn - rowSum);
        }
    }
    else {
        if (width === 'xs') {
            items.push(firstItem);
        }
    }
    let formLayout = 'horizontal';
    if (['xs', 'sm'].includes(width)) {
        formLayout = 'vertical';
    }
    const formItemLayout = formLayout === 'horizontal'
        ? {
            labelCol: { style: { width: 120 } },
            wrapperCol: { style: { maxWidth: 'calc(100% - 120px)' } },
        }
        : null;
    const buttonItemLayout = formLayout === 'horizontal'
        ? { wrapperCol: { span: 18, offset: 6 } }
        : null;
    items.push(_jsx(Col, { span: _gridColumn, children: _jsx(Form.Item, { ...buttonItemLayout, children: _jsxs(Space, { className: Style.actionBox, children: [_jsx(Badge, { count: count, children: _jsx(Button, { type: "default", onClick: () => {
                                filterNames.forEach((ele) => removeNamedFilterByName(ele));
                                form.resetFields();
                                refresh();
                            }, children: t('common::reset') }) }), _jsx(Button, { type: "primary", onClick: () => {
                            if (typeof onSearch === 'function') {
                                onSearch();
                                return;
                            }
                            refresh();
                        }, children: t('common::select') }), showExpandButton && (_jsx(Button, { type: "link", onClick: () => {
                            setOpen(!open);
                        }, children: _jsxs(Space, { children: [open ? t('common::shrink') : t('common::expand'), open ? _jsx(UpOutlined, {}) : _jsx(DownOutlined, {})] }) }))] }) }) }));
    return (_jsx(Form, { form: form, ...formItemLayout, layout: formLayout, children: _jsx(Row, { gutter: [16, 16], children: items }) }));
}
