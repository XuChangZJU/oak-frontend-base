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
function Render(props) {
    var methods = props.methods, oakData = props.data;
    var t = methods.t;
    var _a = tslib_1.__read((0, react_1.useState)([]), 2), tableColumns = _a[0], setTabelColumns = _a[1];
    var oakEntity = oakData.oakEntity, data = oakData.data, columns = oakData.columns, colorDict = oakData.colorDict, _b = oakData.disabledOp, disabledOp = _b === void 0 ? false : _b, handleClick = oakData.handleClick, tablePagination = oakData.tablePagination;
    (0, react_1.useEffect)(function () {
        var tableColumns = columns.map(function (ele) {
            var column = {
                dataIndex: ele.path,
                title: ele.title,
                render: function (v, row) {
                    if (v && ele.type === 'text') {
                        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: v });
                    }
                    var value = (0, lodash_1.get)(row, ele.path);
                    var color = 'black';
                    if (ele.type === 'tag') {
                        value = t("".concat(ele.entity, ":v.").concat(ele.attr, ".").concat(value));
                        color = colorDict[ele.entity][ele.attr][value];
                    }
                    return ((0, jsx_runtime_1.jsx)(RenderCell, { color: color, value: value, type: ele.type }));
                }
            };
            if (ele.width) {
                Object.assign(ele, { width: ele.width });
            }
            return column;
        });
        if (!disabledOp) {
            tableColumns.push({
                fixed: 'right',
                align: 'center',
                title: '操作',
                key: 'operation',
                width: 300,
                render: function (value, row) {
                    var id = row === null || row === void 0 ? void 0 : row.id;
                    var oakActions = row === null || row === void 0 ? void 0 : row.oakActions;
                    (0, assert_1.default)(!!oakActions, '行数据中不存在oakActions, 请禁用(disableOp:true)或添加oakActions');
                    return ((0, jsx_runtime_1.jsx)(actionBtn_1.default, { entity: oakEntity, actions: oakActions, onClick: function (action) { return handleClick && handleClick(id, action); } }));
                }
            });
        }
        setTabelColumns(tableColumns);
    }, [data]);
    return ((0, jsx_runtime_1.jsx)(antd_1.Table, { dataSource: data, scroll: { x: 1500 }, columns: tableColumns, pagination: tablePagination }));
}
exports.default = Render;
