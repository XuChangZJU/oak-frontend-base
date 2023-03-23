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
        cascadeActions: {
            type: Array,
            value: [],
        },
        onAction: Object,
        schema: Object,
    },
    data: {},
    lifetimes: {
        ready: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, actions, extraActions;
                return tslib_1.__generator(this, function (_b) {
                    _a = this.props, actions = _a.actions, extraActions = _a.extraActions;
                    if (extraActions && actions && extraActions.length) {
                        actions.unshift.apply(actions, tslib_1.__spreadArray([], tslib_1.__read(extraActions), false));
                    }
                    return [2 /*return*/];
                });
            });
        }
    },
    methods: {},
});
