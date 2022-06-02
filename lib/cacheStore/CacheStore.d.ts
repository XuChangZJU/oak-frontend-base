import { EntityDict, OperationResult } from 'oak-domain/lib/types/Entity';
import { StorageSchema } from "oak-domain/lib/types/Storage";
import { Checker, Context } from 'oak-domain/lib/types';
import { TreeStore } from 'oak-memory-tree-store';
export declare class CacheStore<ED extends EntityDict, Cxt extends Context<ED>> extends TreeStore<ED, Cxt> {
    private executor;
    constructor(storageSchema: StorageSchema<ED>, contextBuilder: (scene: string) => Cxt, initialData?: {
        [T in keyof ED]?: {
            [ID: string]: ED[T]['OpSchema'];
        };
    });
    operate<T extends keyof ED>(entity: T, operation: ED[T]['Operation'], context: Cxt, params?: Object): Promise<OperationResult<ED>>;
    select<T extends keyof ED, S extends ED[T]['Selection']>(entity: T, selection: S, context: Cxt, params?: Object): Promise<import("oak-domain/lib/types").SelectionResult<ED[T]["Schema"], S["data"]>>;
    registerChecker<T extends keyof ED>(checker: Checker<ED, T, Cxt>): void;
}
