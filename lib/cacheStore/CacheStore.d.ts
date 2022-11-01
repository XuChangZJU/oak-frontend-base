import { DeduceCreateSingleOperation, DeduceRemoveOperation, DeduceUpdateOperation, EntityDict, OperationResult, OpRecord, SelectOption } from 'oak-domain/lib/types/Entity';
import { StorageSchema } from "oak-domain/lib/types/Storage";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { Checker, CheckerType, Context } from 'oak-domain/lib/types';
import { TreeStore, TreeStoreOperateOption } from 'oak-memory-tree-store';
interface CachStoreOperation extends TreeStoreOperateOption {
    inSync?: boolean;
}
export declare class CacheStore<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>> extends TreeStore<ED, Cxt> {
    private executor;
    private getFullDataFn?;
    private resetInitialDataFn?;
    constructor(storageSchema: StorageSchema<ED>, contextBuilder: () => (store: CacheStore<ED, Cxt>) => Cxt, getFullDataFn?: () => any, resetInitialDataFn?: () => void);
    protected updateAbjointRow<T extends keyof ED>(entity: T, operation: DeduceCreateSingleOperation<ED[T]['Schema']> | DeduceUpdateOperation<ED[T]['Schema']> | DeduceRemoveOperation<ED[T]['Schema']>, context: Cxt, option?: CachStoreOperation): Promise<number>;
    operate<T extends keyof ED, OP extends TreeStoreOperateOption>(entity: T, operation: ED[T]['Operation'], context: Cxt, option: OP): Promise<OperationResult<ED>>;
    sync(opRecords: Array<OpRecord<ED>>, context: Cxt): Promise<void>;
    check<T extends keyof ED>(entity: T, operation: ED[T]['Operation'], context: Cxt, checkerTypes?: CheckerType[]): Promise<void>;
    select<T extends keyof ED, S extends ED[T]['Selection'], OP extends SelectOption>(entity: T, selection: S, context: Cxt, option: OP): Promise<import("oak-domain/lib/types").SelectionResult<ED[T]["Schema"], S["data"]>>;
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
}
export {};
