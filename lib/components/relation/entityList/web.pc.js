"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
function render(props) {
    var entities = props.data.entities;
    var onEntityClick = props.methods.onEntityClick;
    return ((0, jsx_runtime_1.jsx)(antd_1.Row, tslib_1.__assign({ wrap: true, style: { width: '100%' } }, { children: entities.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_1.Col, tslib_1.__assign({ span: 4 }, { children: (0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ type: "link", onClick: function () { return onEntityClick(ele); } }, { children: ele })) }))); }) })));
}
exports.default = render;
