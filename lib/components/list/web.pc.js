"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var antd_1 = require("antd");
var assert_1 = tslib_1.__importDefault(require("assert"));
var lodash_1 = require("oak-domain/lib/utils/lodash");
var actionBtn_1 = tslib_1.__importDefault(require("../actionBtn"));
var usefulFn_1 = require("../../utils/usefulFn");
var renderCell_1 = tslib_1.__importDefault(require("./renderCell"));
var listPro_1 = require("../listPro");
function Render(props) {
    var _a, _b;
    var methods = props.methods, oakData = props.data;
    var t = methods.t;
    var loading = oakData.loading, entity = oakData.entity, schema = oakData.schema, extraActions = oakData.extraActions, data = oakData.data, colorDict = oakData.colorDict, _c = oakData.disabledOp, disabledOp = _c === void 0 ? false : _c, tablePagination = oakData.tablePagination, onAction = oakData.onAction, rowSelection = oakData.rowSelection, attributes = oakData.attributes, i18n = oakData.i18n, hideHeader = oakData.hideHeader;
    var _d = tslib_1.__read((0, react_1.useState)([]), 2), tableColumns = _d[0], setTabelColumns = _d[1];
    var _e = (0, react_1.useContext)(listPro_1.TableContext), tableAttributes = _e.tableAttributes, setSchema = _e.setSchema;
    // 为了i18更新时能够重新渲染
    var zhCNKeys = ((_b = (_a = i18n === null || i18n === void 0 ? void 0 : i18n.store) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.zh_CN) && Object.keys(i18n.store.data.zh_CN).length;
    var selectedRowKeys = (rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.selectedRowKeys) || [];
    // 如果字段过多，给table加上
    var showScroll = attributes && attributes.length >= 8;
    (0, react_1.useEffect)(function () {
        if (schema) {
            setSchema && setSchema(schema);
            var showAttributes = attributes;
            if (tableAttributes) {
                showAttributes = tableAttributes.filter(function (ele) { return ele.show; }).map(function (ele) { return ele.attribute; });
            }
            var tableColumns_1 = showAttributes && showAttributes.map(function (ele) {
                var path = (0, usefulFn_1.getPath)(ele);
                var _a = (0, usefulFn_1.resolvePath)(schema, entity, path), attrType = _a.attrType, attr = _a.attr, entityI8n = _a.entity;
                if (entityI8n === 'notExist') {
                    (0, assert_1.default)(ele.width, "\u975Eschema\u5C5E\u6027".concat(attr, "\u9700\u8981\u81EA\u5B9A\u4E49width"));
                    (0, assert_1.default)(ele.type, "\u975Eschema\u5C5E\u6027".concat(attr, "\u9700\u8981\u81EA\u5B9A\u4E49type"));
                    (0, assert_1.default)(ele.label, "\u975Eschema\u5C5E\u6027".concat(attr, "\u9700\u8981\u81EA\u5B9A\u4E49label"));
                }
                var title = (0, usefulFn_1.getLabel)(ele, entityI8n, attr, t);
                var width = (0, usefulFn_1.getWidth)(ele, attrType);
                var type = (0, usefulFn_1.getType)(ele, attrType);
                var align = (0, usefulFn_1.getAlign)(attrType);
                var column = {
                    key: path,
                    title: title,
                    align: align,
                    render: function (v, row) {
                        var _a, _b;
                        var value = (0, usefulFn_1.getValue)(row, path, entityI8n, attr, attrType, t);
                        var stateValue = (0, lodash_1.get)(row, path);
                        if (!stateValue) {
                            return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, {});
                        }
                        var color = colorDict && ((_b = (_a = colorDict[entityI8n]) === null || _a === void 0 ? void 0 : _a[attr]) === null || _b === void 0 ? void 0 : _b[stateValue]);
                        if (type === 'enum') {
                            (0, assert_1.default)(color, "".concat(entity, "\u5B9E\u4F53").concat(attr, "\u989C\u8272\u5B9A\u4E49\u7F3A\u5931"));
                        }
                        return ((0, jsx_runtime_1.jsx)(renderCell_1.default, { color: color, value: value, type: type }));
                    }
                };
                if (width) {
                    Object.assign(column, { width: width });
                }
                else {
                    // 没有宽度的设置ellipsis
                    Object.assign(column, {
                        ellipsis: {
                            showTitle: false,
                        }
                    });
                }
                return column;
            });
            if (!disabledOp && tableColumns_1) {
                tableColumns_1.push({
                    fixed: 'right',
                    align: 'left',
                    title: '操作',
                    key: 'operation',
                    width: 280,
                    render: function (value, row) {
                        var oakActions = row === null || row === void 0 ? void 0 : row['#oakLegalActions'];
                        // assert(!!oakActions, '行数据中不存在#oakLegalActions, 请禁用(disableOp:true)或添加actions')
                        return ((0, jsx_runtime_1.jsx)(actionBtn_1.default, { entity: entity, extraActions: extraActions, actions: oakActions || [], cascadeActions: row === null || row === void 0 ? void 0 : row['#oakLegalCascadeActions'], onAction: function (action, cascadeAction) { return onAction && onAction(row, action, cascadeAction); } }));
                    }
                });
            }
            setTabelColumns(tableColumns_1);
        }
    }, [data, zhCNKeys, schema, tableAttributes]);
    return ((0, jsx_runtime_1.jsx)(antd_1.Table, { rowKey: "id", rowSelection: (rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.type) && {
            type: rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.type,
            selectedRowKeys: selectedRowKeys,
            onChange: function (selectedRowKeys, row, info) {
                (rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.onChange) && (rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.onChange(selectedRowKeys, row, info));
            }
        }, loading: loading, dataSource: data, columns: tableColumns, pagination: tablePagination, scroll: showScroll ? {
            scrollToFirstRowOnChange: true,
            x: 1200,
        } : {}, onRow: function (record) {
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
                    }
                    else {
                        keys = [record.id];
                    }
                    var row = data.filter(function (ele) { return keys.includes(ele.id); });
                    (rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.onChange) && (rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.onChange(keys, row, { type: 'all' }));
                }
            };
        }, showHeader: !hideHeader }));
}
exports.default = Render;
