import { DeduceFilter, DeduceUpdateOperation, EntityDict, EntityShape, FormCreateData, OperationResult, OpRecord, SelectionResult } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { combineFilters } from 'oak-domain/lib/schema/filter';
import { Feature } from '../types/Feature';
import { Cache } from './cache';
import { v4 } from 'uuid';
import assert from 'assert';
import { FrontContext } from '../FrontContext';
import { assign } from 'lodash';
import { judgeRelation } from 'oak-domain/lib/schema/relation';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Pagination } from '../types/Pagination';

export class Node<ED extends EntityDict, AD extends Record<string, Aspect<ED>>, T extends keyof ED> {
    protected entity: T;
    protected fullPath: string;
    protected value: Partial<ED[T]['OpSchema']>;
    protected schema: StorageSchema<ED>;
    protected projection?: ED[T]['Selection']['data'];      // 只在Page层有
    protected parent?: Node<ED, AD, keyof ED>;
    protected updateData?: DeduceUpdateOperation<ED[T]['OpSchema']>;

    constructor(entity: T, fullPath: string, schema: StorageSchema<ED>, projection?: ED[T]['Selection']['data'], parent?: Node<ED, AD, keyof ED>) {
        this.entity = entity;
        this.fullPath = fullPath;
        this.schema = schema;
        this.projection = projection;
        this.parent = parent;
        this.value = {};
    }

    getSubEntity(path: string): {
        entity: keyof ED;
        isList: boolean;
    } {
        const relation = judgeRelation(this.schema, this.entity, path);
        if (relation === 2) {
            return {
                entity: path,
                isList: false,
            };
        }
        else if (typeof relation === 'string') {
            return {
                entity: relation,
                isList: false,
            };
        }
        else {
            assert (relation instanceof Array);
            return {
                entity: relation[0],
                isList: true,
            };
        }
    }
}

const DEFAULT_PAGINATION: Pagination = {
    step: 20,
    append: true,
    indexFrom: 0,
    more: true,
}

class ListNode<ED extends EntityDict, AD extends Record<string, Aspect<ED>>, T extends keyof ED> extends Node<ED, AD, T>{
    private ids: string[];
    protected children: SingleNode<ED, AD, T>[];

    private filters: DeduceFilter<ED[T]['Schema']>[];
    private sorter?: ED[T]['Selection']['sorter'];
    private pagination: Pagination;

    constructor(entity: T, fullPath: string, schema: StorageSchema<ED>, projection?: ED[T]['Selection']['data'],
        parent?: Node<ED, AD, keyof ED>, pagination?: Pagination, filters?: DeduceFilter<ED[T]['Schema']>[], sorter?: ED[T]['Selection']['sorter']) {
        super(entity, fullPath, schema, projection, parent);
        this.ids = [];
        this.children = [];
        this.filters = filters || [];
        this.sorter = sorter || [];
        this.pagination = pagination || DEFAULT_PAGINATION;
    }

    getSelectionParams() {
        assert(this.projection);
        const filter = this.filters.length ? combineFilters(this.filters) : undefined;
        return {
            entity: this.entity,
            selection: {
                data: this.projection,
                filter,
                sorter: this.sorter,
            }
        };
    }

    addChild(path: number, node: SingleNode<ED, AD, T>) {
        const { children } = this;
        children[path] = node;
    }

    getChild(path: number) {
        return this.children[path];
    }

    async refresh(cache: Cache<ED, AD>) {
        const { filters, sorter, pagination, entity, projection } = this;
        assert(projection);
        const { step } = pagination;
        const { ids } = await cache.refresh(entity, {
            data: projection as any,
            filter: combineFilters(filters),
            sorter,
            indexFrom: 0,
            count: step,
        });
        assert(ids);
        this.ids = ids;
        this.pagination.indexFrom = 0;
        this.pagination.more = ids.length === step;
    }

    async getData(cache: Cache<ED, AD>) {
        const { entity, ids, projection } = this;

        if (ids) {
            const filter: Partial<AttrFilter<ED[T]['Schema']>> = {
                id: {
                    $in: ids,
                },
            } as any;       // 这里也没搞懂，用EntityShape能过，ED[T]['Schema']就不过
            return cache.get({
                entity,
                selection: {
                    data: projection as any,
                    filter,
                }
            });
        }
        return [];
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
    private children: {
        [K in keyof ED[T]['Schema']]?: SingleNode<ED, AD, keyof ED> | ListNode<ED, AD, keyof ED>;
    };

    constructor(entity: T, fullPath: string, schema: StorageSchema<ED>, projection?: ED[T]['Selection']['data'], parent?: Node<ED, AD, keyof ED>, id?: string) {
        super(entity, fullPath, schema, projection, parent);
        this.id = id;
        this.children = {};
    }

    async refresh(cache: Cache<ED, AD>) {
        assert(this.projection);
        await cache.refresh(this.entity, {
            data: this.projection,
            filter: {
                id: this.id,
            },
        } as any);
    }

    addChild(path: string, node: Node<ED, AD, keyof ED>) {
        const { children } = this;
        assign(children, {
            [path]: node,
        });
    }

    getChild(path: keyof ED[T]['Schema']) {
        return this.children[path]!;
    }

    async getData(cache: Cache<ED, AD>) {
        const { entity, id, projection } = this;
        assert(id);
        const filter: Partial<AttrFilter<ED[T]["Schema"]>> = {
            id,
        } as any;
        return await cache.get({
            entity,
            selection: {
                data: projection as any,
                filter,
            }
        });
    }
}


export class RunningNode<ED extends EntityDict, AD extends Record<string, Aspect<ED>>> extends Feature<ED, AD> {
    private cache: Cache<ED, AD>;
    private schema?: StorageSchema<ED>;
    private root: Record<string, SingleNode<ED, AD, keyof ED> | ListNode<ED, AD, keyof ED>>;

    constructor(cache: Cache<ED, AD>) {
        super();
        this.cache = cache;
        this.root = {};
    }

    async createNode<T extends keyof ED, L extends boolean>(path: string, parent?: string, entity?: T, isList?: L, projection?: ED[T]['Selection']['data'],
        id?: string, pagination?: Pagination, filters?: DeduceFilter<ED[T]['Schema']>[], sorter?: ED[T]['Selection']['sorter']) {
        let node: ListNode<ED, AD, T> | SingleNode<ED, AD, T>;
        const parentNode = parent ? this.findNode(parent) : undefined;
        const fullPath = parent ? `${parent}.${path}` : `${path}`;
        const subEntity = parentNode && parentNode.getSubEntity(path);
        const entity2 = subEntity ? subEntity.entity : entity!;
        const isList2 = subEntity ? subEntity.isList : isList!;

        const context = this.getContext();
        if (isList2) {
            node = new ListNode<ED, AD, T>(entity2 as T, fullPath, this.schema!, projection, parentNode, pagination, filters, sorter);
        }
        else {
            let id2: string = id || v4({ random: await getRandomValues(16) });
            if (!id) {
                // 如果!isList并且没有id，说明是create，在这里先插入cache
                await context.rowStore.operate(entity2, {
                    action: 'create',
                    data: {
                        id: id2,
                    } as FormCreateData<ED[T]['OpSchema']>,
                }, context);
            }
            node = new SingleNode<ED, AD, T>(entity2 as T, fullPath, this.schema!, projection, parentNode, id2);
        }
        if (parentNode) {
            if (parentNode instanceof ListNode) {
                assert(typeof path === 'number');
                parentNode.addChild(path, <SingleNode<ED, AD, T>>node);
            }
            else {
                assert(typeof path === 'string');
                parentNode.addChild(path, node);
            }
        }
        else {
            this.root[path] = node;
        }
    }

    async refresh(path: string) {
        const node = this.findNode(path);
        await node.refresh(this.cache);
    }

    async get(path: string) {
        const node = this.findNode(path);
        return await node.getData(this.cache);
    }

    private findNode(path: string) {
        const paths = path.split('.');
        let node = this.root[paths[0]];
        let iter = 1;
        while (iter < paths.length) {
            const childPath = path[iter];
            if (node instanceof ListNode) {
                const childPathIdx = parseInt(childPath, 10);
                node = node.getChild(childPathIdx);
            }
            else {
                node = node.getChild(childPath);
            }
        }
        return node;
    }

    setStorageSchema(schema: StorageSchema<ED>) {
        this.schema = schema;
    }
}

