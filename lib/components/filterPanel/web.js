"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var filter2_1 = tslib_1.__importDefault(require("../filter2"));
var utils_1 = require("../filter2/utils");
var web_module_less_1 = tslib_1.__importDefault(require("./web.module.less"));
var DEFAULT_COLUMN_MAP = {
    xxl: 4,
    xl: 4,
    lg: 3,
    md: 2,
    sm: 2,
    xs: 1,
};
function transformColumns(columns) {
    return columns.map(function (column, index) {
        var _filterName = (0, utils_1.getFilterName)(column);
        return tslib_1.__assign(tslib_1.__assign({}, column), { filterName: _filterName });
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
function Render(props) {
    var _a = props.data, onSearch = _a.onSearch, columns = _a.columns, _b = _a.column, column = _b === void 0 ? DEFAULT_COLUMN_MAP : _b, width = _a.width, entity = _a.entity, oakFullpath = _a.oakFullpath;
    var _c = props.methods, t = _c.t, refresh = _c.refresh, getNamedFilters = _c.getNamedFilters, removeNamedFilterByName = _c.removeNamedFilterByName;
    var _d = tslib_1.__read((0, react_1.useState)(false), 2), open = _d[0], setOpen = _d[1];
    var _e = tslib_1.__read(antd_1.Form.useForm(), 1), form = _e[0];
    if (!columns || columns.length === 0) {
        return null;
    }
    var tfColumns = transformColumns(columns);
    var mergedColumn = getColumn(column, width); // 一行放几个
    var gridColumn = Math.ceil(24 / mergedColumn); // 24格 计算一个所需几格
    var totalColSpan = tfColumns.reduce(function (prev, cur, index, arr) {
        return getSpan(cur.colSpan || 1, mergedColumn) + prev;
    }, 0); //总共多少份
    var rows = Math.ceil(totalColSpan / mergedColumn);
    var showExpandButton = totalColSpan > mergedColumn - 1; //需要显示展开按钮
    var filters = getNamedFilters() || [];
    var filterNames = tfColumns.map(function (ele) { return ele.filterName; });
    var filters2 = filters === null || filters === void 0 ? void 0 : filters.filter(function (ele) {
        return filterNames.includes(ele['#name']);
    });
    var count = (filters2 === null || filters2 === void 0 ? void 0 : filters2.length) || 0; //查询条件个数
    var items = [];
    var rowSum = 0;
    var rowSum2 = 0;
    var rows2 = 1;
    var firstItem;
    var _gridColumn = gridColumn;
    tfColumns.forEach(function (column, index) {
        var colSpan = column.colSpan;
        var colSpan2 = getSpan(colSpan || 1, mergedColumn);
        var item = ((0, jsx_runtime_1.jsx)(antd_1.Col, { span: gridColumn * colSpan2, children: (0, jsx_runtime_1.jsx)(filter2_1.default, { column: column, entity: entity, oakPath: oakFullpath }) }));
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
            var other = rows * mergedColumn - rowSum;
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
    var formLayout = 'horizontal';
    if (['xs', 'sm'].includes(width)) {
        formLayout = 'vertical';
    }
    var formItemLayout = formLayout === 'horizontal'
        ? {
            labelCol: { style: { width: 120 } },
            wrapperCol: { style: { maxWidth: 'calc(100% - 120px)' } },
        }
        : null;
    var buttonItemLayout = formLayout === 'horizontal'
        ? { wrapperCol: { span: 18, offset: 6 } }
        : null;
    items.push((0, jsx_runtime_1.jsx)(antd_1.Col, { span: _gridColumn, children: (0, jsx_runtime_1.jsx)(antd_1.Form.Item, tslib_1.__assign({}, buttonItemLayout, { children: (0, jsx_runtime_1.jsxs)(antd_1.Space, { className: web_module_less_1.default.actionBox, children: [(0, jsx_runtime_1.jsx)(antd_1.Badge, { count: count, children: (0, jsx_runtime_1.jsx)(antd_1.Button, { type: "default", onClick: function () {
                                filterNames.forEach(function (ele) {
                                    return removeNamedFilterByName(ele);
                                });
                                form.resetFields();
                                refresh();
                            }, children: t('common::reset') }) }), (0, jsx_runtime_1.jsx)(antd_1.Button, { type: "primary", onClick: function () {
                            if (typeof onSearch === 'function') {
                                onSearch();
                                return;
                            }
                            refresh();
                        }, children: t('common::select') }), showExpandButton && ((0, jsx_runtime_1.jsx)(antd_1.Button, { type: "link", onClick: function () {
                            setOpen(!open);
                        }, children: (0, jsx_runtime_1.jsxs)(antd_1.Space, { children: [open ? t('common::shrink') : t('common::expand'), open ? (0, jsx_runtime_1.jsx)(icons_1.UpOutlined, {}) : (0, jsx_runtime_1.jsx)(icons_1.DownOutlined, {})] }) }))] }) })) }));
    return ((0, jsx_runtime_1.jsx)(antd_1.Form, tslib_1.__assign({ form: form }, formItemLayout, { layout: formLayout, children: (0, jsx_runtime_1.jsx)(antd_1.Row, { gutter: [16, 16], children: items }) })));
}
exports.default = Render;
