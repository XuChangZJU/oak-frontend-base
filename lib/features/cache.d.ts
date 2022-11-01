import { EntityDict, OperateOption, SelectOption, OpRecord, Context, AspectWrapper, SelectionResult, CheckerType } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { Feature } from '../types/Feature';
import { CacheStore } from '../cacheStore/CacheStore';
export declare class Cache<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> extends Feature {
    cacheStore?: CacheStore<ED, Cxt>;
    private aspectWrapper;
    private syncEventsCallbacks;
    private contextBuilder?;
    private syncLock;
    constructor(aspectWrapper: AspectWrapper<ED, Cxt, AD>, contextBuilder: () => Cxt, store: CacheStore<ED, Cxt>);
    refresh<T extends keyof ED, OP extends SelectOption>(entity: T, selection: ED[T]['Selection'], option?: OP, getCount?: true): Promise<{
        data: import("oak-domain/lib/types").SelectRowShape<ED[keyof ED]["Schema"], ED[keyof ED]["Selection"]["data"]>[];
        count?: number | undefined;
    }>;
    operate<T extends keyof ED, OP extends OperateOption>(entity: T, operation: ED[T]['Operation'], option?: OP): Promise<import("oak-domain/lib/types").OperationResult<ED> | import("oak-domain/lib/types").OperationResult<ED>[]>;
    count<T extends keyof ED, OP extends SelectOption>(entity: T, selection: ED[T]['Selection'], option?: OP): Promise<number>;
    private sync;
    /**
     * 前端缓存做operation只可能是测试权限，必然回滚
     * @param entity
     * @param operation
     * @returns
     */
    tryRedoOperations<T extends keyof ED>(operations: (ED[T]['Operation'] & {
        entity: T;
    })[]): Promise<boolean>;
    checkOperation<T extends keyof ED>(entity: T, action: ED[T]['Action'], filter?: ED[T]['Update']['filter'], checkerTypes?: CheckerType[]): Promise<boolean>;
    /**
     * 尝试在cache中重做一些动作，然后选择重做后的数据（为了实现modi）
     * @param entity
     * @param selection
     * @param opers
     */
    tryRedoOperationsThenSelect<T extends keyof ED, S extends ED[T]['Selection']>(entity: T, selection: S, opers: Array<{
        entity: keyof ED;
        operation: ED[keyof ED]['Operation'];
    }>): Promise<SelectionResult<ED[T]["Schema"], S["data"]>>;
    get<T extends keyof ED, S extends ED[T]['Selection']>(entity: T, selection: S, params?: SelectOption): Promise<import("oak-domain/lib/types").SelectRowShape<ED[T]["Schema"], S["data"]>[]>;
    judgeRelation(entity: keyof ED, attr: string): string | 0 | 1 | 2 | string[];
    bindOnSync(callback: (opRecords: OpRecord<ED>[]) => Promise<void>): void;
    unbindOnSync(callback: (opRecords: OpRecord<ED>[]) => Promise<void>): void;
    getCachedData(): { [T in keyof ED]?: ED[T]["OpSchema"][] | undefined; };
    getFullData(): any;
    resetInitialData(): void;
}
