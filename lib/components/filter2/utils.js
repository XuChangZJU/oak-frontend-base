"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttributes = exports.getFilterName = exports.getOp2 = exports.getOp = void 0;
function getOp(column) {
    return "".concat(column.attr).concat(column.op ? ".".concat(column.op) : '');
}
exports.getOp = getOp;
function getOp2(column, op) {
    return "".concat(column.attr).concat(op ? ".".concat(op) : ".".concat(column.op));
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
            type: 'datetime',
        },
    });
}
exports.getAttributes = getAttributes;
