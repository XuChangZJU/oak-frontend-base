import { AggregationResult, AuthCascadePath, AuthDeduceRelationMap, EntityDict, SelectOption, TxnOption } from "oak-domain/lib/types";
import { TreeStore, TreeStoreOperateOption, TreeStoreSelectOption } from 'oak-memory-tree-store';
import { StorageSchema, Trigger, Checker } from "oak-domain/lib/types";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncContext, AsyncRowStore } from "oak-domain/lib/store/AsyncRowStore";
interface DebugStoreOperateOption extends TreeStoreOperateOption {
    noLock?: true;
}
interface DebugStoreSelectOption extends TreeStoreSelectOption {
    noLock?: true;
}
export declare class DebugStore<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>> extends TreeStore<ED> implements AsyncRowStore<ED, Cxt> {
    private executor;
    private relationAuth;
    constructor(storageSchema: StorageSchema<ED>, contextBuilder: (cxtString?: string) => (store: DebugStore<ED, Cxt>) => Promise<Cxt>, actionCascadeGraph: AuthCascadePath<ED>[], relationCascadeGraph: AuthCascadePath<ED>[], authDeduceRelationMap: AuthDeduceRelationMap<ED>, selectFreeEntities: (keyof ED)[]);
    aggregate<T extends keyof ED, OP extends SelectOption>(entity: T, aggregation: ED[T]["Aggregation"], context: Cxt, option: OP): Promise<AggregationResult<ED[T]["Schema"]>>;
    begin(option?: TxnOption): Promise<string>;
    commit(txnId: string): Promise<void>;
    rollback(txnId: string): Promise<void>;
    protected cascadeUpdateAsync<T extends keyof ED, OP extends DebugStoreOperateOption>(entity: T, operation: ED[T]['Operation'], context: AsyncContext<ED>, option: OP): Promise<import("oak-domain/lib/types").OperationResult<ED>>;
    operate<T extends keyof ED, OP extends DebugStoreOperateOption>(entity: T, operation: ED[T]['Operation'], context: Cxt, option: OP): Promise<import("oak-domain/lib/types").OperationResult<ED>>;
    select<T extends keyof ED, OP extends DebugStoreSelectOption>(entity: T, selection: ED[T]['Selection'], context: Cxt, option: OP): Promise<Partial<ED[T]["Schema"]>[]>;
    count<T extends keyof ED, OP extends SelectOption>(entity: T, selection: Pick<ED[T]["Selection"], "filter" | "count">, context: Cxt, option: OP): Promise<number>;
    registerTrigger<T extends keyof ED>(trigger: Trigger<ED, T, Cxt>): void;
    registerChecker<T extends keyof ED>(checker: Checker<ED, T, Cxt>): void;
}
export {};
