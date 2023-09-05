import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import styles from './index.module.less';
import { Space, Checkbox, Divider, Modal, Image } from 'antd';
import { EyeOutlined, } from '@ant-design/icons';
const { confirm } = Modal;
function MaskView(props) {
    const { selected, onClick, setVisibleTrue } = props;
    return (_jsx("div", { className: selected ? styles['mask-checked'] : styles.mask, onClick: onClick, children: _jsxs("div", { className: styles.row2, children: [_jsx(Checkbox, { checked: selected }), _jsx(Space, { size: 0, split: _jsx(Divider, { type: "vertical" }), children: _jsx(EyeOutlined, { style: {
                            color: 'white',
                            fontSize: '1.4em',
                        }, onClick: (e) => {
                            setVisibleTrue();
                            e.stopPropagation();
                        } }) })] }) }));
}
function ImgBox(props) {
    const { width, height, bordered = false, type = 'contain', src, alt, mode, selected, onClick } = props;
    const [visible, setVisible] = useState(false);
    if (bordered) {
        return (_jsxs("div", { className: styles.imgBoxBorder, children: [mode === 'select' && (_jsx(MaskView, { selected: selected, onClick: () => onClick && onClick(), setVisibleTrue: () => {
                        setVisible(true);
                    } })), _jsx("img", { width: width || 72, height: height || 72, src: src, style: {
                        objectFit: type,
                        borderRadius: 8,
                    }, alt: 'img' || alt }), _jsx(Image, { style: { display: 'none' }, src: src, preview: {
                        visible,
                        src,
                        onVisibleChange: (value) => {
                            setVisible(value);
                        },
                    } })] }));
    }
    return (_jsxs("div", { className: styles.imgBox, children: [mode === 'select' && (_jsx(MaskView, { selected: selected, onClick: () => onClick && onClick(), setVisibleTrue: () => {
                    setVisible(true);
                } })), _jsx("img", { width: width || 72, height: height || 72, src: src, style: {
                    objectFit: type,
                }, alt: 'img' || alt }), _jsx(Image, { style: { display: 'none' }, src: src, preview: {
                    visible,
                    src,
                    onVisibleChange: (value) => {
                        setVisible(value);
                    },
                } })] }));
}
export default ImgBox;
