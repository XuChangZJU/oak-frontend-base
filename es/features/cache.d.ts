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
type RefreshOption = {
    dontPublish?: true;
    useLocalCache?: {
        keys: string[];
        gap?: number;
        onlyReturnFresh?: boolean;
    };
};
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
    private initPromise;
    constructor(storageSchema: StorageSchema<ED>, aspectWrapper: AspectWrapper<ED, Cxt, AD>, frontendContextBuilder: () => (store: CacheStore<ED, FrontCxt>) => FrontCxt, checkers: Array<Checker<ED, keyof ED, FrontCxt | Cxt>>, getFullData: () => any, localStorage: LocalStorage, savedEntities?: (keyof ED)[], keepFreshPeriod?: number);
    /**
     * 处理cache中需要缓存的数据
     */
    private initSavedLogic;
    onInitialized(): Promise<void>;
    getSchema(): StorageSchema<ED>;
    exec<K extends keyof AD>(name: K, params: Parameters<AD[K]>[0], callback?: (result: Awaited<ReturnType<AD[K]>>, opRecords?: OpRecord<ED>[]) => void, dontPublish?: true, ignoreContext?: true): Promise<{
        result: Awaited<ReturnType<AD[K]>>;
        message: string | null | undefined;
    }>;
    private saveRefreshRecord;
    private addRefreshRecord;
    /**
     * 向服务器刷新数据
     * @param entity
     * @param selection
     * @param option
     * @param callback
     * @param refreshOption
     * @returns
     * @description 支持增量更新，可以使用useLocalCache来将一些metadata级的数据本地缓存，减少更新次数。
     * 使用增量更新这里要注意，传入的keys如果有一个key是首次更新，会导致所有的keys全部更新。使用模块自己保证这种情况不要出现
     */
    refresh<T extends keyof ED, OP extends CacheSelectOption>(entity: T, selection: ED[T]['Selection'], option?: OP, callback?: (result: Awaited<ReturnType<AD['select']>>) => void, refreshOption?: RefreshOption): Promise<{
        data: Partial<ED[T]["Schema"]>[];
        total?: undefined;
    } | {
        data: Partial<ED[T]["Schema"]>[];
        total: number | undefined;
    }>;
    aggregate<T extends keyof ED, OP extends SelectOption>(entity: T, aggregation: ED[T]['Aggregation'], option?: OP): Promise<ReturnType<AD["aggregate"]>>;
    operate<T extends keyof ED, OP extends OperateOption>(entity: T, operation: ED[T]['Operation'] | ED[T]['Operation'][], option?: OP, callback?: (result: Awaited<ReturnType<AD['operate']>>) => void): Promise<{
        result: Awaited<ReturnType<AD["operate"]>>;
        message: string | null | undefined;
    }>;
    count<T extends keyof ED, OP extends SelectOption>(entity: T, selection: Pick<ED[T]['Selection'], 'filter'>, option?: OP, callback?: (result: Awaited<ReturnType<AD['count']>>) => void): Promise<ReturnType<AD["count"]>>;
    private syncInner;
    sync(records: OpRecord<ED>[]): void;
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
    checkOperation<T extends keyof ED>(entity: T, operation: {
        action: ED[T]['Action'];
        data?: ED[T]['Operation']['data'];
        filter?: ED[T]['Operation']['filter'];
    }, checkerTypes?: CheckerType[]): boolean;
    redoOperation(opers: Array<{
        entity: keyof ED;
        operation: ED[keyof ED]['Operation'];
    }>): void;
    fetchRows(missedRows: Array<{
        entity: keyof ED;
        selection: ED[keyof ED]['Selection'];
    }>): void;
    private getInner;
    /**
     * 把select的结果merge到sr中，因为select有可能存在aggr数据，在这里必须要使用合并后的结果
     * sr的数据结构不好规范化描述，参见common-aspect中的select接口
     * @param entity
     * @param rows
     * @param sr
     */
    mergeSelectResult<T extends keyof ED>(entity: T, rows: Partial<ED[T]['Schema']>[], sr: Record<string, any>): void;
    get<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], allowMiss?: boolean, sr?: Record<string, any>): Partial<ED[T]["Schema"]>[];
    getById<T extends keyof ED>(entity: T, projection: ED[T]['Selection']['data'], id: string, allowMiss?: boolean): Partial<ED[T]["Schema"]>[];
    judgeRelation(entity: keyof ED, attr: string): string | 0 | 1 | string[] | 2 | -1;
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
