"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var utils_1 = require("../query/utils");
var entityPicker_1 = tslib_1.__importDefault(require("../entityPicker"));
var lodash_1 = require("oak-domain/lib/utils/lodash");
var assert_1 = require("oak-domain/lib/utils/assert");
function Render(props) {
    var _a = props.data, onSearch = _a.onSearch, entity = _a.entity, oakFullpath = _a.oakFullpath, _b = _a.formItem, formItem = _b === void 0 ? true : _b, column = _a.column;
    var _c = props.methods, t = _c.t, refresh = _c.refresh, getNamedFilter = _c.getNamedFilter, removeNamedFilterByName = _c.removeNamedFilterByName, addNamedFilter = _c.addNamedFilter, getRefByAttr = _c.getRefByAttr, setMessage = _c.setMessage, getEntityData = _c.getEntityData;
    var _d = tslib_1.__read((0, react_1.useState)(false), 2), open = _d[0], setOpen = _d[1];
    var _e = tslib_1.__read((0, react_1.useState)([]), 2), selectRows = _e[0], setSelectRows = _e[1];
    var op = column.op, attr = column.attr, label = column.label, _f = column.transformValue, transformValue = _f === void 0 ? function (column, filter) { return (0, lodash_1.get)(filter, (0, utils_1.getOp)(column), ''); } : _f, _g = column.transformFilter, transformFilter = _g === void 0 ? function (column, value) { return (0, lodash_1.set)({}, (0, utils_1.getOp)(column), value); } : _g, placeholder = column.placeholder, refProps = column.refProps;
    var name = (0, utils_1.getFilterName)(column);
    var filter = getNamedFilter(name);
    var params = getRefByAttr(entity, attr);
    if (!params) {
        return null;
    }
    var _value = transformValue(column, filter);
    var entity2 = params.entity, attr2 = params.attr, attrType = params.attrType, entityI18n = params.entityI18n, attrI18n = params.attrI18n, attribute = params.attribute;
    if (attribute.type !== 'ref') {
        (0, assert_1.assert)(false, "attr\u4E3A".concat(attr, "\uFF0C\u7C7B\u578B\u3010").concat(attribute.type, "\u3011\u4E0D\u662Fref"));
        return null;
    }
    var _label = '';
    if (label && label.indexOf(':') === -1) {
        _label = label;
    }
    else {
        _label = t("".concat(entityI18n, ":attr.").concat(attrI18n));
    }
    var inputKey = (refProps === null || refProps === void 0 ? void 0 : refProps.inputKey) || 'name';
    var projection = (refProps === null || refProps === void 0 ? void 0 : refProps.projection) || { id: 1, name: 1 };
    var modalProps = {};
    var rows = [];
    var multiple = !!op && ['$in', '$nin'].includes(op);
    if (!multiple) {
        modalProps = {
            footer: false,
        };
        rows = _value
            ? getEntityData(attribute.ref, [_value])
            : [];
    }
    else {
        rows = _value
            ? getEntityData(attribute.ref, _value)
            : [];
    }
    var _value2;
    if (rows.length > 0) {
        _value2 = rows.map(function (ele) { return ele[inputKey]; }).join('、');
    }
    var deleteFilter = function (interval) {
        removeNamedFilterByName(name);
    };
    var setFilterAndResetFilter = function (value, getFilter) {
        if (value === '' ||
            value === undefined ||
            value === null ||
            (value === null || value === void 0 ? void 0 : value.length) === 0) {
            removeNamedFilterByName(name);
            return;
        }
        var filter2 = typeof getFilter === 'function'
            ? getFilter()
            : transformFilter(column, value);
        addNamedFilter({
            filter: filter2,
            '#name': name,
        });
    };
    var V = ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)(antd_1.Input, { placeholder: placeholder || t('placeholder.select'), onClick: function () {
                setOpen(true);
            }, 
            // allowClear
            // onChange={() => {
            //     deleteFilter();
            // }}
            value: _value2, readOnly: true, suffix: _value && ((0, jsx_runtime_1.jsx)("div", tslib_1.__assign({ onClick: function () {
                    deleteFilter();
                    setSelectRows([]);
                } }, { children: (0, jsx_runtime_1.jsx)(icons_1.CloseOutlined, { size: 14 }) }))) }) }));
    if (formItem) {
        V = (0, jsx_runtime_1.jsx)(antd_1.Form.Item, tslib_1.__assign({ label: _label }, { children: V }));
    }
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [V, (0, jsx_runtime_1.jsx)(antd_1.Modal, tslib_1.__assign({ title: t('select'), centered: true, open: open, onOk: function () {
                    if (selectRows.length === 0) {
                        setMessage({
                            type: 'warning',
                            content: t('select'),
                        });
                        return;
                    }
                    var ids = selectRows.map(function (ele) { return ele.id; });
                    setFilterAndResetFilter(ids);
                    setOpen(false);
                }, cancelText: t('closed'), onCancel: function () { return setOpen(false); }, width: "50%", destroyOnClose: true }, modalProps, { children: (0, jsx_runtime_1.jsx)(entityPicker_1.default, { multiple: multiple, oakAutoUnmount: true, projection: projection, entity: attribute.ref, oakPath: "$foreignKeyFilter-entity/picker-".concat(entity), onSelect: function (rows) {
                        setSelectRows(rows);
                        if (!multiple) {
                            var ids = rows.map(function (ele) { return ele.id; });
                            setFilterAndResetFilter(ids[0]);
                            setOpen(false);
                        }
                    } }) }))] }));
}
exports.default = Render;
