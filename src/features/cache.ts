import { DeduceSelection, EntityDict, OperateParams, OpRecord } from 'oak-domain/lib/types/Entity';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Action, Feature } from '../types/Feature';
import { assign } from 'lodash';
import { judgeRelation } from 'oak-domain/lib/schema/relation';

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

    /* action<T extends keyof ED>(action: RefreshAction<ED, T> | SyncAction<ED> | OperateAction<ED, T>) {
        const { type, payload } = action;
        const context = this.getContext();
        
        if (type === 'refresh') {
            const { entity, selection, params } = payload as RefreshAction<ED, T>['payload'];
            return this.getAspectProxy().operate({
                entity: entity as any, 
                operation: assign({}, selection, { action: 'select' }) as DeduceSelection<ED[T]['Schema']>,
                params,
            });
        }
        else if (type === 'sync') {
            return context.rowStore.sync(payload as SyncAction<ED>['payload'], context);
        }
        const { entity, operation, params } = payload as OperateAction<ED, T>['payload'];
        return context.rowStore.operate(entity, operation, context, params);
    } */
    async get<T extends keyof ED>(options: { entity: T, selection: ED[T]['Selection'], params?: object }) {
        const { entity, selection, params } = options;
        const context = this.getContext();
        const { result } = await context.rowStore.select(entity, selection, context, params);
        return result;
    }
}
