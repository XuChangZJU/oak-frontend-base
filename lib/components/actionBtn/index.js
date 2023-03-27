"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
exports.default = OakComponent({
    isList: false,
    properties: {
        entity: String,
        extraActions: {
            type: Array,
            value: [],
        },
        actions: {
            type: Array,
            value: [],
        },
        cascadeActions: Object,
        onAction: Object,
    },
    data: {},
    lifetimes: {
        // 在list组件render之后 才走进这个组件，应该不会存在没有数据的问题
        ready: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, actions, extraActions, schema;
                return tslib_1.__generator(this, function (_b) {
                    _a = this.props, actions = _a.actions, extraActions = _a.extraActions;
                    schema = this.features.cache.getSchema();
                    if (extraActions && actions && extraActions.length) {
                        actions.unshift.apply(actions, tslib_1.__spreadArray([], tslib_1.__read(extraActions), false));
                    }
                    this.setState({
                        schema: schema,
                    });
                    return [2 /*return*/];
                });
            });
        }
    },
    methods: {},
});
