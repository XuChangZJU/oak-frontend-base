export function getOp(column) {
    return `${column.attr}${column.op ? `.${column.op}` : ''}`;
}
export function getOp2(column, op) {
    return `${column.attr}${op ? `.${op}` : `.${column.op}`}`;
}
export function getFilterName(column) {
    return column.filterName || getOp(column);
}
export function getAttributes(attributes) {
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
