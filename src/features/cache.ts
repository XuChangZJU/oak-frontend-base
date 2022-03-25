import { DeduceSelection, EntityDict, OpRecord } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Feature } from '../types/Feature';
import { assign } from 'lodash';

export class Cache<ED extends EntityDict, AD extends Record<string, Aspect<ED>>> extends Feature<ED, AD> {
    async get<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], params?: object) {
        const { result } = await this.getContext().rowStore.select(entity, selection, this.getContext(), params);
        return result;
    }

    async refresh<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], params?: object) {
        return this.getAspectProxy().operate({ entity: entity as any, operation: assign({}, selection, { action: 'select' }) as DeduceSelection<ED[T]['Schema']>, params });
    }

    async sync(opRecords: OpRecord<ED>[]) {
        await this.getContext().rowStore.sync(opRecords, this.getContext());
    }
}

export type Action<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>> = {
    refresh: Cache<ED, AD>['refresh'],
    sync: Cache<ED, AD>['sync'],
};