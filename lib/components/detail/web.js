"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
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
    var data = renderData.map(function (ele) {
        var item = {
            label: ele.label,
            span: 1,
            value: ele.value,
        };
        // 类型如果是日期占两格，文本类型占4格
        if ((ele === null || ele === void 0 ? void 0 : ele.type) === 'datetime') {
            Object.assign(item, { span: 2 });
        }
        if ((ele === null || ele === void 0 ? void 0 : ele.type) === 'text') {
            Object.assign(item, { span: 4 });
        }
        // //类型如果是枚举，用tag
        // if (ele?.type === 'enum') {
        //     Object.assign(item, {
        //         value: (
        //             <Tag color={colorDict![entity]![attr]![String(ele.value)]}>
        //                 {ele.value}
        //             </Tag>
        //         ),
        //     });
        // }
        if ((ele === null || ele === void 0 ? void 0 : ele.type) === 'image') {
            Object.assign(item, {
                value: (0, jsx_runtime_1.jsx)(antd_1.Image, { src: ele.value }),
                span: 4,
            });
        }
        return Object.assign(item, typeof ele !== 'string' && ele);
    });
    return ((0, jsx_runtime_1.jsx)(antd_1.Descriptions, tslib_1.__assign({ column: column }, { children: data === null || data === void 0 ? void 0 : data.map(function (ele) { return ((0, jsx_runtime_1.jsx)(antd_1.Descriptions.Item, tslib_1.__assign({ label: ele.label, span: ele.span || 1 }, { children: ele.value }))); }) })));
}
exports.default = Render;
