import { EntityDict, OperateOption, SelectOption, OpRecord, Context, AspectWrapper } from 'oak-domain/lib/types';
import { CommonAspectDict } from 'oak-common-aspect';
import { Feature } from '../types/Feature';
import { CacheStore } from '../cacheStore/CacheStore';
export declare class Cache<ED extends EntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature<ED, Cxt, AD> {
    cacheStore: CacheStore<ED, Cxt>;
    context: Cxt;
    private syncEventsCallbacks;
    constructor(aspectWrapper: AspectWrapper<ED, Cxt, AD>, context: Cxt, cacheStore: CacheStore<ED, Cxt>);
    refresh<T extends keyof ED, OP extends SelectOption>(entity: T, selection: ED[T]['Selection'], option?: OP, getCount?: true): Promise<{
        data: import("oak-domain/lib/types").SelectRowShape<ED[keyof ED]["Schema"], ED[keyof ED]["Selection"]["data"]>[];
        count?: number | undefined;
    }>;
    private sync;
    /**
     * 前端缓存做operation只可能是测试权限，必然回滚
     * @param entity
     * @param operation
     * @param scene
     * @param commit
     * @param option
     * @returns
     */
    operate<T extends keyof ED>(entity: T, operation: ED[T]['Operation'], option?: OperateOption): Promise<import("oak-domain/lib/types").OperationResult<ED>>;
    get<T extends keyof ED, S extends ED[T]['Selection']>(entity: T, selection: S, params?: SelectOption): Promise<import("oak-domain/lib/types").SelectRowShape<ED[T]["Schema"], S["data"]>[]>;
    judgeRelation(entity: keyof ED, attr: string): string | 0 | 2 | string[] | 1;
    bindOnSync(callback: (opRecords: OpRecord<ED>[]) => Promise<void>): void;
    unbindOnSync(callback: (opRecords: OpRecord<ED>[]) => Promise<void>): void;
    getCachedData(): { [T in keyof ED]?: ED[T]["OpSchema"][] | undefined; };
    getFullData(): any;
    resetInitialData(): void;
}
