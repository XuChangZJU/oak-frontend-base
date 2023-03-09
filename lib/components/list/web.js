"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var antd_1 = require("antd");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var dayjs_1 = tslib_1.__importDefault(require("dayjs"));
function RenderCell(props) {
    var value = props.value, type = props.type, entity = props.entity, color = props.color;
    if (!value) {
        return ((0, jsx_runtime_1.jsx)("div", { children: "--" }));
    }
    // 属性类型是enum要使用标签
    else if (type === 'tag') {
        return ((0, jsx_runtime_1.jsx)(antd_1.Tag, tslib_1.__assign({ color: color }, { children: value })));
    }
    else if (attrType === 'datetime') {
        return (0, jsx_runtime_1.jsx)("div", { children: (0, dayjs_1.default)(value).format('YYYY-MM-DD HH:mm') });
    }
    return ((0, jsx_runtime_1.jsx)("div", { children: value }));
}
function Render(props) {
    var methods = props.methods, oakData = props.data;
    var t = methods.t;
    var _a = tslib_1.__read((0, react_1.useState)([]), 2), tableColumns = _a[0], setTabelColumns = _a[1];
    var oakEntity = oakData.oakEntity, data = oakData.data, columns = oakData.columns, colorDict = oakData.colorDict;
    (0, react_1.useEffect)(function () {
        var tableColumns = columns.map(function (ele) { return ({
            dataIndex: ele.path,
            title: ele.title,
            render: function (v, row) {
                if (v && ele.renderType === 'text') {
                    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: v });
                }
                var value = (0, lodash_1.get)(row, ele.path);
                var color = 'black';
                if (ele.renderType === 'tag') {
                    value = t("".concat(ele.entity, ":v.").concat(ele.attr, ".").concat(value));
                    color = colorDict[ele.entity][ele.attr][value];
                }
                return ((0, jsx_runtime_1.jsx)(RenderCell, { entity: oakEntity, attr: ele.attr, color: color, value: value, type: ele.renderType, t: t }));
            }
        }); });
    }, [data]);
    return ((0, jsx_runtime_1.jsx)(antd_1.Table, { dataSource: data, scroll: { x: 1500 }, columns: columns }));
}
exports.default = Render;
