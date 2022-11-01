import { EntityDict, Context, RowStore, DeduceCreateOperation, DeduceRemoveOperation, DeduceUpdateOperation, SelectionResult, SelectRowShape } from "oak-domain/lib/types";
import { TreeStore, TreeStoreOperateOption, TreeStoreSelectOption } from 'oak-memory-tree-store';
import { StorageSchema, Trigger, Checker } from "oak-domain/lib/types";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
interface DebugStoreOperateOption extends TreeStoreOperateOption {
    noLock?: true;
}
interface DebugStoreSelectOption extends TreeStoreSelectOption {
    noLock?: true;
}
export declare class DebugStore<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>> extends TreeStore<ED, Cxt> {
    private executor;
    private rwLock;
    constructor(storageSchema: StorageSchema<ED>, contextBuilder: (cxtString?: string) => (store: RowStore<ED, Cxt>) => Promise<Cxt>);
    protected updateAbjointRow<T extends keyof ED, OP extends DebugStoreOperateOption>(entity: T, operation: ED[T]['CreateSingle'] | ED[T]['Update'] | ED[T]['Remove'], context: Cxt, option?: OP): Promise<number>;
    protected cascadeUpdate<T extends keyof ED, OP extends DebugStoreOperateOption>(entity: T, operation: DeduceCreateOperation<ED[T]["Schema"]> | DeduceUpdateOperation<ED[T]["Schema"]> | DeduceRemoveOperation<ED[T]["Schema"]>, context: Cxt, option: OP): Promise<import("oak-domain/lib/types").OperationResult<ED>>;
    protected cascadeSelect<T extends keyof ED, S extends ED[T]["Selection"], OP extends DebugStoreSelectOption>(entity: T, selection: S, context: Cxt, option: OP): Promise<SelectRowShape<ED[T]['Schema'], S['data']>[]>;
    operate<T extends keyof ED, OP extends DebugStoreOperateOption>(entity: T, operation: ED[T]['Operation'], context: Cxt, option: OP): Promise<import("oak-domain/lib/types").OperationResult<ED>>;
    select<T extends keyof ED, S extends ED[T]['Selection'], OP extends DebugStoreSelectOption>(entity: T, selection: S, context: Cxt, option: OP): Promise<SelectionResult<ED[T]["Schema"], S["data"]>>;
    registerTrigger<T extends keyof ED>(trigger: Trigger<ED, T, Cxt>): void;
    registerChecker<T extends keyof ED>(checker: Checker<ED, T, Cxt>): void;
    startInitializing(): void;
    endInitializing(): void;
}
export {};
