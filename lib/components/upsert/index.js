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
        helps: Object,
        entity: String,
        attributes: Array,
        data: Object,
        children: Object,
        layout: String,
        mode: String, // 'default' | 'card'
    },
    formData: function () {
        var data = this.props.data;
        var transformer = this.state.transformer;
        var renderData = transformer(data);
        return {
            renderData: renderData,
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
});
