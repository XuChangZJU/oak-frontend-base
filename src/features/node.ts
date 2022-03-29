import { DeduceFilter, DeduceUpdateOperation, EntityDict, EntityShape, OperationResult, OpRecord, SelectionResult } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { combineFilters } from 'oak-domain/lib/schema/filter';
import { Feature } from '../types/Feature';
import { Cache } from './cache';
import assert from 'assert';
import { FrontContext } from '../FrontContext';
import { assign } from 'lodash';

export class Node<ED extends EntityDict, AD extends Record<string, Aspect<ED>>, T extends keyof ED> {
    protected entity: T;
    protected projection?: ED[T]['Selection']['data'];      // 只在最外层有
    protected cache: Cache<ED, AD>;
    private parent?: Node<ED, AD, keyof ED>;
    protected updateData?: DeduceUpdateOperation<ED[T]['OpSchema']>;

    constructor(entity: T, cache: Cache<ED, AD>, projection?: ED[T]['Selection']['data'], parent?: Node<ED, AD, keyof ED>) {
        this.entity = entity;
        this.projection = projection;
        this.cache = cache;
        this.parent = parent;
    }

    doRefresh(context: FrontContext<ED>, filter?: ED[T]['Selection']['filter'], sorter?: ED[T]['Selection']['sorter'], indexFrom?: number, count?: number) {
        const { entity, projection } = this;
        return this.cache.action(context, {
            type: 'refresh',
            payload: {
                entity,
                selection: {
                    data: projection as any,
                    filter,
                    sorter,
                    indexFrom,
                    count,
                },
            },
        }) as OperationResult;
    }
}

class ListNode<ED extends EntityDict, AD extends Record<string, Aspect<ED>>, T extends keyof ED> extends Node<ED, AD, T>{
    private ids: string[];
    private children: Node<ED, AD, T>[];
    private append: boolean;

    private filters: DeduceFilter<ED[T]['Schema']>[];
    private sorter?: ED[T]['Selection']['sorter'];
    private indexFrom?: number;
    private count?: number;
    private hasMore?: boolean;
    private total?: number;

    constructor(entity: T, cache: Cache<ED, AD>, projection?: ED[T]['Selection']['data'],
        parent?: Node<ED, AD, keyof ED>, filters?: DeduceFilter<ED[T]['Schema']>[], sorter?: ED[T]['Selection']['sorter'], append?: boolean) {
        super(entity, cache, projection, parent);
        this.ids = [];
        this.children = [];
        this.append = append || false;      // todo 根据environment来自动决定
        this.filters = filters || [];
        this.sorter = sorter || [];
    }

    
    addChild(path: number, node: Node<ED, AD, T>) {
        const { children } = this;
        children[path] = node;
    }

    async refresh(context: FrontContext<ED>) {
        const { entity, projection, filters, sorter, count } = this;
        const { ids } = await super.doRefresh(context, combineFilters(filters), sorter, 0, count);
        assert(ids);
        this.ids = ids;
        this.indexFrom = 0;
        this.hasMore = ids.length === count;
    }
    
    async getData(context: FrontContext<ED>, projection: ED[T]['Selection']['data']) {
        const { entity, ids } = this;
        if (ids) {
            const filter: Partial<AttrFilter<ED[T]['Schema']>> = {
                id: {
                    $in: ids,
                },
            } as any;       // 这里也没搞懂，用EntityShape能过，ED[T]['Schema']就不过
            return this.cache.get(context, {
                entity,
                selection: {
                    data: projection as any,
                    filter,
                }
            });
        }
    }
    
    async nextPage() {

    }

    async prevPage() {

    }
}

declare type AttrFilter<SH extends EntityShape> = {
    [K in keyof SH]: any;
};

class SingleNode<ED extends EntityDict, AD extends Record<string, Aspect<ED>>, T extends keyof ED> extends Node<ED, AD, T>{
    private id?: string;
    private children: Partial<Record<keyof ED[T]['Schema'], Node<ED, AD, keyof ED>>>;

    constructor(entity: T, cache: Cache<ED, AD>, projection?: ED[T]['Selection']['data'], parent?: Node<ED, AD, keyof ED>, id?: string) {
        super(entity, cache, projection, parent);
        this.id = id;
        this.children = {};
    }

    async refresh(context: FrontContext<ED>) {
        const { entity, projection, id } = this;
        assert (id);
        await super.doRefresh(context, { id });
    }

    addChild(path: string, node: Node<ED, AD, keyof ED>) {
        const { children } = this;
        assign(children, {
            [path]: node,
        });
    }

    async getData(context: FrontContext<ED>, projection: ED[T]['Selection']['data']) {
        const { entity, id } = this;
        assert(id);
        const filter: Partial<AttrFilter<ED[T]["Schema"]>> = {
            id,            
        } as any;
        return (await this.cache.get(context, {
            entity,
            selection: {
                data: projection as any,
                filter,
            }
        }));
    }
}

type InitNodeAction<ED extends EntityDict, AD extends Record<string, Aspect<ED>>, T extends keyof ED> = {
    type: 'init',
    payload: {
        entity: T;
        isList: boolean;
        path?: string | number;
        parent?: Node<ED, AD, keyof ED>;
        id?: string;
        projection?: ED[T]['Selection']['data'];
        filters?: DeduceFilter<ED[T]['Schema']>[];
        sorter?: ED[T]['Selection']['sorter'];
        append?: boolean
    },
}


type GetData<ED extends EntityDict, AD extends Record<string, Aspect<ED>>, T extends keyof ED> = {
    type: 'data';
    payload: {
        node: Node<ED, AD, T>;
        projection: ED[T]['Selection']['data'];
    };
};

export class RunningNode<ED extends EntityDict, AD extends Record<string, Aspect<ED>>> extends Feature<ED, AD> {
    private cache: Cache<ED, AD>;

    constructor(cache: Cache<ED, AD>) {
        super();
        this.cache = cache;
    }


    async get<T extends keyof ED>(context: FrontContext<ED>, params: GetData<ED, AD, T>) {
        const { type, payload } = params;

        switch (type) {
            case 'data': {
                const { node, projection } = payload;
                if (node instanceof ListNode) {
                    return (<ListNode<ED, AD, T>>node).getData(context, projection);
                }
                else {
                    return (<SingleNode<ED, AD, T>>node).getData(context, projection);
                }
            }
        }
    }

    action<T extends keyof ED>(context: FrontContext<ED>, action: InitNodeAction<ED, AD, T>) {
        const { type, payload } = action;
        switch (type) {
            case 'init': {
                const { path, parent, entity, isList, id, projection, filters, sorter, append } = payload;
                const node = isList ? new ListNode<ED, AD, T>(entity, this.cache, projection, parent, filters, sorter, append):
                    new SingleNode<ED, AD, T>(entity, this.cache, projection, parent, id);
                if (parent) {
                    assert(path);
                    const { addChild } = node;
                    if (id) {
                        assert(typeof path === 'string');
                        (<SingleNode<ED, AD, T>>node).addChild(path, node);
                    }
                    else {
                        assert(typeof path === 'number');
                        (<ListNode<ED, AD, T>>node).addChild(path ,node);
                    }
                }
                return node;
            }
            default: {
                break;
            }
        }
        throw new Error('Method not implemented.');
    }    
}


