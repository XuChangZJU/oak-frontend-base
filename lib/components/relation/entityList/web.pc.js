"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var react_1 = require("react");
function render(props) {
    var entities = props.data.entities;
    var onEntityClicked = props.methods.onEntityClicked;
    var _a = tslib_1.__read((0, react_1.useState)(''), 2), search = _a[0], setSearch = _a[1];
    var entities2 = search ? entities === null || entities === void 0 ? void 0 : entities.filter(function (ele) { return ele.includes(search); }) : entities;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(antd_1.Row, { children: (0, jsx_runtime_1.jsx)(antd_1.Col, tslib_1.__assign({ span: 8, style: { padding: 20 } }, { children: (0, jsx_runtime_1.jsx)(antd_1.Input, { onChange: function (_a) {
                            var currentTarget = _a.currentTarget;
                            return setSearch(currentTarget.value);
                        }, allowClear: true }) })) }), (0, jsx_runtime_1.jsx)(antd_1.Row, tslib_1.__assign({ wrap: true, style: { width: '100%' } }, { children: entities2 === null || entities2 === void 0 ? void 0 : entities2.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_1.Col, tslib_1.__assign({ span: 6, style: { paddingTop: 5, paddingBottom: 5 } }, { children: (0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ type: "link", onClick: function () { return onEntityClicked(ele); } }, { children: ele })) }))); }) }))] }));
}
exports.default = render;
