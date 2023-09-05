import { ColumnProps, Ops } from '../../types/Filter';
import { ED } from '../../types/AbstractComponent';
export declare function getOp<ED2 extends ED>(column: ColumnProps<ED2, keyof ED2>): string;
export declare function getOp2<ED2 extends ED>(column: ColumnProps<ED2, keyof ED2>, op: Ops): string;
export declare function getFilterName<ED2 extends ED>(column: ColumnProps<ED2, keyof ED2>): string;
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
