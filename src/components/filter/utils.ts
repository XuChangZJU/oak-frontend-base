import { ColumnProps, Ops } from './column';


export function getOp(column: ColumnProps) {
    return `${column.attr}${column.op ? `.${column.op}` : ''}`;
}

export function getOp2(column: ColumnProps, op: Ops) {
    return `${column.attr}${column.op || op ? `.${column.op || op}` : ''}`;
}

export function getFilterName(column: ColumnProps) {
    return column.filterName || getOp(column);
}



export function getAttributes(attributes: Record<string, any>) {
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