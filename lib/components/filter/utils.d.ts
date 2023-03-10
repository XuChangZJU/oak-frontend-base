import { ColumnProps, Ops } from '../../types/Filter';
export declare function getOp(column: ColumnProps): string;
export declare function getOp2(column: ColumnProps, op: Ops): string;
export declare function getFilterName(column: ColumnProps): string;
export declare function getAttributes(attributes: Record<string, any>): Record<string, any> & {
    id: {
        type: string;
    };
    $$createAt$$: {
        type: string;
    };
    $$updateAt$$: {
        type: string;
    };
    $$deleteAt$$: {
        type: string;
    };
    $$seq$$: {
        type: string;
    };
};
