"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
var money_1 = require("oak-domain/lib/utils/money");
var Entity_1 = require("oak-domain/lib/types/Entity");
var dayjs_1 = tslib_1.__importDefault(require("dayjs"));
var weekday_1 = tslib_1.__importDefault(require("dayjs/plugin/weekday"));
var localeData_1 = tslib_1.__importDefault(require("dayjs/plugin/localeData"));
dayjs_1.default.extend(weekday_1.default);
dayjs_1.default.extend(localeData_1.default);
var lodash_1 = require("oak-domain/lib/utils/lodash");
var assert_1 = require("oak-domain/lib/utils/assert");
var utils_1 = require("./utils");
var refAttr_1 = tslib_1.__importDefault(require("../refAttr"));
function Render(props) {
    var _a = props.data, entity = _a.entity, column = _a.column, oakFullpath = _a.oakFullpath;
    var _b = props.methods, t = _b.t, addNamedFilter = _b.addNamedFilter, removeNamedFilterByName = _b.removeNamedFilterByName, refresh = _b.refresh, getNamedFilter = _b.getNamedFilter, getRefByAttr = _b.getRefByAttr;
    var name = (0, utils_1.getFilterName)(column);
    var filter = getNamedFilter(name);
    var op = column.op, attr = column.attr, label = column.label, _c = column.transformValue, transformValue = _c === void 0 ? function (column, filter) { return (0, lodash_1.get)(filter, (0, utils_1.getOp)(column), ''); } : _c, _d = column.transformFilter, transformFilter = _d === void 0 ? function (column, value) { return (0, lodash_1.set)({}, (0, utils_1.getOp)(column), value); } : _d, placeholder = column.placeholder;
    var params = getRefByAttr(entity, attr);
    if (!params) {
        return null;
    }
    var entity2 = params.entity, attr2 = params.attr, attrType = params.attrType, entityI18n = params.entityI18n, attrI18n = params.attrI18n, attribute = params.attribute;
    var _label = '';
    if (label && label.indexOf(':') === -1) {
        _label = label;
    }
    else if (['$text'].includes(attr2)) {
        _label = t("attr.".concat(attr2));
    }
    else if (Entity_1.initinctiveAttributes.includes(attr2)) {
        _label = t("attr.".concat(attr2));
    }
    else {
        _label = t("".concat(entityI18n, ":attr.").concat(attrI18n));
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
    var V;
    if (attrType === '$text') {
        var ops = ['$search'];
        if (op) {
            (0, assert_1.assert)(ops.includes(op), assertMessage(attr, attrType, op, ops));
        }
        var _e = column.transformFilter, transformFilter_1 = _e === void 0 ? function (column, value) {
            return (0, lodash_1.set)({}, (0, utils_1.getOp2)(column, '$search'), value);
        } : _e, _f = column.transformValue, transformValue_1 = _f === void 0 ? function (column, filter) { return (0, lodash_1.get)(filter, (0, utils_1.getOp2)(column, '$search'), ''); } : _f;
        var _value_1 = transformValue_1(column, filter);
        return ((0, jsx_runtime_1.jsx)(antd_1.Form.Item, tslib_1.__assign({ label: _label }, { children: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)(antd_1.Input, { placeholder: placeholder || t('placeholder.input'), value: _value_1, onChange: function (e) {
                        var val = e.target.value;
                        setFilterAndResetFilter(val, function () {
                            return transformFilter_1(column, val);
                        });
                    }, allowClear: true, onPressEnter: function () { } }) }) })));
    }
    var _value = transformValue(column, filter);
    switch (attrType) {
        case 'money': {
            var ops = ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte'];
            var moneyVal_1 = _value ? (0, money_1.ToYuan)(_value) : '';
            V = ((0, jsx_runtime_1.jsx)(antd_1.Input, { placeholder: placeholder || t('placeholder.input'), value: moneyVal_1, onChange: function (e) {
                    var val = e.target.value;
                    var val2 = /^(-?[1-9]\d*(\.\d*[1-9])?)|(-?0\.\d*[1-9])$/.test(val) ? (0, money_1.ToCent)(Number(val)) : moneyVal_1;
                    setFilterAndResetFilter(val2);
                }, allowClear: true, onPressEnter: function () { } }));
            break;
        }
        case 'float': {
            var ops = ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte'];
            V = ((0, jsx_runtime_1.jsx)(antd_1.Input, { placeholder: placeholder || t('placeholder.input'), value: _value, onChange: function (e) {
                    var val = e.target.value;
                    setFilterAndResetFilter(val);
                }, allowClear: true, onPressEnter: function () { } }));
            break;
        }
        case 'integer':
        case 'int': {
            var ops = ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte'];
            if (op) {
                (0, assert_1.assert)(ops.includes(op), assertMessage(attr, attrType, op, ops));
            }
            V = ((0, jsx_runtime_1.jsx)(antd_1.Input, { placeholder: placeholder || t('placeholder.input'), value: _value, onChange: function (e) {
                    var val = e.target.value;
                    setFilterAndResetFilter(val);
                }, allowClear: true, onPressEnter: function () { } }));
            break;
        }
        case 'char':
        case 'varchar': {
            var ops = [
                '$eq',
                '$ne',
                '$endsWith',
                '$includes',
                '$startsWith',
            ];
            if (op) {
                (0, assert_1.assert)(ops.includes(op), assertMessage(attr, attrType, op, ops));
            }
            V = ((0, jsx_runtime_1.jsx)(antd_1.Input, { placeholder: placeholder || t('placeholder.input'), value: _value, onChange: function (e) {
                    var val = e.target.value;
                    setFilterAndResetFilter(val);
                }, allowClear: true, onPressEnter: function () { } }));
            break;
        }
        case 'boolean': {
            var text2 = void 0;
            switch (_value) {
                case true: {
                    text2 = t('tip.yes');
                    break;
                }
                case false: {
                    text2 = t('tip.no');
                    break;
                }
                default: {
                    text2 = t('tip.unselected');
                    break;
                }
            }
            V = ((0, jsx_runtime_1.jsx)(antd_1.Button, tslib_1.__assign({ onClick: function () {
                    var val;
                    if (_value === true) {
                        val = false;
                    }
                    else if (_value === false) {
                        val = '';
                    }
                    else {
                        val = true;
                    }
                    setFilterAndResetFilter(val);
                } }, { children: text2 })));
            break;
        }
        case 'enum': {
            var ops = ['$in', '$nin', '$eq', '$ne'];
            if (op) {
                (0, assert_1.assert)(ops.includes(op), assertMessage(attr, attrType, op, ops));
            }
            var enumeration = attribute === null || attribute === void 0 ? void 0 : attribute.enumeration;
            var selectProps = column.selectProps;
            var _g = selectProps || {}, options = _g.options, _h = _g.transformInOption, transformInOption = _h === void 0 ? function (option) { return (typeof option === 'object' ? option.value : option); } : _h, // 根据
            _j = _g.transformOutOption, // 根据
            transformOutOption = _j === void 0 ? function (option) { return (typeof option === 'object' ? option.label : option); } : _j;
            var options2 = options ||
                (enumeration === null || enumeration === void 0 ? void 0 : enumeration.map(function (ele) { return ({
                    label: t("".concat(entityI18n, ":v.").concat(attrI18n, ".").concat(ele)),
                    value: ele,
                }); }));
            if (op && ['$in', '$nin'].includes(op)) {
                var _k = column.transformValue, transformValue_2 = _k === void 0 ? function (column, filter) {
                    return (0, lodash_1.get)(filter, (0, utils_1.getOp)(column), []);
                } : _k;
                var selectValue = transformValue_2(column, filter);
                V = ((0, jsx_runtime_1.jsx)(antd_1.Select, { mode: "multiple", allowClear: true, placeholder: placeholder || t('placeholder.select'), value: selectValue, onChange: function (value) {
                        setFilterAndResetFilter(value);
                    }, options: (options2 === null || options2 === void 0 ? void 0 : options2.length) > 0 ? options2 : [], onClear: function () {
                        deleteFilter();
                    } }));
            }
            else {
                V = ((0, jsx_runtime_1.jsx)(antd_1.Select, { allowClear: true, placeholder: placeholder || t('placeholder.select'), value: _value, onChange: function (value) {
                        setFilterAndResetFilter(value);
                    }, options: (options2 === null || options2 === void 0 ? void 0 : options2.length) > 0 ? options2 : [], onClear: function () {
                        deleteFilter();
                    } }));
            }
            break;
        }
        case 'datetime': {
            var dateProps = column.dateProps;
            var _l = dateProps || {}, _m = _l.range, range = _m === void 0 ? false : _m, _o = _l.showTime, showTime = _o === void 0 ? false : _o;
            var unitOfTime_1 = 'day';
            if (range) {
                var ops = ['$between'];
                (0, assert_1.assert)(op, '选择时间范围，算子必须传入');
                (0, assert_1.assert)(ops.includes(op), assertMessage(attr, attrType, op, ops));
                var _p = column.transformValue, transformValue_3 = _p === void 0 ? function (column, filter) {
                    return (0, lodash_1.get)(filter, "".concat((0, utils_1.getOp)(column)), []);
                } : _p, _q = column.transformFilter, transformFilter_2 = _q === void 0 ? function (column, value) {
                    var startTime = (0, dayjs_1.default)(value[0])
                        .startOf(unitOfTime_1)
                        .valueOf();
                    var endTime = (0, dayjs_1.default)(value[1])
                        .endOf(unitOfTime_1)
                        .valueOf();
                    return (0, lodash_1.set)({}, (0, utils_1.getOp)(column), [startTime, endTime]);
                } : _q;
                var dateValues = transformValue_3(column, filter);
                var _r = tslib_1.__read(dateValues, 2), startTime = _r[0], endTIme = _r[1];
                V = ((0, jsx_runtime_1.jsx)(antd_1.DatePicker.RangePicker, { showTime: showTime, value: [
                        startTime ? (0, dayjs_1.default)(startTime) : '',
                        endTIme ? (0, dayjs_1.default)(endTIme) : '',
                    ], onChange: function (dates, dateStrings) {
                        setFilterAndResetFilter(dates, function () {
                            return transformFilter_2(column, dates);
                        });
                    } }));
            }
            else {
                var ops = ['$between', '$gt', '$gte', '$lt', '$lte'];
                if (op) {
                    (0, assert_1.assert)(ops.includes(op), assertMessage(attr, attrType, op, ops));
                }
                var _s = column.transformFilter, transformFilter_3 = _s === void 0 ? function (column, value) {
                    var startTime = (0, dayjs_1.default)(value)
                        .startOf(unitOfTime_1)
                        .valueOf();
                    var endTime = (0, dayjs_1.default)(value)
                        .endOf(unitOfTime_1)
                        .valueOf();
                    if (column.op === '$between') {
                        var values2 = [startTime, endTime];
                        return (0, lodash_1.set)({}, (0, utils_1.getOp)(column), values2);
                    }
                    if (column.op === '$gt' || column.op === '$gte') {
                        return (0, lodash_1.set)({}, (0, utils_1.getOp)(column), startTime);
                    }
                    if (column.op === '$lt' || column.op === '$lte') {
                        return (0, lodash_1.set)({}, (0, utils_1.getOp)(column), endTime);
                    }
                    return (0, lodash_1.set)({}, (0, utils_1.getOp)(column), (0, dayjs_1.default)(value).valueOf());
                } : _s, _t = column.transformValue, transformValue_4 = _t === void 0 ? function (column, filter) {
                    if (column.op === '$between') {
                        return (0, lodash_1.get)(filter, "".concat((0, utils_1.getOp)(column), ".0"), null);
                    }
                    return (0, lodash_1.get)(filter, (0, utils_1.getOp)(column), null);
                } : _t;
                var dateValue = transformValue_4(column, filter);
                V = ((0, jsx_runtime_1.jsx)(antd_1.DatePicker, { format: "YYYY-MM-DD", showTime: showTime, value: dateValue ? (0, dayjs_1.default)(dateValue) : null, onChange: function (date, dateString) {
                        setFilterAndResetFilter(date, function () {
                            return transformFilter_3(column, date);
                        });
                    } }));
            }
            break;
        }
        case 'ref': {
            var ops = ['$in', '$nin', '$eq', '$ne'];
            if (op) {
                (0, assert_1.assert)(ops.includes(op), assertMessage(attr, attrType, op, ops));
            }
            if (op && ['$in', '$nin'].includes(op)) {
                V = ((0, jsx_runtime_1.jsx)(refAttr_1.default, { multiple: true, entityIds: _value, pickerDef: column.refProps, onChange: function (ids) { console.log(ids, '这里等测试到了再写(Xc)'); } }));
            }
            else {
                V = ((0, jsx_runtime_1.jsx)(refAttr_1.default, { multiple: false, entityIds: _value, pickerDef: column.refProps, onChange: function (id) { console.log(id, '这里等测试到了再写(Xc)'); } }));
            }
            break;
        }
        default: {
            (0, assert_1.assert)(false, "\u7C7B\u578B\u3010".concat(attrType, "\u3011\u6682\u4E0D\u652F\u6301"));
            break;
        }
    }
    return ((0, jsx_runtime_1.jsx)(antd_1.Form.Item, tslib_1.__assign({ label: _label }, { children: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: V }) })));
}
exports.default = Render;
function assertMessage(attr, attrType, op, ops) {
    return "attr\u4E3A\u3010".concat(attr, "\u3011, \u4F20\u5165\u7684\u7B97\u5B50\u3010").concat(op, "\u3011\u4E0D\u652F\u6301\uFF0C\u7C7B\u578B\u3010").concat(attrType, "\u3011\u53EA\u652F\u6301\u3010").concat(JSON.stringify(ops), "\u3011");
}
