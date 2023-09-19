"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
require("./web.less");
function Render(props) {
    const { data } = props;
    const { name, color = '', size, className, style = {}, } = data;
    const isColor = ['primary', 'info', 'success', 'error', 'warning'].includes(color);
    let class_name = 'oak-icon ' + 'oak-icon-' + name;
    if (isColor || color === '') {
        class_name += ' ' + 'oak-icon__' + (color || 'primary');
    }
    if (className) {
        class_name += ' ' + className;
    }
    return ((0, jsx_runtime_1.jsx)("span", { className: class_name, style: Object.assign(style, size && { fontSize: size }, color && !isColor && { color }) }));
}
exports.default = Render;
