"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
const { Search } = antd_1.Input;
function Render(props) {
    const { methods, data } = props;
    const { t, searchChange, searchConfirm } = methods;
    const { searchValue, oakLoading, } = data;
    return ((0, jsx_runtime_1.jsx)(Search, { loading: oakLoading, value: searchValue, onChange: ({ target: { value } }) => searchChange(value), onSearch: (value) => searchConfirm(value), placeholder: "", allowClear: true }));
}
exports.default = Render;
