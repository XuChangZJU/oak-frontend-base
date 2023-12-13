import { AggregationResult, AuthDeduceRelationMap, EntityDict, OperationResult, SelectOption, TxnOption } from "oak-domain/lib/types";
import { TreeStore, TreeStoreOperateOption, TreeStoreSelectOption } from 'oak-memory-tree-store';
import { StorageSchema, Trigger, Checker } from "oak-domain/lib/types";
import { TriggerExecutor } from 'oak-domain/lib/store/TriggerExecutor';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncContext, AsyncRowStore } from "oak-domain/lib/store/AsyncRowStore";
import { assert } from 'oak-domain/lib/utils/assert';
import { RelationAuth } from "oak-domain/lib/store/RelationAuth";

interface DebugStoreOperateOption extends TreeStoreOperateOption {
    noLock?: true;
};

interface DebugStoreSelectOption extends TreeStoreSelectOption {
    noLock?: true;
};

export class DebugStore<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>> extends TreeStore<ED> implements AsyncRowStore<ED, Cxt> {
    private executor: TriggerExecutor<ED, Cxt>;
    private relationAuth: RelationAuth<ED>;
    private dataLoaded: boolean;
    private dataLoadedLock: Promise<void>;
    private dataLoadedLockUnlocker = () => undefined as void;

    constructor(
        storageSchema: StorageSchema<ED>,
        contextBuilder: (cxtString?: string) => (store: DebugStore<ED, Cxt>) => Promise<Cxt>,
        authDeduceRelationMap: AuthDeduceRelationMap<ED>,
        selectFreeEntities?: (keyof ED)[],
        updateFreeDict?: {
            [A in keyof ED]?: string[];
        }
    ) {
        super(storageSchema);
        this.dataLoaded = false;
        this.dataLoadedLock = new Promise(
            (resolve) => {
                this.dataLoadedLockUnlocker = () => resolve();
            }
        );
        this.executor = new TriggerExecutor((cxtString) => contextBuilder(cxtString)(this));
        this.relationAuth = new RelationAuth(storageSchema, authDeduceRelationMap, selectFreeEntities, updateFreeDict);
    }

    async exec(script: string, txnId?: string) {
        throw new Error('debugStore dont support exec script directly');
    }

    aggregate<T extends keyof ED, OP extends SelectOption>(entity: T, aggregation: ED[T]["Aggregation"], context: Cxt, option: OP): Promise<AggregationResult<ED[T]["Schema"]>> {
        return this.aggregateAsync(entity, aggregation, context, option);
    }
    begin(option?: TxnOption): Promise<string> {
        return super.beginAsync();
    }
    commit(txnId: string): Promise<void> {
        return super.commitAsync(txnId);
    }
    rollback(txnId: string): Promise<void> {
        return super.rollbackAsync(txnId);
    }

    protected async cascadeUpdateAsync<T extends keyof ED, OP extends DebugStoreOperateOption>(entity: T, operation: ED[T]['Operation'], context: AsyncContext<ED>, option: OP) {
        // 如果是在modi处理过程中，所有的trigger也可以延时到apply时再处理（这时候因为modi中的数据并不实际存在，处理会有问题）
        if (!option.blockTrigger) {
            await this.executor.preOperation(entity, operation, context as Cxt, option);
        }
        const result = await super.cascadeUpdateAsync(entity, operation, context, option);
        if (!option.blockTrigger) {
            await this.executor.postOperation(entity, operation, context as Cxt, option);
        }
        return result;
    }

    async operate<T extends keyof ED, OP extends DebugStoreOperateOption>(
        entity: T,
        operation: ED[T]['Operation'],
        context: Cxt,
        option: OP
    ) {
        if (!this.dataLoaded) {
            await this.dataLoadedLock;
        }
        const autoCommit = !context.getCurrentTxnId();
        let result: OperationResult<ED>;
        if (autoCommit) {
            await context.begin();
        }
        /**
         * 这里似乎还有点问题，如果在后续的checker里增加了cascadeUpdate，是无法在一开始检查权限的
         * 后台的DbStore也一样          by Xc 20230801
         */if (autoCommit) {
            await context.begin();
        }
        try {
            await this.relationAuth.checkRelationAsync(entity, operation, context);
            result = await super.operateAsync(entity, operation, context, option);
        }
        catch (err) {
            await context.rollback();
            throw err;
        }
        if (autoCommit) {
            await context.commit();
        }
        return result;
    }

    async select<T extends keyof ED, OP extends DebugStoreSelectOption>(
        entity: T,
        selection: ED[T]['Selection'],
        context: Cxt,
        option: OP
    ) {
        if (!this.dataLoaded) {
            await this.dataLoadedLock;
        }
        const autoCommit = !context.getCurrentTxnId();
        if (autoCommit) {
            await context.begin();
        }
        Object.assign(selection, {
            action: 'select',
        });

        // select的trigger应加在根结点的动作之前
        try {
            if (!option.blockTrigger) {
                await this.executor.preOperation(entity, selection as ED[T]['Operation'], context, option);
            }
            if (!option.dontCollect) {
                await this.relationAuth.checkRelationAsync(entity, selection, context);
            }
            const result = await super.selectAsync(entity, selection, context, option);

            if (!option.blockTrigger) {
                await this.executor.postOperation(entity, selection as ED[T]['Operation'], context, option, result);
            }

            if (autoCommit) {
                await context.commit();
            }
            return result;
        }
        catch (err) {
            if (autoCommit) {
                await context.rollback();
            }
            throw err;
        }
    }

    async count<T extends keyof ED, OP extends SelectOption>(entity: T, selection: Pick<ED[T]["Selection"], "filter" | "count">, context: Cxt, option: OP): Promise<number> {
        if (!this.dataLoaded) {
            await this.dataLoadedLock;
        }
        return super.countAsync(entity, selection, context, option);
    }

    registerTrigger<T extends keyof ED>(trigger: Trigger<ED, T, Cxt>) {
        this.executor.registerTrigger(trigger);
    }

    registerChecker<T extends keyof ED>(checker: Checker<ED, T, Cxt>) {
        this.executor.registerChecker(checker);
    }

    resetInitialData(initialData: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    }, stat?: {
        create: number;
        update: number;
        remove: number;
        commit: number;
    }) {
        super.resetInitialData(initialData, stat);
        this.dataLoaded = true;
        this.dataLoadedLockUnlocker();
    }
}

