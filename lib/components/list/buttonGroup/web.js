"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
// TODO 应该是要antd-mobile组件
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
function Render(props) {
    var methods = props.methods, data = props.data;
    var t = methods.t;
    var items = data.items;
    if (items && items.length === 1) {
        var item_1 = items[0];
        return ((0, jsx_runtime_1.jsx)(antd_1.FloatButton, { shape: "circle", type: "primary", style: { right: 24 }, icon: item_1.icon, description: item_1.icon ? null : item_1.label, onClick: function () { return item_1.onClick(); } }));
    }
    return ((0, jsx_runtime_1.jsx)(antd_1.FloatButton.Group, tslib_1.__assign({ shape: 'circle', trigger: "click", type: "primary", style: { right: 24 }, icon: (0, jsx_runtime_1.jsx)(icons_1.BarsOutlined, {}) }, { children: items && items.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_1.FloatButton, { icon: ele.icon, description: ele.icon ? null : ele.label, onClick: function () { return ele.onClick(); } })); }) })));
}
exports.default = Render;
