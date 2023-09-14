import { EntityDict, OperateOption, SelectOption, OpRecord, AspectWrapper, CheckerType, Aspect, StorageSchema, Checker } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { Feature } from '../types/Feature';
import { CacheStore } from '../cacheStore/CacheStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { LocalStorage } from './localStorage';
interface CacheSelectOption extends SelectOption {
    ignoreKeepFreshRule?: true;
}
export declare class Cache<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends CommonAspectDict<ED, Cxt> & Record<string, Aspect<ED, Cxt>>> extends Feature {
    cacheStore: CacheStore<ED, FrontCxt>;
    private aspectWrapper;
    private syncEventsCallbacks;
    private contextBuilder?;
    private refreshing;
    private savedEntities;
    private keepFreshPeriod;
    private localStorage;
    private getFullDataFn;
    private refreshRecords;
    private context?;
    constructor(storageSchema: StorageSchema<ED>, aspectWrapper: AspectWrapper<ED, Cxt, AD>, frontendContextBuilder: () => (store: CacheStore<ED, FrontCxt>) => FrontCxt, checkers: Array<Checker<ED, keyof ED, FrontCxt | Cxt>>, getFullData: () => any, localStorage: LocalStorage, savedEntities?: (keyof ED)[], keepFreshPeriod?: number);
    /**
     * 处理cache中需要缓存的数据
     */
    private initSavedLogic;
    getSchema(): StorageSchema<ED>;
    exec<K extends keyof AD>(name: K, params: Parameters<AD[K]>[0], callback?: (result: Awaited<ReturnType<AD[K]>>, opRecords?: OpRecord<ED>[]) => void, dontPublish?: true): Promise<{
        result: Awaited<ReturnType<AD[K]>>;
        message: string | null | undefined;
    }>;
    private getRefreshRecordSize;
    private reduceRefreshRecord;
    private addRefreshRecord;
    /**
     * 判定一个refresh行为是否可以应用缓存优化
     * 可以优化的selection必须满足：
     * 1）没有indexFrom和count
     * 2）没要求getCount
     * 3）查询的projection和filter只限定在该对象自身属性上
     * 4）有filter
     * @param entity
     * @param selection
     * @param option
     * @param getCount
     */
    private canOptimizeRefresh;
    private filterToKey;
    refresh<T extends keyof ED, OP extends CacheSelectOption>(entity: T, selection: ED[T]['Selection'], option?: OP, getCount?: true, callback?: (result: Awaited<ReturnType<AD['select']>>) => void, dontPublish?: true, onlyReturnFresh?: true): Promise<{
        data: Partial<ED[T]["Schema"]>[];
        count?: undefined;
    } | {
        data: Partial<ED[T]["Schema"]>[];
        count: number | undefined;
    }>;
    aggregate<T extends keyof ED, OP extends SelectOption>(entity: T, aggregation: ED[T]['Aggregation'], option?: OP): Promise<ReturnType<AD["aggregate"]>>;
    operate<T extends keyof ED, OP extends OperateOption>(entity: T, operation: ED[T]['Operation'] | ED[T]['Operation'][], option?: OP, callback?: (result: Awaited<ReturnType<AD['operate']>>) => void): Promise<{
        result: Awaited<ReturnType<AD["operate"]>>;
        message: string | null | undefined;
    }>;
    count<T extends keyof ED, OP extends SelectOption>(entity: T, selection: Pick<ED[T]['Selection'], 'filter'>, option?: OP, callback?: (result: Awaited<ReturnType<AD['count']>>) => void): Promise<ReturnType<AD["count"]>>;
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
    }>): void;
    fetchRows(missedRows: Array<{
        entity: keyof ED;
        selection: ED[keyof ED]['Selection'];
    }>): void;
    /**
     * getById可以处理当本行不在缓存中的自动取
     * @attention 这里如果访问了一个id不存在的行（被删除？），可能会陷入无限循环。如果遇到了再处理
     * @param entity
     * @param data
     * @param id
     * @param allowMiss
     */
    getById<T extends keyof ED>(entity: T, data: ED[T]['Selection']['data'], id: string, allowMiss?: boolean): Partial<ED[T]['Schema']> | undefined;
    private getInner;
    get<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], allowMiss?: boolean): Partial<ED[T]["Schema"]>[];
    judgeRelation(entity: keyof ED, attr: string): string | 0 | 1 | string[] | 2;
    bindOnSync(callback: (opRecords: OpRecord<ED>[]) => void): void;
    unbindOnSync(callback: (opRecords: OpRecord<ED>[]) => void): void;
    getCachedData(): { [T in keyof ED]?: ED[T]["OpSchema"][] | undefined; };
    getFullData(): any;
    begin(): FrontCxt;
    commit(): void;
    rollback(): void;
    buildContext(): FrontCxt;
}
export {};
