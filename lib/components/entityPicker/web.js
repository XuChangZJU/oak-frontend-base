"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
function Render(props) {
    var _a = props.data, entity = _a.entity, oakFullpath = _a.oakFullpath, oakLoading = _a.oakLoading, rows = _a.rows, projection = _a.projection, onSelect = _a.onSelect, _b = _a.multiple, multiple = _b === void 0 ? false : _b;
    var t = props.methods.t;
    var columns = Object.keys(projection)
        .filter(function (ele) { return ele !== 'id'; })
        .map(function (ele) { return ({
        dataIndex: ele,
        title: t("".concat(entity, ":attr.").concat(ele)),
    }); });
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)(antd_1.Table, { loading: oakLoading, dataSource: rows, rowKey: "id", rowSelection: {
                type: multiple ? 'checkbox' : 'radio',
                // onSelect: (record) => {
                //     onSelect(record);
                // },
                onChange: function (selectedRowKeys, selectedRows, info) {
                    onSelect(selectedRows);
                },
            }, onRow: !multiple ? function (record) {
                return {
                    onClick: function (event) {
                        onSelect([record]);
                    }, // 点击行
                };
            } : undefined, columns: columns }) }));
}
exports.default = Render;
