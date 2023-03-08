"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OakComponent({
    isList: false,
    formData: function (_a) {
        var props = _a.props, features = _a.features;
        var colorDict = features.style.getColorDict();
        var dataSchema = features.cache.getSchema();
        return {
            colorDict: colorDict,
            dataSchema: dataSchema,
        };
    },
    properties: {},
    data: {},
    lifetimes: {},
    methods: {},
});
