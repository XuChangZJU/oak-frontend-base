import { EntityDict, OperationResult, Context, RowStore, DeduceCreateOperation, DeduceRemoveOperation, DeduceUpdateOperation, OperateParams, SelectionResult } from "oak-domain/lib/types";
import { TreeStore } from 'oak-memory-tree-store';
import { StorageSchema, Trigger, Checker } from "oak-domain/lib/types";
interface DebugStoreOperationParams extends OperateParams {
    noLock?: true;
}
export declare class DebugStore<ED extends EntityDict, Cxt extends Context<ED>> extends TreeStore<ED, Cxt> {
    private executor;
    private rwLock;
    constructor(storageSchema: StorageSchema<ED>, contextBuilder: (store: RowStore<ED, Cxt>, scene: string) => Cxt, initialData?: {
        [T in keyof ED]?: {
            [ID: string]: ED[T]['OpSchema'];
        };
    }, initialStat?: {
        create: number;
        update: number;
        remove: number;
        commit: number;
    });
    protected cascadeUpdate<T extends keyof ED>(entity: T, operation: DeduceCreateOperation<ED[T]["Schema"]> | DeduceUpdateOperation<ED[T]["Schema"]> | DeduceRemoveOperation<ED[T]["Schema"]>, context: Cxt, params?: OperateParams): Promise<OperationResult<ED>>;
    protected cascadeSelect<T extends keyof ED>(entity: T, selection: ED[T]["Selection"], context: Cxt, params?: OperateParams): Promise<ED[T]["Schema"][]>;
    operate<T extends keyof ED>(entity: T, operation: ED[T]['Operation'], context: Cxt, params?: DebugStoreOperationParams): Promise<OperationResult<ED>>;
    select<T extends keyof ED, S extends ED[T]['Selection']>(entity: T, selection: S, context: Cxt, params?: DebugStoreOperationParams): Promise<SelectionResult<ED[T]["Schema"], S["data"]>>;
    registerTrigger<T extends keyof ED>(trigger: Trigger<ED, T, Cxt>): void;
    registerChecker<T extends keyof ED>(checker: Checker<ED, T, Cxt>): void;
    startInitializing(): void;
    endInitalizing(): void;
}
export {};
