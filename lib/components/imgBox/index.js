"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var index_module_less_1 = tslib_1.__importDefault(require("./index.module.less"));
function ImgBox(props) {
    var width = props.width, height = props.height, _a = props.bordered, bordered = _a === void 0 ? false : _a, _b = props.type, type = _b === void 0 ? 'contain' : _b, src = props.src, alt = props.alt;
    if (bordered) {
        return ((0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ className: index_module_less_1.default.imgBox }, { children: (0, jsx_runtime_1.jsx)("img", { width: 72 || width, height: 72 || height, src: src, style: {
                    objectFit: type,
                    borderRadius: 8,
                }, alt: 'img' || alt }) })));
    }
    return ((0, jsx_runtime_1.jsx)("img", { width: 72 || width, height: 72 || height, src: src, style: {
            objectFit: type,
        }, alt: 'img' || alt }));
}
exports.default = ImgBox;
