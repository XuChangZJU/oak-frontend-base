"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var usefulFn_1 = require("../../utils/usefulFn");
exports.default = OakComponent({
    isList: false,
    entity: function () {
        return this.props.entity;
    },
    properties: {
        helps: {},
        entity: '',
        attributes: [],
        data: {},
        layout: 'horizontal',
        mode: 'default',
    },
    formData: function () {
        var _this = this;
        var _a = this.props, data = _a.data, entity = _a.entity;
        var transformer = this.state.transformer;
        var renderData = transformer(data);
        var renderData1 = renderData === null || renderData === void 0 ? void 0 : renderData.map(function (ele) {
            var label = ele.label, attr = ele.attr, type = ele.type;
            var label2 = label;
            if (!label2) {
                if (type === 'ref') {
                    var refEntity = ele.entity;
                    if (attr === 'entityId') {
                        // 反指
                        label2 = _this.t("".concat(refEntity, ":name"));
                    }
                    else {
                        label2 = _this.t("".concat(entity, ":attr.").concat(attr));
                    }
                }
                else {
                    label2 = _this.t("".concat(entity, ":attr.").concat(attr));
                }
            }
            Object.assign(ele, { label: label2 });
            return ele;
        });
        return {
            renderData: renderData1,
        };
    },
    data: {
        transformer: (function () { return []; }),
    },
    listeners: {
        data: function () {
            this.reRender();
        },
    },
    lifetimes: {
        attached: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, attributes, entity, schema, transformer;
                return tslib_1.__generator(this, function (_b) {
                    _a = this.props, attributes = _a.attributes, entity = _a.entity;
                    schema = this.features.cache.getSchema();
                    transformer = (0, usefulFn_1.analyzeDataUpsertTransformer)(schema, entity, attributes);
                    this.setState({
                        transformer: transformer,
                    });
                    return [2 /*return*/];
                });
            });
        },
    },
    methods: {
        setValueMp: function (input) {
            var _a;
            var detail = input.detail, dataset = input.target.dataset;
            var attr = dataset.attr;
            var value = detail.value;
            this.update((_a = {}, _a[attr] = value, _a));
        },
        setValueMp1: function (input) {
            var _a;
            var detail = input.detail, dataset = input.target.dataset;
            var attr = dataset.attr;
            var value = detail.value;
            var valueShowed = parseFloat(Number(value).toFixed(1)) * 10;
            this.update((_a = {}, _a[attr] = valueShowed, _a));
        },
        setValueMp2: function (input) {
            var _a;
            var detail = input.detail, dataset = input.target.dataset;
            var attr = dataset.attr;
            var value = detail.value;
            var valueShowed = parseFloat(Number(value).toFixed(2)) * 100;
            this.update((_a = {}, _a[attr] = valueShowed, _a));
        },
        setEnumValueMp: function (input) {
            var _a;
            var detail = input.detail, dataset = input.target.dataset;
            var attr = dataset.attr;
            var value = detail.value;
            this.update((_a = {}, _a[attr] = value, _a));
        },
    },
});
