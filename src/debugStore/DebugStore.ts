import { AggregationResult, AuthCascadePath, EntityDict, SelectOption, TxnOption } from "oak-domain/lib/types";
import { TreeStore, TreeStoreOperateOption, TreeStoreSelectOption } from 'oak-memory-tree-store';
import { StorageSchema, Trigger, Checker } from "oak-domain/lib/types";
import { TriggerExecutor } from 'oak-domain/lib/store/TriggerExecutor';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncContext, AsyncRowStore } from "oak-domain/lib/store/AsyncRowStore";
import assert from 'assert';
import { RelationAuth } from "oak-domain/lib/store/RelationAuth";

interface DebugStoreOperateOption extends TreeStoreOperateOption {
    noLock?: true;
};

interface DebugStoreSelectOption extends TreeStoreSelectOption {
    noLock?: true;
};

export class DebugStore<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>> extends TreeStore<ED> implements AsyncRowStore<ED, Cxt> {
    private executor: TriggerExecutor<ED>;
    private relationAuth: RelationAuth<ED>;

    constructor(
        storageSchema: StorageSchema<ED>,
        contextBuilder: (cxtString?: string) => (store: DebugStore<ED, Cxt>) => Promise<Cxt>,
        actionCascadeGraph: AuthCascadePath<ED>[],
        relationCascadeGraph: AuthCascadePath<ED>[]
    ) {
        super(storageSchema);
        this.executor = new TriggerExecutor((cxtString) => contextBuilder(cxtString)(this));
        this.relationAuth = new RelationAuth(actionCascadeGraph, relationCascadeGraph, storageSchema);
        this.initRelationAuthTriggers(contextBuilder);
    }

    /**
     * relationAuth中需要缓存一些维表的数据
     */
     private async initRelationAuthTriggers(contextBuilder: (scene?: string) => (store: DebugStore<ED, Cxt>) => Promise<Cxt>) {
        const context = await contextBuilder()(this);
        await context.begin();
        
        const directActionAuths = await this.select('directActionAuth', {
            data: {
                id: 1,
                sourceEntity: 1,
                path: 1,
                deActions: 1,
                destEntity: 1,
            },
        }, context, {
            dontCollect: true,
        });
        this.relationAuth.setDirectionActionAuths(directActionAuths as ED['directActionAuth']['OpSchema'][]);

        const freeActionAuths = await this.select('freeActionAuth', {
            data: {
                id: 1,
                deActions: 1,
                destEntity: 1,
            },
        }, context, {
            dontCollect: true,
        });
        this.relationAuth.setFreeActionAuths(freeActionAuths as ED['freeActionAuth']['OpSchema'][]);
        
        await context.commit();

        const triggers = this.relationAuth.getAuthDataTriggers<Cxt>();
        triggers.forEach(
            (trigger) => this.registerTrigger(trigger)
        );
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
        if (!option.blockTrigger) {
            await this.executor.preOperation(entity, operation, context, option);
        }
        await this.relationAuth.checkRelationAsync(entity, operation, context);
        const result = await super.cascadeUpdateAsync(entity, operation, context, option);
        if (!option.blockTrigger) {
            await this.executor.postOperation(entity, operation, context, option);
        }
        return result;
    }

    async operate<T extends keyof ED, OP extends DebugStoreOperateOption>(
        entity: T,
        operation: ED[T]['Operation'],
        context: Cxt,
        option: OP
    ) {
        assert(context.getCurrentTxnId());
        return super.operateAsync(entity, operation, context, option);
    }

    async select<T extends keyof ED, OP extends DebugStoreSelectOption>(
        entity: T,
        selection: ED[T]['Selection'],
        context: Cxt,
        option: OP
    ) {
        assert(context.getCurrentTxnId());
        Object.assign(selection, {
            action: 'select',
        });

        // select的trigger应加在根结点的动作之前
        if (!option.blockTrigger) {
            await this.executor.preOperation(entity, selection as ED[T]['Operation'], context, option);
        }
        await this.relationAuth.checkRelationAsync(entity, selection, context);
        const result = await super.selectAsync(entity, selection, context, option);

        if (!option.blockTrigger) {
            await this.executor.postOperation(entity, selection as ED[T]['Operation'], context, option, result);
        }
        return result;
    }

    async count<T extends keyof ED, OP extends SelectOption>(entity: T, selection: Pick<ED[T]["Selection"], "filter" | "count">, context: Cxt, option: OP): Promise<number> {
        return super.countAsync(entity, selection, context, option);
    }

    registerTrigger<T extends keyof ED>(trigger: Trigger<ED, T, Cxt>) {
        this.executor.registerTrigger(trigger);
    }

    registerChecker<T extends keyof ED>(checker: Checker<ED, T, Cxt>) {
        this.executor.registerChecker(checker);
    }
}

