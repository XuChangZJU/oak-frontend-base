import { OperateParams, EntityDict, Context } from 'oak-domain/lib/types';
export declare function operate<ED extends EntityDict, T extends keyof ED>(options: {
    entity: T;
    operation: ED[T]['Operation'] | ED[T]['Operation'][];
    params?: OperateParams;
}, context: Context<ED>): Promise<import("oak-domain/lib/types").OperationResult | Promise<import("oak-domain/lib/types").OperationResult>[]>;
export declare function select<ED extends EntityDict, T extends keyof ED>(options: {
    entity: T;
    selection: ED[T]['Selection'];
    params?: object;
}, context: Context<ED>): Promise<import("oak-domain/lib/types").SelectionResult2<ED[T]["Schema"], ED[T]["Selection"]["data"]>>;