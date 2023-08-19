"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var dayjs_1 = tslib_1.__importDefault(require("dayjs"));
function RenderRow(props) {
    var type = props.type, value = props.value, color = props.color;
    if (type === 'image') {
        if (value instanceof Array) {
            return ((0, jsx_runtime_1.jsx)(antd_1.Space, tslib_1.__assign({ wrap: true }, { children: value.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_1.Image, { width: 100, height: 100, src: ele, style: { objectFit: 'contain' } })); }) })));
        }
        else {
            return ((0, jsx_runtime_1.jsx)(antd_1.Space, tslib_1.__assign({ wrap: true }, { children: (0, jsx_runtime_1.jsx)(antd_1.Image, { width: 100, height: 100, src: value, style: { objectFit: 'contain' } }) })));
        }
    }
    if (type === 'enum') {
        (0, jsx_runtime_1.jsx)(antd_1.Tag, tslib_1.__assign({ color: color }, { children: value }));
    }
    return value;
}
function Render(props) {
    var methods = props.methods, oakData = props.data;
    var t = methods.t;
    var entity = oakData.entity, title = oakData.title, colorDict = oakData.colorDict, bordered = oakData.bordered, column = oakData.column, renderData = oakData.renderData, _a = oakData.layout, layout = _a === void 0 ? "horizontal" : _a;
    return ((0, jsx_runtime_1.jsx)(antd_1.Descriptions, tslib_1.__assign({ title: title, column: column, bordered: bordered, layout: layout }, { children: renderData === null || renderData === void 0 ? void 0 : renderData.map(function (ele) {
            var _a, _b;
            var renderValue = ele.value || t('not_filled_in');
            var color = colorDict && ((_b = (_a = colorDict[entity]) === null || _a === void 0 ? void 0 : _a[ele.attr]) === null || _b === void 0 ? void 0 : _b[ele.value]) || 'default';
            if (ele.type === 'enum') {
                renderValue = ele.value && t("".concat(entity, ":v.").concat(ele.attr, ".").concat(ele.value));
            }
            if (ele.type === 'datetime') {
                renderValue = ele.value && (0, dayjs_1.default)(ele.value).format('YYYY-MM-DD');
            }
            return ((0, jsx_runtime_1.jsx)(antd_1.Descriptions.Item, tslib_1.__assign({ label: ele.label, span: ele.span || 1 }, { children: (0, jsx_runtime_1.jsx)(RenderRow, { type: ele.type, value: renderValue, color: color }) })));
        }) })));
}
exports.default = Render;
