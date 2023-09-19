"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
const list_1 = tslib_1.__importDefault(require("../list"));
function Render(props) {
    const { oakLoading, rows, onSelect, titleLabel, multiple = false, entity, } = props.data;
    const { t } = props.methods;
    const columns = [{
            dataIndex: 'title',
            title: titleLabel,
        }];
    if (rows && rows.length) {
        return ((0, jsx_runtime_1.jsx)(list_1.default, { entity: entity, data: rows, loading: oakLoading, attributes: [titleLabel], disabledOp: true, rowSelection: {
                type: multiple ? 'checkbox' : 'radio',
                onChange: (selectRowKeys, selectedRows, info) => {
                    onSelect(selectedRows);
                }
            } }));
    }
    return ((0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(antd_1.Empty, { image: antd_1.Empty.PRESENTED_IMAGE_SIMPLE }) }));
}
exports.default = Render;
