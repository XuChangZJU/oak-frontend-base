import { ColumnProps, Ops } from '../../types/Filter';
import { ED } from '../../types/AbstractComponent';


export function getOp<ED2 extends ED>(column: ColumnProps<ED2, keyof ED2>) {
    return `${column.attr as string}${column.op ? `.${column.op}` : ''}`;
}

export function getOp2<ED2 extends ED>(column: ColumnProps<ED2, keyof ED2>, op: Ops) {
    return `${column.attr as string}${op ? `.${op}` : `.${column.op}`}`;
}

export function getFilterName<ED2 extends ED>(column: ColumnProps<ED2, keyof ED2>) {
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
            type: 'integer',
        },
    });
}