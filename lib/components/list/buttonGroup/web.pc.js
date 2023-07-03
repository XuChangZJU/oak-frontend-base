"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
function Render(props) {
    var methods = props.methods, oakData = props.data;
    var items = oakData.items;
    // 为了i18更新时能够重新渲染
    return ((0, jsx_runtime_1.jsx)(antd_1.Space, { children: items.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ type: ele.type, onClick: ele.onClick }, { children: ele.label }))); }) }));
}
exports.default = Render;
