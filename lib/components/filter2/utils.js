"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttributes = exports.getFilterName = exports.getOp2 = exports.getOp = void 0;
function getOp(column) {
    return `${column.attr}${column.op ? `.${column.op}` : ''}`;
}
exports.getOp = getOp;
function getOp2(column, op) {
    return `${column.attr}${op ? `.${op}` : `.${column.op}`}`;
}
exports.getOp2 = getOp2;
function getFilterName(column) {
    return column.filterName || getOp(column);
}
exports.getFilterName = getFilterName;
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
            type: 'integer',
        },
    });
}
exports.getAttributes = getAttributes;
