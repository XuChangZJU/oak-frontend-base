"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
function Render(props) {
    const { items, title } = props;
    const items2 = items.concat({ title });
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(antd_1.Breadcrumb, { items: items2.map((ele) => {
                    const { title, href } = ele;
                    if (href) {
                        return {
                            title,
                            href,
                        };
                    }
                    return {
                        title,
                    };
                }) }), (0, jsx_runtime_1.jsx)(antd_1.Divider, { style: { marginTop: 4 } })] }));
}
exports.default = Render;
