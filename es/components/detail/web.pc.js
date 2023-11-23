import { jsx as _jsx } from "react/jsx-runtime";
import { Tag, Descriptions, Image, Space } from 'antd';
import { getLabel, getType, getValue } from '../../utils/usefulFn';
import { get } from 'oak-domain/lib/utils/lodash';
function RenderRow(props) {
    const { type, value, color } = props;
    if (type === 'image') {
        if (value instanceof Array) {
            return (_jsx(Space, { wrap: true, children: value.map((ele) => (_jsx(Image, { width: 100, height: 100, src: ele, style: { objectFit: 'contain' } }))) }));
        }
        else {
            return (_jsx(Space, { wrap: true, children: _jsx(Image, { width: 100, height: 100, src: value, style: { objectFit: 'contain' } }) }));
        }
    }
    if (type === 'enum') {
        _jsx(Tag, { color: color, children: value });
    }
    return value;
}
export default function Render(props) {
    const { methods, data: oakData } = props;
    const { t } = methods;
    const { entity, title, colorDict, bordered, column, renderData, layout = "horizontal", judgeAttributes, data, } = oakData;
    return (_jsx(Descriptions, { title: title, column: column, bordered: bordered, layout: layout, children: judgeAttributes?.map((ele) => {
            let renderValue = getValue(data, ele.path, ele.entity, ele.attr, ele.attrType, t);
            let renderLabel = getLabel(ele.attribute, ele.entity, ele.attr, t);
            const renderType = getType(ele.attribute, ele.attrType);
            if ([null, '', undefined].includes(renderValue)) {
                renderValue = t('not_filled_in');
            }
            const stateValue = get(data, ele.path);
            const color = colorDict && colorDict[ele.entity]?.[ele.attr]?.[stateValue] || 'default';
            return (_jsx(Descriptions.Item, { label: renderLabel, span: ele.attribute.span || 1, children: _jsx(RenderRow, { type: renderType, value: renderValue, color: color }) }));
        }) }));
}
