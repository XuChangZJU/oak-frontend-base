import { EntityDict, OperationResult, Context } from "oak-domain/lib/types";
import { TreeStore } from 'oak-memory-tree-store';
import { StorageSchema, Trigger, Checker } from "oak-domain/lib/types";
import { TriggerExecutor } from 'oak-domain/lib/store/TriggerExecutor';
export declare class DebugStore<ED extends EntityDict> extends TreeStore<ED> {
    private executor;
    constructor(executor: TriggerExecutor<ED>, storageSchema: StorageSchema<ED>, initialData?: {
        [T in keyof ED]?: {
            [ID: string]: ED[T]['OpSchema'];
        };
    }, initialStat?: {
        create: number;
        update: number;
        remove: number;
        commit: number;
    });
    operate<T extends keyof ED>(entity: T, operation: ED[T]['Operation'], context: Context<ED>, params?: Object): Promise<OperationResult>;
    select<T extends keyof ED, S extends ED[T]['Selection']>(entity: T, selection: S, context: Context<ED>, params?: Object): Promise<import("oak-domain/lib/types").SelectionResult2<ED[T]["Schema"], S["data"]>>;
    count<T extends keyof ED>(entity: T, selection: Omit<ED[T]['Selection'], 'data' | 'sorter' | 'action'>, context: Context<ED>, params?: Object): Promise<number>;
    registerTrigger<T extends keyof ED>(trigger: Trigger<ED, T>): void;
    registerChecker<T extends keyof ED>(checker: Checker<ED, T>): void;
}
