"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var list_1 = tslib_1.__importDefault(require("../list"));
function Render(props) {
    var _a = props.data, oakLoading = _a.oakLoading, rows = _a.rows, onSelect = _a.onSelect, titleLabel = _a.titleLabel, _b = _a.multiple, multiple = _b === void 0 ? false : _b, entity = _a.entity;
    var t = props.methods.t;
    var columns = [{
            dataIndex: 'title',
            title: titleLabel,
        }];
    if (rows && rows.length) {
        return ((0, jsx_runtime_1.jsx)(list_1.default, { entity: entity, data: rows, loading: oakLoading, attributes: [titleLabel], disabledOp: true, rowSelection: {
                type: multiple ? 'checkbox' : 'radio',
                onChange: function (selectRowKeys, selectedRows, info) {
                    onSelect(selectedRows);
                }
            } }));
    }
    return ((0, jsx_runtime_1.jsx)("div", { children: "\u65E0\u6570\u636E" }));
}
exports.default = Render;
