import { set, cloneDeep, pull, unset } from 'lodash';
import { DeduceCreateOperation, DeduceFilter, DeduceOperation, DeduceSelection, DeduceUpdateOperation, EntityDict, EntityShape, FormCreateData, OperationResult, OpRecord, SelectionResult } from 'oak-domain/lib/types/Entity';
import { Aspect } from 'oak-general-business';
import { combineFilters } from 'oak-domain/lib/store/filter';
import { Action, Feature } from '../types/Feature';
import { Cache } from './cache';
import { v4 } from 'uuid';
import assert from 'assert';
import { assign } from 'lodash';
import { judgeRelation } from 'oak-domain/lib/store/relation';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Pagination } from '../types/Pagination';

export class Node<ED extends EntityDict, AD extends Record<string, Aspect<ED>>, T extends keyof ED> {
    protected entity: T;
    protected fullPath: string;
    protected schema: StorageSchema<ED>;
    protected projection?: ED[T]['Selection']['data'];      // 只在Page层有
    protected parent?: Node<ED, AD, keyof ED>;
    protected action?: ED[T]['Action'];
    protected dirty?: boolean;
    protected updateData?: DeduceUpdateOperation<ED[T]['OpSchema']>['data'];

    constructor(entity: T, fullPath: string, schema: StorageSchema<ED>, projection?: ED[T]['Selection']['data'],
        parent?: Node<ED, AD, keyof ED>, action?: ED[T]['Action']) {
        this.entity = entity;
        this.fullPath = fullPath;
        this.schema = schema;
        this.projection = projection;
        this.parent = parent;
        this.action = action;
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
            assert(relation instanceof Array);
            return {
                entity: relation[0],
                isList: true,
            };
        }
    }

    getEntity() {
        return this.entity;
    }

    setUpdateData(attr: string, value: any) {
        if (!this.updateData) {
            this.updateData = {};
        }
        this.setDirty();
        set(this.updateData!, attr, value);
    }

    setDirty() {
        if (!this.dirty) {
            this.dirty = true;
        }
    }

    isDirty() {
        return this.dirty;
    }

    getParent() {
        return this.parent;
    }

    getProjection() {
        return this.projection!;
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
    protected value: Partial<ED[T]['Schema']>[];

    private filters: DeduceFilter<ED[T]['Schema']>[];
    private sorter?: ED[T]['Selection']['sorter'];
    private pagination: Pagination;

    constructor(entity: T, fullPath: string, schema: StorageSchema<ED>, projection?: ED[T]['Selection']['data'],
        parent?: Node<ED, AD, keyof ED>, pagination?: Pagination, filters?: DeduceFilter<ED[T]['Schema']>[],
        sorter?: ED[T]['Selection']['sorter'], action?: ED[T]['Action']) {
        super(entity, fullPath, schema, projection, parent, action);
        this.ids = [];
        this.value = [];
        this.children = [];
        this.filters = filters || [];
        this.sorter = sorter || [];
        this.pagination = pagination || DEFAULT_PAGINATION;
    }

    composeOperation(): DeduceOperation<ED[T]['Schema']> | DeduceOperation<ED[T]['Schema']>[] | undefined {
        if (!this.isDirty()) {
            return;
        }
        if (this.action || this.updateData) {
            return {
                action: this.action || 'update',
                data: cloneDeep(this.updateData),
                filter: combineFilters(this.filters),
            } as DeduceUpdateOperation<ED[T]['Schema']>;  // todo 这里以后再增加对选中id的过滤
        }
        const actions = [];
        for (const node of this.children) {
            const subAction = node.composeOperation();
            if (subAction) {
                actions.push(subAction);
            }
        }
        return actions;
    }

    addChild(path: string, node: SingleNode<ED, AD, T>) {
        const { children } = this;
        const idx = parseInt(path, 10);
        assert(!children[idx]);
        children[idx] = node;
    }

    removeChild(path: string) {
        const { children } = this;
        const idx = parseInt(path, 10);
        assert(children[idx]);
        unset(children, idx);
    }

    async getChild(path: string, create?: boolean, cache?: Cache<ED, AD>) {
        const idx = parseInt(path, 10);
        let node = this.children[idx];
        if (create && !node) {
            node = new SingleNode(this.entity, `${this.fullPath}.${idx}`, this.schema, undefined, this, this.ids[idx]);
            node.setValue(this.value[idx]);
            this.addChild(path, node);
        }
        return node;
    }

    getFilter() {
        return combineFilters(this.filters);
    }

    setFilters(filters: DeduceFilter<ED[T]['Schema']>[]) {
        this.filters = filters;
    }

    async refresh(cache: Cache<ED, AD>) {
        const { filters, sorter, pagination, entity, projection } = this;
        assert(projection);
        const { step } = pagination;
        const { ids } = await cache.refresh(entity, {
            data: projection as any,
            filter: filters.length > 0 ? combineFilters(filters) : undefined,
            sorter,
            indexFrom: 0,
            count: step,
        });
        assert(ids);
        this.ids = ids;
        this.pagination.indexFrom = 0;
        this.pagination.more = ids.length === step;
    }

    updateChildrenValue() {
        this.children.forEach(
            (ele, idx) => ele.setValue(this.value[idx])
        );
    }

    async getValue(cache: Cache<ED, AD>) {
        const { entity, ids, projection } = this;

        if (ids.length) {
            const filter: Partial<AttrFilter<ED[T]['Schema']>> = {
                id: {
                    $in: ids,
                },
            } as any;       // 这里也没搞懂，用EntityShape能过，ED[T]['Schema']就不过
            const rows = await cache.get({
                entity,
                selection: {
                    data: projection as any,
                    filter,
                }
            });
            this.value = ids.map(
                id => rows.find(ele => ele.id === id)!
            );
        }
        else {
            this.value = [];
        }

        this.updateChildrenValue();

        return this.value;
    }

    setValue(value: Partial<ED[T]['Schema']>[]) {
        this.value = value;
        this.updateChildrenValue();
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
    private value?: Partial<ED[T]['Schema']>;
    private children: {
        [K in keyof ED[T]['Schema']]?: SingleNode<ED, AD, keyof ED> | ListNode<ED, AD, keyof ED>;
    };

    constructor(entity: T, fullPath: string, schema: StorageSchema<ED>, projection?: ED[T]['Selection']['data'],
        parent?: Node<ED, AD, keyof ED>, id?: string, action?: ED[T]['Action']) {
        super(entity, fullPath, schema, projection, parent, action);
        this.id = id;
        this.children = {};
    }

    async refresh(cache: Cache<ED, AD>) {
        assert(this.projection);
        if (this.action !== 'create') {
            await cache.refresh(this.entity, {
                data: this.projection,
                filter: {
                    id: this.id,
                },
            } as any);
        }
    }

    composeOperation(): DeduceOperation<ED[T]['Schema']> | undefined {
        if (!this.isDirty()) {
            return;
        }
        const action = this.action === 'create' ? {
            action: 'create',
            data: cloneDeep(this.updateData) || {},
        } as DeduceCreateOperation<ED[T]['Schema']> : {
            action: this.action || 'update',
            data: cloneDeep(this.updateData) || {},
            filter: {
                id: this.id!,
            },
        } as DeduceUpdateOperation<ED[T]['Schema']>;
        for (const attr in this.children) {
            const subAction = this.children[attr]!.composeOperation();
            if (subAction) {
                assign(action.data, {
                    [attr]: subAction,
                });
            }
        }
        return action;
    }

    addChild(path: string, node: Node<ED, AD, keyof ED>) {
        const { children } = this;
        assert(!children[path]);
        assign(children, {
            [path]: node,
        });
    }

    removeChild(path: string) {
        const { children } = this;
        assert(children[path]);
        unset(children, path);
    }

    async getChild(path: keyof ED[T]['Schema'], create?: boolean, cache?: Cache<ED, AD>) {
        let node = this.children[path];
        if (create && !node) {
            assert(cache);
            const relation = judgeRelation(this.schema, this.entity, path as any);
            if (relation === 2) {
                // 基于entityId的多对一
                if (this.value && this.value.entityId) {
                    node = new SingleNode(path as any, `${this.fullPath}.${path}`, this.schema, undefined, this, this.value.entityId);
                }
                else {
                    // 新建对象并关联
                    assert(!this.value || this.value.entity);
                    const id = v4({ random: await getRandomValues(16) });
                    /*  await cache.operate(this.entity, {
                         action: 'update',
                         data: {
                             entity: path as any,
                             [path]: {
                                 action: 'create',
                                 data: {
                                     id,
                                 },
                             },
                         },
                         filter: {
                             id: this.id!,
                         }
                     } as any); */
                    node = new SingleNode(path as any, `${this.fullPath}.${path}`, this.schema, undefined, this, id, 'create');
                }
            }
            else if (typeof relation === 'string') {
                if (this.value && this.value[`${path}Id`]) {
                    node = new SingleNode(relation as any, `${this.fullPath}.${path}`, this.schema, undefined, this, this.value![`${path}Id`]);
                }
                else {
                    // 新建对象并关联
                    assert(!this.value || !this.value.entity);
                    const id = v4({ random: await getRandomValues(16) });
                    /* await cache.operate(this.entity, {
                        action: 'update',
                        data: {
                            [path]: {
                                action: 'create',
                                data: {
                                    id,
                                },
                            },
                        },
                        filter: {
                            id: this.id!,
                        }
                    } as any); */
                    node = new SingleNode(path as any, `${this.fullPath}.${path}`, this.schema, undefined, this, id, 'create');
                }
            }
            else {
                assert(relation instanceof Array);
                node = new ListNode(relation[0] as any, `${this.fullPath}.${path}`, this.schema, undefined, this);
            }
            node.setValue(this.value && this.value[path] as any);
            this.addChild(path as string, node);
        }

        return node;
    }

    getFilter() {
        return {
            id: this.id,
        } as DeduceFilter<ED[T]['Schema']>;
    }

    updateChildrenValues() {
        for (const attr in this.children) {
            const value = this.value![attr];
            this.children[attr]?.setValue(value!);
        }
    }

    async getValue(cache: Cache<ED, AD>) {
        const { entity, id, projection } = this;
        assert(projection);
        if (id) {
            const filter: Partial<AttrFilter<ED[T]["Schema"]>> = {
                id,
            } as any;
            const value = await cache.get({
                entity,
                selection: {
                    data: projection as any,
                    filter,
                }
            });
            this.value = value[0];
            this.updateChildrenValues();
        }
        return this.value;
    }

    setValue(value: Partial<ED[T]['Schema']>) {
        this.value = value;
        this.updateChildrenValues();
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

    async createNode<T extends keyof ED>(path: string, parent?: string,
        entity?: T, isList?: boolean, isPicker?: boolean, projection?: ED[T]['Selection']['data'], id?: string,
        pagination?: Pagination, filters?: DeduceFilter<ED[T]['Schema']>[],
        sorter?: ED[T]['Selection']['sorter']) {
        let node: ListNode<ED, AD, T> | SingleNode<ED, AD, T>;
        const parentNode = parent ? await this.findNode(parent) : undefined;
        const fullPath = parent ? `${parent}.${path}` : `${path}`;
        const subEntity = parentNode && parentNode.getSubEntity(path);
        const entity2 = subEntity ? subEntity.entity : entity!;
        const isList2 = subEntity ? subEntity.isList : isList!;

        if (isPicker || isList2) {
            node = new ListNode<ED, AD, T>(entity2 as T, fullPath, this.schema!, projection, parentNode, pagination, filters, sorter);
        }
        else {
            /*  let id2: string = id || v4({ random: await getRandomValues(16) });
             if (!id) {
                 // 如果!isList并且没有id，说明是create，在这里先插入cache
                 await context.rowStore.operate(entity2, {
                     action: 'create',
                     data: {
                         id: id2,
                     } as FormCreateData<ED[T]['OpSchema']>,
                 }, context);
             } */
            node = new SingleNode<ED, AD, T>(entity2 as T, fullPath, this.schema!, projection, parentNode, id, !id ? 'create' : undefined);
        }
        if (parentNode) {
            parentNode.addChild(path, node as any);
        }
        else {
            this.root[path] = node;
        }

        return entity2;
    }

    async destroyNode(path: string) {
        const node = await this.findNode(path);
        if (node) {
            const childPath = path.slice(path.lastIndexOf('.') + 1);
            const parent = node.getParent();
            if (parent instanceof SingleNode) {
                parent.removeChild(childPath);
            }
            else if (parent instanceof ListNode) {
                parent.removeChild(childPath);
            }
            else if (!parent) {
                assert(childPath === path);
                unset(this.root, path);
            }
        }
    }

    setStorageSchema(schema: StorageSchema<ED>) {
        this.schema = schema;
    }

    private async applyOperation<T extends keyof ED>(
        entity: T, value: Partial<ED[T]['Schema']> | Partial<ED[T]['Schema']>[] | undefined,
        operation: DeduceOperation<ED[T]['Schema']> | DeduceOperation<ED[T]['Schema']>[],
        projection: DeduceSelection<ED[T]['Schema']>['data']): Promise<Partial<ED[T]['Schema']> | Partial<ED[T]['Schema']>[] | undefined> {
        if (operation instanceof Array) {
            assert(value instanceof Array);
            for (const action of operation) {
                switch (action.action) {
                    case 'create': {
                        value.push(await this.applyOperation(entity, undefined, action, projection) as Partial<ED[T]['Schema']>);
                    }
                    case 'remove': {
                        const { filter } = action;
                        assert(filter!.id);
                        const row = value.find(
                            ele => ele.id === filter!.id
                        );
                        pull(value, row);
                    }
                    default: {
                        const { filter } = action;
                        assert(filter!.id);
                        const row = value.find(
                            ele => ele.id === filter!.id
                        );
                        await this.applyOperation(entity, row!, action, projection);
                    }
                }
            }
            return value;
        }
        else {
            if (value instanceof Array) {
                // todo 这里还有种可能不是对所有的行，只对指定id的行操作
                return (await Promise.all(value.map(
                    async (row) => await this.applyOperation(entity, row, operation, projection)
                ))).filter(
                    ele => !!ele
                ) as Partial<ED[T]['Schema']>[];
            }
            else {
                const { action, data } = operation;
                const applyUpsert = async (row: Partial<ED[T]['Schema']>, actionData: DeduceUpdateOperation<ED[T]['Schema']>['data']) => {
                    for (const attr in actionData) {
                        const relation = judgeRelation(this.schema!, entity, attr);
                        if (relation === 1) {
                            set(row, attr, actionData[attr]);
                        }
                        else if (relation === 2) {
                            // 基于entity/entityId的多对一
                            if (projection[attr]) {
                                set(row, attr, await this.applyOperation(attr, row[attr], actionData[attr]!, projection[attr]!));
                                if (row[attr]) {
                                    assign(row, {
                                        entity: attr,
                                        entityId: row[attr]!['id'],
                                    });
                                }
                                else {
                                    assign(row, {
                                        entity: undefined,
                                        entityId: undefined,
                                    });
                                }
                            }
                        }
                        else if (typeof relation === 'string') {
                            if (projection[attr]) {
                                set(row, attr, await this.applyOperation(relation, row[attr], actionData[attr]!, projection[attr]!));
                                if (row[attr]) {
                                    assign(row, {
                                        [`${attr}Id`]: row[attr]!['id'],
                                    });
                                }
                                else {
                                    assign(row, {
                                        [`${attr}Id`]: undefined,
                                    });
                                }
                            }
                        }
                        else {
                            assert(relation instanceof Array);
                            if (projection[attr]) {
                                set(row, attr, await this.applyOperation(relation[0], row[attr], actionData[attr]!, projection[attr]!));
                                row[attr]!.forEach(
                                    (ele: ED[keyof ED]['Schema']) => {
                                        if (relation[1]) {
                                            assign(ele, {
                                                [relation[1]]: row.id,
                                            });
                                        }
                                        else {
                                            assign(ele, {
                                                entity,
                                                entityId: row.id,
                                            });
                                        }
                                    }
                                );
                            }
                        }
                    }

                    // 这里有一种额外的情况，actionData中更新了某项外键而projection中有相应的请求
                    for (const attr in projection) {
                        if (!actionData.hasOwnProperty(attr)) {
                            const relation = judgeRelation(this.schema!, entity, attr);
                            if (relation === 2 &&
                                (actionData.hasOwnProperty('entity') || actionData.hasOwnProperty('entityId'))) {
                                const entity = actionData.entity || row.entity!;
                                const entityId = actionData.entityId || row.entityId!;
                                const [entityRow] = await this.cache.get({
                                    entity,
                                    selection: {
                                        data: projection[attr]!,
                                        filter: {
                                            id: entityId,
                                        } as any,
                                    }
                                });
                                set(row, attr, entityRow);
                            }
                            else if (typeof relation === 'string' && actionData.hasOwnProperty(`${attr}Id`)) {
                                const [entityRow] = await this.cache.get({
                                    entity: relation,
                                    selection: {
                                        data: projection[attr]!,
                                        filter: {
                                            id: actionData[`${attr}Id`],
                                        } as any,
                                    }
                                });
                                set(row, attr, entityRow);
                            }
                        }
                    }
                }
                switch (action) {
                    case 'create': {
                        assert(!value);
                        const row = {
                            id: v4({ random: await getRandomValues(16) }),
                        } as Partial<ED[T]['Schema']>;
                        await applyUpsert(row, data as DeduceUpdateOperation<ED[T]['Schema']>['data']);
                        return row;
                    }
                    case 'remove': {
                        return undefined;
                    }
                    default: {
                        await applyUpsert(value!, data as DeduceUpdateOperation<ED[T]['Schema']>['data']);
                        return value;
                    }
                }
            }
        }
    }

    async get(path: string) {
        const node = await this.findNode(path);
        let value = await node.getValue(this.cache);
        if (node.isDirty()) {
            const operation = node.composeOperation();
            const projection = node.getProjection();
            value = (await this.applyOperation(node.getEntity(), value, operation!, projection as any));
        }

        if (value instanceof Array) {
            return value!;
        }
        return [value!];
    }

    async isDirty(path: string) {
        const node = await this.findNode(path);
        return node.isDirty();
    }

    private async findNode(path: string) {
        const paths = path.split('.');
        let node = this.root[paths[0]];
        let iter = 1;
        while (iter < paths.length) {
            const childPath = paths[iter];
            node = (await node.getChild(childPath))!;
            iter++;
        }
        return node;
    }

    protected async setUpdateDataInner(path: string, attr: string, value: any) {
        let node = await this.findNode(path);
        const attrSplit = attr.split('.');
        let idx = 0;
        for (const split of attrSplit) {
            const entity = node.getEntity();
            const relation = judgeRelation(this.schema!, entity, split);
            if (relation === 1) {
                // todo transform data format
                const attrName = attrSplit.slice(idx).join('.');
                node.setUpdateData(attrName, value);
                /* this.cache.operate(entity, {
                    action: 'update',
                    data: {
                        [attrName]: value,
                    } as any,
                    filter: node.getFilter(),
                }); */
                return;
            }
            else {
                node.setDirty();
                node = (await node.getChild(split, true, this.cache))!;
                idx++;
            }
        }
    }

    @Action
    async setUpdateData(path: string, attr: string, value: any) {
        await this.setUpdateDataInner(path, attr, value);
    }

    @Action
    async setMultipleData(path: string, data: [string, any][]) {
        for (const d of data) {
            await this.setUpdateDataInner(path, d[0], d[1]);
        }
    }

    @Action
    async refresh(path: string) {
        const node = await this.findNode(path);
        await node.refresh(this.cache);
    }

    @Action
    async setFilters<T extends keyof ED>(path: string, filters: DeduceFilter<ED[T]['Schema']>[], refresh: boolean = true) {
        const node = await this.findNode(path);
        if (node instanceof ListNode) {
            node.setFilters(filters);
            if (refresh) {
                await node.refresh(this.cache);
            }
        }
    }

    @Action
    async execute(path: string, isTry?: boolean) {
        const node = await this.findNode(path);
        const operation = node.composeOperation();
        // 先在cache中尝试能否执行，如果权限上否决了在这里就失败
        if (operation instanceof Array) {
            for (const oper of operation) {
                await this.cache.operate(node.getEntity(), oper, false);
            }
        }
        else if (operation) {
            await this.cache.operate(node.getEntity(), operation, false);
        }
        else {
            return;
        }

        if (isTry) {
            return;
        }

        console.log('exeucte to aspectProxy');
        // this.getAspectProxy().operate
    }
}

