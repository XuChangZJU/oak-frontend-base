import { StorageSchema, DeduceSelection, EntityDict, OperateParams, OpRecord, Aspect, Checker, RowStore, Context, OperationResult, Trigger, SelectOpResult, UpdateOpResult } from 'oak-domain/lib/types';
import { Action, Feature } from '../types/Feature';
import { assign, pull, uniq } from 'lodash';
import { CacheStore } from '../cacheStore/CacheStore';

export class Cache<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>> extends Feature<ED, Cxt, AD> {
    cacheStore: CacheStore<ED, Cxt>;
    createContext: (store: RowStore<ED, Cxt>, scene: string) => Cxt;
    private syncEventsCallbacks: Array<(opRecords: OpRecord<ED>[]) => Promise<void>>;

    constructor(storageSchema: StorageSchema<ED>, createContext: (store: RowStore<ED, Cxt>, scene: string) => Cxt, checkers?: Array<Checker<ED, keyof ED, Cxt>>) {
        const cacheStore = new CacheStore(storageSchema, (scene) => createContext(this.cacheStore, scene));
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
    refresh<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], scene: string, params?: object) {
        return this.getAspectProxy().select({
            entity: entity as string, 
            selection,
            params,
        }, scene);
    }

    @Action
    async sync(records: OpRecord<ED>[]) {
        const context = this.createContext(this.cacheStore, 'sync');
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

    /**
     * 前端缓存做operation只可能是测试权限，必然回滚
     * @param entity 
     * @param operation 
     * @param scene 
     * @param commit 
     * @param params 
     * @returns 
     */
    async operate<T extends keyof ED>(entity: T, operation: ED[T]['Operation'], scene: string, params?: OperateParams) {
        const context = this.createContext(this.cacheStore, scene);
        let result: Awaited<ReturnType<typeof this.cacheStore.operate>>;
        await context.begin();
        try {
            result = await this.cacheStore.operate(entity, operation, context, params);
            
            await context.rollback();
        }
        catch(err) {
            await context.rollback();
            throw err;
        }
        return result;        
    }


    async get<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], scene: string, params?: object) {        
        const context = this.createContext(this.cacheStore, scene);
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

    registerCheckers(checkers: Array<Checker<ED, keyof ED, Cxt>>) {
        checkers.forEach(
            (checker) => this.cacheStore.registerChecker(checker)
        );
    }
}
