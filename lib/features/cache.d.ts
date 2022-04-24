import { StorageSchema, EntityDict, OperateParams, OpRecord, Aspect, Checker, RowStore, Context, OperationResult } from 'oak-domain/lib/types';
import { Feature } from '../types/Feature';
import { CacheStore } from '../cacheStore/CacheStore';
export declare class Cache<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>> extends Feature<ED, Cxt, AD> {
    cacheStore: CacheStore<ED, Cxt>;
    createContext: (store: RowStore<ED, Cxt>) => Cxt;
    private syncEventsCallbacks;
    constructor(storageSchema: StorageSchema<ED>, createContext: (store: RowStore<ED, Cxt>) => Cxt, checkers?: Array<Checker<ED, keyof ED, Cxt>>);
    refresh<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], params?: object): OperationResult;
    sync(records: OpRecord<ED>[]): Promise<void>;
    operate<T extends keyof ED>(entity: T, operation: ED[T]['Operation'], commit?: boolean, params?: OperateParams): Promise<OperationResult>;
    get<T extends keyof ED>(options: {
        entity: T;
        selection: ED[T]['Selection'];
        params?: object;
    }): Promise<import("oak-domain/lib/types").SelectRowShape<ED[T]["Schema"], ED[T]["Selection"]["data"]>[]>;
    judgeRelation(entity: keyof ED, attr: string): string | 0 | 1 | 2 | string[];
    bindOnSync(callback: (opRecords: OpRecord<ED>[]) => Promise<void>): void;
    unbindOnSync(callback: (opRecords: OpRecord<ED>[]) => Promise<void>): void;
}
