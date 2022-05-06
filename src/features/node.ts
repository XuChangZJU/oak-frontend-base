import { set, cloneDeep, pull, unset } from 'lodash';
import { AttrFilter, CreateOpResult, DeduceCreateOperation, DeduceFilter, DeduceOperation, DeduceSelection, DeduceUpdateOperation, EntityDict, EntityShape, OpRecord, SelectOpResult, SelectRowShape, UpdateOpResult } from 'oak-domain/lib/types/Entity';
import { Aspect, Context, Trigger } from 'oak-domain/lib/types';
import { combineFilters } from 'oak-domain/lib/store/filter';
import { Action, Feature } from '../types/Feature';
import { Cache } from './cache';
import { v4 } from 'uuid';
import assert from 'assert';
import { assign } from 'lodash';
import { judgeRelation } from 'oak-domain/lib/store/relation';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Pagination } from '../types/Pagination';

export class Node<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>> {
    protected entity: T;
    protected fullPath: string;
    protected schema: StorageSchema<ED>;
    protected projection?: ED[T]['Selection']['data'];      // 只在Page层有
    protected parent?: Node<ED, keyof ED, Cxt, AD>;
    protected action?: ED[T]['Action'];
    protected dirty: boolean;
    protected updateData?: DeduceUpdateOperation<ED[T]['OpSchema']>['data'];
    protected cache: Cache<ED, Cxt, AD>;
    protected needReGetValue: boolean;
    protected refreshing: boolean;
    private refreshFn?: (opRecords: OpRecord<ED>[]) => Promise<void>;

    constructor(entity: T, fullPath: string, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, AD>, projection?: ED[T]['Selection']['data'],
        parent?: Node<ED, keyof ED, Cxt, AD>, action?: ED[T]['Action']) {
        this.entity = entity;
        this.fullPath = fullPath;
        this.schema = schema;
        this.cache = cache;
        this.projection = projection;
        this.parent = parent;
        this.action = action;
        this.dirty = false;
        this.needReGetValue = !!this.projection;
        this.refreshing = false;
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

    registerValueSentry(refreshFn: (opRecords: OpRecord<ED>[]) => Promise<void>) {
        /**
         * 这里对于singleNode可以进一步优化，只有对该行的动作才会触发refresh，目前应该无所谓了
         * by Xc 20220417
         */
        this.refreshFn = refreshFn;
        this.cache.bindOnSync(refreshFn);
    }

    unregisterValueSentry() {
        if (this.refreshFn) {
            this.cache.unbindOnSync(this.refreshFn);
            this.refreshFn = undefined;
        }
    }
}

const DEFAULT_PAGINATION: Pagination = {
    step: 20,
    append: true,
    indexFrom: 0,
    more: true,
}

class ListNode<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>> extends Node<ED, T, Cxt, AD>{
    private ids: string[];
    protected children: SingleNode<ED, T, Cxt, AD>[];
    protected value: Array<Partial<ED[T]['Schema']>>;

    private filters: ED[T]['Selection']['filter'][];
    private sorter?: ED[T]['Selection']['sorter'];
    private pagination: Pagination;

    constructor(entity: T, fullPath: string, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, AD>, projection?: ED[T]['Selection']['data'],
        parent?: Node<ED, keyof ED, Cxt, AD>, pagination?: Pagination, filters?: ED[T]['Selection']['filter'][],
        sorter?: ED[T]['Selection']['sorter'], action?: ED[T]['Action']) {
        super(entity, fullPath, schema, cache, projection, parent, action);
        this.ids = [];
        this.value = [];
        this.children = [];
        this.filters = filters || [];
        this.sorter = sorter || [];
        this.pagination = pagination || DEFAULT_PAGINATION;

        if (projection) {
            this.registerValueSentry((records) => this.onRecordSynchoronized(records));
        }
    }

    async composeOperation(): Promise<DeduceOperation<ED[T]['Schema']> | DeduceOperation<ED[T]['Schema']>[] | undefined> {
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
            const subAction = await node.composeOperation();
            if (subAction) {
                actions.push(subAction);
            }
        }
        return actions;
    }

    addChild(path: string, node: SingleNode<ED, T, Cxt, AD>) {
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

    async getChild(path: string, create?: boolean) {
        const idx = parseInt(path, 10);
        let node = this.children[idx];
        if (create && !node) {
            node = new SingleNode(this.entity, `${this.fullPath}.${idx}`, this.schema, this.cache, undefined, this as any, this.ids[idx]);
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

    async refresh() {
        const { filters, sorter, pagination, entity, projection, fullPath } = this;
        assert(projection);
        const { step } = pagination;
        this.refreshing = true;
        const { ids } = await this.cache.refresh(entity, {
            data: projection as any,
            filter: filters.length > 0 ? combineFilters(filters) : undefined,
            sorter,
            indexFrom: 0,
            count: step,
        }, fullPath);
        assert(ids);
        this.ids = ids;
        this.pagination.indexFrom = 0;
        this.pagination.more = ids.length === step;
        this.refreshing = false;
    }

    updateChildrenValue() {
        this.children.forEach(
            (ele, idx) => ele.setValue(this.value[idx])
        );
    }

    async reGetValue() {
        const { entity, ids, projection, fullPath } = this;
        assert(projection);
        if (ids.length > 0) {
            const rows = await this.cache.get({
                entity,
                selection: {
                    data: projection as any,
                    filter:  {
                        id: {
                            $in: ids,
                        }
                    } as any,                    
                },
                scene: fullPath,
            });
            
            this.value = ids.map(
                (id) => rows.find(
                    (ele) => ele.id === id
                )
            ).filter(
                ele => !!ele
            ) as any;
        }
        else {
            this.value = [];
        }

        this.updateChildrenValue();
    }

    async onRecordSynchoronized(records: OpRecord<ED>[]) {
        if (this.refreshing) {
            this.needReGetValue = true;
            return;
        }
        for (const record of records) {
            const { a } = record;
            switch (a) {
                case 'c': {
                    const { e, d } = record as CreateOpResult<ED, T>;
                    if (e === this.entity) {
                        const { id } = d;
                        const filter = combineFilters([{ id } as any, ...this.filters]);
                        const { ids } = await this.cache.operate(e, {
                            data: {
                                id: 1,
                            } as any,
                            filter,
                            action: 'select',
                        }, 'onRecordSynchoronized', false, { obscure: true });
                        if (ids!.length > 0) {
                            // todo 这里更严格应该还要考虑sorter，但前端可能没有完整的供sort用的cache数据
                            this.ids.push(id);
                            this.needReGetValue = true;
                        }
                    }
                    break;
                }
                case 'r':
                case 'u': {
                    const { e, f } = record as UpdateOpResult<ED, T>;
                    if (e === this.entity) {
                        // todo 这里更严格应该考虑f对当前value有无影响，同上面一样这里可能没有完整的供f用的cache数据
                        this.needReGetValue = true;
                    }                    
                }
                case 's': {
                    const { d } = record as SelectOpResult<ED>;
                    for (const e in d) {
                        if (e as string === this.entity) {
                            for (const id in d[e]) {
                                if (this.ids.includes(id)) {
                                    this.needReGetValue = true;
                                    break;
                                }
                                else {
                                    const filter = combineFilters([{ id } as any, ...this.filters]);
                                    const { ids } = await this.cache.operate(e, {
                                        data: {
                                            id: 1,
                                        } as any,
                                        filter,
                                        action: 'select',
                                    }, 'onRecordSynchoronized', false, { obscure: true });
                                    if (ids!.length > 0) {
                                        // todo 这里更严格应该还要考虑sorter，但前端可能没有完整的供sort用的cache数据
                                        this.ids.push(id);
                                        this.needReGetValue = true;
                                        break;
                                    }
                                }
                            }
                        }
                        break;
                    }                    
                }
            }
        }
    }

    async getValue() {
        if (this.needReGetValue) {
            await this.reGetValue();
            this.needReGetValue = false;
        }
        return this.value;
    }

    setValue(value: Array<Partial<ED[T]['Schema']>>) {
        this.value = value;
        this.updateChildrenValue();
    }
    
    resetUpdateData() {
        this.updateData = undefined;
        // this.action = undefined;
        this.dirty = false;
        
        this.children.forEach(
            (ele) => ele.resetUpdateData()
        );
    }

    async nextPage() {

    }

    async prevPage() {

    }
}


class SingleNode<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>> extends Node<ED, T, Cxt, AD>{
    private id?: string;
    private value?: Partial<ED[T]['Schema']>;
    private children: {
        [K in keyof ED[T]['Schema']]?: SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD>;
    };

    constructor(entity: T, fullPath: string, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, AD>, projection?: ED[T]['Selection']['data'],
        parent?: Node<ED, keyof ED, Cxt, AD>, id?: string, action?: ED[T]['Action']) {
        super(entity, fullPath, schema, cache, projection, parent, action);
        this.id = id;
        this.children = {};
        if (projection) {
            this.registerValueSentry((record) => this.onRecordSynchoronized(record));
        }
    }

    async refresh() {
        assert(this.projection);
        if (this.action !== 'create') {
            this.refreshing = true;
            await this.cache.refresh(this.entity, {
                data: this.projection,
                filter: {
                    id: this.id,
                },
            } as any, this.fullPath);
            this.refreshing = false;
        }
    }

    async composeOperation(action2?: string): Promise<DeduceOperation<ED[T]['Schema']> | undefined> {
        if (!this.isDirty() && !action2) {
            return;
        }
        const action = this.action === 'create' ? {
            action: 'create',
            data: assign({}, this.updateData, { id: await generateNewId() }),
        } as DeduceCreateOperation<ED[T]['Schema']> : {
            action: action2 || this.action || 'update',
            data: cloneDeep(this.updateData) || {},
            filter: {
                id: this.id!,
            },
        } as DeduceUpdateOperation<ED[T]['Schema']>;
        for (const attr in this.children) {
            const subAction = await this.children[attr]!.composeOperation();
            if (subAction) {
                assign(action.data, {
                    [attr]: subAction,
                });
            }
        }
        return action;
    }

    addChild(path: string, node: Node<ED, keyof ED, Cxt, AD>) {
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

    async getChild<Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>>(path: keyof ED[T]['Schema'], create?: boolean, cache?: Cache<ED, Cxt, AD>) {
        let node = this.children[path];
        if (create && !node) {
            assert(cache);
            const relation = judgeRelation(this.schema, this.entity, path as any);
            if (relation === 2) {
                // 基于entityId的多对一
                if (this.value && this.value.entityId) {
                    node = new SingleNode(path as keyof ED, `${this.fullPath}.${path}`, this.schema, this.cache, undefined, this as any, this.value.entityId);
                }
                else {
                    // 新建对象并关联
                    assert(!this.value || this.value.entity);
                    const id = await generateNewId();
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
                    node = new SingleNode(path as any, `${this.fullPath}.${path}`, this.schema, this.cache, undefined, this as any, id, 'create');
                }
            }
            else if (typeof relation === 'string') {
                if (this.value && this.value[`${path}Id`]) {
                    node = new SingleNode(relation as any, `${this.fullPath}.${path}`, this.schema, this.cache, undefined, this as any, this.value![`${path}Id`]);
                }
                else {
                    // 新建对象并关联
                    assert(!this.value || !this.value.entity);
                    const id = await generateNewId();
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
                    node = new SingleNode(path as any, `${this.fullPath}.${path}`, this.schema, this.cache, undefined, this as any, id, 'create');
                }
            }
            else {
                assert(relation instanceof Array);
                node = new ListNode(relation[0] as any, `${this.fullPath}.${path}`, this.schema, this.cache, undefined, this as any);
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

    async reGetValue() {
        const { entity, id, projection, fullPath } = this;
        assert(projection);
        if (id) {
            const filter: Partial<AttrFilter<ED[T]["Schema"]>> = {
                id,
            } as any;
            const value = await this.cache.get({
                entity,
                selection: {
                    data: projection as any,
                    filter,
                },
                scene: fullPath,
            });
            this.value = value[0] as Partial<ED[T]['Schema']>;
            this.updateChildrenValues();
        }
    }

    async getValue() {
        if (this.needReGetValue) {
            await this.reGetValue();
            this.needReGetValue = false;
        }
        return this.value;
    }

    setValue(value: Partial<ED[T]['Schema']>) {
        this.value = value;
        this.updateChildrenValues();
    }

    resetUpdateData() {
        this.updateData = undefined;
        // this.action = undefined;
        this.dirty = false;
        
        for (const attr in this.children) {
            this.children[attr]?.resetUpdateData();
        }
    }

    async onRecordSynchoronized(records: OpRecord<ED>[]) {
        if (this.refreshing) {
            this.needReGetValue = true;
            return;
        }
        for (const record of records) {
            const { a } = record;
            switch (a) {
                case 'c': {
                }
                case 'r':
                case 'u': {
                    const { e, f } = record as UpdateOpResult<ED, T>;
                    if (e === this.entity) {
                        // todo 这里更严格应该考虑f对当前filter有无影响，同上面一样这里可能没有完整的供f用的cache数据
                        this.needReGetValue = true;
                    }                    
                }
                case 's': {
                    const { d } = record as SelectOpResult<ED>;
                    for (const e in d) {
                        if (e as string === this.entity) {
                            for (const id in d[e]) {
                                if (this.id === id) {
                                    this.needReGetValue = true;
                                    break;
                                }
                            }
                        }
                    }
                    break;
                }
            }
        }
    }
}


export class RunningNode<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>> extends Feature<ED, Cxt, AD> {
    private cache: Cache<ED, Cxt, AD>;
    private schema?: StorageSchema<ED>;
    private root: Record<string, SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD>>;

    constructor(cache: Cache<ED, Cxt, AD>) {
        super();
        this.cache = cache;
        this.root = {};
    }

    async createNode<T extends keyof ED>(path: string, parent?: string,
        entity?: T, isList?: boolean, isPicker?: boolean, projection?: ED[T]['Selection']['data'], id?: string,
        pagination?: Pagination, filters?: ED[T]['Selection']['filter'][],
        sorter?: ED[T]['Selection']['sorter']) {
        let node: ListNode<ED, T, Cxt, AD> | SingleNode<ED, T, Cxt, AD>;
        const parentNode = parent ? await this.findNode(parent) : undefined;
        const fullPath = parent ? `${parent}.${path}` : `${path}`;
        const subEntity = parentNode && parentNode.getSubEntity(path);
        const entity2 = subEntity ? subEntity.entity : entity!;
        const isList2 = subEntity ? subEntity.isList : isList!;

        if (isPicker || isList2) {
            node = new ListNode<ED, T, Cxt, AD>(entity2 as T, fullPath, this.schema!, this.cache, projection, parentNode, pagination, filters, sorter);
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
            node = new SingleNode<ED, T, Cxt, AD>(entity2 as T, fullPath, this.schema!, this.cache, projection, parentNode, id, !id ? 'create' : undefined);
        }
        if (parentNode) {
            parentNode.addChild(path, node as any);
        }
        else {
            this.root[path] = node as any;
        }

        return entity2;
    }

    async destroyNode(path: string) {
        const node = await this.findNode(path);
        if (node) {
            node.unregisterValueSentry();
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
        projection: DeduceSelection<ED[T]['Schema']>['data'],
        scene: string): Promise<Partial<ED[T]['Schema']> | Partial<ED[T]['Schema']>[] | undefined> {
        if (operation instanceof Array) {
            assert(value instanceof Array);
            for (const action of operation) {
                switch (action.action) {
                    case 'create': {
                        value.push(await this.applyOperation(entity, undefined, action, projection, scene) as Partial<ED[T]['Schema']>);
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
                        await this.applyOperation(entity, row!, action, projection, scene);
                    }
                }
            }
            return value;
        }
        else {
            if (value instanceof Array) {
                // todo 这里还有种可能不是对所有的行，只对指定id的行操作
                return (await Promise.all(value.map(
                    async (row) => await this.applyOperation(entity, row, operation, projection, scene)
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
                                set(row, attr, await this.applyOperation(attr, row[attr], actionData[attr]!, projection[attr]!, scene));
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
                                set(row, attr, await this.applyOperation(relation, row[attr], actionData[attr]!, projection[attr]!, scene));
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
                                set(row, attr, await this.applyOperation(relation[0], row[attr], actionData[attr]!, projection[attr]!, scene));
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
                                    },
                                    scene
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
                                    },
                                    scene,
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
                            id: await generateNewId(),
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
        let value = await node.getValue();
        if (node.isDirty()) {
            const operation = await node.composeOperation();
            const projection = node.getProjection();
            value = (await this.applyOperation(node.getEntity(), value, operation!, projection as any, path));
        }

        if (value instanceof Array) {
            return value;
        }
        return [value];
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
            node = (await node.getChild<Cxt, AD>(childPath))!;
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
                node = (await node.getChild<Cxt, AD>(split, true, this.cache))!;
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
        await node.refresh();
    }

    @Action
    async setFilters<T extends keyof ED>(path: string, filters: DeduceFilter<ED[T]['Schema']>[], refresh: boolean = true) {
        const node = await this.findNode(path);
        if (node instanceof ListNode) {
            node.setFilters(filters);
            if (refresh) {
                await node.refresh();
            }
        }
    }

    @Action
    async execute(path: string, action?: string, isTry?: boolean) {
        const node = await this.findNode(path);
        const operation = await node.composeOperation(action);
        // 先在cache中尝试能否执行，如果权限上否决了在这里就失败
        if (operation instanceof Array) {
            for (const oper of operation) {
                await this.cache.operate(node.getEntity(), oper, path, false);
            }
        }
        else if (operation) {
            await this.cache.operate(node.getEntity(), operation, path, false);
        }
        else {
            return;
        }

        if (isTry) {
            return;
        }

        await this.getAspectProxy().operate({
            entity: node.getEntity() as string,
            operation,
        }, path);
        
        // 清空缓存
        node.resetUpdateData();
    }
}

