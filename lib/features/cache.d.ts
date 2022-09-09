import { EntityDict, OperateOption, SelectOption, OpRecord, Context, AspectWrapper } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { Feature } from '../types/Feature';
import { CacheStore } from '../cacheStore/CacheStore';
export declare class Cache<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature<ED, Cxt, AD> {
    cacheStore: CacheStore<ED, Cxt>;
    context: Cxt;
    private syncEventsCallbacks;
    private contextBuilder;
    private syncLock;
    constructor(aspectWrapper: AspectWrapper<ED, Cxt, AD>, context: Cxt, cacheStore: CacheStore<ED, Cxt>, contextBuilder: () => Cxt);
    refresh<T extends keyof ED, OP extends SelectOption>(entity: T, selection: ED[T]['Selection'], option?: OP, getCount?: true): Promise<{
        data: import("oak-domain/lib/types").SelectRowShape<ED[keyof ED]["Schema"], ED[keyof ED]["Selection"]["data"]>[];
        count?: number | undefined;
    }>;
    operate<T extends keyof ED, OP extends OperateOption>(entity: T, operation: ED[T]['Operation'], option?: OP): Promise<import("oak-domain/lib/types").OperationResult<ED> | import("oak-domain/lib/types").OperationResult<ED>[]>;
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
    testOperation<T extends keyof ED>(entity: T, operation: ED[T]['Operation']): Promise<import("oak-domain/lib/types").OperationResult<ED>>;
    /**
     * 尝试在cache中重做一些动作，然后选择重做后的数据（为了实现modi）
     * @param entity
     * @param projection
     * @param opers
     */
    tryRedoOperations<T extends keyof ED, S extends ED[T]['Selection']>(entity: T, selection: S, opers: Array<{
        entity: keyof ED;
        operation: ED[keyof ED]['Operation'];
    }>): Promise<import("oak-domain/lib/types").SelectionResult<ED[keyof ED]["Schema"], ED[keyof ED]["Selection"]["data"]>>;
    get<T extends keyof ED, S extends ED[T]['Selection']>(entity: T, selection: S, params?: SelectOption): Promise<import("oak-domain/lib/types").SelectRowShape<ED[T]["Schema"], S["data"]>[]>;
    judgeRelation(entity: keyof ED, attr: string): string | 0 | 2 | 1 | string[];
    bindOnSync(callback: (opRecords: OpRecord<ED>[]) => Promise<void>): void;
    unbindOnSync(callback: (opRecords: OpRecord<ED>[]) => Promise<void>): void;
    getCachedData(): CacheStore<ED, Cxt>;
    getFullData(): any;
    resetInitialData(): void;
}
