"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var Search = antd_1.Input.Search;
function Render(props) {
    var methods = props.methods, data = props.data;
    var t = methods.t, searchChange = methods.searchChange, searchConfirm = methods.searchConfirm;
    var searchValue = data.searchValue, oakLoading = data.oakLoading;
    return ((0, jsx_runtime_1.jsx)(Search, { loading: oakLoading, value: searchValue, onChange: function (_a) {
            var value = _a.target.value;
            return searchChange(value);
        }, onSearch: function (value) { return searchConfirm(value); }, placeholder: "", allowClear: true }));
}
exports.default = Render;
