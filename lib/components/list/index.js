"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var usefulFn_1 = require("../../utils/usefulFn");
exports.default = OakComponent({
    isList: false,
    properties: {
        entity: String,
        attributes: Array,
        data: Array,
    },
    data: {},
    formData: function (_a) {
        var props = _a.props, features = _a.features;
        var data = props.data;
        var converter = this.state.converter;
        var columns = converter(data);
        return {
            columns: columns,
            converter: converter,
        };
    },
    lifetimes: {
        ready: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, attributes, entity, schema, _b, converter, columnDef;
                var _this = this;
                return tslib_1.__generator(this, function (_c) {
                    _a = this.props, attributes = _a.attributes, entity = _a.entity;
                    schema = this.features.cache.getSchema();
                    _b = (0, usefulFn_1.analyzeAttrDefForTable)(schema, entity, attributes, function (k, params) { return _this.t(k, params); }), converter = _b.converter, columnDef = _b.columnDef;
                    this.setState({
                        converter: converter,
                        columnDef: columnDef,
                    });
                    return [2 /*return*/];
                });
            });
        }
    }
});
