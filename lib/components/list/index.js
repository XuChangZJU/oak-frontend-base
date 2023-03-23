"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var usefulFn_1 = require("../../utils/usefulFn");
var assert_1 = tslib_1.__importDefault(require("assert"));
exports.default = OakComponent({
    isList: false,
    properties: {
        entity: String,
        extraActions: Array,
        onAction: Object,
        disabledOp: Boolean,
        attributes: Array,
        data: Array,
        loading: Boolean,
        tablePagination: Object,
        rowSelection: Object,
    },
    formData: function (_a) {
        var _this = this;
        var props = _a.props;
        // 因为部分i18json数据请求较慢，会导致converter，columnDef解析出错
        var _b = this.props, attributes = _b.attributes, entity = _b.entity;
        var schema = this.features.cache.getSchema();
        var colorDict = this.features.style.getColorDict();
        (0, assert_1.default)(!!entity, 'list属性entity不能为空');
        (0, assert_1.default)(!!attributes, 'list属性attributes不能为空');
        var _c = (0, usefulFn_1.analyzeAttrDefForTable)(schema, entity, attributes, function (k, params) { return _this.t(k, params); }), converter = _c.converter, columnDef = _c.columnDef;
        return {
            converter: converter,
            columns: columnDef,
            colorDict: colorDict,
            schema: schema,
        };
    },
    data: {},
    listeners: {},
    lifetimes: {}
});
