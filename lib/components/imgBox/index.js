"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var index_module_less_1 = tslib_1.__importDefault(require("./index.module.less"));
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var confirm = antd_1.Modal.confirm;
function MaskView(props) {
    var selected = props.selected, onClick = props.onClick, setVisibleTrue = props.setVisibleTrue;
    return ((0, jsx_runtime_1.jsx)("div", { className: selected ? index_module_less_1.default['mask-checked'] : index_module_less_1.default.mask, onClick: onClick, children: (0, jsx_runtime_1.jsxs)("div", { className: index_module_less_1.default.row2, children: [(0, jsx_runtime_1.jsx)(antd_1.Checkbox, { checked: selected }), (0, jsx_runtime_1.jsx)(antd_1.Space, { size: 0, split: (0, jsx_runtime_1.jsx)(antd_1.Divider, { type: "vertical" }), children: (0, jsx_runtime_1.jsx)(icons_1.EyeOutlined, { style: {
                            color: 'white',
                            fontSize: '1.4em',
                        }, onClick: function (e) {
                            setVisibleTrue();
                            e.stopPropagation();
                        } }) })] }) }));
}
function ImgBox(props) {
    var width = props.width, height = props.height, _a = props.bordered, bordered = _a === void 0 ? false : _a, _b = props.type, type = _b === void 0 ? 'contain' : _b, src = props.src, alt = props.alt, mode = props.mode, selected = props.selected, onClick = props.onClick;
    var _c = tslib_1.__read((0, react_1.useState)(false), 2), visible = _c[0], setVisible = _c[1];
    if (bordered) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: index_module_less_1.default.imgBoxBorder, children: [mode === 'select' && ((0, jsx_runtime_1.jsx)(MaskView, { selected: selected, onClick: function () { return onClick && onClick(); }, setVisibleTrue: function () {
                        setVisible(true);
                    } })), (0, jsx_runtime_1.jsx)("img", { width: width || 72, height: height || 72, src: src, style: {
                        objectFit: type,
                        borderRadius: 8,
                    }, alt: 'img' || alt }), (0, jsx_runtime_1.jsx)(antd_1.Image, { style: { display: 'none' }, src: src, preview: {
                        visible: visible,
                        src: src,
                        onVisibleChange: function (value) {
                            setVisible(value);
                        },
                    } })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: index_module_less_1.default.imgBox, children: [mode === 'select' && ((0, jsx_runtime_1.jsx)(MaskView, { selected: selected, onClick: function () { return onClick && onClick(); }, setVisibleTrue: function () {
                    setVisible(true);
                } })), (0, jsx_runtime_1.jsx)("img", { width: width || 72, height: height || 72, src: src, style: {
                    objectFit: type,
                }, alt: 'img' || alt }), (0, jsx_runtime_1.jsx)(antd_1.Image, { style: { display: 'none' }, src: src, preview: {
                    visible: visible,
                    src: src,
                    onVisibleChange: function (value) {
                        setVisible(value);
                    },
                } })] }));
}
exports.default = ImgBox;
