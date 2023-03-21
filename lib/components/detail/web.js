"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var web_module_less_1 = tslib_1.__importDefault(require("./web.module.less"));
var DEFAULT_COLUMN_MAP = {
    xxl: 4,
    xl: 4,
    lg: 4,
    md: 3,
    sm: 2,
    xs: 1,
};
// function getColumn(column: ColSpanType | ColumnMapType, width: Width) {
//     if (typeof column === 'number') {
//         return column;
//     }
//     if (typeof column === 'object') {
//         if (column[width] !== undefined) {
//             return column[width] || DEFAULT_COLUMN_MAP[width];
//         }
//     }
//     return 3;
// }
function Render(props) {
    var methods = props.methods, oakData = props.data;
    var t = methods.t;
    var entity = oakData.entity, handleClick = oakData.handleClick, colorDict = oakData.colorDict, dataSchema = oakData.dataSchema, _a = oakData.column, column = _a === void 0 ? DEFAULT_COLUMN_MAP : _a, renderData = oakData.renderData;
    var data = renderData === null || renderData === void 0 ? void 0 : renderData.map(function (ele) {
        var _a;
        var item = {
            label: ele.label,
            span: 1,
            value: ele.value || '未填写',
            attr: ele.attr,
        };
        // 类型如果是日期占两格，文本类型占4格
        // if (ele?.type === 'datetime') {
        //     Object.assign(item, { span: 2 });
        // }
        if ((ele === null || ele === void 0 ? void 0 : ele.type) === 'text') {
            Object.assign(item, { span: 4 });
        }
        //类型如果是枚举，用tag
        if ((ele === null || ele === void 0 ? void 0 : ele.type) === 'enum') {
            Object.assign(item, {
                value: ((0, jsx_runtime_1.jsx)(antd_1.Tag, tslib_1.__assign({ color: colorDict[entity][ele.attr][String(ele.value)] }, { children: t("".concat(entity, ":v.").concat(ele.attr, ".").concat(ele.value)) }))),
            });
        }
        if ((ele === null || ele === void 0 ? void 0 : ele.type) === 'img') {
            Object.assign(item, {
                value: ((0, jsx_runtime_1.jsx)("div", { children: (_a = ele.value) === null || _a === void 0 ? void 0 : _a.map(function (ele1) { return ((0, jsx_runtime_1.jsx)(antd_1.Image, { src: ele1, width: 120, height: 120, className: web_module_less_1.default.img })); }) })),
                span: 4,
            });
        }
        return Object.assign(item);
    });
    console.log(data);
    return ((0, jsx_runtime_1.jsx)(antd_1.Descriptions, tslib_1.__assign({ column: column, bordered: true }, { children: data === null || data === void 0 ? void 0 : data.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_1.Descriptions.Item, tslib_1.__assign({ label: ele.label, span: ele.span || 1 }, { children: ele.value }))); }) })));
}
exports.default = Render;
