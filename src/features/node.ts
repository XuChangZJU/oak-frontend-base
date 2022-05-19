import { set, cloneDeep, pull, unset } from 'lodash';
import { AttrFilter, CreateOpResult, DeduceCreateOperation, DeduceFilter, DeduceOperation, DeduceSelection, DeduceUpdateOperation, EntityDict, EntityShape, OpRecord, SelectOpResult, SelectRowShape, UpdateOpResult } from 'oak-domain/lib/types/Entity';
import { Aspect, Context, Trigger } from 'oak-domain/lib/types';
import { combineFilters } from 'oak-domain/lib/store/filter';
import { Action, Feature } from '../types/Feature';
import { Cache } from './cache';
import assert from 'assert';
import { assign } from 'lodash';
import { judgeRelation } from 'oak-domain/lib/store/relation';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Pagination } from '../types/Pagination';
import { NamedFilterItem, NamedSorterItem } from '../types/NamedCondition';
import { generateMockId, isMockId } from '../utils/mockId';

export class Node<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>> {
    protected entity: T;
    // protected fullPath: string;
    protected schema: StorageSchema<ED>;
    private projection?: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>);      // 只在Page层有
    protected parent?: Node<ED, keyof ED, Cxt, AD>;
    protected action?: ED[T]['Action'];
    protected dirty: boolean;
    protected updateData: DeduceUpdateOperation<ED[T]['OpSchema']>['data'];
    protected cache: Cache<ED, Cxt, AD>;
    protected refreshing: boolean;
    private beforeExecute?: (updateData: DeduceUpdateOperation<ED[T]['OpSchema']>['data'], action: ED[T]['Action']) => Promise<void>;
    private afterExecute?: (updateData: DeduceUpdateOperation<ED[T]['OpSchema']>['data'], action: ED[T]['Action']) => Promise<void>;
    private refreshFn?: (opRecords: OpRecord<ED>[]) => Promise<void>;

    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, AD>,
        projection?: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>),
        parent?: Node<ED, keyof ED, Cxt, AD>, action?: ED[T]['Action'], 
        updateData?: DeduceUpdateOperation<ED[T]['OpSchema']>['data']) {
        this.entity = entity;
        this.schema = schema;
        this.cache = cache;
        this.projection = projection;
        this.parent = parent;
        this.action = action;
        this.dirty = false;
        this.refreshing = false;
        this.updateData = updateData || {};
    }

    /* getSubEntity(path: string) {
        if (this instanceof ListNode) {
            const idx = parseInt(path, 10);
            assert(typeof idx === 'number');
            return {
                entity: this.entity,
                isList: false,
                id: this.getIds()[idx] || undefined,
            }
        }
        assert(this instanceof SingleNode);
        const relation = judgeRelation(this.schema, this.entity, path);
        if (relation === 2) {
            return {
                entity: path,
                isList: false,
                id: (this.getValue())!['entityId'] as string,
            };
        }
        else if (typeof relation === 'string') {
            return {
                entity: relation,
                isList: false,
                id: (this.getValue())![`${path}Id`],
            };
        }
        else {
            assert(relation instanceof Array);
            return {
                entity: relation[0],
                isList: true,
                ids: (this.getValue())!.map(
                    (ele: any) => ele.id,
                ),
            };
        }
    } */

    getEntity() {
        return this.entity;
    }

    setUpdateData(attr: string, value: any) {
        this.setDirty();
        set(this.updateData!, attr, value);
    }

    getUpdateData() {
        return this.updateData;
    }

    setWholeUpdateData(updateData: DeduceUpdateOperation<ED[T]['OpSchema']>['data']) {
        this.updateData = updateData;
        this.setDirty();
    }

    setDirty() {
        if (!this.dirty) {
            this.dirty = true;
        }
        if (this.parent) {
            this.parent.setDirty();
        }
    }

    setAction(action: ED[T]['Action']) {
        this.action = action;
        this.setDirty();
    }

    isDirty() {
        return this.dirty;
    }

    getParent() {
        return this.parent;
    }

    async getProjection() {
        if (this.projection) {
            return typeof this.projection === 'function' ? await this.projection() : this.projection;
        }
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

    setBeforeExecute(_beforeExecute?: (updateData: DeduceUpdateOperation<ED[T]['OpSchema']>['data'], action: ED[T]['Action']) => Promise<void>) {
        this.beforeExecute = _beforeExecute;
    }

    setAfterExecute(_afterExecute?: (updateData: DeduceUpdateOperation<ED[T]['OpSchema']>['data'], action: ED[T]['Action']) => Promise<void>) {
        this.afterExecute = _afterExecute;
    }

    getBeforeExecute() {
        return this.beforeExecute;
    }

    getAfterExecute() {
        return this.afterExecute;
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
    protected newBorn: SingleNode<ED, T, Cxt, AD>[];    // 新插入的结点
    protected value: Array<Partial<ED[T]['Schema']>>;

    private filters: NamedFilterItem<ED, T>[];
    private sorters: NamedSorterItem<ED, T>[];
    private pagination: Pagination;

    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, AD>,
        projection?: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>),
        parent?: Node<ED, keyof ED, Cxt, AD>, pagination?: Pagination,
        filters?: NamedFilterItem<ED, T>[], sorters?: NamedSorterItem<ED, T>[],
        ids?: string[], action?: ED[T]['Action'], updateData?: DeduceUpdateOperation<ED[T]['OpSchema']>['data']) {
        super(entity, schema, cache, projection, parent, action, updateData);
        this.ids = ids || [];
        this.value = [];
        this.children = [];
        this.newBorn = [];
        this.filters = filters || [];
        this.sorters = sorters || [];
        this.pagination = pagination || DEFAULT_PAGINATION;

        if (projection) {
            this.registerValueSentry((records) => this.onRecordSynchoronized(records));
        }
    }

    getIds() {
        return this.ids;
    }

    getAction() {
        assert(this.dirty);
        return this.action || 'update';
    }

    async composeOperation(action?: string, realId?: boolean): Promise<DeduceOperation<ED[T]['Schema']> | DeduceOperation<ED[T]['Schema']>[] | undefined> {
        if (!action && !this.isDirty()) {
            return;
        }

        // todo 这里的逻辑还没有测试过
        if (action || this.action) {
            return {
                action: action || this.getAction(),
                data: cloneDeep(this.updateData),
                filter: combineFilters(this.filters.map(ele => ele.filter)),
            } as DeduceUpdateOperation<ED[T]['Schema']>;  // todo 这里以后再增加对选中id的过滤
        }
        const actions = [];
        for (const node of this.children) {
            const subAction = await node.composeOperation(undefined, realId);
            if (subAction) {
                actions.push(subAction);
            }
        }
        for (const node of this.newBorn) {
            const subAction = await node.composeOperation(undefined, realId);
            if (subAction) {
                actions.push(subAction);
            }
        }
        return actions;
    }

    getChildren() {
        return this.children;
    }

    addChild(node: SingleNode<ED, T, Cxt, AD>, path?: string) {
        const { children, newBorn } = this;
        if (path) {
            const idx = parseInt(path, 10);
            assert (idx < this.ids.length);            
            node.setValue(this.value[idx]);
            assert(!children[idx]);
            children[idx] = node;
        }
        else {
            node.setAction('create');
            newBorn.push(node);
        }
    }

    removeChild(path: string) {
        const { children, newBorn } = this;
        const idx = parseInt(path, 10);
        if (idx >= this.ids.length) {
            const idx2 = idx - this.ids.length;
            assert(idx2 < newBorn.length);
            newBorn.splice(idx2, 1);
        }
        else {
            assert(children[idx]);
            unset(children, idx);
        }
    }

    getChild(path?: string, create?: boolean): SingleNode<ED, T, Cxt, AD> | undefined {
        if (path) {
            let node: SingleNode<ED, T, Cxt, AD>;
            const idx = parseInt(path, 10);
            if (idx >= this.ids.length) {
                const idx2 = idx - this.ids.length;
                // assert(idx2 < this.newBorn.length);
                node = this.newBorn[idx2];
            }
            else {            
                node = this.children[idx];
                if (create && !node) {
                    node = new SingleNode(this.entity, this.schema, this.cache, undefined, this as any, this.ids[idx]);
                    this.addChild(node, path);
                }
            }
            return node;
        }
        else {
            // 不传path说明是在list里增加一个结点，直接插入到newBorn里
            assert(create);
            const node = new SingleNode(this.entity, this.schema, this.cache, undefined, this as any, undefined);
            this.addChild(node);

            return node;
        }
    }

    getNamedFilters() {
        return this.filters;
    }

    getNamedFilterByName(name: string) {
        const filter = this.filters.find((ele) => ele['#name'] === name);
        return filter;
    }

    setNamedFilters(filters: NamedFilterItem<ED, T>[]) {
        this.filters = filters;
    }

    addNamedFilter(filter: NamedFilterItem<ED, T>) {
        // filter 根据#name查找
        const fIndex = this.filters.findIndex(ele => filter['#name'] && ele['#name'] === filter['#name']);
        if (fIndex >= 0) {
            this.filters.splice(fIndex, 1, filter);
        } else {
            this.filters.push(filter);
        }
    }

    removeNamedFilter(filter: NamedFilterItem<ED, T>) {
        // filter 根据#name查找
        const fIndex = this.filters.findIndex(ele => filter['#name'] && ele['#name'] === filter['#name']);
        if (fIndex >= 0) {
            this.filters.splice(fIndex, 1);
        }
    }

    removeNamedFilterByName(name: string) {
        // filter 根据#name查找
        const fIndex = this.filters.findIndex(ele => ele['#name'] === name);
        if (fIndex >= 0) {
            this.filters.splice(fIndex, 1);
        }
    }

    getNamedSorters() {
        return this.sorters;
    }

    getNamedSorterByName(name: string) {
        const sorter = this.sorters.find((ele) => ele['#name'] === name);
        return sorter;
    }

    setNamedSorters(sorters: NamedSorterItem<ED, T>[]) {
        this.sorters = sorters;
    }

    addNamedSorter(sorter: NamedSorterItem<ED, T>) {
        // sorter 根据#name查找
        const fIndex = this.sorters.findIndex(ele => sorter['#name'] && ele['#name'] === sorter['#name']);
        if (fIndex >= 0) {
            this.sorters.splice(fIndex, 1, sorter);
        } else {
            this.sorters.push(sorter);
        }
    }

    removeNamedSorter(sorter: NamedSorterItem<ED, T>) {
        // sorter 根据#name查找
        const fIndex = this.sorters.findIndex(ele => sorter['#name'] && ele['#name'] === sorter['#name']);
        if (fIndex >= 0) {
            this.sorters.splice(fIndex, 1);
        }
    }

    removeNamedSorterByName(name: string) {
        // sorter 根据#name查找
        const fIndex = this.sorters.findIndex(ele => ele['#name'] === name);
        if (fIndex >= 0) {
            this.sorters.splice(fIndex, 1);
        }
    }

    async refresh(scene: string) {
        const { filters, sorters, pagination, entity } = this;
        const { step } = pagination;
        const proj = await this.getProjection();
        assert(proj);
        const sorterss = await Promise.all(sorters.map(
            async (ele) => {
                const { sorter } = ele;
                if (typeof sorter === 'function') {
                    return await sorter();
                }
                else {
                    return sorter;
                }
            }
        ));
        const filterss = await Promise.all(filters.map(
            async (ele) => {
                const { filter } = ele;
                if (typeof filter === 'function') {
                    return await filter();
                }
                return filter;
            }
        ));
        this.refreshing = true;
        const { ids } = await this.cache.refresh(entity, {
            data: proj as any,
            filter: filterss.length > 0 ? combineFilters(filterss) : undefined,
            sorter: sorterss,
            indexFrom: 0,
            count: step,
        }, scene);
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
        const { entity, ids } = this;
        const projection = await this.getProjection();
        assert(projection);
        if (ids.length > 0) {
            const rows = await this.cache.get(entity, {
                data: projection as any,
                filter: {
                    id: {
                        $in: ids,
                    }
                } as any,
            }, 'reGetValue');

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
        let needReGetValue = false;
        if (this.refreshing) {
            return;
        }
        for (const record of records) {
            const { a } = record;
            switch (a) {
                case 'c': {
                    const { e, d } = record as CreateOpResult<ED, T>;
                    if (e === this.entity) {
                        const { id } = d;
                        const filter = combineFilters([{ id } as any, ...(this.filters).map(ele => ele.filter)]);
                        const { ids } = await this.cache.operate(e, {
                            data: {
                                id: 1,
                            } as any,
                            filter,
                            action: 'select',
                        }, 'onRecordSynchoronized', { obscure: true });
                        if (ids!.length > 0) {
                            // todo 这里更严格应该还要考虑sorter，但前端可能没有完整的供sort用的cache数据
                            this.ids.push(id);
                            needReGetValue = true;
                        }
                    }
                    break;
                }
                case 'r':
                case 'u': {
                    const { e, f } = record as UpdateOpResult<ED, T>;
                    if (e === this.entity) {
                        // todo 这里更严格应该考虑f对当前value有无影响，同上面一样这里可能没有完整的供f用的cache数据
                        needReGetValue = true;
                    }
                    break;
                }
                case 's': {
                    const { d } = record as SelectOpResult<ED>;
                    for (const e in d) {
                        if (e as string === this.entity) {
                            for (const id in d[e]) {
                                if (this.ids.includes(id)) {
                                    needReGetValue = true;
                                    break;
                                }
                                else {
                                    const filter = combineFilters([{ id } as any, ...(this.filters.map(ele => ele.filter))]);
                                    const { ids } = await this.cache.operate(e, {
                                        data: {
                                            id: 1,
                                        } as any,
                                        filter,
                                        action: 'select',
                                    }, 'onRecordSynchoronized', { obscure: true });
                                    if (ids!.length > 0) {
                                        // todo 这里更严格应该还要考虑sorter，但前端可能没有完整的供sort用的cache数据
                                        this.ids.push(id);
                                        needReGetValue = true;
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

        if (needReGetValue) {
            await this.reGetValue();
        }
    }

    getValue() {
        return this.value;
    }

    setValue(value: Array<Partial<ED[T]['Schema']>>) {
        this.value = value;
        this.updateChildrenValue();
    }

    resetUpdateData() {
        this.updateData = {};
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
        [K: string]: SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD>;
    };

    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, AD>, projection?: ED[T]['Selection']['data'],
        parent?: Node<ED, keyof ED, Cxt, AD>, id?: string, action?: ED[T]['Action'], updateData?: DeduceUpdateOperation<ED[T]['OpSchema']>['data']) {
        super(entity, schema, cache, projection, parent, action, updateData);
        this.id = id;
        this.children = {};
        if (projection) {
            this.registerValueSentry((record) => this.onRecordSynchoronized(record));
        }
    }

    async refresh(scene: string) {
        const projection = await this.getProjection();
        assert(projection);
        if (this.action !== 'create') {
            this.refreshing = true;
            await this.cache.refresh(this.entity, {
                data: projection,
                filter: {
                    id: this.id,
                },
            } as any, scene);
            this.refreshing = false;
        }
    }
    
    getAction() {
        return this.action || (this.id ? 'update' : 'create');
    }

    getId() {
        return this.id;
    }

    async composeOperation(action2?: string, realId?: boolean): Promise<DeduceOperation<ED[T]['Schema']> | undefined> {
        if (!action2 && !this.isDirty()) {
            return;
        }
        const action = action2 || this.getAction();

        const operation = action === 'create' ? {
            action: 'create',
            data: assign({}, this.updateData, { id: realId ? await generateNewId() : generateMockId() }),
        } as DeduceCreateOperation<ED[T]['Schema']> : {
            action,
            data: cloneDeep(this.updateData) || {},
            filter: {
                id: this.id!,
            },
        } as DeduceUpdateOperation<ED[T]['Schema']>;
        for (const attr in this.children) {
            const subAction = await this.children[attr]!.composeOperation(undefined, realId);
            if (subAction) {
                assign(operation.data, {
                    [attr]: subAction,
                });
            }
        }
        return operation;
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
        assert (children[path]); 
        unset(children, path);
    }

    getChildren() {
        return this.children;
    }

    getChild(path: keyof ED[T]['Schema'], create?: boolean): SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD> | undefined {
        let node = this.children[path as string];
        if (create && !node) {
            const relation = judgeRelation(this.schema, this.entity, path as any);
            if (relation === 2) {
                // 基于entityId的多对一
                if (this.value && this.value.entityId) {
                    node = new SingleNode(path as keyof ED, this.schema, this.cache, undefined, this, this.value.entityId);
                }
                else {
                    // 新建对象并关联
                    assert(!this.value || this.value.entity);
                    node = new SingleNode(path as any, this.schema, this.cache, undefined, this, undefined, 'create');
                }
            }
            else if (typeof relation === 'string') {
                if (this.value && this.value[`${path}Id`]) {
                    node = new SingleNode(relation as any, this.schema, this.cache, undefined, this as any, this.value![`${path}Id`]);
                }
                else {
                    // 新建对象并关联
                    assert(!this.value || !this.value.entity);
                    node = new SingleNode(path as any, this.schema, this.cache, undefined, this as any, undefined, 'create');
                }
            }
            else {
                assert(relation instanceof Array);
                node = new ListNode(relation[0] as any, this.schema, this.cache, undefined, this as any, undefined, undefined, undefined, this.value && this.value[path].map((ele: any) => ele.id));
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
        const { entity, id } = this;
        const projection = await this.getProjection();
        assert(projection);
        if (id) {
            const filter: Partial<AttrFilter<ED[T]["Schema"]>> = {
                id,
            } as any;
            const value = await this.cache.get(entity, {
                data: projection as any,
                filter,
            }, 'reGetValue');
            this.value = value[0] as Partial<ED[T]['Schema']>;
            this.updateChildrenValues();
        }
    }

    getValue() {
        return this.value;
    }

    setValue(value: Partial<ED[T]['Schema']>) {
        this.value = value;
        this.updateChildrenValues();
    }

    resetUpdateData() {
        this.updateData = {};
        // this.action = undefined;
        this.dirty = false;

        for (const attr in this.children) {
            this.children[attr]?.resetUpdateData();
        }
    }

    async onRecordSynchoronized(records: OpRecord<ED>[]) {
        let needReGetValue = false;
        if (this.refreshing) {
            return;
        }
        for (const record of records) {
            if (needReGetValue === true) {
                break;
            }
            const { a } = record;
            switch (a) {
                case 'c': {
                }
                case 'r':
                case 'u': {
                    const { e, f } = record as UpdateOpResult<ED, T>;
                    if (e === this.entity) {
                        // todo 这里更严格应该考虑f对当前filter有无影响，同上面一样这里可能没有完整的供f用的cache数据
                        needReGetValue = true;
                    }
                    break;
                }
                case 's': {
                    const { d } = record as SelectOpResult<ED>;
                    for (const e in d) {
                        if (needReGetValue === true) {
                            break;
                        }
                        if (e as string === this.entity) {
                            for (const id in d[e]) {
                                if (this.id === id) {
                                    needReGetValue = true;
                                    break;
                                }
                            }
                        }
                    }
                    break;
                }
            }
        }
        if (needReGetValue) {
            await this.reGetValue();
        }
    }

    createPicker<T2 extends keyof ED>(path: string,
        projection?: ED[T2]['Selection']['data'] | (() => Promise<ED[T2]['Selection']['data']>),
        pagination?: Pagination, filters?: NamedFilterItem<ED, T2>[],
        sorters?: NamedSorterItem<ED, T2>[]) {
        const rel = judgeRelation(this.schema, this.entity, path);
        let entity: T2;
        if (rel === 2) {
            entity = path as T2;
        }
        else {
            assert(typeof rel === 'string');
            entity = rel as T2;
        }
        const node = new ListNode<ED, T2, Cxt, AD>(entity, this.schema!, this.cache, projection, this, pagination, filters, sorters);
        this.addChild(path, node);
        return node;
    }
}

export type CreateNodeOptions<ED extends EntityDict, T extends keyof ED> = {
    path?: string;
    parent?: string;
    entity?: T;
    isList?: boolean;
    isPicker?: boolean;
    projection?: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>);
    pagination?: Pagination;
    filters?: NamedFilterItem<ED, T>[]; 
    sorters?: NamedSorterItem<ED, T>[];
    action?: ED[T]['Action'];
    id?: string;
    ids?: string[];
    updateData?: DeduceUpdateOperation<ED[T]['OpSchema']>['data'];
    beforeExecute?: (updateData: DeduceUpdateOperation<ED[T]['OpSchema']>['data'], action: ED[T]['Action']) => Promise<void>;
    afterExecute?: (updateData: DeduceUpdateOperation<ED[T]['OpSchema']>['data'], action: ED[T]['Action']) => Promise<void>;
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

    async createNode<T extends keyof ED>(options: CreateNodeOptions<ED, T>) {
        const {
            entity,
            parent,
            pagination,
            path,
            filters,
            sorters,
            id,
            ids,
            action,
            updateData,
            projection,
            isList,
            isPicker,
            beforeExecute,
            afterExecute,
        } = options;
        let node: ListNode<ED, T, Cxt, AD> | SingleNode<ED, T, Cxt, AD>;
        const parentNode = parent && this.findNode(parent);
        if (parentNode) {
            if (isPicker) {
                // 如果是picker，使用list来选择
                assert(path);
                assert(parentNode instanceof SingleNode);
                node = parentNode.createPicker(path, projection, pagination, filters, sorters);
            }
            else {
                assert(path || parentNode instanceof ListNode);
                node = (parentNode.getChild(path!, true)) as ListNode<ED, T, Cxt, AD> | SingleNode<ED, T, Cxt, AD>;
            }
            if (action) {
                node.setAction(action);
            }
            if (updateData) {
                node.setWholeUpdateData(updateData);
            }
        }
        else {
            assert(entity && path);
            if (isPicker || isList) {
                node = new ListNode<ED, T, Cxt, AD>(entity, this.schema!, this.cache, projection, undefined, pagination, filters, sorters, ids, action, updateData);
            }
            else {
                node = new SingleNode<ED, T, Cxt, AD>(entity, this.schema!, this.cache, projection, undefined, id, action, updateData);
            }
            this.root[path] = node as any;
        }
        if (beforeExecute) {
            node.setBeforeExecute(beforeExecute);
        }
        if (afterExecute) {
            node.setAfterExecute(afterExecute);
        }
        return node;
        /* const parentNode = parent ? await this.findNode(parent) : undefined;
        const fullPath = parent ? `${parent}.${path}` : `${path}`;
        const subEntity = parentNode && await parentNode.getSubEntity(path);
        const entity2 = subEntity ? subEntity.entity : entity!;
        const isList2 = subEntity ? subEntity.isList : isList!;
        const id2 = subEntity && subEntity.id || id;
        const ids2 = subEntity && subEntity.ids || ids;

        if (isPicker || isList2) {
            node = new ListNode<ED, T, Cxt, AD>(entity2 as T, fullPath, this.schema!, this.cache, projection, parentNode, pagination, filters, sorters, ids2, action);
        }
        else {
            node = new SingleNode<ED, T, Cxt, AD>(entity2 as T, fullPath, this.schema!, this.cache, projection, parentNode, id2, action);
        }
        if (parentNode) {
            parentNode.addChild(path, node as any);
        }
        else {
            this.root[path] = node as any;
        }

        return entity2; */
    }

    // 目前addNode应该只有在list中新加一项这一种情况
    @Action
    addNode<T extends keyof ED>(options: Pick<CreateNodeOptions<ED, T>, 'parent' | 'updateData' | 'beforeExecute' | 'afterExecute'>) {
        return this.createNode(options);
    }

    @Action
    async removeNode(options: {
        parent: string,
        path: string,
    }) {
        const { parent, path} = options;
        const parentNode = this.findNode(parent);
        
        const node = parentNode.getChild(path);
        assert (node instanceof SingleNode);        // 现在应该不可能remove一个list吧，未来对list的处理还要细化
        if (node.getId()) {
            // 如果有id，说明是删除数据
            await this.getAspectProxy().operate({
                entity: node.getEntity() as string,
                operation: {
                    action: 'remove',
                    data: {},
                    filter: {
                        id: node.getId(),
                    },
                }
            }, parent);
        }
        else {
            // 删除子结点
            parentNode.removeChild(path);
        }
    }

    async destroyNode(path: string) {
        const node = this.findNode(path);
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
        projection: ED[T]['Selection']['data'],
        scene: string): Promise<Partial<ED[T]['Schema']> | Partial<ED[T]['Schema']>[] | undefined> {
        if (operation instanceof Array) {
            assert(value instanceof Array);
            for (const action of operation) {
                switch (action.action) {
                    case 'create': {
                        value.push(await this.applyOperation(entity, undefined, action, projection, scene) as Partial<ED[T]['Schema']>);
                        break;
                    }
                    case 'remove': {
                        const { filter } = action;
                        assert(filter!.id);
                        const row = value.find(
                            ele => ele.id === filter!.id
                        );
                        pull(value, row);
                        break;
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
                                set(row, attr, await this.applyOperation(relation[0], row[attr], actionData[attr]!, projection[attr]!['data'], scene));
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
                                const [entityRow] = await this.cache.get(entity, {
                                    data: projection[attr]!,
                                    filter: {
                                        id: entityId,
                                    } as any,
                                }, scene);
                                set(row, attr, entityRow);
                            }
                            else if (typeof relation === 'string' && actionData.hasOwnProperty(`${attr}Id`)) {
                                const [entityRow] = await this.cache.get(relation, {
                                    data: projection[attr]!,
                                    filter: {
                                        id: actionData[`${attr}Id`],
                                    } as any,
                                }, scene);
                                set(row, attr, entityRow);
                            }
                        }
                    }
                };
                switch (action) {
                    case 'create': {
                        assert(!value);
                        const row = {
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
        const node = this.findNode(path);
        let value = node.getValue();
        if (node.isDirty()) {
            const operation = await node.composeOperation();
            const projection = await node.getProjection();
            value = (await this.applyOperation(node.getEntity(), cloneDeep(value), operation!, projection as any, path));
        }

        if (value instanceof Array) {
            return value;
        }
        return [value];
    }

    async isDirty(path: string) {
        const node = this.findNode(path);
        return node ? node.isDirty() : false;
    }

    private findNode(path: string, create?: boolean) {
        const paths = path.split('.');
        let node = this.root[paths[0]];
        let iter = 1;
        while (iter < paths.length && node) {
            const childPath = paths[iter];
            iter++;
            node = node.getChild(childPath, create)!;
        }
        return node;
    }

    protected async setUpdateDataInner(path: string, attr: string, value: any) {
        let node = this.findNode(path);
        const attrSplit = attr.split('.');
        let idx = 0;
        for (const split of attrSplit) {
            const entity = node.getEntity();
            const relation = judgeRelation(this.schema!, entity, split);
            if (relation === 1) {
                // todo transform data format
                const attrName = attrSplit.slice(idx).join('.');
                node.setUpdateData(attrName, value);
                return;
            }
            else {
                // node.setDirty();
                node = node.getChild(split, true)!;
                idx++;
            }
        }
    }

    async setAction<T extends keyof ED>(path: string, action: ED[T]['Action']) {
        const node = this.findNode(path, true);
        node.setAction(action);
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
    async setForeignKey(path: string, id: string) {
        const node = this.findNode(path);
        const parent = node.getParent()!;
        const attr = path.slice(path.lastIndexOf('.') + 1);
        const rel = judgeRelation(this.schema!, parent.getEntity(), attr);

        if (rel === 2) {
            parent.setUpdateData('entity', node.getEntity());
            parent.setUpdateData('entityId', id);
        }
        else {
            assert(typeof rel === 'string');
            parent.setUpdateData(`${attr}Id`, id);
        }
    }

    @Action
    async refresh(path: string) {
        const node = this.findNode(path);
        await node.refresh(path);
        await node.reGetValue();
    }

    async getNamedFilters<T extends keyof ED>(path: string) {
        const node = this.findNode(path);
        assert (node instanceof ListNode);
        return node.getNamedFilters();
    }

    async getNamedFilterByName<T extends keyof ED>(path: string, name: string) {
        const node = this.findNode(path);
        assert (node instanceof ListNode);
        return node.getNamedFilterByName(name);
    }

    @Action
    async setNamedFilters<T extends keyof ED>(path: string, filters: NamedFilterItem<ED, T>[], refresh: boolean = true) {
        const node = this.findNode(path);
        assert (node instanceof ListNode);
        node.setNamedFilters(filters);
        if (refresh) {
            await node.refresh(path);
        }
    }

    @Action
    async addNamedFilter<T extends keyof ED>(path: string, filter: NamedFilterItem<ED, T>, refresh: boolean = false) {
        const node = this.findNode(path);
        assert (node instanceof ListNode);
        node.addNamedFilter(filter);
        if (refresh) {
            await node.refresh(path);
        }
    }

    @Action
    async removeNamedFilter<T extends keyof ED>(path: string, filter: NamedFilterItem<ED, T>, refresh: boolean = false) {
        const node = this.findNode(path);
        assert (node instanceof ListNode);
        node.removeNamedFilter(filter);
        if (refresh) {
            await node.refresh(path);
        }
    }

    @Action
    async removeNamedFilterByName<T extends keyof ED>(path: string, name: string, refresh: boolean = false) {
        const node = this.findNode(path);
        assert (node instanceof ListNode);
        node.removeNamedFilterByName(name);
        if (refresh) {
            await node.refresh(path);
        }
    }

    async getNamedSorters<T extends keyof ED>(path: string) {
        const node = await this.findNode(path);
        assert (node instanceof ListNode);
        return node.getNamedSorters();
    }

    async getNamedSorterByName<T extends keyof ED>(path: string, name: string) {
        const node = await this.findNode(path);
        assert (node instanceof ListNode);
        return node.getNamedSorterByName(name);
    }

    @Action
    async setNamedSorters<T extends keyof ED>(path: string, sorters: NamedSorterItem<ED, T>[], refresh: boolean = true) {
        const node = this.findNode(path);
        assert (node instanceof ListNode);
        node.setNamedSorters(sorters);
        if (refresh) {
            await node.refresh(path);
        }
    }

    @Action
    async addNamedSorter<T extends keyof ED>(path: string, sorter: NamedSorterItem<ED, T>, refresh: boolean = false) {
        const node = this.findNode(path);
        assert (node instanceof ListNode);
        node.addNamedSorter(sorter);
        if (refresh) {
            await node.refresh(path);
        }
    }

    @Action
    async removeNamedSorter<T extends keyof ED>(path: string, sorter: NamedSorterItem<ED, T>, refresh: boolean = false) {
        const node = this.findNode(path);
        assert (node instanceof ListNode);
        node.removeNamedSorter(sorter);
        if (refresh) {
            await node.refresh(path);
        }
    }

    @Action
    async removeNamedSorterByName<T extends keyof ED>(path: string, name: string, refresh: boolean = false) {
        const node = this.findNode(path);
        assert (node instanceof ListNode);
        node.removeNamedSorterByName(name);
        if (refresh) {
            await node.refresh(path);
        }
    }

    async testAction(path: string, action: string, realId?: boolean) {
        const node = this.findNode(path);
        const operation = await node.composeOperation(action, realId);
        // 先在cache中尝试能否执行，如果权限上否决了在这里就失败
        if (operation instanceof Array) {
            for (const oper of operation) {
                await this.cache.operate(node.getEntity(), oper, path);
            }
        }
        else if (operation) {
            await this.cache.operate(node.getEntity(), operation, path);
        }
        else {
            assert(false);
        }
        return {
            node,
            operation,
        };
    }

    private async beforeExecute(node2: SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD>, action: string) {
        async function beNode(node: SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD>, action2?: string) {
            if (node.isDirty()) {
                const beforeExecuteFn = node.getBeforeExecute();
                if (beforeExecuteFn) {
                    await beforeExecuteFn(node.getUpdateData(), action2 || node.getAction());
                }
                if (node instanceof ListNode) {
                    for (const child of node.getChildren()) {
                        await beNode(child);
                    }
                }
                else {
                    for (const k in node.getChildren()) {
                        await beNode(node.getChildren()[k]);
                    }
                }
            }
        }
        await beNode(node2, action);
    }

    @Action
    async execute(path: string, action: string) {
        const { node, operation } = await this.testAction(path, action, true);

        await this.beforeExecute(node, action);
        await this.getAspectProxy().operate({
                entity: node.getEntity() as string,
                operation,
            }, path);

        // 清空缓存
        node.resetUpdateData();
    }
}

