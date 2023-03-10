"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var usefulFn_1 = require("../../utils/usefulFn");
exports.default = OakComponent({
    isList: false,
    entity: function () {
        return this.props.entity;
    },
    properties: {
        entity: String,
        attributes: Array,
        data: Object,
        children: Object,
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
        mtoPickerDict: {},
    },
    listeners: {
        data: function () {
            this.reRender();
        },
    },
    lifetimes: {
        attached: function () {
            var _this = this;
            var _a = this.props, attributes = _a.attributes, entity = _a.entity;
            var schema = this.features.cache.getSchema();
            var _b = (0, usefulFn_1.analyzeDataUpsertTransformer)(schema, entity, attributes, function (k, params) { return _this.t(k, params); }), transformer = _b.transformer, mtoPickerDict = _b.mtoPickerDict;
            this.setState({
                transformer: transformer,
                mtoPickerDict: mtoPickerDict,
            });
        }
    }
});
