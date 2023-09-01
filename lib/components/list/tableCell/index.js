"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var imgBox_1 = tslib_1.__importDefault(require("../../imgBox"));
var Link = antd_1.Typography.Link;
function TableCell(props) {
    var value = props.value, type = props.type, color = props.color;
    if (!value) {
        return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: "--" }));
    }
    // 属性类型是enum要使用标签
    else if (type === 'enum') {
        return ((0, jsx_runtime_1.jsx)(antd_1.Tag, tslib_1.__assign({ color: color }, { children: value })));
    }
    else if (type === 'image') {
        if (value instanceof Array) {
            return ((0, jsx_runtime_1.jsx)(antd_1.Space, { children: value.map(function (ele) { return ((0, jsx_runtime_1.jsx)(imgBox_1.default, { src: ele, width: 120, height: 70 })); }) }));
        }
        return ((0, jsx_runtime_1.jsx)(imgBox_1.default, { src: value, width: 120, height: 70 }));
    }
    else if (type === 'link') {
        if (value instanceof Array) {
            return ((0, jsx_runtime_1.jsx)(antd_1.Space, tslib_1.__assign({ direction: "vertical" }, { children: value.map(function (ele) { return ((0, jsx_runtime_1.jsx)(Link, tslib_1.__assign({ href: ele, target: "_blank" }, { children: ele }))); }) })));
        }
        return ((0, jsx_runtime_1.jsx)(Link, tslib_1.__assign({ href: value, target: "_blank" }, { children: value })));
    }
    return ((0, jsx_runtime_1.jsx)(antd_1.Tooltip, tslib_1.__assign({ placement: "topLeft", title: value }, { children: value })));
}
exports.default = TableCell;
