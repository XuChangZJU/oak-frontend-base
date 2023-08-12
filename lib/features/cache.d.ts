import { EntityDict, OperateOption, SelectOption, OpRecord, AspectWrapper, CheckerType, Aspect } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { Feature } from '../types/Feature';
import { CacheStore } from '../cacheStore/CacheStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
export declare class Cache<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt> & Record<string, Aspect<ED, Cxt>>> extends Feature {
    cacheStore: CacheStore<ED, FrontCxt>;
    private aspectWrapper;
    private syncEventsCallbacks;
    private contextBuilder?;
    private refreshing;
    constructor(aspectWrapper: AspectWrapper<ED, Cxt, AD>, contextBuilder: () => FrontCxt, store: CacheStore<ED, FrontCxt>);
    getSchema(): import("oak-domain/lib/types").StorageSchema<ED>;
    getCurrentUserId(allowUnloggedIn?: boolean): string | undefined;
    exec<K extends keyof AD>(name: K, params: Parameters<AD[K]>[0], callback?: (result: Awaited<ReturnType<AD[K]>>, opRecords?: OpRecord<ED>[]) => void, dontPublish?: true): Promise<{
        result: Awaited<ReturnType<AD[K]>>;
        message: string | null | undefined;
    }>;
    refresh<T extends keyof ED, OP extends SelectOption>(entity: T, selection: ED[T]['Selection'], option?: OP, getCount?: true, callback?: (result: Awaited<ReturnType<AD['select']>>) => void, dontPublish?: true): Promise<{
        data: Partial<ED[T]["Schema"]>[];
        count: number | undefined;
    }>;
    aggregate<T extends keyof ED, OP extends SelectOption>(entity: T, aggregation: ED[T]['Aggregation'], option?: OP): Promise<import("oak-domain/lib/types").AggregationResult<ED[keyof ED]["Schema"]>>;
    operate<T extends keyof ED, OP extends OperateOption>(entity: T, operation: ED[T]['Operation'] | ED[T]['Operation'][], option?: OP, callback?: (result: Awaited<ReturnType<AD['operate']>>) => void): Promise<{
        result: Awaited<ReturnType<AD["operate"]>>;
        message: string | null | undefined;
    }>;
    count<T extends keyof ED, OP extends SelectOption>(entity: T, selection: Pick<ED[T]['Selection'], 'filter'>, option?: OP, callback?: (result: Awaited<ReturnType<AD['count']>>) => void): Promise<number>;
    private sync;
    /**
     * 前端缓存做operation只可能是测试权限，必然回滚
     * @param entity
     * @param operation
     * @returns
     */
    tryRedoOperations<T extends keyof ED>(operations: ({
        operation: ED[T]['Operation'];
        entity: T;
    })[]): true | Error;
    checkOperation<T extends keyof ED>(entity: T, action: ED[T]['Action'], data?: ED[T]['Update']['data'], filter?: ED[T]['Update']['filter'], checkerTypes?: CheckerType[]): boolean;
    redoOperation(opers: Array<{
        entity: keyof ED;
        operation: ED[keyof ED]['Operation'];
    }>, context: FrontCxt): void;
    private getInner;
    get<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], context?: FrontCxt, allowMiss?: boolean): Partial<ED[T]["Schema"]>[];
    judgeRelation(entity: keyof ED, attr: string): string | 0 | 1 | string[] | 2;
    bindOnSync(callback: (opRecords: OpRecord<ED>[]) => void): void;
    unbindOnSync(callback: (opRecords: OpRecord<ED>[]) => void): void;
    getCachedData(): { [T in keyof ED]?: ED[T]["OpSchema"][] | undefined; };
    getFullData(): any;
    resetInitialData(): void;
    begin(): FrontCxt;
    commit(context: FrontCxt): void;
    rollback(context: FrontCxt): void;
}
