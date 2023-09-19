"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
// TODO 应该是要antd-mobile组件
const antd_1 = require("antd");
const icons_1 = require("@ant-design/icons");
function Render(props) {
    const { methods, data } = props;
    const { t } = methods;
    const { items } = data;
    if (items && items.length === 1) {
        const item = items[0];
        return ((0, jsx_runtime_1.jsx)(antd_1.FloatButton, { shape: "circle", type: "primary", style: { right: 24 }, icon: item.icon, description: item.icon ? null : item.label, onClick: () => item.onClick() }));
    }
    return ((0, jsx_runtime_1.jsx)(antd_1.FloatButton.Group, { shape: 'circle', trigger: "click", type: "primary", style: { right: 24 }, icon: (0, jsx_runtime_1.jsx)(icons_1.BarsOutlined, {}), children: items && items.map((ele) => ((0, jsx_runtime_1.jsx)(antd_1.FloatButton, { icon: ele.icon, description: ele.icon ? null : ele.label, onClick: () => ele.onClick() }))) }));
}
exports.default = Render;
