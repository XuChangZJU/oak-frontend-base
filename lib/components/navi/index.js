"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var features_1 = require("../../platforms/web/features");
function Render(props) {
    var items = props.items, title = props.title;
    var items2 = items.concat({ title: title });
    var navigator = (0, features_1.useFeatures)().navigator;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(antd_1.Breadcrumb, { items: items2.map(function (ele) {
                    var title = ele.title, href = ele.href;
                    if (href) {
                        return {
                            title: title,
                            href: href,
                        };
                    }
                    return {
                        title: title,
                    };
                }) }), (0, jsx_runtime_1.jsx)(antd_1.Divider, { style: { marginTop: 4 } })] }));
}
exports.default = Render;
