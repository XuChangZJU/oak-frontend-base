import { EntityDict, OpRecord } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Feature } from '../types/Feature';

export class Cache<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>> extends Feature<ED, AD> {
    async get<T extends keyof ED>(params: { entity: T, selection: ED[T]['Selection'] }) {
        const { result } = await this.context.rowStore.select(params.entity, params.selection, this.context);
        return result;
    }

    protected async refresh<T extends keyof ED>(entity: T, selection: ED[T]['Selection'], params?: object) {
        this.aspectProxy.select({ entity: entity as any, selection, params });
        // this.notify();
    }

    protected async sync(opRecords: OpRecord<ED>[]) {
        await this.context.rowStore.sync(opRecords, this.context);
        // this.notify();
    }
}

export type Action<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>> = {
    refresh: Cache<ED, AD>['refresh'],
    sync: Cache<ED, AD>['sync'],
};