"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var usefulFn_1 = require("../../utils/usefulFn");
var assert_1 = tslib_1.__importDefault(require("assert"));
exports.default = OakComponent({
    isList: false,
    properties: {
        entity: '',
        extraActions: [],
        onAction: (function () { return undefined; }),
        disabledOp: false,
        attributes: [],
        data: [],
        loading: false,
        tablePagination: {},
        rowSelection: {},
    },
    formData: function (_a) {
        var props = _a.props;
        var converter = this.state.converter;
        var data = props.data;
        if (converter) {
            var mobileData = converter(data);
            return {
                mobileData: mobileData,
            };
        }
        return {};
    },
    data: {
        converter: function (data) { return []; },
    },
    listeners: {
        data: function () {
            this.reRender();
        },
    },
    lifetimes: {
        ready: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, attributes, entity, data, schema, colorDict, converter;
                var _this = this;
                return tslib_1.__generator(this, function (_b) {
                    _a = this.props, attributes = _a.attributes, entity = _a.entity, data = _a.data;
                    schema = this.features.cache.getSchema();
                    colorDict = this.features.style.getColorDict();
                    (0, assert_1.default)(!!data, 'data不能为空');
                    (0, assert_1.default)(!!entity, 'list属性entity不能为空');
                    (0, assert_1.default)(attributes === null || attributes === void 0 ? void 0 : attributes.length, 'attributes不能为空');
                    converter = (0, usefulFn_1.analyzeAttrMobileForCard)(schema, entity, function (k, params) { return _this.t(k, params); }, attributes);
                    this.setState({
                        converter: converter,
                        schema: schema,
                        colorDict: colorDict,
                    });
                    return [2 /*return*/];
                });
            });
        },
    },
    methods: {
        onActionMp: function (e) {
            var onAction = this.props.onAction;
            var _a = e.detail, action = _a.action, cascadeAction = _a.cascadeAction;
            var row = e.currentTarget.dataset.row;
            this.triggerEvent('onAction', {
                record: row,
                action: action,
                cascadeAction: cascadeAction,
            });
        },
    },
});
