"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_i18next_1 = require("react-i18next");
var antd_1 = require("antd");
var assert_1 = tslib_1.__importDefault(require("assert"));
var useFeatures_1 = tslib_1.__importDefault(require("../../hooks/useFeatures"));
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
// 解析路径， 获取属性类型、属性值、以及实体名称
function Fn(entity, path) {
    var _entity = entity;
    var attr;
    (0, assert_1.default)(!path.includes('['), '数组索引不需要携带[],请使用arr.0.value');
    var features = (0, useFeatures_1.default)();
    var dataSchema = features.cache.getSchema();
    if (!path.includes('.')) {
        attr = path;
    }
    else {
        var strs = path.split('.');
        // 最后一个肯定是属性
        attr = strs.pop();
        // 倒数第二个可能是类名可能是索引
        _entity = strs.pop();
        // 判断是否是数组索引
        if (!Number.isNaN(Number(_entity))) {
            _entity = strs.pop().split('$')[0];
        }
    }
    var attributes = (0, usefulFn_1.getAttributes)(dataSchema[_entity].attributes);
    var attribute = attributes[attr];
    return {
        entity: _entity,
        attr: attr,
        attribute: attribute,
    };
}
function RenderCell(props) {
    var content = props.content, entity = props.entity, path = props.path, attr = props.attr, attrType = props.attrType;
    var value = (0, lodash_1.get)(content, path);
    var t = (0, react_i18next_1.useTranslation)().t;
    var feature = (0, useFeatures_1.default)();
    var colorDict = feature.style.getColorDict();
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
function List(props) {
    var data = props.data, columns = props.columns, entity = props.entity, _a = props.disableOp, disableOp = _a === void 0 ? false : _a, tableProps = props.tableProps;
    var t = (0, react_i18next_1.useTranslation)().t;
    var tableColumns = columns.map(function (ele) {
        var title = '';
        var render = function () { return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, {}); };
        var path;
        if (typeof ele === 'string') {
            path = ele;
        }
        else {
            path = ele.path;
        }
        var _a = Fn(entity, path) || {}, useEntity = _a.entity, attr = _a.attr, attribute = _a.attribute;
        title = decodeTitle(useEntity, attr);
        render = function (value, row) { return ((0, jsx_runtime_1.jsx)(RenderCell, { entity: entity, content: row, path: path, attr: attr, attrType: attribute.type })); };
        var column = {
            align: 'center',
            title: title,
            dataIndex: typeof ele === 'string' ? ele : ele.dataIndex,
            render: render,
        };
        // 类型如果是枚举类型，那么它的宽度一般不超过160
        // if (attribute?.type === 'enum') {
        //     Object.assign(column, {width: 160})
        // }
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
                return ((0, jsx_runtime_1.jsx)(actionBtnPanel_1.default, { oakId: id, oakActions: oakActions }));
            }
        });
    }
    return ((0, jsx_runtime_1.jsx)(antd_1.Table, { dataSource: data, scroll: { x: 2200 }, columns: tableColumns }));
}
exports.default = List;
