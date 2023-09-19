"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
const imgBox_1 = tslib_1.__importDefault(require("../../imgBox"));
const { Link } = antd_1.Typography;
function Render(props) {
    const { methods, data: oakData } = props;
    const { value, type, color, linkUrl } = oakData;
    if (value === null || value === '' || value === undefined) {
        return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: "--" }));
    }
    // 属性类型是enum要使用标签
    else if (type === 'enum') {
        let renderColor = color || 'default';
        // web端的Tag组件没有primary 和 danger
        if (renderColor === 'primary') {
            renderColor = 'processing';
        }
        if (renderColor === 'danger') {
            renderColor = 'error';
        }
        return ((0, jsx_runtime_1.jsx)(antd_1.Tag, { color: renderColor, children: value }));
    }
    else if (type === 'image') {
        if (value instanceof Array) {
            return ((0, jsx_runtime_1.jsx)(antd_1.Space, { children: value.map((ele) => ((0, jsx_runtime_1.jsx)(imgBox_1.default, { src: ele, width: 120, height: 70 }))) }));
        }
        return ((0, jsx_runtime_1.jsx)(imgBox_1.default, { src: value, width: 120, height: 70 }));
    }
    else if (type === 'link') {
        let href = linkUrl;
        if (value instanceof Array) {
            return ((0, jsx_runtime_1.jsx)(antd_1.Space, { direction: "vertical", children: value.map((ele) => {
                    href = ele;
                    if (linkUrl) {
                        href = linkUrl;
                    }
                    return ((0, jsx_runtime_1.jsx)(Link, { href: href, children: ele }));
                }) }));
        }
        return ((0, jsx_runtime_1.jsx)(Link, { href: href, children: value }));
    }
    return ((0, jsx_runtime_1.jsx)(antd_1.Tooltip, { placement: "topLeft", title: value, children: value }));
}
exports.default = Render;
