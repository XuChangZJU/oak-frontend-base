import { EntityDict, OperationResult, Context, RowStore } from "oak-domain/lib/types";
import { TreeStore } from 'oak-memory-tree-store';
import { StorageSchema, Trigger, Checker } from "oak-domain/lib/types";
export declare class DebugStore<ED extends EntityDict, Cxt extends Context<ED>> extends TreeStore<ED, Cxt> {
    private executor;
    constructor(storageSchema: StorageSchema<ED>, contextBuilder: (store: RowStore<ED, Cxt>) => Cxt, initialData?: {
        [T in keyof ED]?: {
            [ID: string]: ED[T]['OpSchema'];
        };
    }, initialStat?: {
        create: number;
        update: number;
        remove: number;
        commit: number;
    });
    operate<T extends keyof ED>(entity: T, operation: ED[T]['Operation'], context: Cxt, params?: Object): Promise<OperationResult>;
    select<T extends keyof ED, S extends ED[T]['Selection']>(entity: T, selection: S, context: Cxt, params?: Object): Promise<{
        result: import("oak-domain/lib/types").SelectRowShape<ED[T]["Schema"], ED[T]["Selection"]["data"]>[];
    }>;
    count<T extends keyof ED>(entity: T, selection: Omit<ED[T]['Selection'], 'data' | 'sorter' | 'action'>, context: Cxt, params?: Object): Promise<number>;
    registerTrigger<T extends keyof ED>(trigger: Trigger<ED, T, Cxt>): void;
    registerChecker<T extends keyof ED>(checker: Checker<ED, T, Cxt>): void;
}
