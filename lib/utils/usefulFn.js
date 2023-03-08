"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttributes = void 0;
function getAttributes(attributes) {
    return Object.assign({}, attributes, {
        id: {
            type: 'char',
        },
        $$createAt$$: {
            type: 'datetime',
        },
        $$updateAt$$: {
            type: 'datetime',
        },
        $$deleteAt$$: {
            type: 'datetime',
        },
        $$seq$$: {
            type: 'datetime',
        },
    });
}
exports.getAttributes = getAttributes;
