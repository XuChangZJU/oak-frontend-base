import { EntityDict, OpRecord } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Feature } from '../types/Feature';

export class Cache<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>> extends Feature<ED, AD> {
    async get<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], params?: object) {
        const { result } = await this.getContext().rowStore.select(entity, selection, this.getContext(), params);
        return result;
    }

    protected async refresh<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], params?: object) {
        this.getAspectProxy().select({ entity: entity as any, selection, params });
    }

    protected async sync(opRecords: OpRecord<ED>[]) {
        await this.getContext().rowStore.sync(opRecords, this.getContext());
    }
}

export type Action<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>> = {
    refresh: Cache<ED, AD>['refresh'],
    sync: Cache<ED, AD>['sync'],
};