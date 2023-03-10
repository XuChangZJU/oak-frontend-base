"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var usefulFn_1 = require("../../utils/usefulFn");
var assert_1 = tslib_1.__importDefault(require("assert"));
exports.default = OakComponent({
    isList: false,
    properties: {
        entity: String,
        disabledOp: Boolean,
        attributes: Array,
        data: Array,
        tablePagination: Object,
    },
    data: {},
    lifetimes: {
        ready: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, attributes, entity, schema, colorDict, _b, converter, columnDef;
                var _this = this;
                return tslib_1.__generator(this, function (_c) {
                    _a = this.props, attributes = _a.attributes, entity = _a.entity;
                    schema = this.features.cache.getSchema();
                    colorDict = this.features.style.getColorDict();
                    (0, assert_1.default)(!!attributes, 'attributes不能为空');
                    _b = (0, usefulFn_1.analyzeAttrDefForTable)(schema, entity, attributes, function (k, params) { return _this.t(k, params); }), converter = _b.converter, columnDef = _b.columnDef;
                    this.setState({
                        converter: converter,
                        columns: columnDef,
                        colorDict: colorDict,
                        schema: schema,
                    });
                    return [2 /*return*/];
                });
            });
        }
    }
});
