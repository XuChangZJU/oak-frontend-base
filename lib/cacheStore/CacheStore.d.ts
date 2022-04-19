import { EntityDict, OperationResult } from 'oak-domain/lib/types/Entity';
import { StorageSchema } from "oak-domain/lib/types/Storage";
import { Checker, Context } from 'oak-domain/lib/types';
import { TreeStore } from 'oak-memory-tree-store';
export declare class CacheStore<ED extends EntityDict> extends TreeStore<ED> {
    private executor;
    constructor(storageSchema: StorageSchema<ED>, initialData?: {
        [T in keyof ED]?: {
            [ID: string]: ED[T]['OpSchema'];
        };
    });
    operate<T extends keyof ED>(entity: T, operation: ED[T]['Operation'], context: Context<ED>, params?: Object): Promise<OperationResult>;
    select<T extends keyof ED, S extends ED[T]['Selection']>(entity: T, selection: S, context: Context<ED>, params?: Object): Promise<import("oak-domain/lib/types").SelectionResult2<ED[T]["Schema"], S["data"]>>;
    count<T extends keyof ED>(entity: T, selection: Omit<ED[T]['Selection'], 'data' | 'sorter' | 'action'>, context: Context<ED>, params?: Object): Promise<number>;
    registerChecker<T extends keyof ED>(checker: Checker<ED, T>): void;
}
