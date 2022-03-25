import { DeduceUpdateOperation, EntityDict, OpRecord } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { combineFilters } from 'oak-domain/lib/schema/filter';
import { Feature } from '../types/Feature';
import { Cache } from './cache';
import assert from 'assert';

export class Node<ED extends EntityDict, AD extends Record<string, Aspect<ED>>, T extends keyof ED> {
    protected entity: T;
    protected projection: ED[T]['Selection']['data'];
    protected cache: Cache<ED, AD>;
    private parent?: Node<ED, AD, keyof ED>;
    protected updateData?: DeduceUpdateOperation<ED[T]['OpSchema']>;

    constructor(entity: T, projection: ED[T]['Selection']['data'], cache: Cache<ED, AD>, parent?: Node<ED, AD, keyof ED>) {
        this.entity = entity;
        this.projection = projection;
        this.cache = cache;
        this.parent = parent;
    }

    
}

class ListNode<ED extends EntityDict, AD extends Record<string, Aspect<ED>>, T extends keyof ED> extends Node<ED, AD, T>{
    private ids: string[];
    private children: Node<ED, AD, T>[];
    private append: boolean;

    private filters?: ED[T]['Selection']['filter'][];
    private sorter?: ED[T]['Selection']['sorter'];
    private indexFrom?: number;
    private count?: number;
    private hasMore?: boolean;
    private total?: number;

    constructor(entity: T, projection: ED[T]['Selection']['data'], cache: Cache<ED, AD>, parent?: Node<ED, AD, keyof ED>, append?: boolean) {
        super(entity, projection, cache, parent);
        this.ids = [];
        this.children = [];
        this.append = append || false;      // todo 根据environment来自动决定
    }

    async refresh() {
        const { entity, projection, filters, sorter, count } = this;
        const { ids } = await this.cache.refresh(entity, {
            data: projection as any,
            filter: filters && combineFilters(filters as any),
            sorter,
            indexFrom: count && 0,
            count,
        });
        assert(ids);
        this.ids = ids;
        this.indexFrom = 0;
        this.hasMore = ids.length === count;
    }
    
    async nextPage() {

    }

    async prevPage() {

    }
}


class SingleNode<ED extends EntityDict, AD extends Record<string, Aspect<ED>>, T extends keyof ED> extends Node<ED, AD, T>{
    private id?: string;
    private children: Partial<Record<keyof ED[T]['Schema'], Node<ED, AD, keyof ED>>>;

    constructor(entity: T, projection: ED[T]['Selection']['data'], cache: Cache<ED, AD>, parent?: Node<ED, AD, keyof ED>, id?: string) {
        super(entity, projection, cache, parent);
        this.id = id;
        this.children = {};
    }

    async refresh() {
        const { entity, projection, id } = this;
        assert (id);
        await this.cache.refresh<T>(entity, {
            data: projection,
            filter: {
                id,
            },
        } as ED[T]['Selection']);       // 搞不懂为何这里过不去
    }

    async get() {
        const { entity, projection, id } = this;
        const row = id && this.cache.get<T>(entity, {
            data: projection,
            filter: {
                id,
            },
        } as ED[T]['Selection']);
    }
}

