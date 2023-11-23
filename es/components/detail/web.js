import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Space, Image } from 'antd-mobile';
import styles from './mobile.module.less';
// type Width = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
import { getLabel, getType, getValue } from '../../utils/usefulFn';
function RenderRow(props) {
    const { type, label, value } = props;
    if (type === 'image') {
        if (value instanceof Array) {
            return (_jsxs("div", { className: styles.renderRow, children: [_jsx("div", { className: styles.renderLabel, children: label }), _jsx(Space, { wrap: true, children: value.map((ele) => (_jsx(Image, { width: 70, height: 70, src: ele, fit: "contain" }))) })] }));
        }
        else {
            return (_jsxs("div", { className: styles.renderRow, children: [_jsx("div", { className: styles.renderLabel, children: label }), _jsx(Space, { wrap: true, children: _jsx(Image, { width: 70, height: 70, src: value, fit: "contain" }) })] }));
        }
    }
    return (_jsxs("div", { className: styles.renderRow, children: [_jsx("div", { className: styles.renderLabel, children: label }), _jsx("div", { className: styles.renderValue, children: value ? String(value) : '--' })] }));
}
export default function Render(props) {
    const { methods, data: oakData } = props;
    const { t } = methods;
    const { title, renderData, entity, judgeAttributes, data, } = oakData;
    return (_jsxs("div", { className: styles.panel, children: [title && (_jsx("div", { className: styles.title, children: title })), _jsx("div", { className: styles.panel_content, children: _jsx(Space, { direction: "vertical", style: { '--gap': '10px' }, children: judgeAttributes && judgeAttributes.map((ele) => {
                        let renderValue = getValue(data, ele.path, ele.entity, ele.attr, ele.attrType, t);
                        let renderLabel = getLabel(ele.attribute, ele.entity, ele.attr, t);
                        const renderType = getType(ele.attribute, ele.attrType);
                        if ([null, '', undefined].includes(renderValue)) {
                            renderValue = t('not_filled_in');
                        }
                        return (_jsx(RenderRow, { label: renderLabel, value: renderValue, type: renderType }));
                    }) }) })] }));
}
