import { DeduceSelection, EntityDict, OpRecord } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Feature } from '../types/Feature';
import { assign } from 'lodash';
import { FrontContext } from '../FrontContext';

type RefreshAction<ED extends EntityDict, T extends keyof ED> = {
    type: 'refresh';
    payload: {
        entity: T, selection: ED[T]['Selection'];
        params?: object;
    };
};

type SyncAction<ED extends EntityDict> = {
    type: 'sync';
    payload: OpRecord<ED>[];
}

export class Cache<ED extends EntityDict, AD extends Record<string, Aspect<ED>>> extends Feature<ED, AD> {
    action<T extends keyof ED>(context: FrontContext<ED>, action: RefreshAction<ED, T> | SyncAction<ED>) {
        const { type, payload } = action;
        
        if (type === 'refresh') {
            const { entity, selection, params } = payload as RefreshAction<ED, T>['payload'];
            return this.getAspectProxy().operate({
                entity: entity as any, 
                operation: assign({}, selection, { action: 'select' }) as DeduceSelection<ED[T]['Schema']>,
                params,
            }, context);
        }
        return context.rowStore.sync(payload as SyncAction<ED>['payload'], context);
    }
    async get<T extends keyof ED>(context: FrontContext<ED>, options: { entity: T, selection: ED[T]['Selection'], params?: object }) {
        const { entity, selection, params } = options;
        const { result } = await context.rowStore.select(entity, selection, context, params);
        return result;
    }
}
