"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_mobile_1 = require("antd-mobile");
function Render(props) {
    const { methods, data } = props;
    const { t, searchChange, searchConfirm, searchClear } = methods;
    const { searchValue, placeholder = '请输入' } = data;
    return ((0, jsx_runtime_1.jsx)(antd_mobile_1.SearchBar, { value: searchValue, placeholder: placeholder, showCancelButton: true, onChange: searchChange, onSearch: searchConfirm, onClear: () => searchClear() }));
}
exports.default = Render;
