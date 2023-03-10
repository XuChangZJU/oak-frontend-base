"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OakComponent({
    entity: function () {
        var entity = this.props.entity;
        return entity;
    },
    projection: function () {
        var projection = this.props.projection;
        return projection;
    },
    formData: function (_a) {
        var rows = _a.data;
        return {
            rows: rows,
        };
    },
    isList: true,
    data: {
        open: false,
    },
    properties: {
        entity: String,
        projection: Object,
        multiple: Boolean,
        onSelect: Function,
    },
    methods: {},
});
