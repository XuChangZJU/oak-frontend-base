"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
require("./web.less");
function Render(props) {
    var data = props.data;
    var name = data.name, _a = data.color, color = _a === void 0 ? '' : _a, size = data.size, className = data.className, _b = data.style, style = _b === void 0 ? {} : _b;
    var isColor = ['primary', 'info', 'success', 'error', 'warning'].includes(color);
    var class_name = 'oak-icon ' + 'oak-icon-' + name;
    if (isColor || color === '') {
        class_name += ' ' + 'oak-icon__' + (color || 'primary');
    }
    if (className) {
        class_name += ' ' + className;
    }
    return ((0, jsx_runtime_1.jsx)("span", { className: class_name, style: Object.assign(style, size && { fontSize: size }, color && !isColor && { color: color }) }));
}
exports.default = Render;
