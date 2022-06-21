import { StorageSchema, EntityDict, OperateParams, OpRecord, Aspect, Checker, RowStore, Context, AspectWrapper } from 'oak-domain/lib/types';
import { AspectDict } from 'oak-common-aspect/src/aspectDict';
import { Action, Feature } from '../types/Feature';
import { assign, pull } from 'lodash';
import { CacheStore } from '../cacheStore/CacheStore';

export class Cache<ED extends EntityDict, Cxt extends Context<ED>, AD extends AspectDict<ED, Cxt>> extends Feature<ED, Cxt, AD> {
    cacheStore: CacheStore<ED, Cxt>;
    context: Cxt;
    private syncEventsCallbacks: Array<(opRecords: OpRecord<ED>[]) => Promise<void>>;

    constructor(aspectWrapper: AspectWrapper<ED, Cxt, AD>, context: Cxt, cacheStore: CacheStore<ED, Cxt>) {
        super(aspectWrapper);
        this.cacheStore = cacheStore;
        this.context = context;
        this.syncEventsCallbacks = [];

        // 在这里把wrapper的返回opRecords截取到并同步到cache中
        const { exec } = aspectWrapper;
        aspectWrapper.exec = async <T extends keyof AD>(name: T, params: any) => {
            const { result, opRecords } = await exec(name, params);
            this.sync(opRecords);
            return {
                result,
                opRecords,
            };
        };
    }


    @Action
    async refresh<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], params?: object) {
        const { result } = await this.getAspectWrapper().exec('select', {
            entity, 
            selection,
            params,
        });
        return result;
    }

    private async sync(records: OpRecord<ED>[]) {
        await this.context.begin();
        try {
            await this.cacheStore.sync(records, this.context);
        }
        catch (err) {
            await this.context.rollback();
            throw err;
        }
        await this.context.commit();

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
    async operate<T extends keyof ED>(entity: T, operation: ED[T]['Operation'], params?: OperateParams) {
        let result: Awaited<ReturnType<typeof this.cacheStore.operate>>;
        await this.context.begin();
        try {
            result = await this.cacheStore.operate(entity, operation, this.context, params);
            
            await this.context.rollback();
        }
        catch(err) {
            await this.context.rollback();
            throw err;
        }
        return result;        
    }


    async get<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], params?: object) {                
        const { result } = await this.cacheStore.select(entity, selection, this.context, params);
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
