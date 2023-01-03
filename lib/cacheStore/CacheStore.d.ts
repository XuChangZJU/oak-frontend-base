import { AggregationResult, EntityDict, OperationResult, OpRecord, SelectOption } from 'oak-domain/lib/types/Entity';
import { StorageSchema } from "oak-domain/lib/types/Storage";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { Checker, CheckerType, TxnOption } from 'oak-domain/lib/types';
import { TreeStore, TreeStoreOperateOption } from 'oak-memory-tree-store';
import { SyncContext, SyncRowStore } from 'oak-domain/lib/store/SyncRowStore';
export declare class CacheStore<ED extends EntityDict & BaseEntityDict, Cxt extends SyncContext<ED>> extends TreeStore<ED> implements SyncRowStore<ED, SyncContext<ED>> {
    private checkerExecutor;
    private getFullDataFn?;
    private resetInitialDataFn?;
    constructor(storageSchema: StorageSchema<ED>, getFullDataFn?: () => any, resetInitialDataFn?: () => void);
    aggregate<T extends keyof ED, OP extends SelectOption>(entity: T, aggregation: ED[T]['Aggregation'], context: SyncContext<ED>, option: OP): AggregationResult<ED[T]['Schema']>;
    operate<T extends keyof ED, OP extends TreeStoreOperateOption>(entity: T, operation: ED[T]['Operation'], context: Cxt, option: OP): OperationResult<ED>;
    sync<Cxt extends SyncContext<ED>>(opRecords: Array<OpRecord<ED>>, context: Cxt): void;
    check<T extends keyof ED>(entity: T, operation: ED[T]['Operation'], context: Cxt, checkerTypes?: CheckerType[]): void;
    select<T extends keyof ED, OP extends SelectOption, Cxt extends SyncContext<ED>>(entity: T, selection: ED[T]['Selection'], context: Cxt, option: OP): Partial<ED[T]["Schema"]>[];
    registerChecker<T extends keyof ED>(checker: Checker<ED, T, Cxt>): void;
    /**
     * 这个函数是在debug下用来获取debugStore的数据，release下不能使用
     * @returns
     */
    getFullData(): any;
    /**
     * 这个函数是在debug下用来初始化debugStore的数据，release下不能使用
     * @returns
     */
    resetInitialData(): void;
    count<T extends keyof ED, OP extends SelectOption>(entity: T, selection: Pick<ED[T]['Selection'], 'filter' | 'count'>, context: SyncContext<ED>, option: OP): number;
    begin(option?: TxnOption): string;
    commit(txnId: string): void;
    rollback(txnId: string): void;
}
