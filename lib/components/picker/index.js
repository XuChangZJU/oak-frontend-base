"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OakComponent({
    entity: function () {
        var entity = this.props.entity;
        return entity;
    },
    formData: function (_a) {
        var _b = _a.data, data = _b === void 0 ? [] : _b;
        var title = this.props.title;
        return {
            rows: data.map(function (ele) { return ({
                id: ele.id,
                title: title(ele)
            }); }),
        };
    },
    isList: true,
    properties: {
        entity: String,
        multiple: Boolean,
        onSelect: Function,
        title: Function,
        titleLabel: String,
    },
    methods: {},
});
