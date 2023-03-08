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
        items: {
            type: Array,
            value: [],
        },
        mode: {
            type: String,
            value: 'cell',
        },
        column: {
            type: Number,
            value: 3,
        },
    },
    data: {},
    lifetimes: {},
    methods: {},
});
