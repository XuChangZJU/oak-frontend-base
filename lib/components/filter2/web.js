"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var antd_1 = require("antd");
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
    var _a = props.data, entity = _a.entity, column = _a.column, oakFullpath = _a.oakFullpath, viewType = _a.viewType, options = _a.options, attrI18n = _a.attrI18n, entityI18n = _a.entityI18n, isCommonI18n = _a.isCommonI18n;
    var _b = props.methods, t = _b.t, addNamedFilter = _b.addNamedFilter, removeNamedFilterByName = _b.removeNamedFilterByName, refresh = _b.refresh, getNamedFilter = _b.getNamedFilter, setFilterAndResetFilter = _b.setFilterAndResetFilter;
    var name = (0, utils_1.getFilterName)(column);
    var filter = getNamedFilter(name);
    var op = column.op, attr = column.attr, placeholder = column.placeholder, _label = column.label;
    // ready中根据attrType判断得到的viewType,不存在viewType直接返回null
    if (!viewType) {
        return null;
    }
    // 拼接过滤项的label
    var label = _label;
    if (isCommonI18n) {
        label = t("common:".concat(attrI18n));
    }
    else {
        label = t("".concat(entityI18n, ":attr.").concat(attrI18n));
    }
    var V;
    switch (viewType) {
        case 'Input':
            {
                V = ((0, jsx_runtime_1.jsx)(antd_1.Input, { placeholder: placeholder || t('placeholder.input'), onChange: function (e) {
                        var val = e.target.value;
                        setFilterAndResetFilter(viewType, val);
                    }, allowClear: true, onPressEnter: function () { } }));
                break;
            }
            ;
        case 'Select': {
            var options2 = options.map(function (ele) { return ({
                label: typeof ele.value === 'boolean' ? t("".concat(ele.value ? 'tip.yes' : 'tip.no'))
                    : t("".concat(entityI18n, ":v.").concat(attrI18n, ".").concat(ele.value)),
                value: ele.value,
            }); });
            V = ((0, jsx_runtime_1.jsx)(antd_1.Select, { mode: ['$in', '$nin'].includes(op || '') ? 'multiple' : undefined, allowClear: true, placeholder: placeholder || t('placeholder.select'), onChange: function (value) {
                    setFilterAndResetFilter(viewType, value);
                }, options: options2, onClear: function () {
                    removeNamedFilterByName(name);
                } }));
            break;
        }
        case 'DatePicker':
            {
                var dateProps = column.dateProps;
                var _c = (dateProps || {}).showTime, showTime = _c === void 0 ? false : _c;
                (0, assert_1.assert)(op, '选择时间，算子必须传入');
                var unitOfTime = 'day';
                V = ((0, jsx_runtime_1.jsx)(antd_1.DatePicker, { style: { width: '100%' }, format: "YYYY-MM-DD", showTime: showTime, onChange: function (date, dateString) {
                        setFilterAndResetFilter(viewType, date);
                    } }));
                break;
            }
            ;
        case 'DatePicker.RangePicker': {
            var dateProps = column.dateProps;
            var _d = (dateProps || {}).showTime, showTime = _d === void 0 ? false : _d;
            V = ((0, jsx_runtime_1.jsx)(antd_1.DatePicker.RangePicker, { style: { width: '100%' }, showTime: showTime, onChange: function (dates, dateStrings) {
                    setFilterAndResetFilter(viewType, dates);
                } }));
        }
        case 'RefAttr': {
            var ops = ['$in', '$nin', '$eq', '$ne'];
            var filter_1 = getNamedFilter(name);
            var value = (0, lodash_1.get)(filter_1, (0, utils_1.getOp2)(column, '$search'), '');
            V = ((0, jsx_runtime_1.jsx)(refAttr_1.default, { multiple: ['$in', '$nin'].includes(op || ''), entityIds: [value], pickerRender: Object.assign({}, column.refProps, {
                    label: 'todotodo',
                }), onChange: function (ids) { console.log(ids, '这里等测试到了再写(Xc)'); } }));
            break;
        }
    }
    return ((0, jsx_runtime_1.jsx)(antd_1.Form.Item, tslib_1.__assign({ label: label, name: name }, { children: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: V }) })));
}
exports.default = Render;
function assertMessage(attr, attrType, op, ops) {
    return "attr\u4E3A\u3010".concat(attr, "\u3011, \u4F20\u5165\u7684\u7B97\u5B50\u3010").concat(op, "\u3011\u4E0D\u652F\u6301\uFF0C\u7C7B\u578B\u3010").concat(attrType, "\u3011\u53EA\u652F\u6301\u3010").concat(JSON.stringify(ops), "\u3011");
}