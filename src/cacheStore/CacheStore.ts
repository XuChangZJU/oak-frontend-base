import { AggregationResult, EntityDict, OperateOption, OperationResult, OpRecord, SelectOption } from 'oak-domain/lib/types/Entity';
import { StorageSchema } from "oak-domain/lib/types/Storage";
import { readOnlyActions } from 'oak-domain/lib/actions/action';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { Checker, CheckerType, Trigger, TxnOption } from 'oak-domain/lib/types';
import { TreeStore, TreeStoreOperateOption } from 'oak-memory-tree-store';
import assert from 'assert';
import { SyncContext, SyncRowStore } from 'oak-domain/lib/store/SyncRowStore';
import SyncTriggerExecutor from './SyncTriggerExecutor';

interface CachStoreOperation extends TreeStoreOperateOption {
    checkerTypes?: CheckerType[];
};

export class CacheStore<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends SyncContext<ED>
    > extends TreeStore<ED> implements SyncRowStore<ED, SyncContext<ED>>{
    private triggerExecutor: SyncTriggerExecutor<ED, Cxt>;
    private getFullDataFn?: () => any;
    private resetInitialDataFn?: () => void;

    constructor(
        storageSchema: StorageSchema<ED>,
        getFullDataFn?: () => any,
        resetInitialDataFn?: () => void
    ) {
        super(storageSchema);
        this.triggerExecutor = new SyncTriggerExecutor();
        this.getFullDataFn = getFullDataFn;
        this.resetInitialDataFn = resetInitialDataFn;
    }
    
    aggregate<T extends keyof ED, OP extends SelectOption>(entity: T, aggregation: ED[T]['Aggregation'], context: SyncContext<ED>, option: OP): AggregationResult<ED[T]['Schema']> {
        return this.aggregateSync(entity, aggregation, context, option);
    }

    protected cascadeUpdate<T extends keyof ED, OP extends CachStoreOperation>(entity: T, operation: ED[T]['Operation'], context: SyncContext<ED>, option: OP): OperationResult<ED> {        
        assert(context.getCurrentTxnId());
        if (!option.blockTrigger) {
            this.triggerExecutor.check(entity, operation, context as Cxt, 'before', option.checkerTypes);
        }
        if (operation.data) {
            const result = super.cascadeUpdate(entity, operation, context, option);
    
            if (!option.blockTrigger) {
                this.triggerExecutor.check(entity, operation, context as Cxt, 'after', option.checkerTypes);
            }

            return result;
        }
        return {};
    }

    operate<T extends keyof ED, OP extends CachStoreOperation>(
        entity: T,
        operation: ED[T]['Operation'],
        context: Cxt,
        option: OP
    ): OperationResult<ED> {
        assert(context.getCurrentTxnId());
        const result = super.operateSync(entity, operation, context, option);
        return result;
    }

    sync<Cxt extends SyncContext<ED>>(opRecords: Array<OpRecord<ED>>, context: Cxt) {
        const autoCommit = !context.getCurrentTxnId();
        if (autoCommit) {
            context.begin();
        }
        let result;

        try {
            result = super.sync<OperateOption, Cxt>(opRecords, context, {});
        } catch (err) {
            if (autoCommit) {
                context.rollback();
            }
            throw err;
        }
        if (autoCommit) {
            context.commit();
        }
        return result;
    }

    check<T extends keyof ED>(entity: T, operation: Omit<ED[T]['Operation'], 'id'>, context: Cxt, checkerTypes?: CheckerType[]) {
        assert(context.getCurrentTxnId());
        const { action } = operation;
        if (readOnlyActions.includes(action)) {
            // 只读查询的checker只能在根部入口执行
            this.triggerExecutor.check(entity, operation, context, undefined, checkerTypes);
            return;
        }
        this.operate(entity, operation as ED[T]['Operation'], context, {
            checkerTypes,
        });
    }

    select<
        T extends keyof ED,
        OP extends SelectOption,
        Cxt extends SyncContext<ED>
    >(entity: T, selection: ED[T]['Selection'], context: Cxt, option: OP) {
        const autoCommit = !context.getCurrentTxnId();
        if (autoCommit) {
            context.begin();
        }
        let result;

        try {
            result = super.selectSync(entity, selection, context, option);
        } catch (err) {
            if (autoCommit) {
                context.rollback();
            }
            throw err;
        }
        if (autoCommit) {
            context.commit();
        }
        return result;
    }

    registerChecker<T extends keyof ED>(checker: Checker<ED, T, Cxt>) {
        this.triggerExecutor.registerChecker(checker);
    }

    /* registerTrigger<T extends keyof ED>(trigger: Trigger<ED, T, Cxt>) {
        this.triggerExecutor.registerTrigger(trigger);
    } */

    /**
     * 这个函数是在debug下用来获取debugStore的数据，release下不能使用
     * @returns
     */
    getFullData() {
        return this.getFullDataFn!();
    }

    /**
     * 这个函数是在debug下用来初始化debugStore的数据，release下不能使用
     * @returns
     */
    resetInitialData() {
        return this.resetInitialDataFn!();
    }

    count<T extends keyof ED, OP extends SelectOption>(entity: T, selection: Pick<ED[T]['Selection'], 'filter' | 'count'>, context: SyncContext<ED>, option: OP): number {
        const autoCommit = !context.getCurrentTxnId();
        if (autoCommit) {
            context.begin();
        }
        let result;

        try {
            result = super.countSync(entity, selection, context, option);
        } catch (err) {
            if (autoCommit) {
                context.rollback();
            }
            throw err;
        }
        if (autoCommit) {
            context.commit();
        }
        return result;
    }
    begin(option?: TxnOption): string {
        return super.beginSync();
    }
    commit(txnId: string): void {
        return super.commitSync(txnId);
    }
    rollback(txnId: string): void {
        return super.rollbackSync(txnId);
    }
}
