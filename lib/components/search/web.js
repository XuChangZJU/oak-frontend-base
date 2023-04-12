"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_mobile_1 = require("antd-mobile");
function Render(props) {
    var methods = props.methods, data = props.data;
    var t = methods.t, searchChange = methods.searchChange, searchConfirm = methods.searchConfirm, searchClear = methods.searchClear;
    var searchValue = data.searchValue, _a = data.placeholder, placeholder = _a === void 0 ? '请输入' : _a;
    return ((0, jsx_runtime_1.jsx)(antd_mobile_1.SearchBar, { value: searchValue, placeholder: placeholder, showCancelButton: true, onChange: searchChange, onSearch: searchConfirm, onClear: function () { return searchClear(); } }));
}
exports.default = Render;
