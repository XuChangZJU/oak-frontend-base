"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const index_module_less_1 = tslib_1.__importDefault(require("./index.module.less"));
const antd_1 = require("antd");
const icons_1 = require("@ant-design/icons");
const { confirm } = antd_1.Modal;
function MaskView(props) {
    const { selected, onClick, setVisibleTrue } = props;
    return ((0, jsx_runtime_1.jsx)("div", { className: selected ? index_module_less_1.default['mask-checked'] : index_module_less_1.default.mask, onClick: onClick, children: (0, jsx_runtime_1.jsxs)("div", { className: index_module_less_1.default.row2, children: [(0, jsx_runtime_1.jsx)(antd_1.Checkbox, { checked: selected }), (0, jsx_runtime_1.jsx)(antd_1.Space, { size: 0, split: (0, jsx_runtime_1.jsx)(antd_1.Divider, { type: "vertical" }), children: (0, jsx_runtime_1.jsx)(icons_1.EyeOutlined, { style: {
                            color: 'white',
                            fontSize: '1.4em',
                        }, onClick: (e) => {
                            setVisibleTrue();
                            e.stopPropagation();
                        } }) })] }) }));
}
function ImgBox(props) {
    const { width, height, bordered = false, type = 'contain', src, alt, mode, selected, onClick } = props;
    const [visible, setVisible] = (0, react_1.useState)(false);
    if (bordered) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: index_module_less_1.default.imgBoxBorder, children: [mode === 'select' && ((0, jsx_runtime_1.jsx)(MaskView, { selected: selected, onClick: () => onClick && onClick(), setVisibleTrue: () => {
                        setVisible(true);
                    } })), (0, jsx_runtime_1.jsx)("img", { width: width || 72, height: height || 72, src: src, style: {
                        objectFit: type,
                        borderRadius: 8,
                    }, alt: 'img' || alt }), (0, jsx_runtime_1.jsx)(antd_1.Image, { style: { display: 'none' }, src: src, preview: {
                        visible,
                        src,
                        onVisibleChange: (value) => {
                            setVisible(value);
                        },
                    } })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: index_module_less_1.default.imgBox, children: [mode === 'select' && ((0, jsx_runtime_1.jsx)(MaskView, { selected: selected, onClick: () => onClick && onClick(), setVisibleTrue: () => {
                    setVisible(true);
                } })), (0, jsx_runtime_1.jsx)("img", { width: width || 72, height: height || 72, src: src, style: {
                    objectFit: type,
                }, alt: 'img' || alt }), (0, jsx_runtime_1.jsx)(antd_1.Image, { style: { display: 'none' }, src: src, preview: {
                    visible,
                    src,
                    onVisibleChange: (value) => {
                        setVisible(value);
                    },
                } })] }));
}
exports.default = ImgBox;
