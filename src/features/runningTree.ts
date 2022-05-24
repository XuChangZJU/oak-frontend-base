import assert from "assert";
import { assign, cloneDeep, keys, omit, pick, pull, set, unset } from "lodash";
import { combineFilters, contains } from "oak-domain/lib/store/filter";
import { judgeRelation } from "oak-domain/lib/store/relation";
import { EntityDict, Aspect, Context, DeduceUpdateOperation, StorageSchema, OpRecord, SelectRowShape, DeduceCreateOperation, DeduceOperation, UpdateOpResult, SelectOpResult } from "oak-domain/lib/types";
import { Action, Feature, Pagination } from "../initialize";
import { NamedFilterItem, NamedSorterItem } from "../types/NamedCondition";
import { generateMockId } from "../utils/mockId";
import { Cache } from './cache';

abstract class Node<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>> {
    protected entity: T;
    // protected fullPath: string;
    protected schema: StorageSchema<ED>;
    protected projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>);      // 只在Page层有
    protected parent?: Node<ED, keyof ED, Cxt, AD>;
    protected action?: ED[T]['Action'];
    protected dirty: boolean;
    protected updateData: DeduceUpdateOperation<ED[T]['OpSchema']>['data'];
    protected cache: Cache<ED, Cxt, AD>;
    protected refreshing: boolean;
    private beforeExecute?: (updateData: DeduceUpdateOperation<ED[T]['OpSchema']>['data'], action: ED[T]['Action']) => Promise<void>;
    private afterExecute?: (updateData: DeduceUpdateOperation<ED[T]['OpSchema']>['data'], action: ED[T]['Action']) => Promise<void>;

    abstract onCachSync(opRecords: OpRecord<ED>[]): Promise<void>;

    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, AD>,
        projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>),
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
        this.cache.bindOnSync(this.onCachSync);
    }

    getEntity() {
        return this.entity;
    }

    setUpdateData(attr: string, value: any) {
        this.setDirty();
        set(this.updateData, attr, value);
    }

    getUpdateData() {
        return this.updateData;
    }

    setMultiUpdateData(updateData: DeduceUpdateOperation<ED[T]['OpSchema']>['data']) {
        assign(this.updateData, updateData);
    }

    setDirty() {
        if (!this.dirty) {
            this.dirty = true;
            if (this.parent) {
                this.parent.setDirty();
            }
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
        return typeof this.projection === 'function' ? await this.projection() : this.projection;
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

    destroy() {
        this.cache.unbindOnSync(this.onCachSync);
    }

    protected judgeRelation(attr: string) {
        return judgeRelation(this.schema, this.entity, attr);
    }

    protected contains(filter: ED[T]['Selection']['filter'],  conditionalFilter: ED[T]['Selection']['filter']) {
        return contains(this.entity, this.schema, filter, conditionalFilter);
    }
}

const DEFAULT_PAGINATION: Pagination = {
    step: 20,
    append: true,
    indexFrom: 0,
    more: true,
}

class ListNode<ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>> extends Node<ED, T, Cxt, AD> {
    private children: SingleNode<ED, T, Cxt, AD>[];
    private newBorn: SingleNode<ED, T, Cxt, AD>[];    // 新插入的结点

    private filters: NamedFilterItem<ED, T>[];
    private sorters: NamedSorterItem<ED, T>[];
    private pagination: Pagination;
    private projectionShape: ED[T]['Selection']['data'];

    async onCachSync(records: OpRecord<ED>[]): Promise<void> {
        // 当相应的entity发生create和remove时，对相应的children进行更改。
    }

    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, AD>,
        projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>),
        projectionShape: ED[T]['Selection']['data'],
        parent?: Node<ED, keyof ED, Cxt, AD>,
        action?: ED[T]['Action'], updateData?: DeduceUpdateOperation<ED[T]['OpSchema']>['data'],
        filters?: NamedFilterItem<ED, T>[], sorters?: NamedSorterItem<ED, T>[],
        pagination?: Pagination) {
        super(entity, schema, cache, projection, parent, action, updateData);
        this.projectionShape = projectionShape;
        this.children = [];
        this.newBorn = [];
        this.filters = filters || [];
        this.sorters = sorters || [];
        this.pagination = pagination || DEFAULT_PAGINATION;
    }

    getChild(path: string): SingleNode<ED, T, Cxt, AD> {
        const idx = parseInt(path, 10);
        assert(typeof idx === 'number');
        return this.children[idx];
    }

    getChildren() {
        return this.children;
    }

    getNewBorn() {
        return this.newBorn;
    }

    /*  addChild(path: string, node: SingleNode<ED, T, Cxt, AD>) {
         const idx = parseInt(path, 10);
         assert(typeof idx === 'number');
         this.children[idx] = node;
     } */
    removeChild(path: string) {
        const idx = parseInt(path, 10);
        assert(typeof idx === 'number');
        this.children.splice(idx, 1);
    }

    setValue(value: SelectRowShape<ED[T]['OpSchema'], ED[T]['Selection']['data']>[]) {
        value.forEach(
            (ele, idx) => {
                if (this.children[idx]) {
                    this.children[idx].setValue(ele);
                }
                else {
                    const node = new SingleNode(this.entity, this.schema, this.cache, this.projection, this);
                    this.children[idx] = node;
                    node.setValue(ele);
                }
            }
        );
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

    getValue(): SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']>[] {
        const value = this.children.map(
            ele => ele.getValue()
        );
        return value;
    }

    getAction() {
        assert(this.dirty);
        return this.action || 'update';
    }

    async composeOperation(action?: string, realId?: boolean): Promise<DeduceOperation<ED[T]['Schema']> | DeduceOperation<ED[T]['Schema']>[] | undefined> {
        if (!this.isDirty()) {
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
        const result = await this.cache.get(entity, {
            data: proj as any,
            filter: filterss.length > 0 ? combineFilters(filterss) : undefined,
            sorter: sorterss,
            indexFrom: 0,
            count: step,
        }, scene);
        this.pagination.indexFrom = 0;
        this.pagination.more = ids.length === step;
        this.refreshing = false;

        this.setValue(result as any);
    }

    resetUpdateData() {
        this.updateData = {};
        // this.action = undefined;
        this.dirty = false;

        this.children.forEach(
            (ele) => ele.resetUpdateData()
        );
    }
}

class SingleNode<ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>> extends Node<ED, T, Cxt, AD> {
    private id?: string;
    private value?: SelectRowShape<ED[T]['OpSchema'], ED[T]['Selection']['data']>;

    private children: {
        [K: string]: SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD>;
    };

    async onCachSync(records: OpRecord<ED>[]): Promise<void> {
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
                        if (f && typeof f.id === )
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

    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, AD>,
        projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>),
        projectionShape: ED[T]['Selection']['data'],
        parent?: Node<ED, keyof ED, Cxt, AD>,
        action?: ED[T]['Action'], updateData?: DeduceUpdateOperation<ED[T]['OpSchema']>['data']) {
        super(entity, schema, cache, projection, parent, action, updateData);
        this.children = {};

        const ownKeys: string[] = [];
        keys(projectionShape).forEach(
            (attr) => {
                const rel = this.judgeRelation(attr);
                if (rel === 2) {
                    const node = new SingleNode(attr, this.schema, this.cache, projectionShape[attr], projectionShape[attr], this);
                    assign(this.children, {
                        [attr]: node,
                    });
                }
                else if (typeof rel === 'string') {
                    const node = new SingleNode(rel, this.schema, this.cache, projectionShape[attr], projectionShape[attr], this);
                    assign(this.children, {
                        [attr]: node,
                    });
                }
                else if (typeof rel === 'object' && rel instanceof Array) {
                    const { data, filter, sorter, indexFrom, count } = projectionShape[attr] as ED[keyof ED]['Selection'];
                    const node = new ListNode(rel[0], this.schema, this.cache, data, data, this);
                    if (filter) {
                        node.addNamedFilter({
                            filter,
                        });
                    }
                    if (sorter && sorter.length > 0) {
                        sorter.forEach(
                            ele => node.addNamedSorter({
                                sorter: ele
                            })
                        );
                    }
                    assign(this.children, {
                        [attr]: node,
                    });
                }
                else {
                    ownKeys.push(attr);
                }
            }
        );

        this.projection = pick(projectionShape, ownKeys);
    }

    getChild(path: string): SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD> {
        return this.children[path];
    }

    getChildren() {
        return this.children;
    }

    removeChild(path: string) {
        unset(this.children, path);
    }

    setValue(value: SelectRowShape<ED[T]['OpSchema'], ED[T]['Selection']['data']>) {
        for (const attr in this.children) {
            const node = this.children[attr];
            node.setValue(value[attr] as any);
            if (node instanceof ListNode) {
                const rel = this.judgeRelation(attr);
                assert(rel instanceof Array);
                const filter = rel[1] ? {
                    [rel[1]]: value.id!,
                } : {
                    entityId: value.id!,
                };

                node.addNamedFilter({
                    filter,
                });
            }
        }
        this.id = value.id as string;
        this.value = value;
    }

    getValue(): SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']> {
        const value = this.value ? cloneDeep(this.value) : {} as SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']>;

        for (const k in this.children) {
            assign(value, {
                [k]: this.children[k].getValue(),
            });
        }

        return value;
    }

    getAction() {
        return this.action || (this.id ? 'update' : 'create');
    }

    async composeOperation(action2?: string, realId?: boolean) {
        if (!action2 && !this.isDirty()) {
            return;
        }
        const action = action2 || this.getAction();

        const operation = action === 'create' ? {
            action: 'create',
            data: assign({}, this.updateData, { id: realId ? await generateNewId() : generateMockId() }),
        } as DeduceCreateOperation<ED[T]['Schema']> : {
            action,
            data: cloneDeep(this.updateData),
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

    async refresh(scene: string) {
        const projection = await this.getProjection();
        if (this.id) {
            this.refreshing = true;
            await this.cache.refresh(this.entity, {
                data: projection,
                filter: {
                    id: this.id,
                },
            } as any, scene);
            this.refreshing = false;

            const value = this.cache.get(this.entity, {
                data: projection,
                filter: {
                    id: this.id,
                },
            } as any, scene);
            this.setValue(value as any);
        }
    }

    resetUpdateData() {
        this.updateData = {};
        // this.action = undefined;
        this.dirty = false;

        for (const attr in this.children) {
            this.children[attr].resetUpdateData();
        }
    }
}

export type CreateNodeOptions<ED extends EntityDict, T extends keyof ED> = {
    path: string;
    parent?: string;
    entity: T;
    isList?: boolean;
    isPicker?: boolean;
    projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>);
    pagination?: Pagination;
    filters?: NamedFilterItem<ED, T>[];
    sorters?: NamedSorterItem<ED, T>[];
    action?: ED[T]['Action'];
    id?: string;
    ids?: string[];
    updateData?: DeduceUpdateOperation<ED[T]['OpSchema']>['data'];
    beforeExecute?: (updateData: DeduceUpdateOperation<ED[T]['OpSchema']>['data'], action: ED[T]['Action']) => Promise<void>;
    afterExecute?: (updateData: DeduceUpdateOperation<ED[T]['OpSchema']>['data'], action: ED[T]['Action']) => Promise<void>;
};

export class RunningTree<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>> extends Feature<ED, Cxt, AD> {
    private cache: Cache<ED, Cxt, AD>;
    private schema?: StorageSchema<ED>;
    private root: Record<string, SingleNode<ED,
        keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD>>;

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
        const parentNode = parent ? this.findNode(parent) : undefined;
        const projectionShape = typeof projection === 'function' ? await projection() : projection;
        if (isList) {
            node = new ListNode<ED, T, Cxt, AD>(entity, this.schema!, this.cache, projection, projectionShape, parentNode, action, updateData, filters, sorters, pagination);
        }
        else {
            node = new SingleNode<ED, T, Cxt, AD>(entity, this.schema!, this.cache, projection, projectionShape, parentNode, action, updateData);
        }
        if (parentNode) {
            // todo，这里有几种情况，待处理
        }

        if (action) {
            node.setAction(action);
        }
        if (updateData) {
            node.setMultiUpdateData(updateData);
        }
        if (beforeExecute) {
            node.setBeforeExecute(beforeExecute);
        }
        if (afterExecute) {
            node.setAfterExecute(afterExecute);
        }
        return node;
    }

    private findNode(path: string) {
        const paths = path.split('.');
        let node = this.root[paths[0]];
        let iter = 1;
        while (iter < paths.length && node) {
            const childPath = paths[iter];
            iter++;
            node = node.getChild(childPath)!;
        }
        return node;
    }

    destroyNode(path: string) {
        const node = this.findNode(path);
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
        entity: T, value: SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']> | SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']>[],
        operation: DeduceOperation<ED[T]['Schema']> | DeduceOperation<ED[T]['Schema']>[],
        projection: ED[T]['Selection']['data'],
        scene: string): Promise<SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']> | SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']>[] | undefined> {

        if (operation instanceof Array) {
            assert(value instanceof Array);
            for (const action of operation) {
                switch (action.action) {
                    case 'create': {
                        value.push(await this.applyOperation(entity, {} as any, action, projection, scene) as SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']>);
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
                ) as SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']>[];
            }
            else {
                const { action, data } = operation;
                const applyUpsert = async (row: SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']>, actionData: DeduceUpdateOperation<ED[T]['Schema']>['data']) => {
                    for (const attr in actionData) {
                        const relation = judgeRelation(this.schema!, entity, attr);
                        if (relation === 1) {
                            set(row, attr, actionData[attr]);
                        }
                        else if (relation === 2) {
                            // 基于entity/entityId的多对一
                            if (projection[attr]) {
                                set(row, attr, await this.applyOperation(attr, row[attr] as SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']>, actionData[attr]!, projection[attr]!, scene));
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
                                set(row, attr, await this.applyOperation(relation, row[attr] as SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']>, actionData[attr]!, projection[attr]!, scene));
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
                                set(row, attr, await this.applyOperation(relation[0], row[attr] as SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']>, actionData[attr]!, projection[attr]!['data'], scene));
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
                        } as SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']>;
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

    async getValue(path: string) {
        const node = this.findNode(path);
        let value = await node.getValue();

        if (node.isDirty()) {
            const operation = await node.composeOperation();
            const projection = await node.getProjection();
            return (await this.applyOperation(node.getEntity(), cloneDeep(value), operation!, projection, path));
        }

        return value;
    }

    isDirty(path: string) {
        const node = this.findNode(path);
        return node.isDirty();
    }

    private async setUpdateDataInner(path: string, attr: string, value: any) {
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
                node = node.getChild(split)!;
                idx++;
            }
        }
    }

    @Action
    async setUpdateData(path: string, attr: string, value: any) {
        await this.setUpdateDataInner(path, attr, value);
    }

    async setAction<T extends keyof ED>(path: string, action: ED[T]['Action']) {
        const node = this.findNode(path);
        node.setAction(action);
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
    }

    async getNamedFilters<T extends keyof ED>(path: string) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.getNamedFilters();
    }

    async getNamedFilterByName<T extends keyof ED>(path: string, name: string) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.getNamedFilterByName(name);
    }

    @Action
    async setNamedFilters<T extends keyof ED>(path: string, filters: NamedFilterItem<ED, T>[], refresh: boolean = true) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.setNamedFilters(filters);
        if (refresh) {
            await node.refresh(path);
        }
    }

    @Action
    async addNamedFilter<T extends keyof ED>(path: string, filter: NamedFilterItem<ED, T>, refresh: boolean = false) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.addNamedFilter(filter);
        if (refresh) {
            await node.refresh(path);
        }
    }

    @Action
    async removeNamedFilter<T extends keyof ED>(path: string, filter: NamedFilterItem<ED, T>, refresh: boolean = false) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.removeNamedFilter(filter);
        if (refresh) {
            await node.refresh(path);
        }
    }

    @Action
    async removeNamedFilterByName<T extends keyof ED>(path: string, name: string, refresh: boolean = false) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.removeNamedFilterByName(name);
        if (refresh) {
            await node.refresh(path);
        }
    }

    async getNamedSorters<T extends keyof ED>(path: string) {
        const node = await this.findNode(path);
        assert(node instanceof ListNode);
        return node.getNamedSorters();
    }

    async getNamedSorterByName<T extends keyof ED>(path: string, name: string) {
        const node = await this.findNode(path);
        assert(node instanceof ListNode);
        return node.getNamedSorterByName(name);
    }

    @Action
    async setNamedSorters<T extends keyof ED>(path: string, sorters: NamedSorterItem<ED, T>[], refresh: boolean = true) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.setNamedSorters(sorters);
        if (refresh) {
            await node.refresh(path);
        }
    }

    @Action
    async addNamedSorter<T extends keyof ED>(path: string, sorter: NamedSorterItem<ED, T>, refresh: boolean = false) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.addNamedSorter(sorter);
        if (refresh) {
            await node.refresh(path);
        }
    }

    @Action
    async removeNamedSorter<T extends keyof ED>(path: string, sorter: NamedSorterItem<ED, T>, refresh: boolean = false) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.removeNamedSorter(sorter);
        if (refresh) {
            await node.refresh(path);
        }
    }

    @Action
    async removeNamedSorterByName<T extends keyof ED>(path: string, name: string, refresh: boolean = false) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
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
                    for (const child of node.getNewBorn()) {
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