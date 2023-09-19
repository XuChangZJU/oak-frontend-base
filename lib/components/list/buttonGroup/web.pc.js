"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
function Render(props) {
    const { methods, data: oakData } = props;
    const { items } = oakData;
    // 为了i18更新时能够重新渲染
    return ((0, jsx_runtime_1.jsx)(antd_1.Space, { children: items.filter((ele) => ele.show).map((ele) => ((0, jsx_runtime_1.jsx)(antd_1.Button, { type: ele.type, onClick: ele.onClick, children: ele.label }))) }));
}
exports.default = Render;
