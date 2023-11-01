"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const web_module_less_1 = tslib_1.__importDefault(require("./web.module.less"));
function render(props) {
    const { t } = props.methods;
    return ((0, jsx_runtime_1.jsx)("div", { className: web_module_less_1.default.container, children: t('useWideScreen') }));
}
exports.default = render;
