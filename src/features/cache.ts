import { DeduceSelection, EntityDict, OperateParams, OpRecord } from 'oak-domain/lib/types/Entity';
import { Aspect } from 'oak-general-business/lib/types/Aspect';
import { Action, Feature } from '../types/Feature';
import { assign } from 'lodash';
import { FrontContext } from '../FrontContext';
import { CacheStore } from '../cacheStore/CacheStore';

export class Cache<ED extends EntityDict, AD extends Record<string, Aspect<ED>>> extends Feature<ED, AD> {
    cacheStore: CacheStore<ED>;

    constructor(cacheStore: CacheStore<ED>) {
        super();
        this.cacheStore = cacheStore;
    }

    @Action
    refresh<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], params?: object) {
        return this.getAspectProxy().operate({
            entity: entity as any, 
            operation: assign({}, selection, { action: 'select' }) as DeduceSelection<ED[T]['Schema']>,
            params,
        });
    }

    @Action
    async sync(records: OpRecord<ED>[]) {
        const context = new FrontContext(this.cacheStore);
        try {
            await this.cacheStore.sync(records, context);
        }
        catch (err) {
            await context.rollback();
            throw err;
        }
        await context.commit();
    }

    @Action
    async operate<T extends keyof ED>(entity: T, operation: ED[T]['Operation'], params?: OperateParams) {
        const context = new FrontContext(this.cacheStore);
        let result: Awaited<ReturnType<typeof this.cacheStore.operate>>;
        try {
            result = await this.cacheStore.operate(entity, operation, context, params);
            await context.commit();
        }
        catch(err) {
            await context.rollback();
            throw err;
        }
        return result;        
    }

    async get<T extends keyof ED>(options: { entity: T, selection: ED[T]['Selection'], params?: object }) {
        const { entity, selection, params } = options;
        const context = new FrontContext(this.cacheStore);        
        const { result } = await this.cacheStore.select(entity, selection, context, params);
        return result;
    }

    judgeRelation(entity: keyof ED, attr: string) {
        return this.cacheStore.judgeRelation(entity, attr);
    }
}
