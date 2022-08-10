import { EntityDict, SelectOption, Context, RowStore, DeduceCreateOperation, DeduceRemoveOperation, DeduceUpdateOperation, OperateOption, SelectionResult, SelectRowShape } from "oak-domain/lib/types";
import { TreeStore } from 'oak-memory-tree-store';
import { StorageSchema, Trigger, Checker } from "oak-domain/lib/types";
interface DebugStoreOperateOption extends OperateOption {
    noLock?: true;
}
interface DebugStoreSelectOption extends SelectOption {
    noLock?: true;
    omitTrigger?: true;
}
export declare class DebugStore<ED extends EntityDict, Cxt extends Context<ED>> extends TreeStore<ED, Cxt> {
    private executor;
    private rwLock;
    constructor(storageSchema: StorageSchema<ED>, contextBuilder: (cxtString?: string) => (store: RowStore<ED, Cxt>) => Cxt, initialData?: {
        [T in keyof ED]?: ED[T]['OpSchema'][];
    }, initialStat?: {
        create: number;
        update: number;
        remove: number;
        commit: number;
    });
    protected cascadeUpdate<T extends keyof ED, OP extends DebugStoreOperateOption>(entity: T, operation: DeduceCreateOperation<ED[T]["Schema"]> | DeduceUpdateOperation<ED[T]["Schema"]> | DeduceRemoveOperation<ED[T]["Schema"]>, context: Cxt, option?: OP): Promise<import("oak-domain/lib/types").OperationResult<ED>>;
    protected cascadeSelect<T extends keyof ED, S extends ED[T]["Selection"], OP extends DebugStoreSelectOption>(entity: T, selection: S, context: Cxt, option?: OP): Promise<SelectRowShape<ED[T]['Schema'], S['data']>[]>;
    operate<T extends keyof ED, OP extends DebugStoreOperateOption>(entity: T, operation: ED[T]['Operation'], context: Cxt, option?: OP): Promise<import("oak-domain/lib/types").OperationResult<ED>>;
    select<T extends keyof ED, S extends ED[T]['Selection'], OP extends DebugStoreSelectOption>(entity: T, selection: S, context: Cxt, option?: OP): Promise<SelectionResult<ED[T]["Schema"], S["data"]>>;
    registerTrigger<T extends keyof ED>(trigger: Trigger<ED, T, Cxt>): void;
    registerChecker<T extends keyof ED>(checker: Checker<ED, T, Cxt>): void;
    startInitializing(): void;
    endInitializing(): void;
}
export {};
