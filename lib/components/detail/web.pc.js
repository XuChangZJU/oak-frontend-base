"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var usefulFn_1 = require("../../utils/usefulFn");
var lodash_1 = require("oak-domain/lib/utils/lodash");
function RenderRow(props) {
    var type = props.type, value = props.value, color = props.color;
    if (type === 'image') {
        if (value instanceof Array) {
            return ((0, jsx_runtime_1.jsx)(antd_1.Space, { wrap: true, children: value.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_1.Image, { width: 100, height: 100, src: ele, style: { objectFit: 'contain' } })); }) }));
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
    var methods = props.methods, oakData = props.data;
    var t = methods.t;
    var entity = oakData.entity, title = oakData.title, colorDict = oakData.colorDict, bordered = oakData.bordered, column = oakData.column, renderData = oakData.renderData, _a = oakData.layout, layout = _a === void 0 ? "horizontal" : _a, judgeAttributes = oakData.judgeAttributes, data = oakData.data;
    return ((0, jsx_runtime_1.jsx)(antd_1.Descriptions, { title: title, column: column, bordered: bordered, layout: layout, children: judgeAttributes === null || judgeAttributes === void 0 ? void 0 : judgeAttributes.map(function (ele) {
            var _a, _b;
            var renderValue = (0, usefulFn_1.getValue)(data, ele.path, ele.entity, ele.attr, ele.attrType, t);
            var renderLabel = (0, usefulFn_1.getLabel)(ele.attribute, ele.entity, ele.attr, t);
            var renderType = (0, usefulFn_1.getType)(ele.attribute, ele.attrType);
            if ([null, '', undefined].includes(renderValue)) {
                renderValue = t('not_filled_in');
            }
            var stateValue = (0, lodash_1.get)(data, ele.path);
            var color = colorDict && ((_b = (_a = colorDict[ele.entity]) === null || _a === void 0 ? void 0 : _a[ele.attr]) === null || _b === void 0 ? void 0 : _b[stateValue]) || 'default';
            return ((0, jsx_runtime_1.jsx)(antd_1.Descriptions.Item, { label: renderLabel, span: ele.attribute.span || 1, children: (0, jsx_runtime_1.jsx)(RenderRow, { type: renderType, value: renderValue, color: color }) }));
        }) }));
}
exports.default = Render;
