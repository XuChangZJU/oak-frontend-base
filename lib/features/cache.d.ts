import { EntityDict, OperateOption, SelectOption, OpRecord, Context, AspectWrapper, SelectionResult } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { Feature } from '../types/Feature';
import { CacheStore } from '../cacheStore/CacheStore';
export declare class Cache<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature<ED, Cxt, AD> {
    cacheStore?: CacheStore<ED, Cxt>;
    private syncEventsCallbacks;
    private contextBuilder?;
    private syncLock;
    private initLock;
    constructor(aspectWrapper: AspectWrapper<ED, Cxt, AD>);
    /**
     * 目前context和cache会形成循环依赖，这里不太好处理，只能先让contextBuilder后注入
     * @param contextBuilder
     */
    init(contextBuilder: () => Cxt, store: CacheStore<ED, Cxt>): void;
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
    testOperation<T extends keyof ED>(entity: T, operation: ED[T]['Operation']): Promise<boolean>;
    /**
     * 尝试在cache中重做一些动作，然后选择重做后的数据（为了实现modi）
     * @param entity
     * @param projection
     * @param opers
     */
    tryRedoOperations<T extends keyof ED, S extends ED[T]['Selection']>(entity: T, selection: S, opers: Array<{
        entity: keyof ED;
        operation: ED[keyof ED]['Operation'];
    }>): Promise<SelectionResult<ED[T]["Schema"], S["data"]>>;
    get<T extends keyof ED, S extends ED[T]['Selection']>(entity: T, selection: S, params?: SelectOption): Promise<import("oak-domain/lib/types").SelectRowShape<ED[T]["Schema"], S["data"]>[]>;
    judgeRelation(entity: keyof ED, attr: string): string | 0 | 1 | string[] | 2;
    bindOnSync(callback: (opRecords: OpRecord<ED>[]) => Promise<void>): void;
    unbindOnSync(callback: (opRecords: OpRecord<ED>[]) => Promise<void>): void;
    getCachedData(): { [T in keyof ED]?: ED[T]["OpSchema"][] | undefined; };
    getFullData(): any;
    resetInitialData(): void;
}
