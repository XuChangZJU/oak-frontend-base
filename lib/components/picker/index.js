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
            rows: data
        };
    },
    isList: true,
    properties: {
        entity: '',
        multiple: false,
        onSelect: (function () { return undefined; }),
        title: (function () { return ''; }),
        titleLabel: '',
    },
});
