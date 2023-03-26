"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var antd_1 = require("antd");
var assert_1 = tslib_1.__importDefault(require("assert"));
var lodash_1 = require("oak-domain/lib/utils/lodash");
var actionBtn_1 = tslib_1.__importDefault(require("../actionBtn"));
function RenderCell(props) {
    var value = props.value, type = props.type, color = props.color;
    if (!value) {
        return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: "--" }));
    }
    // 属性类型是enum要使用标签
    else if (type === 'tag') {
        return ((0, jsx_runtime_1.jsx)(antd_1.Tag, tslib_1.__assign({ color: color }, { children: value })));
    }
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: value }));
}
var tableProps = {};
function Render(props) {
    var methods = props.methods, oakData = props.data;
    var t = methods.t;
    var _a = tslib_1.__read((0, react_1.useState)([]), 2), selectedRowKeys = _a[0], setSelectedRowKeys = _a[1];
    var _b = tslib_1.__read((0, react_1.useState)([]), 2), tableColumns = _b[0], setTabelColumns = _b[1];
    var loading = oakData.loading, entity = oakData.entity, schema = oakData.schema, extraActions = oakData.extraActions, oakEntity = oakData.oakEntity, data = oakData.data, columns = oakData.columns, colorDict = oakData.colorDict, _c = oakData.disabledOp, disabledOp = _c === void 0 ? false : _c, handleClick = oakData.handleClick, tablePagination = oakData.tablePagination, onAction = oakData.onAction, rowSelection = oakData.rowSelection;
    (0, react_1.useEffect)(function () {
        var tableColumns = columns && columns.map(function (ele) {
            var column = {
                dataIndex: ele.path,
                title: ele.title,
                align: 'center',
                render: function (v, row) {
                    var _a, _b;
                    if (v && ele.type === 'text') {
                        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: v });
                    }
                    var value = (0, lodash_1.get)(row, ele.path);
                    var color = 'black';
                    if (ele.type === 'tag' && !!value) {
                        (0, assert_1.default)(!!((_b = (_a = colorDict === null || colorDict === void 0 ? void 0 : colorDict[ele.entity]) === null || _a === void 0 ? void 0 : _a[ele.attr]) === null || _b === void 0 ? void 0 : _b[value]), "".concat(entity, "\u5B9E\u4F53iState\u989C\u8272\u5B9A\u4E49\u7F3A\u5931"));
                        color = colorDict[ele.entity][ele.attr][value];
                        value = t("".concat(ele.entity, ":v.").concat(ele.attr, ".").concat(value));
                    }
                    return ((0, jsx_runtime_1.jsx)(RenderCell, { color: color, value: value, type: ele.type }));
                }
            };
            if (ele.width) {
                Object.assign(ele, { width: ele.width });
            }
            return column;
        });
        if (!disabledOp && tableColumns) {
            tableColumns.push({
                fixed: 'right',
                align: 'center',
                title: '操作',
                key: 'operation',
                width: 300,
                render: function (value, row) {
                    var id = row === null || row === void 0 ? void 0 : row.id;
                    var oakActions = row === null || row === void 0 ? void 0 : row['#oakLegalActions'];
                    (0, assert_1.default)(!!oakActions, '行数据中不存在#oakLegalActions, 请禁用(disableOp:true)或添加actions');
                    return ((0, jsx_runtime_1.jsx)(actionBtn_1.default, { schema: schema, entity: entity, extraActions: extraActions, actions: row === null || row === void 0 ? void 0 : row['#oakLegalActions'], cascadeActions: row === null || row === void 0 ? void 0 : row['#oakLegalCascadeActions'], onAction: function (action, cascadeAction) { return onAction && onAction(row, action, cascadeAction); } }));
                }
            });
        }
        setTabelColumns(tableColumns);
    }, [data]);
    return ((0, jsx_runtime_1.jsx)(antd_1.Table, { rowKey: "id", rowSelection: (rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.type) && {
            type: rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.type,
            selectedRowKeys: selectedRowKeys,
            onChange: function (selectedRowKeys, row, info) {
                setSelectedRowKeys(selectedRowKeys);
                (rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.onChange) && (rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.onChange(selectedRowKeys, row, info));
            }
        }, loading: loading, dataSource: data, scroll: { x: 1500 }, columns: tableColumns, pagination: tablePagination, onRow: function (record) {
            return {
                onClick: function () {
                    var index = selectedRowKeys.findIndex(function (ele) { return ele === record.id; });
                    if ((rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.type) === 'checkbox') {
                        if (index !== -1) {
                            selectedRowKeys.splice(index, 1);
                        }
                        else {
                            selectedRowKeys.push(record.id);
                        }
                        setSelectedRowKeys(tslib_1.__spreadArray([], tslib_1.__read(selectedRowKeys), false));
                    }
                    else {
                        setSelectedRowKeys([record.id]);
                    }
                    var row = data.filter(function (ele) { return selectedRowKeys.includes(ele.id); });
                    (rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.onChange) && (rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.onChange(selectedRowKeys, row, { type: 'all' }));
                }
            };
        } }));
}
exports.default = Render;
