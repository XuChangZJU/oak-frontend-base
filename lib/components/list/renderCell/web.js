"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var imgBox_1 = tslib_1.__importDefault(require("../../imgBox"));
var Link = antd_1.Typography.Link, Text = antd_1.Typography.Text;
function Render(props) {
    var methods = props.methods, oakData = props.data;
    var value = oakData.value, type = oakData.type, color = oakData.color;
    if (value === null || value === '' || value === undefined) {
        return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: "--" }));
    }
    else if (type === 'image') {
        if (value instanceof Array) {
            return ((0, jsx_runtime_1.jsx)(antd_1.Space, { children: value.map(function (ele) { return ((0, jsx_runtime_1.jsx)(imgBox_1.default, { src: ele, width: 100, height: 60 })); }) }));
        }
        return ((0, jsx_runtime_1.jsx)(imgBox_1.default, { src: value, width: 100, height: 60 }));
    }
    else if (type === 'link') {
        if (value instanceof Array) {
            return ((0, jsx_runtime_1.jsx)(antd_1.Space, { direction: "vertical", children: value.map(function (ele) { return ((0, jsx_runtime_1.jsx)(Link, { href: ele, target: "_blank", ellipsis: true, children: ele })); }) }));
        }
        return ((0, jsx_runtime_1.jsx)(Link, { href: value, target: "_blank", ellipsis: true, children: value }));
    }
    return ((0, jsx_runtime_1.jsx)(Text, { ellipsis: true, children: value }));
}
exports.default = Render;
