import { assert } from 'oak-domain/lib/utils/assert';
import { cloneDeep, pull, set, unset } from "oak-domain/lib/utils/lodash";
import { combineFilters, contains, repel, same } from "oak-domain/lib/store/filter";
import { createOperationsFromModies } from 'oak-domain/lib/store/modi';
import { judgeRelation } from "oak-domain/lib/store/relation";
import { EntityDict, Aspect, Context, DeduceUpdateOperation, StorageSchema, OpRecord, SelectRowShape, DeduceCreateOperation, DeduceOperation, UpdateOpResult, SelectOpResult, CreateOpResult, RemoveOpResult, DeduceSorterItem, AspectWrapper, DeduceFilter } from "oak-domain/lib/types";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';

import { NamedFilterItem, NamedSorterItem } from "../types/NamedCondition";
import { generateMockId } from "../utils/mockId";
import { Cache } from './cache';
import { Pagination } from '../types/Pagination';
import { Action, Feature } from '../types/Feature';

type Operation<ED extends EntityDict & BaseEntityDict, T extends keyof ED, OmitId extends boolean = false> = {
    oper: OmitId extends true ? Omit<ED[T]['Operation'], 'id'> : ED[T]['Operation'];
    beforeExecute?: () => Promise<void>;
    afterExecute?: () => Promise<void>;
};

abstract class Node<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> {
    protected entity: T;
    // protected fullPath: string;
    protected schema: StorageSchema<ED>;
    protected projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>);      // 只在Page层有
    protected parent?: Node<ED, keyof ED, Cxt, AD>;
    protected dirty?: boolean;
    protected cache: Cache<ED, Cxt, AD>;
    protected loading: boolean;
    protected loadingMore: boolean;
    protected executing: boolean;
    protected operations: Operation<ED, T>[];

    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, AD>,
        projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>),
        parent?: Node<ED, keyof ED, Cxt, AD>) {
        this.entity = entity;
        this.schema = schema;
        this.cache = cache;
        this.projection = projection;
        this.parent = parent;
        this.dirty = undefined;
        this.loading = false;
        this.loadingMore = false;
        this.executing = false;
        this.operations = [];
    }

    getEntity() {
        return this.entity;
    }


    setDirty() {
        if (!this.dirty) {
            this.dirty = true;
            if (this.parent) {
                this.parent.setDirty();
            }
        }
    }

    isDirty() {
        return !!this.dirty;
    }

    isLoading() {
        return this.loading;
    }

    isLoadingMore() {
        return this.loadingMore;
    }

    isExecuting() {
        return this.executing;
    }

    setExecuting(executing: boolean) {
        this.executing = executing;
    }

    getParent() {
        return this.parent;
    }

    async getProjection() {
        return typeof this.projection === 'function' ? await this.projection() : this.projection;
    }

    protected judgeRelation(attr: string) {
        const attr2 = attr.split(':')[0];       // 处理attr:prev
        return judgeRelation(this.schema, this.entity, attr2);
    }

    protected contains(filter: ED[T]['Selection']['filter'], conditionalFilter: ED[T]['Selection']['filter']) {
        return contains(this.entity, this.schema, filter, conditionalFilter);
    }

    protected repel(filter1: ED[T]['Selection']['filter'], filter2: ED[T]['Selection']['filter']) {
        return repel(this.entity, this.schema, filter1, filter2);
    }
}

const DEFAULT_PAGINATION: Pagination = {
    currentPage: 0,
    pageSize: 20,
    append: true,
    more: true,
}

function mergeOperationData<ED extends EntityDict & BaseEntityDict, T extends keyof ED>(
    entity: T,
    schema: StorageSchema<ED>,
    from: ED[T]['Operation']['data'],
    into: ED[T]['Operation']['data']
) {
    for (const attr in from) {
        if (!into[attr]) {
            into[attr] = from[attr];
        }
        else {
            const rel = judgeRelation(schema, entity, attr);
            if (rel === 2) {
                const result = mergeOperation(attr, schema, from[attr] as any, [into[attr] as any]);
                assert(result);
            }
            else if (typeof rel === 'string') {
                const result = mergeOperation(rel, schema, from[attr] as any, [into[attr] as any]);
                assert(result);
            }
            else if (rel instanceof Array) {
                const [entity2] = rel;
                const result = mergeOperation(entity2, schema, from[attr] as any, [into[attr] as any]);
                assert(result);
            }
            else {
                into[attr] = from[attr];
            }
        }
    }
}

function mergeOperationTrigger<ED extends EntityDict & BaseEntityDict, T extends keyof ED>(
    from: Operation<ED, T, true>,
    to: Operation<ED, T>
) {
    const { beforeExecute: be1, afterExecute: ae1 } = from;
    const { beforeExecute: be2, afterExecute: ae2 } = to;

    if (be1) {
        if (be2) {
            to.beforeExecute = async () => {
                await be1();
                await be2();
            };
        }
        else {
            to.beforeExecute = be1;
        }
    }
    if (ae1) {
        if (ae2) {
            to.afterExecute = async () => {
                await ae1();
                await ae2();
            };
        }
        else {
            to.afterExecute = ae1;
        }
    }
}
/**
 * 尝试将operation行为merge到现有的operation中去
 * @param operation 
 * @param operations 
 * @return 是否merge成功
 */
function mergeOperation<ED extends EntityDict & BaseEntityDict, T extends keyof ED>(
    entity: T,
    schema: StorageSchema<ED>,
    operation: Operation<ED, T, true>,
    operations: Operation<ED, T>[]
) {
    const { oper } = operation;
    const { action, data } = oper;
    let idx = 0;
    let result = false;
    for (const operIter of operations) {
        const { oper: oper2 } = operIter;
        if (action === oper2.action) {
            switch (action) {
                case 'create': {
                    const { data: data2 } = oper2 as ED[T]['Create'];
                    if (data2 instanceof Array) {
                        if (data instanceof Array) {
                            data2.push(...data);
                        }
                        else {
                            data2.push(data as ED[T]['CreateSingle']['data']);
                        }
                    }
                    else {
                        const data3 = [data2] as ED[T]['CreateMulti']['data'];
                        if (data instanceof Array) {
                            data3.push(...data);
                        }
                        else {
                            data3.push(data as ED[T]['CreateSingle']['data']);
                        }
                        Object.assign(oper2, {
                            data: data3,
                        });
                    }
                    // 如果需要，merge execute事件
                    mergeOperationTrigger(operation, operIter);
                    return true;
                }
                default: {
                    // update/remove只合并filter完全相同的项
                    const { filter: filter2, data: data2 } = oper2;
                    const { filter} = oper as ED[T]['Remove'];
                    assert(filter && filter2, '更新动作目前应该都有谓词条件');
                    if (same(entity, schema, filter, filter2)) {
                        mergeOperationData(entity, schema, data, data2);
                        mergeOperationTrigger(operation, operIter);
                        return true;
                    }
                }
            }
        }
        else {
            const { data, filter } = oper;
            if (action === 'update' && oper2.action === 'create') {
                // 更新刚create的数据，直接加在上面
                const { data: operData } = oper2;
                if (operData instanceof Array) {
                    for (const operData2 of operData) {
                        if (operData2.id === filter!.id) {
                            mergeOperationData(entity, schema, data, operData2);
                            mergeOperationTrigger(operation, operIter);
                            return true;
                        }
                    }
                }
                else {
                    if (operData.id === filter!.id) {
                        mergeOperationData(entity, schema, data, operData);
                        mergeOperationTrigger(operation, operIter);
                        return true;
                    }
                }
            }
            else if (action === 'remove') {
                if (oper2.action === 'create') {
                    // create和remove动作相抵消
                    const { data: operData } = oper2;
                    if (operData instanceof Array) {
                        for (const operData2 of operData) {
                            if (operData2.id === filter!.id) {
                                if (operData.length > 0) {
                                    Object.assign(operIter, {
                                        data: pull(operData, operData2)
                                    });
                                }
                                else {
                                    operations.splice(idx, 1);
                                }
                                result = true;
                            }
                        }
                    }
                    else {
                        if (operData.id === filter!.id) {
                            operations.splice(idx, 1);
                            result = true;
                        }
                    }
                }
                else {
                    // update，此时把相同id的update直接去掉
                    const { filter: operFilter } = oper2;
                    if (filter?.id === operFilter?.id) {
                        operations.splice(idx, 1);
                        continue;   // 这里不能返回true
                    }
                }
            }
        }
        idx++;
    }

    return result;
}

class ListNode<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends CommonAspectDict<ED, Cxt>
    > extends Node<ED, T, Cxt, AD> {
    private children: SingleNode<ED, T, Cxt, AD>[];

    private filters: NamedFilterItem<ED, T>[];
    private sorters: NamedSorterItem<ED, T>[];
    private pagination: Pagination;
    private ids: string[];

    private syncHandler: (records: OpRecord<ED>[]) => Promise<void>;

    async onCacheSync(records: OpRecord<ED>[]): Promise<void> {
        // 只需要处理insert
        if (this.loading) {
            return;
        }
        const createdIds: string[] = [];
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
                default: {
                    break;
                }
            }
        }
        if (createdIds.length > 0) {
            const currentIds = this.ids;

            const { sorter, filters } = await this.constructSelection();
            filters.push({
                id: {
                    $in: currentIds.concat(createdIds),
                },
            });
            const filter = combineFilters(filters);

            const value = await this.cache.get(
                this.entity,
                {
                    data: {
                        id: 1,
                    },
                    filter,
                    sorter,
                },
                { obscure: true }
            );
            this.ids = (value.map(ele => ele.id as unknown as string));
        }
    }

    destroy(): void {
        this.cache.unbindOnSync(this.syncHandler);
        for (const child of this.children) {
            child.destroy();
        }
    }

    constructor(
        entity: T,
        schema: StorageSchema<ED>,
        cache: Cache<ED, Cxt, AD>,
        projection:
            | ED[T]['Selection']['data']
            | (() => Promise<ED[T]['Selection']['data']>),
        projectionShape: ED[T]['Selection']['data'],
        parent?: Node<ED, keyof ED, Cxt, AD>,
        filters?: NamedFilterItem<ED, T>[],
        sorters?: NamedSorterItem<ED, T>[],
        pagination?: Pagination
    ) {
        super(entity, schema, cache, projection, parent);
        this.children = [];
        this.filters = filters || [];
        this.sorters = sorters || [];
        this.pagination = pagination || DEFAULT_PAGINATION;
        this.ids = [];

        this.syncHandler = (records) => this.onCacheSync(records);
        this.cache.bindOnSync(this.syncHandler);
    }

    getPagination() {
        return this.pagination;
    }

    async setPagination(pagination: Pagination) {
        const newPagination = Object.assign(this.pagination, pagination);
        this.pagination = newPagination;
        await this.refresh();
    }

    getChild(
        path: string,
        newBorn?: true
    ): SingleNode<ED, T, Cxt, AD> | undefined {
        const idx = parseInt(path, 10);
        assert(typeof idx === 'number');
        assert(idx < this.children.length);
        return this.children[idx];
    }

    getChildren() {
        return this.children;
    }

    addChild(path: string, node: SingleNode<ED, T, Cxt, AD>) {
        const idx = parseInt(path, 10);
        assert(typeof idx === 'number');
        this.children[idx] = node;
    }

    removeChild(path: string) {
        const idx = parseInt(path, 10);
        assert(typeof idx === 'number');
        this.children.splice(idx, 1);
    }

    getNamedFilters() {
        return this.filters;
    }

    getNamedFilterByName(name: string) {
        const filter = this.filters.find((ele) => ele['#name'] === name);
        return filter;
    }

    async setNamedFilters(filters: NamedFilterItem<ED, T>[], refresh?: boolean) {
        this.filters = filters;
        if (refresh) {
            await this.refresh(0, true);
        }
    }

    async addNamedFilter(filter: NamedFilterItem<ED, T>, refresh?: boolean) {
        // filter 根据#name查找
        const fIndex = this.filters.findIndex(
            (ele) => filter['#name'] && ele['#name'] === filter['#name']
        );
        if (fIndex >= 0) {
            this.filters.splice(fIndex, 1, filter);
        } else {
            this.filters.push(filter);
        }
        if (refresh) {
            await this.refresh(0, true);
        }
    }

    async removeNamedFilter(filter: NamedFilterItem<ED, T>, refresh?: boolean) {
        // filter 根据#name查找
        const fIndex = this.filters.findIndex(
            (ele) => filter['#name'] && ele['#name'] === filter['#name']
        );
        if (fIndex >= 0) {
            this.filters.splice(fIndex, 1);
        }
        if (refresh) {
            await this.refresh(0, true);
        }
    }

    async removeNamedFilterByName(name: string, refresh?: boolean) {
        // filter 根据#name查找
        const fIndex = this.filters.findIndex((ele) => ele['#name'] === name);
        if (fIndex >= 0) {
            this.filters.splice(fIndex, 1);
        }
        if (refresh) {
            await this.refresh(0, true);
        }
    }

    getNamedSorters() {
        return this.sorters;
    }

    getNamedSorterByName(name: string) {
        const sorter = this.sorters.find((ele) => ele['#name'] === name);
        return sorter;
    }

    async setNamedSorters(sorters: NamedSorterItem<ED, T>[], refresh?: boolean) {
        this.sorters = sorters;
        if (refresh) {
            await this.refresh(0, true);
        }
    }

    async addNamedSorter(sorter: NamedSorterItem<ED, T>, refresh?: boolean) {
        // sorter 根据#name查找
        const fIndex = this.sorters.findIndex(
            (ele) => sorter['#name'] && ele['#name'] === sorter['#name']
        );
        if (fIndex >= 0) {
            this.sorters.splice(fIndex, 1, sorter);
        } else {
            this.sorters.push(sorter);
        }
        if (refresh) {
            await this.refresh(0, true);
        }
    }

    async removeNamedSorter(sorter: NamedSorterItem<ED, T>, refresh?: boolean) {
        // sorter 根据#name查找
        const fIndex = this.sorters.findIndex(
            (ele) => sorter['#name'] && ele['#name'] === sorter['#name']
        );
        if (fIndex >= 0) {
            this.sorters.splice(fIndex, 1);
        }
        if (refresh) {
            await this.refresh(0, true);
        }
    }

    async removeNamedSorterByName(name: string, refresh: boolean) {
        // sorter 根据#name查找
        const fIndex = this.sorters.findIndex((ele) => ele['#name'] === name);
        if (fIndex >= 0) {
            this.sorters.splice(fIndex, 1);
        }
        if (refresh) {
            await this.refresh(0, true);
        }
    }

    async getFreshValue(): Promise<Array<
        SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']>
    >> {
        const projection = typeof this.projection === 'function' ? await this.projection() : this.projection;
        // 在createOperation中的数据也是要返回的
        const ids = [...this.ids];
        for (const operation of this.operations) {
            const { oper } = operation;
            if (oper.action === 'create') {
                const { data } = oper;
                if (data instanceof Array) {
                    ids.push(...data.map(ele => ele.id));
                }
                else {
                    ids.push(data.id);
                }
            }
        }
        const { result } = await this.cache.tryRedoOperationsThenSelect(this.entity, {
            data: projection,
            filter: {
                id: {
                    $in: ids,
                }
            } as any,
        }, this.operations.map(
            ele => ({
                entity: this.entity,
                operation: ele.oper,
            })
        ));
        return result;
    }

    async addOperation(oper: Omit<ED[T]['Operation'], 'id'>, beforeExecute?: Operation<ED, T>['beforeExecute'], afterExecute?: Operation<ED, T>['afterExecute']) {
        const operation = {
            oper: Object.assign(oper, { id: await generateNewId() }),
            beforeExecute,
            afterExecute,
        }
        const merged = mergeOperation(this.entity, this.schema, operation, this.operations);
        if (!merged) {
            this.operations.push(operation);
        }
        this.setDirty();
    }

    async composeOperations() {
        if (!this.dirty) {
            return;
        }
        const childOperations = await Promise.all(
            this.children.map(
                async ele => await ele.composeOperations()
            )
        );

        const operations: Operation<ED, T>[] = [];
        for (const oper of childOperations) {
            if (oper) {
                const merged = this.operations.length > 0 && mergeOperation(this.entity, this.schema, oper[0], this.operations);
                if (!merged) {
                    operations.push(oper[0]);
                }
            }
        }
        operations.push(...this.operations);
        return operations;
    }

    private async constructSelection() {
        const { filters, sorters } = this;
        const proj = await this.getProjection();
        assert(proj, "取数据时找不到projection信息");
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
        
        const filterOfParent = (this.parent as SingleNode<ED, keyof ED, Cxt, AD>)?.getOtmFilter<T>(this);
        filterArr.push(filterOfParent as any);

        return {
            projection: proj,
            filters: filterArr.filter(ele => !!ele) as ED[T]['Selection']['filter'][],
            sorter: sorterArr,
        }
    }

    async refresh(pageNumber?: number, getCount?: true, append?: boolean) {
        const { entity, pagination } = this;
        const { currentPage, pageSize } = pagination;        
        if (append) {
            this.loadingMore = true;
        }
        else {
            this.loading = true;
        }
        const currentPage3 = typeof pageNumber === 'number' ? pageNumber : currentPage;
        const { projection, filters, sorter } = await this.constructSelection();
        try {
            const { data, count } = await this.cache.refresh(
                entity,
                {
                    data: projection,
                    filter: filters.length > 0
                            ? combineFilters(filters)
                            : undefined,
                    sorter,
                    indexFrom: currentPage3 * pageSize,
                    count: pageSize,
                },
                undefined,
                getCount
            );
            this.pagination.currentPage = currentPage;
            this.pagination.more = data.length === pageSize;
            if (append) {
                this.loadingMore = false;
            }
            else {
                this.loading = false;
            }
            if (getCount) {
                this.pagination.total = count;
            }

            const ids = data.map(
                ele => ele.id!
            ) as string[];
            if (append) {
                this.ids = this.ids.concat(ids)
            }
            else {
                this.ids = ids;
            }
        }
        catch (err) {
            if (append) {
                this.loadingMore = false;
            }
            else {
                this.loading = false;
            }
            throw err;
        }
    }

    async loadMore() {
        const { filters, sorters, pagination, entity } = this;
        const { pageSize, more, currentPage } = pagination;
        if (!more) {
            return;
        }
        const currentPage2 = currentPage + 1;
        await this.refresh(currentPage2, undefined, true);
    }

    async setCurrentPage<T extends keyof ED>(currentPage: number, append?: boolean) {
        await this.refresh(currentPage, undefined, append);
    }

    clean() {
        this.dirty = undefined;
        this.operations = [];

        for (const child of this.children) {
            child.clean();
        }
    }
}

class SingleNode<ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    AD extends CommonAspectDict<ED, Cxt>> extends Node<ED, T, Cxt, AD> {
    private id?: string;
    private children: {
        [K: string]: SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD>;
    };

    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, AD>,
        projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>),
        projectionShape: ED[T]['Selection']['data'],
        parent?: Node<ED, keyof ED, Cxt, AD>) {
        super(entity, schema, cache, projection, parent);
        this.children = {};

        const ownKeys: string[] = [];
        const attrs = Object.keys(projectionShape);
        const { toModi } = schema[entity];
        attrs.forEach(
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
                    if (toModi && attr !== 'modi$entity') {
                        const node2 = new SingleNode(attr, this.schema, this.cache, proj, projectionShape[attr], this);
                        Object.assign(this.children, {
                            [`${attr}:prev`]: node2,
                        });
                    }
                }
                else if (typeof rel === 'string') {
                    const node = new SingleNode(rel, this.schema, this.cache, proj, projectionShape[attr], this);
                    Object.assign(this.children, {
                        [attr]: node,
                    });
                    if (toModi && attr !== 'modi$entity') {
                        const node2 = new SingleNode(attr, this.schema, this.cache, proj, projectionShape[attr], this);
                        Object.assign(this.children, {
                            [`${attr}:prev`]: node2,
                        });
                    }
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
                    if (toModi && attr !== 'modi$entity') {
                        const node2 = new ListNode(rel[0], this.schema, this.cache, proj, subProjectionShape, this);
                        if (filter) {
                            node2.addNamedFilter({
                                filter,
                            });
                        }
                        if (sorters && sorters instanceof Array) {
                            // todo 没有处理projection是一个function的case
                            sorters.forEach(
                                ele => node2.addNamedSorter({
                                    sorter: ele
                                })
                            );
                        }
                        Object.assign(this.children, {
                            [`${attr}:prev`]: node2,
                        });
                    }
                }
                else {
                    ownKeys.push(attr);
                }
            }
        );
    }

    destroy(): void {
        for (const k in this.children) {
            this.children[k].destroy();
        }
    }

    getChild(path: string): SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD> {
        return this.children[path];
    }

    async setId(id: string) {
        this.id = id;
        await this.refresh();
    }

    getChildren() {
        return this.children;
    }

    addChild(path: string, node: SingleNode<ED, keyof ED, Cxt, AD> | ListNode<ED, keyof ED, Cxt, AD>) {
        assert(!this.children[path]);
        this.children[path] = node;
    }

    removeChild(path: string) {
        unset(this.children, path);
    }

    /* async setValue(value: SelectRowShape<ED[T]['OpSchema'], ED[T]['Selection']['data']> | undefined) {
        let value2 = value && Object.assign({}, value);
        this.id = value2 && value2.id as string;
        const attrs = Object.keys(this.children);
        if (attrs.includes('modi$entity')) {
            // 说明这个对象关联了modi，所以这个对象的子对象必须要显示modi应用后的值，同时将当前的值记录在attr:prev属性
            if (value2) {
                if (value2.modi$entity && value2.modi$entity.length > 0) {
                    const entityOperations = createOperationsFromModies(value2.modi$entity as any);
                    const { projection, id, entity } = this;
                    const projection2 = typeof projection === 'function' ? await projection() : projection;

                    const { result: [value3] } = await this.cache.tryRedoOperations(entity, {
                        data: projection2,
                        filter: {
                            id: id!,
                        } as any,
                    }, entityOperations);

                    for (const attr in value3) {
                        if (attr !== 'modi$entity' && this.children[attr]) {
                            // 如果有子结点，就用modi应用后的结点替代原来的结点，
                            Object.assign(value2, {
                                [attr]: value3[attr],
                                [`${attr}:prev`]: value2[attr],
                            });
                        }
                    }
                }
            }
        }
        for (const attr of attrs) {
            const node = this.children[attr];
            if (value2 && value2[attr]) {
                await node.setValue(value2[attr] as any);
                if (node instanceof ListNode) {
                    const rel = this.judgeRelation(attr);
                    assert(rel instanceof Array);
                    const filter = rel[1] ? {
                        [rel[1]]: value2.id!,
                    } : {
                        entityId: value2.id!,
                    };

                    node.removeNamedFilterByName('inherent:parentId');
                    node.addNamedFilter({
                        filter,
                        "#name": 'inherent:parentId',
                    });
                }
            }
            else {
                await node.setValue(undefined);
            }
        }
        this.value = value2;
        this.refreshValue();
    } */


    async getFreshValue(): Promise<SelectRowShape<ED[T]['Schema'], ED[T]['Selection']['data']>> {
        const projection = typeof this.projection === 'function' ? await this.projection() : this.projection;
        const { result } = await this.cache.tryRedoOperationsThenSelect(this.entity, {
            data: projection,
            filter: {
                id: this.id,
            } as any,
        }, this.operations.map(
            ele => ({
                entity: this.entity,
                operation: ele.oper
            })
        ));
        return result[0];
    }

    async addOperation(oper: Omit<ED[T]['Operation'], 'id'>, beforeExecute?: Operation<ED, T>['beforeExecute'], afterExecute?: Operation<ED, T>['afterExecute']) {
        if (!oper.filter) {
            Object.assign(oper, {
                filter: {
                    id: this.id,
                },
            });
        }
        else {
            assert(oper.filter.id === this.id);
        }
        const operation = {
            oper,
            beforeExecute,
            afterExecute,
        };
        const merged = mergeOperation(this.entity, this.schema, operation, this.operations);
        if (!merged) {
            assert(this.operations.length === 0);   // singleNode上的merge应该不可能失败（所有的操作都是基于id的）
            Object.assign(oper, { id: await generateNewId() });
            this.operations.push(operation as Operation<ED, T>);
        }
        this.setDirty();
    }

    async composeOperations() {
        if (!this.dirty) {
            return;
        }
        const childOperations = await Promise.all(
            Object.keys(this.children).map(
                async (ele) => {
                    const child = this.children[ele];
                    const childOperations = await child!.composeOperations();
                    let subOper, subBe, subAe;
                    if (childOperations) {
                        if (child instanceof SingleNode) {
                            subOper = childOperations[0].oper;
                            subBe = childOperations[0].beforeExecute;
                            subAe = childOperations[0].afterExecute;
                        }
                        else {
                            assert(child instanceof ListNode);
                            subOper = childOperations.map(ele => ele.oper);
                            subBe = async () => {
                                for (const o of childOperations) {
                                    o.beforeExecute && await o.beforeExecute();
                                }
                            };
                            subAe = async () => {
                                for (const o of childOperations) {
                                    o.afterExecute && await o.afterExecute();
                                }
                            }
                        }
                    }
                    return {
                        oper: {
                            id: 'dummy',        // 因为肯定会被merge掉，所以无所谓了
                            action: 'update',
                            data: {
                                [ele]: subOper,
                            },
                            filter: {
                                id: this.id,
                            }
                        },
                        beforeExecute: subBe,
                        afterExecute: subAe,
                    } as Operation<ED, keyof ED>;
                }
            )
        );

        const operations: Operation<ED, T>[] = [];
        if (this.operations.length > 0) {
            assert(this.operations.length === 1);
            operations.push(this.operations[0]);
        }
        else {
            operations.push({
                oper: {
                    id: await generateNewId(),
                    action: 'update',
                    data: {},
                    filter: {
                        id: this.id,
                    } as any,
                }
            });
        }
        for (const oper of childOperations) {
            const merged = mergeOperation(this.entity, this.schema, oper, operations);
            assert(merged);     // SingleNode貌似不可能不merge成功
        }
        return operations;
    }

    async refresh() {
        const projection = await this.getProjection();
        if (this.id) {
            this.loading = true;
            try {
                const { data: [value] } = await this.cache.refresh(this.entity, {
                    data: projection,
                    filter: {
                        id: this.id,
                    },
                } as any);
                this.loading = false;
            }
            catch (err) {
                this.loading = false;
                throw err;
            }
        }
    }

    clean() {
        this.dirty = undefined;
        this.operations = [];

        for (const child in this.children) {
            this.children[child]!.clean();
        }
    }

    getOtmFilter<T2 extends keyof ED>(childNode: ListNode<ED, keyof ED, Cxt, AD>): ED[T2]['Selection']['filter'] {
        for (const key in this.children) {
            if (childNode === this.children[key]) {
                const rel = this.judgeRelation(key);
                assert(rel instanceof Array);
                if (rel[1]) {
                    // 基于普通外键的一对多
                    return {
                        [rel[1]]: this.id!,
                    } as any;
                }
                else {
                    // 基于entity/entityId的一对多
                    return {
                        entity: this.entity,
                        entityId: this.id,
                    } as any;
                }
            }
        }
        assert(false);
    }
}

export type CreateNodeOptions<ED extends EntityDict & BaseEntityDict, T extends keyof ED> = {
    path: string;
    entity: T;
    isList?: boolean;
    isPicker?: boolean;
    projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>);
    pagination?: Pagination;
    filters?: NamedFilterItem<ED, T>[];
    sorters?: NamedSorterItem<ED, T>[];
    beforeExecute?: (operations: ED[T]['Operation'][]) => Promise<void>;
    afterExecute?: (operations: ED[T]['Operation'][]) => Promise<void>;
    id?: string;
};


function analyzePath(path: string) {
    const idx = path.lastIndexOf('.');
    if (idx !== -1) {
        return {
            parent: path.slice(0, idx),
            path: path.slice(idx + 1),
        };
    }
    return {
        path,
    };
}

export class RunningTree<
    ED extends EntityDict & BaseEntityDict,
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
            pagination,
            path: fullPath,
            filters,
            sorters,
            projection,
            isList,
            isPicker,
            id,
        } = options;
        let node: ListNode<ED, T, Cxt, AD> | SingleNode<ED, T, Cxt, AD>;
        const { parent, path } = analyzePath(fullPath);
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
                filters,
                sorters,
                pagination
            );
            node.refresh();
        } else {
            node = new SingleNode<ED, T, Cxt, AD>(
                entity,
                this.schema!,
                this.cache,
                projection,
                projectionShape,
                parentNode
            );
            if (id) {
                node.setId(id);
            }
        }
        if (parentNode) {
            parentNode.addChild(path, node as any);
        } else {
            assert(!parent && !this.root[path]);
            this.root[path] = node;
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
            node.destroy();
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

    @Action
    async addOperation<T extends keyof ED>(path: string, operation: Omit<ED[T]['Operation'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        const node = this.findNode(path);
        assert(node);
        await node.addOperation(operation, beforeExecute, afterExecute);
    }

    isLoading(path: string) {
        const node = this.findNode(path);
        return node.isLoading();
    }

    isLoadingMore(path: string) {
        const node = this.findNode(path);
        return node.isLoadingMore();
    }

    isExecuting(path: string) {
        const node = this.findNode(path);
        return node.isExecuting();
    }

    @Action
    async refresh(path: string) {
        const node = this.findNode(path);
        if (node instanceof ListNode) {
            await node.refresh(0, true);
        }
        else {
            assert(node instanceof SingleNode);
            await node.refresh();
        }
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
    setId(path: string, id: string) {
        const node = this.findNode(path);
        assert(node instanceof SingleNode);
        return node.setId(id);
    }

    @Action
    setPageSize<T extends keyof ED>(
        path: string,
        pageSize: number
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        // 切换分页pageSize就重新设置
        return node.setPagination({
            pageSize,
            currentPage: 1,
            more: true,
        });
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
        node.setNamedFilters(filters, refresh);
    }

    @Action
    async addNamedFilter<T extends keyof ED>(
        path: string,
        filter: NamedFilterItem<ED, T>,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.addNamedFilter(filter, refresh);
    }

    @Action
    async removeNamedFilter<T extends keyof ED>(
        path: string,
        filter: NamedFilterItem<ED, T>,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.removeNamedFilter(filter, refresh);
    }

    @Action
    async removeNamedFilterByName<T extends keyof ED>(
        path: string,
        name: string,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.removeNamedFilterByName(name, refresh);
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
        node.setNamedSorters(sorters, refresh);
    }

    @Action
    async addNamedSorter<T extends keyof ED>(
        path: string,
        sorter: NamedSorterItem<ED, T>,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.addNamedSorter(sorter, refresh);
    }

    @Action
    async removeNamedSorter<T extends keyof ED>(
        path: string,
        sorter: NamedSorterItem<ED, T>,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.removeNamedSorter(sorter, refresh);
    }

    @Action
    async removeNamedSorterByName<T extends keyof ED>(
        path: string,
        name: string,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.removeNamedSorterByName(name, refresh);
    }

    async tryExecute(path: string) {
        const node = this.findNode(path);
        const operations = await node.composeOperations();
        if (operations) {
            await this.cache.tryRedoOperations(node.getEntity(), operations.map(ele => ele.oper));
        }
    }

    @Action
    async execute(path: string) {        
        const node = this.findNode(path);
        if (!node.isDirty()) {
            return;
        }

        node.setExecuting(true);
        try {
            const operations = await node.composeOperations() as Operation<ED, keyof ED>[];
            
            for (const operation of operations) {
                operation.beforeExecute && await operation.beforeExecute();
            }
            await this.getAspectWrapper().exec('operate', {
                entity: node.getEntity() as string,
                operation: operations.map(ele => ele.oper),
            });

            for (const operation of operations) {
                operation.afterExecute && await operation.afterExecute();
            }

            // 清空缓存
            node.clean();
            node.setExecuting(false);
            return;
        }
        catch (err) {
            node.setExecuting(false);
            throw err;
        }
    }

    @Action
    clean(path: string) {
        const node = this.findNode(path);

        node.clean();
    }

    getRoot() {
        return this.root;
    }
}