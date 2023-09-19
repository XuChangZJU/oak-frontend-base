"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
const usefulFn_1 = require("../../utils/usefulFn");
const lodash_1 = require("oak-domain/lib/utils/lodash");
function RenderRow(props) {
    const { type, value, color } = props;
    if (type === 'image') {
        if (value instanceof Array) {
            return ((0, jsx_runtime_1.jsx)(antd_1.Space, { wrap: true, children: value.map((ele) => ((0, jsx_runtime_1.jsx)(antd_1.Image, { width: 100, height: 100, src: ele, style: { objectFit: 'contain' } }))) }));
        }
        else {
            return ((0, jsx_runtime_1.jsx)(antd_1.Space, { wrap: true, children: (0, jsx_runtime_1.jsx)(antd_1.Image, { width: 100, height: 100, src: value, style: { objectFit: 'contain' } }) }));
        }
    }
    if (type === 'enum') {
        (0, jsx_runtime_1.jsx)(antd_1.Tag, { color: color, children: value });
    }
    return value;
}
function Render(props) {
    const { methods, data: oakData } = props;
    const { t } = methods;
    const { entity, title, colorDict, bordered, column, renderData, layout = "horizontal", judgeAttributes, data, } = oakData;
    return ((0, jsx_runtime_1.jsx)(antd_1.Descriptions, { title: title, column: column, bordered: bordered, layout: layout, children: judgeAttributes?.map((ele) => {
            let renderValue = (0, usefulFn_1.getValue)(data, ele.path, ele.entity, ele.attr, ele.attrType, t);
            let renderLabel = (0, usefulFn_1.getLabel)(ele.attribute, ele.entity, ele.attr, t);
            const renderType = (0, usefulFn_1.getType)(ele.attribute, ele.attrType);
            if ([null, '', undefined].includes(renderValue)) {
                renderValue = t('not_filled_in');
            }
            const stateValue = (0, lodash_1.get)(data, ele.path);
            const color = colorDict && colorDict[ele.entity]?.[ele.attr]?.[stateValue] || 'default';
            return ((0, jsx_runtime_1.jsx)(antd_1.Descriptions.Item, { label: renderLabel, span: ele.attribute.span || 1, children: (0, jsx_runtime_1.jsx)(RenderRow, { type: renderType, value: renderValue, color: color }) }));
        }) }));
}
exports.default = Render;
