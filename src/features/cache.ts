import { StorageSchema, DeduceSelection, EntityDict, OperateParams, OpRecord, Aspect, Checker, RowStore, Context, OperationResult, Trigger, SelectOpResult, UpdateOpResult } from 'oak-domain/lib/types';
import { Action, Feature } from '../types/Feature';
import { assign, pull, uniq } from 'lodash';
import { CacheStore } from '../cacheStore/CacheStore';

export class Cache<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>> extends Feature<ED, Cxt, AD> {
    cacheStore: CacheStore<ED>;
    createContext: (store: RowStore<ED>) => Cxt;
    private syncEventsCallbacks: Array<(opRecords: OpRecord<ED>[]) => Promise<void>>;

    constructor(storageSchema: StorageSchema<ED>, createContext: (store: RowStore<ED>) => Cxt, checkers?: Array<Checker<ED, keyof ED>>) {
        const cacheStore = new CacheStore(storageSchema);
        if (checkers) {
            checkers.forEach(
                (checker) => cacheStore.registerChecker(checker)
            );
        }
        super();
        this.cacheStore = cacheStore;
        this.createContext = createContext;
        this.syncEventsCallbacks = [];
    }


    @Action
    refresh<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], params?: object) {
        return this.getAspectProxy().operate({
            entity: entity as any, 
            operation: assign({}, selection, { action: 'select' }) as DeduceSelection<ED[T]['Schema']>,
            params,
        }) as OperationResult;
    }

    @Action
    async sync(records: OpRecord<ED>[]) {
        const context = this.createContext(this.cacheStore);
        try {
            await this.cacheStore.sync(records, context);
        }
        catch (err) {
            await context.rollback();
            throw err;
        }
        await context.commit();

        // 唤起同步注册的回调
        const result = this.syncEventsCallbacks.map(
            ele => ele(records)
        );
        await Promise.all(result);
    }

    @Action
    async operate<T extends keyof ED>(entity: T, operation: ED[T]['Operation'], commit: boolean = true, params?: OperateParams) {
        const context = this.createContext(this.cacheStore);
        let result: Awaited<ReturnType<typeof this.cacheStore.operate>>;
        try {
            result = await this.cacheStore.operate(entity, operation, context, params);
            if (commit) {
                await context.commit();
            }
            else {
                await context.rollback();
            }
        }
        catch(err) {
            await context.rollback();
            throw err;
        }
        return result;        
    }


    async get<T extends keyof ED>(options: { entity: T, selection: ED[T]['Selection'], params?: object }) {
        const { entity, selection, params } = options;
        const context = this.createContext(this.cacheStore);        
        const { result } = await this.cacheStore.select(entity, selection, context, params);
        return result;
    }

    judgeRelation(entity: keyof ED, attr: string) {
        return this.cacheStore.judgeRelation(entity, attr);
    }

    
    bindOnSync(callback: (opRecords: OpRecord<ED>[]) => Promise<void>) {        
        this.syncEventsCallbacks.push(callback);
    }

    
    unbindOnSync(callback: (opRecords: OpRecord<ED>[]) => Promise<void>) {
        pull(this.syncEventsCallbacks, callback);
    }
}
