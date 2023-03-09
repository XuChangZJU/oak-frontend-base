"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_i18next_1 = require("react-i18next");
var antd_1 = require("antd");
var assert_1 = tslib_1.__importDefault(require("assert"));
var usefulFn_1 = require("../../utils/usefulFn");
var lodash_1 = require("oak-domain/lib/utils/lodash");
var dayjs_1 = tslib_1.__importDefault(require("dayjs"));
var actionBtnPanel_1 = tslib_1.__importDefault(require("../actionBtnPanel"));
function decodeTitle(entity, attr) {
    var t = (0, react_i18next_1.useTranslation)().t;
    if (attr === ('$$createAt$$' || '$$updateAt$$')) {
        return t("common:".concat(attr));
    }
    return t("".concat(entity, ":attr.").concat(attr));
}
function RenderCell(props) {
    var content = props.content, entity = props.entity, path = props.path, attr = props.attr, attrType = props.attrType, t = props.t, colorDict = props.colorDict;
    var value = (0, lodash_1.get)(content, path);
    if (!value) {
        return ((0, jsx_runtime_1.jsx)("div", { children: "--" }));
    }
    // 属性类型是enum要使用标签
    else if (attrType === 'enum') {
        return ((0, jsx_runtime_1.jsx)(antd_1.Tag, tslib_1.__assign({ color: colorDict[entity][attr][String(value)] }, { children: t("".concat(entity, ":v.").concat(attr, ".").concat(value)) })));
    }
    else if (attrType === 'datetime') {
        return (0, jsx_runtime_1.jsx)("div", { children: (0, dayjs_1.default)(value).format('YYYY-MM-DD HH:mm') });
    }
    return ((0, jsx_runtime_1.jsx)("div", { children: value }));
}
function Render(props) {
    var methods = props.methods, oakData = props.data;
    var t = methods.t;
    var oakEntity = oakData.oakEntity, data = oakData.data, columns = oakData.columns, _a = oakData.disableOp, disableOp = _a === void 0 ? false : _a, handleClick = oakData.handleClick, colorDict = oakData.colorDict, dataSchema = oakData.dataSchema;
    var tableColumns = columns.map(function (ele) {
        if (ele.path) {
            var _a = (0, usefulFn_1.resolutionPath)(dataSchema, entity, path) || {}, useEntity = _a.entity, attr = _a.attr, attribute = _a.attribute;
        }
        var title = '';
        var render = function () { return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, {}); };
        var path;
        if (typeof ele === 'string') {
            path = ele;
        }
        else {
            path = ele.path;
        }
        title = decodeTitle(useEntity, attr);
        render = function (value, row) { return ((0, jsx_runtime_1.jsx)(RenderCell, { entity: entity, content: row, path: path, attr: attr, attrType: attribute === null || attribute === void 0 ? void 0 : attribute.type, t: t, colorDict: colorDict })); };
        var column = {
            align: 'center',
            title: title,
            dataIndex: typeof ele === 'string' ? ele : ele.dataIndex,
            render: render,
        };
        // 类型如果是枚举类型，那么它的宽度一般不超过160
        if ((attribute === null || attribute === void 0 ? void 0 : attribute.type) === 'enum') {
            Object.assign(column, { width: 160 });
        }
        return Object.assign(column, typeof ele !== 'string' && ele);
    });
    if (tableColumns && tableColumns) {
        tableColumns.unshift({ title: '序号', width: 100, render: function (value, record, index) {
                return index + 1;
            }, });
    }
    if (!disableOp) {
        tableColumns.push({
            fixed: 'right',
            align: 'center',
            title: '操作',
            key: 'operation',
            width: 300,
            render: function (value, row) {
                var id = row === null || row === void 0 ? void 0 : row.id;
                var oakActions = row === null || row === void 0 ? void 0 : row.oakActions;
                (0, assert_1.default)(!!oakActions, '行数据中不存在oakActions, 请禁用(disableOp:true)或添加oakActions');
                return ((0, jsx_runtime_1.jsx)(actionBtnPanel_1.default, { oakId: id, entity: entity, oakActions: oakActions, onClick: function (id, action) { return handleClick && handleClick(id, action); } }));
            }
        });
    }
    return ((0, jsx_runtime_1.jsx)(antd_1.Table, tslib_1.__assign({ dataSource: data, scroll: { x: 1500 }, columns: tableColumns }, tableProps)));
}
exports.default = Render;
