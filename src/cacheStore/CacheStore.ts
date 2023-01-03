import { AggregationResult, EntityDict, OperationResult, OpRecord, SelectOption } from 'oak-domain/lib/types/Entity';
import { StorageSchema } from "oak-domain/lib/types/Storage";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { Checker, CheckerType, TxnOption } from 'oak-domain/lib/types';
import { TreeStore, TreeStoreOperateOption } from 'oak-memory-tree-store';
import assert from 'assert';
import { SyncContext, SyncRowStore } from 'oak-domain/lib/store/SyncRowStore';
import CheckerExecutor from './CheckerExecutor';

interface CachStoreOperation extends TreeStoreOperateOption {};

export class CacheStore<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends SyncContext<ED>
    > extends TreeStore<ED> implements SyncRowStore<ED, SyncContext<ED>>{
    private checkerExecutor: CheckerExecutor<ED, Cxt>;
    private getFullDataFn?: () => any;
    private resetInitialDataFn?: () => void;

    constructor(
        storageSchema: StorageSchema<ED>,
        getFullDataFn?: () => any,
        resetInitialDataFn?: () => void
    ) {
        super(storageSchema);
        this.checkerExecutor = new CheckerExecutor();
        this.getFullDataFn = getFullDataFn;
        this.resetInitialDataFn = resetInitialDataFn;
    }
    
    aggregate<T extends keyof ED, OP extends SelectOption>(entity: T, aggregation: ED[T]['Aggregation'], context: SyncContext<ED>, option: OP): AggregationResult<ED[T]['Schema']> {
        return this.aggregateSync(entity, aggregation, context, option);
    }

    operate<T extends keyof ED, OP extends TreeStoreOperateOption>(
        entity: T,
        operation: ED[T]['Operation'],
        context: Cxt,
        option: OP
    ): OperationResult<ED> {
        assert(context.getCurrentTxnId());
        if (!option.blockTrigger) {
            this.checkerExecutor.check(entity, operation, context);
        }
        return super.operateSync(entity, operation, context, option);
    }

    sync<Cxt extends SyncContext<ED>>(opRecords: Array<OpRecord<ED>>, context: Cxt) {
        const autoCommit = !context.getCurrentTxnId();
        if (autoCommit) {
            context.begin();
        }
        let result;

        try {
            result = super.sync<CachStoreOperation, Cxt>(opRecords, context, {});
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

    check<T extends keyof ED>(entity: T, operation: ED[T]['Operation'], context: Cxt, checkerTypes?: CheckerType[]) {
        assert(context.getCurrentTxnId());
        this.checkerExecutor.check(entity, operation, context, checkerTypes);
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
        this.checkerExecutor.registerChecker(checker);
    }

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
