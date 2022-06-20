import { StorageSchema, EntityDict, OperateParams, OpRecord, Aspect, Checker, RowStore, Context, OperationResult } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
import { CacheStore } from '../cacheStore/CacheStore';
export declare class Cache<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>> extends Feature<ED, Cxt, AD> {
    cacheStore: CacheStore<ED, Cxt>;
    createContext: (store: RowStore<ED, Cxt>, scene: string) => Cxt;
    private syncEventsCallbacks;
    constructor(storageSchema: StorageSchema<ED>, createContext: (store: RowStore<ED, Cxt>, scene: string) => Cxt, checkers?: Array<Checker<ED, keyof ED, Cxt>>);
    refresh<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], scene: string, params?: object): ReturnType<(AD & {
        operate: typeof import("../aspects/crud").operate;
        select: typeof import("../aspects/crud").select;
        amap: typeof import("../aspects/amap").amap;
        getTranslations: typeof import("../aspects/locales").getTranslations;
    })["select"]>;
    sync(records: OpRecord<ED>[]): Promise<void>;
    /**
     * 前端缓存做operation只可能是测试权限，必然回滚
     * @param entity
     * @param operation
     * @param scene
     * @param commit
     * @param params
     * @returns
     */
    operate<T extends keyof ED>(entity: T, operation: ED[T]['Operation'], scene: string, params?: OperateParams): Promise<OperationResult<ED>>;
    get<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], scene: string, params?: object): Promise<import("oak-domain/lib/types").SelectRowShape<ED[T]["Schema"], ED[T]["Selection"]["data"]>[]>;
    judgeRelation(entity: keyof ED, attr: string): string | 0 | 1 | 2 | string[];
    bindOnSync(callback: (opRecords: OpRecord<ED>[]) => Promise<void>): void;
    unbindOnSync(callback: (opRecords: OpRecord<ED>[]) => Promise<void>): void;
    registerCheckers(checkers: Array<Checker<ED, keyof ED, Cxt>>): void;
}
