"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var antd_1 = require("antd");
var assert_1 = tslib_1.__importDefault(require("assert"));
var actionBtn_1 = tslib_1.__importDefault(require("../actionBtn"));
var usefulFn_1 = require("../../utils/usefulFn");
var imgBox_1 = tslib_1.__importDefault(require("../imgBox"));
function getDownload(file) {
    var aLink = document.createElement('a');
    fetch(file === null || file === void 0 ? void 0 : file.url)
        .then(function (res) { return res.blob(); })
        .then(function (blob) {
        // 将链接地址字符内容转变成blob地址
        aLink.href = URL.createObjectURL(blob);
        aLink.download = file === null || file === void 0 ? void 0 : file.filename;
        aLink.style.display = 'none';
        document.body.appendChild(aLink);
        aLink.click();
    });
}
function RenderCell(props) {
    var value = props.value, type = props.type, color = props.color;
    if (!value) {
        return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: "--" }));
    }
    // 属性类型是enum要使用标签
    else if (type === 'tag') {
        return ((0, jsx_runtime_1.jsx)(antd_1.Tag, tslib_1.__assign({ color: color }, { children: value })));
    }
    else if (type === 'img') {
        if (value instanceof Array) {
            return ((0, jsx_runtime_1.jsx)(antd_1.Space, { children: value.map(function (ele) { return ((0, jsx_runtime_1.jsx)(imgBox_1.default, { src: ele.url, width: 120, height: 70 })); }) }));
        }
        return ((0, jsx_runtime_1.jsx)(imgBox_1.default, { src: value.url, width: 120, height: 70 }));
    }
    else if (type === 'avatar') {
        return ((0, jsx_runtime_1.jsx)(antd_1.Avatar, { src: value }));
    }
    else if (type === 'file') {
        if (value instanceof Array) {
            return ((0, jsx_runtime_1.jsx)(antd_1.Space, tslib_1.__assign({ direction: "vertical" }, { children: value.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ type: "dashed" /* icon={} */, onClick: function () { return getDownload(ele); } }, { children: ele.filename }))); }) })));
        }
        return ((0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ type: "dashed" /* icon={}  */, onClick: function () { return getDownload(value); } }, { children: value.filename })));
    }
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: value }));
}
var sizeForWidth = {
    'xl': 'large',
    'lg': 'middle',
    'md': 'small',
    'sm': 'small',
    'xs': 'small',
};
var opSizeForWidth = {
    'xl': 280,
    'lg': 260,
    'md': 200,
    'sm': 180,
    'xs': 180,
};
function Render(props) {
    var _a, _b;
    var methods = props.methods, oakData = props.data;
    var t = methods.t;
    var _c = tslib_1.__read((0, react_1.useState)([]), 2), selectedRowKeys = _c[0], setSelectedRowKeys = _c[1];
    var _d = tslib_1.__read((0, react_1.useState)([]), 2), tableColumns = _d[0], setTabelColumns = _d[1];
    var loading = oakData.loading, entity = oakData.entity, schema = oakData.schema, extraActions = oakData.extraActions, oakEntity = oakData.oakEntity, data = oakData.data, columns = oakData.columns, colorDict = oakData.colorDict, _e = oakData.disabledOp, disabledOp = _e === void 0 ? false : _e, handleClick = oakData.handleClick, tablePagination = oakData.tablePagination, onAction = oakData.onAction, rowSelection = oakData.rowSelection, width = oakData.width, scroll = oakData.scroll, attributes = oakData.attributes, i18n = oakData.i18n;
    // 为了i18更新时能够重新渲染
    var zhCNKeys = ((_b = (_a = i18n === null || i18n === void 0 ? void 0 : i18n.store) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.zh_CN) && Object.keys(i18n.store.data.zh_CN).length;
    (0, react_1.useEffect)(function () {
        if (schema) {
            var tableColumns_1 = attributes && attributes.map(function (ele) {
                var path = (0, usefulFn_1.getPath)(ele);
                var _a = (0, usefulFn_1.resolvePath)(schema, entity, path), attrType = _a.attrType, attr = _a.attr, attribute = _a.attribute, entityI8n = _a.entity;
                var title = (0, usefulFn_1.getLabel)(ele, entityI8n, attr, t);
                var width = (0, usefulFn_1.getWidth)(ele, attrType, 'table');
                var type = (0, usefulFn_1.getType)(ele, attrType);
                var column = {
                    key: path,
                    title: title,
                    align: 'center',
                    render: function (v, row) {
                        var _a, _b;
                        var value = (0, usefulFn_1.getValue)(ele, row, path, entityI8n, attr, attrType, t);
                        var color = 'black';
                        if (type === 'tag' && !!value) {
                            (0, assert_1.default)(!!((_b = (_a = colorDict === null || colorDict === void 0 ? void 0 : colorDict[entityI8n]) === null || _a === void 0 ? void 0 : _a[attr]) === null || _b === void 0 ? void 0 : _b[value]), "".concat(entity, "\u5B9E\u4F53iState\u989C\u8272\u5B9A\u4E49\u7F3A\u5931"));
                            color = colorDict[entityI8n][attr][value];
                        }
                        return ((0, jsx_runtime_1.jsx)(RenderCell, { color: color, value: value, type: type }));
                    }
                };
                if (width) {
                    Object.assign(column, { width: width });
                }
                return column;
            });
            if (!disabledOp && tableColumns_1) {
                tableColumns_1.push({
                    fixed: 'right',
                    align: 'center',
                    title: '操作',
                    key: 'operation',
                    width: opSizeForWidth[width] || 300,
                    render: function (value, row) {
                        var id = row === null || row === void 0 ? void 0 : row.id;
                        var oakActions = row === null || row === void 0 ? void 0 : row['#oakLegalActions'];
                        (0, assert_1.default)(!!oakActions, '行数据中不存在#oakLegalActions, 请禁用(disableOp:true)或添加actions');
                        return ((0, jsx_runtime_1.jsx)(actionBtn_1.default, { entity: entity, extraActions: extraActions, actions: row === null || row === void 0 ? void 0 : row['#oakLegalActions'], cascadeActions: row === null || row === void 0 ? void 0 : row['#oakLegalCascadeActions'], onAction: function (action, cascadeAction) { return onAction && onAction(row, action, cascadeAction); } }));
                    }
                });
            }
            setTabelColumns(tableColumns_1);
        }
    }, [data, zhCNKeys]);
    return ((0, jsx_runtime_1.jsx)(antd_1.Table, { size: sizeForWidth[width], rowKey: "id", rowSelection: (rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.type) && {
            type: rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.type,
            selectedRowKeys: selectedRowKeys,
            onChange: function (selectedRowKeys, row, info) {
                setSelectedRowKeys(selectedRowKeys);
                (rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.onChange) && (rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.onChange(selectedRowKeys, row, info));
            }
        }, loading: loading, dataSource: data, columns: tableColumns, pagination: tablePagination, scroll: tslib_1.__assign({}, scroll), onRow: function (record) {
            return {
                onClick: function () {
                    var index = selectedRowKeys.findIndex(function (ele) { return ele === record.id; });
                    var keys = selectedRowKeys;
                    if ((rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.type) === 'checkbox') {
                        if (index !== -1) {
                            keys.splice(index, 1);
                        }
                        else {
                            keys.push(record.id);
                        }
                        setSelectedRowKeys(tslib_1.__spreadArray([], tslib_1.__read(selectedRowKeys), false));
                    }
                    else {
                        keys = [record.id];
                        setSelectedRowKeys([record.id]);
                    }
                    var row = data.filter(function (ele) { return keys.includes(ele.id); });
                    (rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.onChange) && (rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.onChange(keys, row, { type: 'all' }));
                }
            };
        } }));
}
exports.default = Render;
