"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OakComponent({
    isList: false,
    properties: {
        entity: String,
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
    lifetimes: {},
    methods: {},
});
