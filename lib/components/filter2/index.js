"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var assert_1 = require("oak-domain/lib/utils/assert");
var utils_1 = require("./utils");
var usefulFn_1 = require("../../utils/usefulFn");
var dayjs_1 = tslib_1.__importDefault(require("dayjs"));
var lodash_1 = require("oak-domain/lib/utils/lodash");
exports.default = OakComponent({
    entity: function () {
        var entity = this.props.entity;
        return entity;
    },
    isList: true,
    formData: function () {
        var _this = this;
        var column = this.props.column;
        (0, assert_1.assert)(!!column, 'column缺失');
        var _a = this.state, entityI18n = _a.entityI18n, attrI18n = _a.attrI18n, viewType = _a.viewType, attribute = _a.attribute;
        var _label = column.label;
        // 兼容小程序和web，数据要在这里处理
        // 小程序, 在这里可以直接使用t进行翻译
        var labelMp = _label;
        // 是否需要采用common的i18json
        var isCommonI18n = attrI18n === '$$createAt$$' || attrI18n === '$$updateAt$$' || attrI18n === '$$seq$$' || attrI18n === 'id';
        if (isCommonI18n) {
            labelMp = this.t("common:".concat(attrI18n));
        }
        else {
            labelMp = this.t("".concat(entityI18n, ":attr.").concat(attrI18n));
        }
        // enum类型和布尔类型采用select组件，组合渲染所需的options
        var options = []; // web使用
        var optionsMp = []; // 小程序使用
        if (viewType === 'Select') {
            var enumeration = attribute === null || attribute === void 0 ? void 0 : attribute.enumeration;
            // weblabel目前只能在render的时候翻译
            if (enumeration) {
                options = enumeration.map(function (ele) { return ({
                    value: ele,
                }); });
                optionsMp = enumeration.map(function (ele) { return ({
                    label: _this.t("".concat(entityI18n, ":v.").concat(attrI18n, ".").concat(ele)),
                    value: ele,
                    checked: false,
                }); });
            }
            else {
                options = [
                    { value: true },
                    { value: false },
                ];
                optionsMp = [
                    { label: this.t('tip.yes'), value: true, checked: false, },
                    { label: this.t('tip.no'), value: false, checked: false, },
                ];
            }
        }
        // 该方法将attr和算子拼接，作为addNameFilter的#name参数
        var name = (0, utils_1.getFilterName)(column);
        return {
            isCommonI18n: isCommonI18n,
            options: options,
            name: name,
            labelMp: labelMp,
            optionsMp: optionsMp,
        };
    },
    data: {
        modeMp: '',
        labelMp: '',
        optionsMp: [],
        isCommonI18n: false,
        name: '',
        show: false,
        viewType: '',
        entityI18n: '',
        attrI18n: '',
        attribute: {},
        options: [],
        inputType: '',
        timeStartStr: '',
        timeEndStr: '',
        selectedLabel: '',
    },
    properties: {
        entity: '',
        column: {},
    },
    lifetimes: {
        ready: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, column, entity, _b, attr, dateProps, op, schema, _c, entityI18n, attrType, attrI18n, attribute, viewType, inputType, modeMp;
                var _this = this;
                return tslib_1.__generator(this, function (_d) {
                    _a = this.props, column = _a.column, entity = _a.entity;
                    _b = column, attr = _b.attr, dateProps = _b.dateProps, op = _b.op;
                    schema = this.features.cache.getSchema();
                    _c = (0, usefulFn_1.resolvePath)(schema, entity, attr), entityI18n = _c.entity, attrType = _c.attrType, attrI18n = _c.attr, attribute = _c.attribute;
                    // 根据attrType来决定采用什么样类型的组件，datePicker还有类型欠缺
                    switch (attrType) {
                        case 'money':
                        case 'integer':
                        case 'float':
                            viewType = 'Input';
                            inputType = 'number';
                            break;
                        case 'text':
                        case 'varchar':
                            viewType = 'Input';
                            inputType = 'text';
                            break;
                        case 'datetime':
                            viewType = (dateProps === null || dateProps === void 0 ? void 0 : dateProps.range) ? 'DatePicker.RangePicker' : 'DatePicker';
                            break;
                        case 'boolean':
                        case 'enum':
                            viewType = 'Select';
                            break;
                        case 'ref':
                            viewType = 'RefAttr';
                            break;
                    }
                    modeMp = 'selector';
                    if (op && op === '$in' || op === '$nin') {
                        modeMp = 'multiSelector';
                    }
                    this.setState({
                        viewType: viewType,
                        entityI18n: entityI18n,
                        attribute: attribute,
                        attrI18n: attrI18n,
                        inputType: inputType,
                        modeMp: modeMp,
                    }, function () {
                        _this.reRender();
                    });
                    return [2 /*return*/];
                });
            });
        }
    },
    methods: {
        searchConfirmMp: function () {
            this.refresh();
            this.setState({
                show: false,
            });
        },
        onChangeTapMp: function (event) {
            var _a = event.detail, key = _a.key, checked = _a.checked;
            var _b = this.state, optionsMp = _b.optionsMp, modeMp = _b.modeMp;
            if (modeMp === 'selector') {
                var optionsMp2 = optionsMp.map(function (ele) { return ({
                    label: ele.label,
                    value: ele.value,
                    checked: ele.value === key ? checked : false,
                }); });
                this.setState({
                    optionsMp: tslib_1.__spreadArray([], tslib_1.__read(optionsMp2), false),
                });
            }
            else {
                var option = optionsMp.find(function (ele) { return ele.value === key; });
                (option === null || option === void 0 ? void 0 : option.checked) === checked;
                this.setState({
                    optionsMp: tslib_1.__spreadArray([], tslib_1.__read(optionsMp), false),
                });
            }
        },
        onConfirmSelectMp: function () {
            var _a = this.state, optionsMp = _a.optionsMp, viewType = _a.viewType;
            var selectedOptions = optionsMp.filter(function (ele) { return ele.checked; });
            var values = selectedOptions.map(function (ele) { return ele.value; });
            var labels = selectedOptions.map(function (ele) { return ele.label; });
            this.setState({
                selectedLabel: labels.join(' ')
            });
            this.setFilterAndResetFilter(viewType, values);
            this.searchConfirmMp();
        },
        onCancelSelectMp: function () {
            var optionsMp = this.state.optionsMp;
            var optionsMps2 = optionsMp.map(function (ele) { return ({
                label: ele.label,
                value: ele.value,
                checked: false,
            }); });
            this.setState({
                optionsMp: optionsMps2,
            });
        },
        bindPickerChangeMp: function (event) {
            var selectedIndexMp = event.detail.value;
            this.setState({
                selectedIndexMp: selectedIndexMp,
            });
        },
        openPopupMp: function () {
            this.setState({
                show: true,
            });
        },
        closePopupMp: function () {
            var name = this.state.name;
            this.removeNamedFilterByName(name);
            this.setState({
                show: false,
            });
        },
        closePopupMp2: function () {
            var _a = this.state, name = _a.name, optionsMp = _a.optionsMp;
            var optionsMp2 = optionsMp.map(function (ele) { return ({
                label: ele.label,
                value: ele.value,
                checked: false,
            }); });
            this.removeNamedFilterByName(name);
            this.setState({
                show: false,
                optionsMp: optionsMp2,
            });
        },
        setValueMp: function (input) {
            var viewType = this.state.viewType;
            var detail = input.detail, dataset = input.target.dataset;
            var attr = dataset.attr;
            var value = detail.value;
            this.setFilterAndResetFilter(viewType, value);
        },
        setTimeStrMp: function (event) {
            var viewType = this.state.viewType;
            var value = event.detail.value;
            if (value instanceof Array) {
                var timeStartStr = (0, dayjs_1.default)(value[0]).format('YYYY-MM-DD');
                var timeEndStr = (0, dayjs_1.default)(value[1]).format('YYYY-MM-DD');
                this.setState({
                    timeStartStr: timeStartStr,
                    timeEndStr: timeEndStr,
                });
            }
            else {
                var timeStartStr = (0, dayjs_1.default)(value).format('YYYY-MM-DD');
                this.setState({
                    timeStartStr: timeStartStr,
                });
            }
            this.setFilterAndResetFilter(viewType, value);
        },
        setFilterAndResetFilter: function (viewType, value) {
            var name = this.state.name;
            var column = this.props.column;
            if (value === '' ||
                value === undefined ||
                value === null ||
                (value === null || value === void 0 ? void 0 : value.length) === 0) {
                this.removeNamedFilterByName(name);
                return;
            }
            var filter = this.transformFilter(viewType, value);
            this.addNamedFilter({
                filter: filter,
                '#name': name,
            });
        },
        transformFilter: function (viewType, value) {
            var column = this.props.column;
            var unitOfTime = 'day';
            var op = column.op;
            // 这里只有全文字段和时间戳字段需要特殊处理。
            if (viewType === 'Input' && op === '$text') {
                return (0, lodash_1.set)({}, '$text.$search', value);
            }
            if (viewType === 'Select' && !op) {
                return (0, lodash_1.set)({}, (0, utils_1.getOp)(column), value[0]);
            }
            if (viewType === 'DatePicker') {
                var startTime = (0, dayjs_1.default)(value)
                    .startOf(unitOfTime)
                    .valueOf();
                var endTime = (0, dayjs_1.default)(value)
                    .endOf(unitOfTime)
                    .valueOf();
                if (op === '$between') {
                    var values2 = [startTime, endTime];
                    return (0, lodash_1.set)({}, (0, utils_1.getOp)(column), values2);
                }
                if (op === '$gt' || op === '$gte') {
                    return (0, lodash_1.set)({}, (0, utils_1.getOp)(column), startTime);
                }
                if (op === '$lt' || op === '$lte') {
                    return (0, lodash_1.set)({}, (0, utils_1.getOp)(column), endTime);
                }
                return (0, lodash_1.set)({}, (0, utils_1.getOp)(column), (0, dayjs_1.default)(value).valueOf());
            }
            if (viewType === 'DatePicker.RangePicker') {
                var startTime = (0, dayjs_1.default)(value[0])
                    .startOf(unitOfTime)
                    .valueOf();
                var endTime = (0, dayjs_1.default)(value[1])
                    .endOf(unitOfTime)
                    .valueOf();
                // range只能是between
                return (0, lodash_1.set)({}, (0, utils_1.getOp2)(column, '$between'), [startTime, endTime]);
            }
            return (0, lodash_1.set)({}, (0, utils_1.getOp)(column), value);
        },
        getNamedFilter: function (name) {
            if (this.state.oakFullpath) {
                var filter = this.getFilterByName(name);
                return filter;
            }
        },
    },
});
