import { DeduceSelection, EntityDict, OperateParams, OpRecord } from 'oak-domain/lib/types/Entity';
import { Aspect } from 'oak-general-business/lib/types/Aspect';
import { Action, Feature } from '../types/Feature';
import { assign } from 'lodash';

export class Cache<ED extends EntityDict, AD extends Record<string, Aspect<ED>>> extends Feature<ED, AD> {
    @Action
    refresh<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], params?: object) {
        return this.getAspectProxy().operate({
            entity: entity as any, 
            operation: assign({}, selection, { action: 'select' }) as DeduceSelection<ED[T]['Schema']>,
            params,
        });
    }

    @Action
    sync(records: OpRecord<ED>[]) {
        const context = this.getContext();
        return context.rowStore.sync(records, context);
    }

    @Action
    operate<T extends keyof ED>(entity: T, operation: ED[T]['Operation'], params?: OperateParams) {
        const context = this.getContext();
        return context.rowStore.operate(entity, operation, context, params);
    }

    async get<T extends keyof ED>(options: { entity: T, selection: ED[T]['Selection'], params?: object }) {
        const { entity, selection, params } = options;
        const context = this.getContext();
        const { result } = await context.rowStore.select(entity, selection, context, params);
        return result;
    }
}
