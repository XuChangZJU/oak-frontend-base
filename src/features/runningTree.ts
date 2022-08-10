import { assert } from 'oak-domain/lib/utils/assert';
import { cloneDeep, pull, set, unset } from "oak-domain/lib/utils/lodash";
import { combineFilters, contains, repel } from "oak-domain/lib/store/filter";
import { judgeRelation } from "oak-domain/lib/store/relation";
import { EntityDict, Aspect, Context, DeduceUpdateOperation, StorageSchema, OpRecord, SelectRowShape, DeduceCreateOperation, DeduceOperation, UpdateOpResult, SelectOpResult, CreateOpResult, RemoveOpResult, DeduceSorterItem, AspectWrapper } from "oak-domain/lib/types";
import { CommonAspectDict } from 'oak-common-aspect';

import { NamedFilterItem, NamedSorterItem } from "../types/NamedCondition";
import { generateMockId } from "../utils/mockId";
import { Cache } from './cache';
import { Pagination } from '../types/Pagination';
import { Action, Feature } from '../types/Feature';

abstract class Node<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> {
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

    abstract onCacheSync(opRecords: OpRecord<ED>[]): Promise<void>;

    abstract refreshValue(): void;

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
        this.cache.bindOnSync((records) => this.onCacheSync(records));
    }

    getEntity() {
        return this.entity;
    }

    protected abstract setForeignKey(attr: string, entity: keyof ED, id: string | undefined): void;
    
    private setLocalUpdateData(attr: string, value: any) {
        const rel = this.judgeRelation(attr);

        let subEntity: string | undefined = undefined;
        if (rel === 2) {
            if (value) {
                Object.assign(this.updateData, {
                    entity: attr,
                    entityId: value,
                });
            }
            else {
                Object.assign(this.updateData, {
                    entity: undefined,
                    entityId: undefined,
                });
            }
            subEntity = attr;
        }
        else if (typeof rel === 'string'){
            if (value) {
                Object.assign(this.updateData, {
                    [`${attr}Id`]: value,
                });
            }
            else {
                Object.assign(this.updateData, {
                    [`${attr}Id`]: undefined,
                });
            }
            subEntity = rel;
        }
        else {
            assert(rel === 1);
            Object.assign(this.updateData, {
                [attr]: value,
            });
        }
        if (subEntity) {
            // 说明是更新了外键
            this.setForeignKey(attr, subEntity, value);
        }
    }

    setUpdateData(attr: string, value: any) {
        this.setLocalUpdateData(attr, value);
        this.setDirty();
        this.refreshValue();
    }

    getUpdateData() {
        return this.updateData;
    }

    setMultiUpdateData(updateData: DeduceUpdateOperation<ED[T]['OpSchema']>['data']) {
        for (const k in updateData) {
            this.setLocalUpdateData(k, updateData[k]);
        }
        this.setDirty();
        this.refreshValue();
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
        this.refreshValue();
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
        this.cache.unbindOnSync(this.onCacheSync);
    }

    protected judgeRelation(attr: string) {
        return judgeRelation(this.schema, this.entity, attr);
    }

    protected contains(filter: ED[T]['Selection']['filter'], conditionalFilter: ED[T]['Selection']['filter']) {
        return contains(this.entity, this.schema, filter, conditionalFilter);
    }

    protected repel(filter1: ED[T]['Selection']['filter'], filter2: ED[T]['Selection']['filter']) {
        return repel(this.entity, this.schema, filter1, filter2);
    }
}

const DEFAULT_PAGINATION: Pagination = {
    currentPage: 1,
    pageSize: 20,
    append: true,
    more: true,
}

class ListNode<
    ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends CommonAspectDict<ED, Cxt>
> extends Node<ED, T, Cxt, AD> {
    private children: SingleNode<ED, T, Cxt, AD>[];
    private newBorn: SingleNode<ED, T, Cxt, AD>[]; // 新插入的结点

    private filters: NamedFilterItem<ED, T>[];
    private sorters: NamedSorterItem<ED, T>[];
    private pagination: Pagination;
    private projectionShape: ED[T]['Selection']['data'];

    async onCacheSync(records: OpRecord<ED>[]): Promise<void> {
        if (this.refreshing) {
            return;
        }
        const createdIds: string[] = [];
        let removeIds = false;
        for (const record of records) {
            const { a } = record;
            switch (a) {
                case 'c': {
                    const { e, d } = record as CreateOpResult<ED, T>;
                    if (e === this.entity) {
                        if (d instanceof Array) {
                            d.forEach((dd) => {
                                const { id } = dd;
                                createdIds.push(id);
                            });
                        } else {
                            const { id } = d;
                            createdIds.push(id);
                        }
                    }
                    break;
                }
                case 'r': {
                    const { e, f } = record as RemoveOpResult<ED, T>;
                    if (e === this.entity) {
                        // todo 这里更严格应该考虑f对当前value有无影响，同上面一样这里可能没有完整的供f用的cache数据
                        removeIds = true;
                    }
                    break;
                }
                default: {
                    break;
                }
            }
        }
        if (createdIds.length > 0 || removeIds) {
            const currentIds = this.children
                .map((ele) => ele.getFreshValue()?.id)
                .filter((ele) => !!ele) as string[];

            const filter = combineFilters([
                {
                    id: {
                        $in: currentIds.concat(createdIds),
                    },
                },
                ...this.filters.map((ele) => ele.filter),
            ]);

            const sorterss = (
                await Promise.all(
                    this.sorters.map(async (ele) => {
                        const { sorter } = ele;
                        if (typeof sorter === 'function') {
                            return await sorter();
                        } else {
                            return sorter;
                        }
                    })
                )
            ).filter((ele) => !!ele) as DeduceSorterItem<ED[T]['Schema']>[];
            const projection =
                typeof this.projection === 'function'
                    ? await this.projection()
                    : this.projection;
            const value = await this.cache.get(
                this.entity,
                {
                    data: projection as any,
                    filter,
                    sorter: sorterss,
                },
                { obscure: true }
            );
            this.setValue(value);
        }
    }

    async setForeignKey(
        attr: string,
        entity: keyof ED,
        id: string | undefined
    ) {
        // todo 对list的update外键的情况等遇到了再写 by Xc
    }

    refreshValue(): void {}

    constructor(
        entity: T,
        schema: StorageSchema<ED>,
        cache: Cache<ED, Cxt, AD>,
        projection:
            | ED[T]['Selection']['data']
            | (() => Promise<ED[T]['Selection']['data']>),
        projectionShape: ED[T]['Selection']['data'],
        parent?: Node<ED, keyof ED, Cxt, AD>,
        action?: ED[T]['Action'],
        updateData?: DeduceUpdateOperation<ED[T]['OpSchema']>['data'],
        filters?: NamedFilterItem<ED, T>[],
        sorters?: NamedSorterItem<ED, T>[],
        pagination?: Pagination
    ) {
        super(entity, schema, cache, projection, parent, action, updateData);
        this.projectionShape = projectionShape;
        this.children = [];
        this.newBorn = [];
        this.filters = filters || [];
        this.sorters = sorters || [];
        this.pagination = pagination || DEFAULT_PAGINATION;
    }

    getPagination() {
        return this.pagination;
    }

    setPagination(pagination: Pagination) {
        const newPagination = Object.assign(this.pagination, pagination);
        this.pagination = newPagination;
    }

    getChild(
        path: string,
        newBorn?: true
    ): SingleNode<ED, T, Cxt, AD> | undefined {
        const idx = parseInt(path, 10);
        assert(typeof idx === 'number');
        if (idx < this.children.length) {
            return this.children[idx];
        } else {
            const idx2 = idx - this.children.length;
            // assert(idx2 < this.newBorn.length);  // 在删除结点时可能还是会跑到
            if (this.newBorn[idx2]) {
                return this.newBorn[idx2];
            } else if (newBorn) {
                this.newBorn[idx2] = new SingleNode(
                    this.entity,
                    this.schema,
                    this.cache,
                    this.projection,
                    this.projectionShape,
                    this,
                    'create'
                );
                return this.newBorn[idx2];
            }
        }
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

    setValue(
        value:
            | SelectRowShape<ED[T]['OpSchema'], ED[T]['Selection']['data']>[]
            | undefined
    ) {
        this.children = [];
        value &&
            value.forEach((ele, idx) => {
                const node = new SingleNode(
                    this.entity,
                    this.schema,
                    this.cache,
                    this.projection,
                    this.projectionShape,
                    this
                );
                this.children[idx] = node;
                node.setValue(ele);
            });
    }

    private appendValue(
        value:
            | SelectRowShape<ED[T]['OpSchema'], ED[T]['Selection']['data']>[]
            | undefined
    ) {
        value &&
            value.forEach((ele, idx) => {
                const node = new SingleNode(
                    this.entity,
                    this.schema,
                    this.cache,
                    this.projection,
                    this.projectionShape,
                    this
                );
                this.children[this.children.length + idx] = node;
                node.setValue(ele);
            });
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
        const fIndex = this.filters.findIndex(
            (ele) => filter['#name'] && ele['#name'] === filter['#name']
        );
        if (fIndex >= 0) {
            this.filters.splice(fIndex, 1, filter);
        } else {
            this.filters.push(filter);
        }
    }

    removeNamedFilter(filter: NamedFilterItem<ED, T>) {
        // filter 根据#name查找
        const fIndex = this.filters.findIndex(
            (ele) => filter['#name'] && ele['#name'] === filter['#name']
        );
        if (fIndex >= 0) {
            this.filters.splice(fIndex, 1);
        }
    }

    removeNamedFilterByName(name: string) {
        // filter 根据#name查找
        const fIndex = this.filters.findIndex((ele) => ele['#name'] === name);
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
        const fIndex = this.sorters.findIndex(
            (ele) => sorter['#name'] && ele['#name'] === sorter['#name']
        );
        if (fIndex >= 0) {
            this.sorters.splice(fIndex, 1, sorter);
        } else {
            this.sorters.push(sorter);
        }
    }

    removeNamedSorter(sorter: NamedSorterItem<ED, T>) {
        // sorter 根据#name查找
        const fIndex = this.sorters.findIndex(
            (ele) => sorter['#name'] && ele['#name'] === sorter['#name']
        );
        if (fIndex >= 0) {
            this.sorters.splice(fIndex, 1);
        }
    }

    removeNamedSorterByName(name: string) {
        // sorter 根据#name查找
        const fIndex = this.sorters.findIndex((ele) => ele['#name'] === name);
        if (fIndex >= 0) {
            this.sorters.splice(fIndex, 1);
        }
    }

    getFreshValue(): Array<
        SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']> | undefined
    > {
        const value = this.children
            .map((ele) => ele.getFreshValue())
            .concat(this.newBorn.map((ele) => ele.getFreshValue()))
            .filter((ele) => !!ele);
        if (this.isDirty()) {
            const action = this.action || 'update';

            if (action === 'remove') {
                return []; // 这个可能跑到吗？
            }
            return value.map((ele) => Object.assign({}, ele, this.updateData));
        } else {
            return value;
        }
    }

    getAction() {
        assert(this.dirty);
        return this.action || 'update';
    }

    async composeOperation(
        action?: string,
        execute?: boolean
    ): Promise<
        | DeduceOperation<ED[T]['Schema']>
        | DeduceOperation<ED[T]['Schema']>[]
        | undefined
    > {
        if (!this.isDirty()) {
            if (action) {
                assert(action === 'create'); // 在list页面测试create是否允许？
                return {
                    action,
                    data: {},
                };
            }
            return;
        }

        // todo 这里的逻辑还没有测试过，后面还有ids选择的Case
        if (this.action) {
            return {
                action: this.getAction(),
                data: cloneDeep(this.updateData),
                filter: combineFilters(this.filters.map((ele) => ele.filter)),
            } as DeduceUpdateOperation<ED[T]['Schema']>; // todo 这里以后再增加对选中id的过滤
        }
        const actions = [];
        for (const node of this.children) {
            const subAction = await node.composeOperation(undefined, execute);
            if (subAction) {
                // 如果有action，这里用action代替默认的update。userRelation/onEntity页面可以测到
                if (action) {
                    Object.assign(subAction, {
                        action,
                    });
                }
                actions.push(subAction);
            }
        }
        for (const node of this.newBorn) {
            const subAction = await node.composeOperation(undefined, execute);
            if (subAction) {
                assert(!action || action === 'update'); // 如果还有新建，应该不会有其它类型的action
                actions.push(subAction);
            }
        }
        return actions;
    }

    async refresh() {
        const { filters, sorters, pagination, entity } = this;
        const { pageSize } = pagination;
        const proj = await this.getProjection();
        assert(proj);
        const sorterArr = (
            await Promise.all(
                sorters.map(async (ele) => {
                    const { sorter } = ele;
                    if (typeof sorter === 'function') {
                        return await sorter();
                    } else {
                        return sorter;
                    }
                })
            )
        ).filter((ele) => !!ele) as DeduceSorterItem<ED[T]['Schema']>[];
        const filterArr = await Promise.all(
            filters.map(async (ele) => {
                const { filter } = ele;
                if (typeof filter === 'function') {
                    return await filter();
                }
                return filter;
            })
        );
        this.refreshing = true;
        const currentPage = 1;
        // todo 什么时候该传getCount参数 (老王)
        const { data, count } = await this.cache.refresh(
            entity,
            {
                data: proj as any,
                filter:
                    filterArr.length > 0
                        ? combineFilters(filterArr.filter((ele) => !!ele))
                        : undefined,
                sorter: sorterArr,
                indexFrom: (currentPage - 1) * pageSize,
                count: pageSize,
            },
            undefined,
            true
        );
        this.pagination.currentPage = currentPage;
        this.pagination.more = data.length === pageSize;
        this.refreshing = false;
        this.pagination.total = count;

        this.setValue(data);
    }

    async loadMore() {
        const { filters, sorters, pagination, entity } = this;
        const { pageSize, more, currentPage } = pagination;
        if (!more) {
            return;
        }
        const proj = await this.getProjection();
        assert(proj);
        const sorterArr = (
            await Promise.all(
                sorters.map(async (ele) => {
                    const { sorter } = ele;
                    if (typeof sorter === 'function') {
                        return await sorter();
                    } else {
                        return sorter;
                    }
                })
            )
        ).filter((ele) => !!ele) as DeduceSorterItem<ED[T]['Schema']>[];
        const filterArr = await Promise.all(
            filters.map(async (ele) => {
                const { filter } = ele;
                if (typeof filter === 'function') {
                    return await filter();
                }
                return filter;
            })
        );
        this.refreshing = true;
        const currentPage2 = currentPage + 1;
        const { data } = await this.cache.refresh(entity, {
            data: proj as any,
            filter:
                filterArr.length > 0
                    ? combineFilters(filterArr.filter((ele) => !!ele))
                    : undefined,
            sorter: sorterArr,
            indexFrom: (currentPage2 - 1) * pageSize,
            count: pageSize,
        });
        this.pagination.currentPage = currentPage2;
        this.pagination.more = data.length === pageSize;
        this.refreshing = false;

        this.appendValue(data);
    }

    async setCurrentPage<T extends keyof ED>(currentPage: number, append?: boolean) {
        const { filters, sorters, pagination, entity } = this;
        const { pageSize } = pagination;
        const proj = await this.getProjection();
        assert(proj);
        const sorterArr = (
            await Promise.all(
                sorters.map(async (ele) => {
                    const { sorter } = ele;
                    if (typeof sorter === 'function') {
                        return await sorter();
                    } else {
                        return sorter;
                    }
                })
            )
        ).filter((ele) => !!ele) as DeduceSorterItem<ED[T]['Schema']>[];
        const filterArr = await Promise.all(
            filters.map(async (ele) => {
                const { filter } = ele;
                if (typeof filter === 'function') {
                    return await filter();
                }
                return filter;
            })
        );
        this.refreshing = true;
        const { data } = await this.cache.refresh(entity, {
            data: proj as any,
            filter:
                filterArr.length > 0
                    ? combineFilters(filterArr.filter((ele) => !!ele))
                    : undefined,
            sorter: sorterArr,
            indexFrom: (currentPage - 1) * pageSize,
            count: pageSize,
        });
        this.pagination.currentPage = currentPage;
        this.pagination.more = data.length === pageSize;
        this.refreshing = false;

        if (append) {
            this.appendValue(data);
        } else {
            this.setValue(data);
        }
    }

    resetUpdateData() {
        this.updateData = {};
        this.action = undefined;
        this.dirty = false;

        this.children.forEach((ele) => ele.resetUpdateData());
        this.newBorn = [];
    }

    pushNewBorn(
        options: Pick<
            CreateNodeOptions<ED, T>,
            'updateData' | 'beforeExecute' | 'afterExecute'
        >
    ) {
        const { updateData, beforeExecute, afterExecute } = options;
        const node = new SingleNode(
            this.entity,
            this.schema,
            this.cache,
            this.projection,
            this.projectionShape,
            this,
            'create'
        );

        if (updateData) {
            node.setMultiUpdateData(updateData);
        }
        if (beforeExecute) {
            node.setBeforeExecute(beforeExecute);
        }
        if (afterExecute) {
            node.setAfterExecute(afterExecute);
        }
        this.newBorn.push(node);
        return node;
    }

    popNewBorn(path: string) {
        const index = parseInt(path, 10);
        assert(typeof index === 'number' && index >= this.children.length);
        const index2 = index - this.children.length;
        assert(index2 < this.newBorn.length);
        this.newBorn.splice(index2, 1);
    }

    /**
     * 判断传入的updateData和当前的某项是否相等
     * @param from 当前项
     * @param to 传入项
     * @returns
     */
    private judgeTheSame(
        from: ED[T]['Update']['data'] | undefined,
        to: ED[T]['Update']['data']
    ) {
        if (!from) {
            return false;
        }
        for (const attr in to) {
            if (from[attr] !== to[attr]) {
                return false;
            }
        }
        return true;
    }

    // 将本结点的freshValue更正成data的要求，其中updateData要和现有的数据去重
    setUniqueChildren(
        data: Pick<
            CreateNodeOptions<ED, T>,
            'updateData' | 'beforeExecute' | 'afterExecute'
        >[]
    ) {
        const convertForeignKey = (
            origin: ED[T]['Update']['data']
        ): ED[T]['Update']['data'] => {
            const result: ED[T]['Update']['data'] = {};
            for (const attr in origin) {
                const rel = this.judgeRelation(attr);
                if (rel === 2) {
                    Object.assign(result, {
                        entity: attr,
                        entityId: origin[attr],
                    });
                } else if (typeof rel === 'string') {
                    Object.assign(result, {
                        [`${attr}Id`]: origin[attr],
                    });
                } else {
                    assert(rel === 1);
                    Object.assign(result, {
                        [attr]: origin[attr],
                    });
                }
            }

            return result;
        };
        const uds = [];
        for (const dt of data) {
            let existed = false;
            const { updateData } = dt;
            const ud2 = convertForeignKey(updateData!);
            uds.push(ud2);
            for (const child of this.children) {
                if (this.judgeTheSame(child.getFreshValue(true), ud2)) {
                    if (child.getAction() === 'remove') {
                        // 这里把updateData全干掉了，如果本身是先update再remove或许会有问题 by Xc
                        child.resetUpdateData();
                    }
                    existed = true;
                    break;
                }
            }
            for (const child of this.newBorn) {
                if (this.judgeTheSame(child.getFreshValue(true), ud2)) {
                    existed = true;
                    break;
                }
            }
            if (!existed) {
                // 如果不存在，就生成newBorn
                this.pushNewBorn(dt);
            }
        }

        for (const child of this.children) {
            let included = false;
            for (const ud of uds) {
                if (this.judgeTheSame(child.getFreshValue(true), ud)) {
                    included = true;
                    break;
                }
            }
            if (!included) {
                child.setAction('remove');
            }
        }

        const newBorn2: SingleNode<ED, T, Cxt, AD>[] = [];
        for (const child of this.newBorn) {
            for (const ud of uds) {
                if (this.judgeTheSame(child.getFreshValue(true), ud)) {
                    newBorn2.push(child);
                    break;
                }
            }
        }
        this.newBorn = newBorn2;
    }

    toggleChild(
        data: Pick<
            CreateNodeOptions<ED, T>,
            'updateData' | 'beforeExecute' | 'afterExecute'
        >,
        checked: boolean
    ) {
        const { updateData } = data;
        if (checked) {
            // 如果是选中，这里要处理一种例外就是之前被删除
            for (const child of this.children) {
                if (this.judgeTheSame(child.getFreshValue(true), updateData!)) {
                    assert(child.getAction() === 'remove');
                    // 这里把updateData全干掉了，如果本身是先update再remove或许会有问题 by Xc
                    child.resetUpdateData();
                    return;
                }
            }
            this.pushNewBorn(data);
        } else {
            for (const child of this.children) {
                if (this.judgeTheSame(child.getFreshValue(true), updateData!)) {
                    assert(child.getAction() !== 'remove');
                    // 这里把updateData全干掉了，如果本身是先update再remove或许会有问题 by Xc
                    child.setAction('remove');
                    return;
                }
            }
            for (const child of this.newBorn) {
                if (this.judgeTheSame(child.getFreshValue(true), updateData!)) {
                    pull(this.newBorn, child);
                    return;
                }
            }

            assert(false, 'toggle动作的remove对象没有找到对应的子结点');
        }
    }
}

class SingleNode<ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends CommonAspectDict<ED, Cxt>> extends Node<ED, T, Cxt, AD> {
    private id?: string;
    private value?: SelectRowShape<ED[T]['OpSchema'], ED[T]['Selection']['data']>;
    private freshValue?: SelectRowShape<ED[T]['OpSchema'], ED[T]['Selection']['data']>;

    private children: {
        [K: string]: SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD>;
    };

    async onCacheSync(records: OpRecord<ED>[]): Promise<void> {
        let needReGetValue = false;
        if (this.refreshing || !this.id) {
            return;
        }
        for (const record of records) {
            if (needReGetValue === true) {
                break;
            }
            const { a } = record;
            switch (a) {
                case 'c': {
                    const { e, d } = record as CreateOpResult<ED, T>;
                    if (e === this.entity) {
                        if (d instanceof Array) {
                            if (d.find(
                                dd => dd.id === this.id
                            )) {
                                needReGetValue = true;                     
                            }
                        }
                        else if (d.id === this.id){
                            // this.id应该是通过父结点来设置到子结点上
                            needReGetValue = true;                            
                        }
                    }
                    break;
                }
                case 'r':
                case 'u': {
                    const { e, f } = record as UpdateOpResult<ED, T>;
                    if (e === this.entity) {
                        // todo 这里更严格应该考虑f对当前filter有无影响，同上面一样这里可能没有完整的供f用的cache数据
                        if (!this.repel(f || {}, {
                            id: this.id,
                        })) {
                            needReGetValue = true;
                        }
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
            const projection = typeof this.projection === 'function' ? await this.projection() : this.projection;
            const [value] = await this.cache.get(this.entity, {
                data: projection,
                filter: {
                    id: this.id,
                }
            } as any);
            this.setValue(value);
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
        Object.keys(projectionShape).forEach(
            (attr) => {
                const proj = typeof projection === 'function' ? async () => {
                    const projection2 = await projection();
                    return projection2[attr];
                } : projection[attr];
                const rel = this.judgeRelation(attr);
                if (rel === 2) {
                    const node = new SingleNode(attr, this.schema, this.cache, proj, projectionShape[attr], this);
                    Object.assign(this.children, {
                        [attr]: node,
                    });
                }
                else if (typeof rel === 'string') {
                    const node = new SingleNode(rel, this.schema, this.cache, proj, projectionShape[attr], this);
                    Object.assign(this.children, {
                        [attr]: node,
                    });
                }
                else if (typeof rel === 'object' && rel instanceof Array) {
                    const { data: subProjectionShape } = projectionShape[attr] as ED[keyof ED]['Selection'];
                    const proj = typeof projection === 'function' ? async () => {
                        const projection2 = await projection();
                        return projection2[attr].data;
                    } : projection[attr].data;
                    const filter = typeof projection === 'function' ? async () => {
                        const projection2 = await projection();
                        return projection2[attr].filter;
                    } : projection[attr].filter;
                    const sorters = typeof projection === 'function' ? async () => {
                        const projection2 = await projection();
                        return projection2[attr].sorter;
                    } : projection[attr].sorter;
                    const node = new ListNode(rel[0], this.schema, this.cache, proj, subProjectionShape, this);
                    if (filter) {
                        node.addNamedFilter({
                            filter,
                        });
                    }
                    if (sorters && sorters instanceof Array) {
                        // todo 没有处理projection是一个function的case
                        sorters.forEach(
                            ele => node.addNamedSorter({
                                sorter: ele
                            })
                        );
                    }
                    Object.assign(this.children, {
                        [attr]: node,
                    });
                }
                else {
                    ownKeys.push(attr);
                }
            }
        );
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

    refreshValue() {
        const action = this.action || (this.isDirty() ? 'update' : '');
        if (!action) {
            this.freshValue = this.value;
        }
        else {
            if (action === 'remove') {
                this.freshValue = undefined;
            }
            else if (action === 'create') {
                this.freshValue = Object.assign({
                    id: generateMockId(),
                }, this.value, this.updateData);
            }
            else {
                this.freshValue = Object.assign({}, this.value, this.updateData);
            }
        }
    }

    setValue(value: SelectRowShape<ED[T]['OpSchema'], ED[T]['Selection']['data']> | undefined) {
        for (const attr in this.children) {
            const node = this.children[attr];
            if (value && value[attr]) {
                node.setValue(value[attr] as any);
                if (node instanceof ListNode) {
                    const rel = this.judgeRelation(attr);
                    assert(rel instanceof Array);
                    const filter = rel[1] ? {
                        [rel[1]]: value.id!,
                    } : {
                        entityId: value.id!,
                    };

                    node.removeNamedFilterByName('inherent:parentId');
                    node.addNamedFilter({
                        filter,
                        "#name": 'inherent:parentId',
                    });
                }
            }
            else {
                node.setValue(undefined);
            }
        }
        this.id = value && value.id as string;
        this.value = value;
        this.refreshValue();
    }

    getFreshValue(ignoreRemoved?: boolean) {
        if (ignoreRemoved) {
            return Object.assign({}, this.value, this.updateData);
        }
        const freshValue = this.freshValue && cloneDeep(this.freshValue) as SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']>;
        if (freshValue) {
            for (const k in this.children) {
                Object.assign(freshValue, {
                    [k]: this.children[k].getFreshValue(),
                });
            }
        }

        return freshValue;
    }

    getAction() {
        return this.action || (this.id ? 'update' : 'create');
    }

    async composeOperation(action2?: string, execute?: boolean) {
        if (!action2 && !this.isDirty()) {
            return;
        }
        const action = action2 || this.getAction();

        const operation = action === 'create' ? {
            action: 'create',
            data: Object.assign({}, this.updateData, { id: execute ? await generateNewId() : generateMockId() }),
        } as DeduceCreateOperation<ED[T]['Schema']> : {
            action,
            data: cloneDeep(this.updateData),
            filter: {
                id: this.id!,
            },
        } as DeduceUpdateOperation<ED[T]['Schema']>;

        for (const attr in this.children) {
            const subAction = await this.children[attr]!.composeOperation(undefined, execute);
            if (subAction) {
                Object.assign(operation.data, {
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
            const { data: [value] } = await this.cache.refresh(this.entity, {
                data: projection,
                filter: {
                    id: this.id,
                },
            } as any);
            this.refreshing = false;
            this.setValue(value);
        }
    }

    resetUpdateData(attrs?: string[]) {
        const attrsReset = attrs || Object.keys(this.updateData);
        for (const attr in this.children) {
            const rel = this.judgeRelation(attr);
            if (rel === 2) {
                if (attrsReset.includes('entityId')) {
                    (<SingleNode<ED, keyof ED, Cxt, AD>>this.children[attr]).setValue(this.value && this.value[attr] as any);
                }
            }
            else if (typeof rel === 'string') {
                if (attrsReset.includes(`${attr}Id`)) {
                    (<SingleNode<ED, keyof ED, Cxt, AD>>this.children[attr]).setValue(this.value && this.value[attr] as any);
                }
            }
            else if (typeof rel === 'object') {
                assert(!attrsReset.includes(attr));
            }
            this.children[attr].resetUpdateData();
        }
        unset(this.updateData, attrsReset);
        // this.action = undefined;
        if (!attrs) {
            this.dirty = false;
            this.action = undefined;
        }

        this.refreshValue();
    }

    async setForeignKey(attr: string, entity: keyof ED, id: string | undefined) {
        // 如果修改了外键且对应的外键上有子结点，在这里把子结点的value更新掉
        if (this.children[attr]) {
            const proj = typeof this.projection === 'function' ? await this.projection() : this.projection;
            const subProj = proj[attr];
            const newId = id || this.value?.id;
            const [value] =  newId ? await this.cache.get(entity, {
                data: subProj,
                filter: {
                    id: newId,
                } as any,
            }) : [undefined];
            (<SingleNode<ED, keyof ED, Cxt, AD>>this.children[attr]).setValue(value);
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

export class RunningTree<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends CommonAspectDict<ED, Cxt>
> extends Feature<ED, Cxt, AD> {
    private cache: Cache<ED, Cxt, AD>;
    private schema: StorageSchema<ED>;
    private root: Record<
        string,
        SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD>
    >;

    constructor(
        aspectWrapper: AspectWrapper<ED, Cxt, AD>,
        cache: Cache<ED, Cxt, AD>,
        schema: StorageSchema<ED>
    ) {
        super(aspectWrapper);
        this.cache = cache;
        this.schema = schema;
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
        const projectionShape =
            typeof projection === 'function' ? await projection() : projection;
        if (isList) {
            node = new ListNode<ED, T, Cxt, AD>(
                entity,
                this.schema!,
                this.cache,
                projection,
                projectionShape,
                parentNode,
                action,
                updateData,
                filters,
                sorters,
                pagination
            );
        } else {
            node = new SingleNode<ED, T, Cxt, AD>(
                entity,
                this.schema!,
                this.cache,
                projection,
                projectionShape,
                parentNode,
                action,
                updateData
            );
            if (id) {
                node.setValue({ id } as any);
            }
        }
        if (parentNode) {
            // todo，这里有几种情况，待处理
        } else {
            assert(!this.root[path]);
            this.root[path] = node;
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
        if (this.root[path]) {
            return this.root[path];
        }
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
            } else if (parent instanceof ListNode) {
                parent.removeChild(childPath);
            } else if (!parent) {
                assert(this.root.hasOwnProperty(path));
                unset(this.root, path);
            }
        }
    }

    private async applyOperation<T extends keyof ED>(
        entity: T,
        value:
            | SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']>
            | SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']>[],
        operation:
            | DeduceOperation<ED[T]['Schema']>
            | DeduceOperation<ED[T]['Schema']>[],
        projection: ED[T]['Selection']['data'],
        scene: string
    ): Promise<
        | SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']>
        | SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']>[]
        | undefined
    > {
        if (operation instanceof Array) {
            assert(value instanceof Array);
            for (const action of operation) {
                switch (action.action) {
                    case 'create': {
                        value.push(
                            (await this.applyOperation(
                                entity,
                                {} as any,
                                action,
                                projection,
                                scene
                            )) as SelectRowShape<
                                ED[T]['Schema'],
                                ED[T]['Selection']['data']
                            >
                        );
                        break;
                    }
                    case 'remove': {
                        const { filter } = action;
                        assert(filter!.id);
                        const row = value.find((ele) => ele.id === filter!.id);
                        pull(value, row);
                        break;
                    }
                    default: {
                        const { filter } = action;
                        assert(filter!.id);
                        const row = value.find((ele) => ele.id === filter!.id);
                        await this.applyOperation(
                            entity,
                            row!,
                            action,
                            projection,
                            scene
                        );
                    }
                }
            }
            return value;
        } else {
            if (value instanceof Array) {
                // todo 这里还有种可能不是对所有的行，只对指定id的行操作
                return (
                    await Promise.all(
                        value.map(
                            async (row) =>
                                await this.applyOperation(
                                    entity,
                                    row,
                                    operation,
                                    projection,
                                    scene
                                )
                        )
                    )
                ).filter((ele) => !!ele) as SelectRowShape<
                    ED[T]['Schema'],
                    ED[T]['Selection']['data']
                >[];
            } else {
                const { action, data } = operation;
                const applyUpsert = async (
                    row: SelectRowShape<
                        ED[T]['Schema'],
                        ED[T]['Selection']['data']
                    >,
                    actionData: DeduceUpdateOperation<ED[T]['Schema']>['data']
                ) => {
                    for (const attr in actionData) {
                        const relation = judgeRelation(
                            this.schema!,
                            entity,
                            attr
                        );
                        if (relation === 1) {
                            set(row, attr, actionData[attr]);
                        } else if (relation === 2) {
                            // 基于entity/entityId的多对一
                            if (projection[attr]) {
                                set(
                                    row,
                                    attr,
                                    await this.applyOperation(
                                        attr,
                                        row[attr] as SelectRowShape<
                                            ED[T]['Schema'],
                                            ED[T]['Selection']['data']
                                        >,
                                        actionData[attr]!,
                                        projection[attr]!,
                                        scene
                                    )
                                );
                                if (row[attr]) {
                                    Object.assign(row, {
                                        entity: attr,
                                        entityId: row[attr]!['id'],
                                    });
                                } else {
                                    Object.assign(row, {
                                        entity: undefined,
                                        entityId: undefined,
                                    });
                                }
                            }
                        } else if (typeof relation === 'string') {
                            if (projection[attr]) {
                                set(
                                    row,
                                    attr,
                                    await this.applyOperation(
                                        relation,
                                        row[attr] as SelectRowShape<
                                            ED[T]['Schema'],
                                            ED[T]['Selection']['data']
                                        >,
                                        actionData[attr]!,
                                        projection[attr]!,
                                        scene
                                    )
                                );
                                if (row[attr]) {
                                    Object.assign(row, {
                                        [`${attr}Id`]: row[attr]!['id'],
                                    });
                                } else {
                                    Object.assign(row, {
                                        [`${attr}Id`]: undefined,
                                    });
                                }
                            }
                        } else {
                            assert(relation instanceof Array);
                            if (projection[attr]) {
                                set(
                                    row,
                                    attr,
                                    await this.applyOperation(
                                        relation[0],
                                        row[attr] as SelectRowShape<
                                            ED[T]['Schema'],
                                            ED[T]['Selection']['data']
                                        >,
                                        actionData[attr]!,
                                        projection[attr]!['data'],
                                        scene
                                    )
                                );
                                row[attr]!.forEach(
                                    (ele: ED[keyof ED]['Schema']) => {
                                        if (relation[1]) {
                                            Object.assign(ele, {
                                                [relation[1]]: row.id,
                                            });
                                        } else {
                                            Object.assign(ele, {
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
                            const relation = judgeRelation(
                                this.schema!,
                                entity,
                                attr
                            );
                            if (
                                relation === 2 &&
                                (actionData.hasOwnProperty('entity') ||
                                    actionData.hasOwnProperty('entityId'))
                            ) {
                                const entity = actionData.entity || row.entity!;
                                const entityId =
                                    actionData.entityId || row.entityId!;
                                const [entityRow] = await this.cache.get(
                                    entity,
                                    {
                                        data: projection[attr]!,
                                        filter: {
                                            id: entityId,
                                        } as any,
                                    }
                                );
                                set(row, attr, entityRow);
                            } else if (
                                typeof relation === 'string' &&
                                actionData.hasOwnProperty(`${attr}Id`)
                            ) {
                                const [entityRow] = await this.cache.get(
                                    relation,
                                    {
                                        data: projection[attr]!,
                                        filter: {
                                            id: actionData[`${attr}Id`],
                                        } as any,
                                    }
                                );
                                set(row, attr, entityRow);
                            }
                        }
                    }
                };
                switch (action) {
                    case 'create': {
                        await applyUpsert(
                            value,
                            data as DeduceUpdateOperation<
                                ED[T]['Schema']
                            >['data']
                        );
                        return value;
                    }
                    case 'remove': {
                        return undefined;
                    }
                    default: {
                        await applyUpsert(
                            value!,
                            data as DeduceUpdateOperation<
                                ED[T]['Schema']
                            >['data']
                        );
                        return value;
                    }
                }
            }
        }
    }

    getFreshValue(path: string) {
        const node = this.findNode(path);
        let value = node && node.getFreshValue();

        return value;
    }

    isDirty(path: string) {
        const node = this.findNode(path);
        return node ? node.isDirty() : false;
    }

    private async setUpdateDataInner(path: string, attr: string, value: any) {
        let node = this.findNode(path);
        const attrSplit = attr.split('.');
        let idx = 0;
        for (const split of attrSplit) {
            if (node instanceof ListNode) {
                const idx2 = parseInt(split);
                assert(typeof idx2 === 'number');
                node = node.getChild(split, true)!;
                idx++;
            } else {
                const entity = node.getEntity();
                const relation = judgeRelation(this.schema!, entity, split);
                if (relation === 1) {
                    // todo transform data format
                    const attrName = attrSplit.slice(idx).join('.');
                    node.setUpdateData(attrName, value);
                    return;
                } else {
                    // node.setDirty();
                    node = node.getChild(split)!;
                    idx++;
                }
            }
        }
    }

    @Action
    async setUpdateData(path: string, attr: string, value: any) {
        await this.setUpdateDataInner(path, attr, value);
    }

    @Action
    async setAction<T extends keyof ED>(path: string, action: ED[T]['Action']) {
        const node = this.findNode(path);
        node.setAction(action);
    }

    @Action
    setForeignKey(parent: string, attr: string, id: string | undefined) {
        const parentNode = this.findNode(parent);
        assert(parentNode instanceof SingleNode);

        parentNode.setUpdateData(attr, id);
    }

    @Action
    addForeignKeys(parent: string, attr: string, ids: string[]) {
        const parentNode = this.findNode(parent);
        assert(parentNode instanceof ListNode);

        ids.forEach((id) => {
            const node = parentNode.pushNewBorn({});
            node.setUpdateData(attr, id);
        });
    }

    @Action
    setUniqueForeignKeys(parent: string, attr: string, ids: string[]) {
        const parentNode = this.findNode(parent);
        assert(parentNode instanceof ListNode);

        parentNode.setUniqueChildren(
            ids.map((id) => ({
                updateData: {
                    [attr]: id,
                } as any,
            }))
        );
    }

    @Action
    async refresh(path: string) {
        const node = this.findNode(path);
        await node.refresh(path);
    }

    @Action
    async loadMore(path: string) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        await node.loadMore();
    }

    getPagination<T extends keyof ED>(path: string) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.getPagination();
    }

    @Action
    async setPageSize<T extends keyof ED>(
        path: string,
        pageSize: number,
        refresh: boolean = true
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        // 切换分页pageSize就重新设置
        node.setPagination({
            pageSize,
            currentPage: 0,
            more: true,
        });
        if (refresh) {
            await node.refresh();
        }
    }

    @Action
    setCurrentPage<T extends keyof ED>(path: string, currentPage: number) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.setCurrentPage(currentPage);
    }

    getNamedFilters<T extends keyof ED>(path: string) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.getNamedFilters();
    }

    getNamedFilterByName<T extends keyof ED>(path: string, name: string) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.getNamedFilterByName(name);
    }

    @Action
    async setNamedFilters<T extends keyof ED>(
        path: string,
        filters: NamedFilterItem<ED, T>[],
        refresh: boolean = true
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.setNamedFilters(filters);
        if (refresh) {
            await node.refresh();
        }
    }

    @Action
    async addNamedFilter<T extends keyof ED>(
        path: string,
        filter: NamedFilterItem<ED, T>,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.addNamedFilter(filter);
        if (refresh) {
            await node.refresh();
        }
    }

    @Action
    async removeNamedFilter<T extends keyof ED>(
        path: string,
        filter: NamedFilterItem<ED, T>,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.removeNamedFilter(filter);
        if (refresh) {
            await node.refresh();
        }
    }

    @Action
    async removeNamedFilterByName<T extends keyof ED>(
        path: string,
        name: string,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.removeNamedFilterByName(name);
        if (refresh) {
            await node.refresh();
        }
    }

    getNamedSorters<T extends keyof ED>(path: string) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.getNamedSorters();
    }

    getNamedSorterByName<T extends keyof ED>(path: string, name: string) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.getNamedSorterByName(name);
    }

    @Action
    async setNamedSorters<T extends keyof ED>(
        path: string,
        sorters: NamedSorterItem<ED, T>[],
        refresh: boolean = true
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.setNamedSorters(sorters);
        if (refresh) {
            await node.refresh();
        }
    }

    @Action
    async addNamedSorter<T extends keyof ED>(
        path: string,
        sorter: NamedSorterItem<ED, T>,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.addNamedSorter(sorter);
        if (refresh) {
            await node.refresh();
        }
    }

    @Action
    async removeNamedSorter<T extends keyof ED>(
        path: string,
        sorter: NamedSorterItem<ED, T>,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.removeNamedSorter(sorter);
        if (refresh) {
            await node.refresh();
        }
    }

    @Action
    async removeNamedSorterByName<T extends keyof ED>(
        path: string,
        name: string,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.removeNamedSorterByName(name);
        if (refresh) {
            await node.refresh();
        }
    }

    async testAction(path: string, action?: string, execute?: boolean) {
        const node = this.findNode(path);
        if (execute) {
            await this.beforeExecute(node, action);
        }
        const operation = await node.composeOperation(action, execute);
        // 先在cache中尝试能否执行，如果权限上否决了在这里就失败
        if (operation instanceof Array) {
            for (const oper of operation) {
                await this.cache.operate(node.getEntity(), oper);
            }
        } else if (operation) {
            await this.cache.operate(node.getEntity(), operation);
        } else {
            assert(false);
        }
        return {
            node,
            operation,
        };
    }

    private async beforeExecute(
        node2:
            | SingleNode<ED, keyof ED, Cxt, AD>
            | ListNode<ED, keyof ED, Cxt, AD>,
        action?: string
    ) {
        async function beNode(
            node:
                | SingleNode<ED, keyof ED, Cxt, AD>
                | ListNode<ED, keyof ED, Cxt, AD>,
            action2?: string
        ) {
            if (node.isDirty()) {
                const beforeExecuteFn = node.getBeforeExecute();
                if (beforeExecuteFn) {
                    await beforeExecuteFn(
                        node.getUpdateData(),
                        action2 || node.getAction()
                    );
                }
                if (node instanceof ListNode) {
                    for (const child of node.getChildren()) {
                        await beNode(child);
                    }
                    for (const child of node.getNewBorn()) {
                        await beNode(child);
                    }
                } else {
                    for (const k in node.getChildren()) {
                        await beNode(node.getChildren()[k]);
                    }
                }
            }
        }
        await beNode(node2, action);
    }

    @Action
    async execute(path: string, action?: string) {
        const { node, operation } = await this.testAction(path, action, true);

        await this.getAspectWrapper().exec('operate', {
            entity: node.getEntity() as string,
            operation,
        });

        // 清空缓存
        node.resetUpdateData();
        return operation;
    }

    @Action
    pushNode<T extends keyof ED>(
        path: string,
        options: Pick<
            CreateNodeOptions<ED, T>,
            'updateData' | 'beforeExecute' | 'afterExecute'
        >
    ) {
        const parent = this.findNode(path);
        assert(parent instanceof ListNode);

        parent.pushNewBorn(options);
    }
    @Action
    async removeNode(parent: string, path: string) {
        const parentNode = this.findNode(parent);

        const node = parentNode.getChild(path);
        assert(parentNode instanceof ListNode && node instanceof SingleNode); // 现在应该不可能remove一个list吧，未来对list的处理还要细化
        if (node.getAction() !== 'create') {
            // 不是增加，说明是删除数据
            await this.getAspectWrapper().exec('operate', {
                entity: node.getEntity() as string,
                operation: {
                    action: 'remove',
                    data: {},
                    filter: {
                        id: node.getFreshValue()!.id,
                    },
                } as ED[keyof ED]['Remove'],
            });
        } else {
            // 删除子结点
            parentNode.popNewBorn(path);
        }
    }

    @Action
    resetUpdateData(path: string) {
        const node = this.findNode(path);

        node.resetUpdateData();
    }

    @Action
    toggleNode(path: string, nodeData: Record<string, any>, checked: boolean) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);

        node.toggleChild(
            {
                updateData: nodeData as any,
            },
            checked
        );
    }

    getRoot() {
        return this.root;
    }
}