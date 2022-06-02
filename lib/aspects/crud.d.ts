import { OperateParams, EntityDict, Context } from 'oak-domain/lib/types';
export declare function operate<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>>(options: {
    entity: T;
    operation: ED[T]['Operation'] | ED[T]['Operation'][];
    params?: OperateParams;
}, context: Cxt): Promise<import("oak-domain/lib/types").OperationResult<ED> | Promise<import("oak-domain/lib/types").OperationResult<ED>>[]>;
export declare function select<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>>(options: {
    entity: T;
    selection: ED[T]['Selection'];
    params?: object;
}, context: Cxt): Promise<import("oak-domain/lib/types").SelectionResult<ED[T]["Schema"], ED[T]["Selection"]["data"]>>;
