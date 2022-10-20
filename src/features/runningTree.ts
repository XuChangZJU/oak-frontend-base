import { assert } from 'oak-domain/lib/utils/assert';
import { cloneDeep, pull, set, unset, merge } from "oak-domain/lib/utils/lodash";
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
    protected modiIds: string[];        //  对象所关联的modi的id

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
        this.modiIds = [];
    }

    getEntity() {
        return this.entity;
    }

    protected abstract getChildPath(child: Node<ED, keyof ED, Cxt, AD>): string;
    abstract doBeforeTrigger(): Promise<void>;
    abstract doAfterTrigger(): Promise<void>;

    /**
     * 这个函数从某个结点向父亲查询，看所在路径上是否有需要被应用的modi
     */
    getModiIds(child: Node<ED, keyof ED, Cxt, AD>): string[] {
        const childPath = this.getChildPath(child);
        if (childPath.includes(':')) {
            const { modiIds } = this;
            // 如果是需要modi的路径，在这里应该就可以返回了，目前应该不存在modi嵌套modi
            return modiIds;
        }
        const { toModi } = this.schema[this.entity];
        if (toModi) {
            // 如果这就是一个toModi的对象，则不用再向上查找了
            return [];
        }
        if (this.parent) {
            return this.parent.getModiIds(this);
        }
        return [];
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

    protected async getProjection() {
        return typeof this.projection === 'function' ? await this.projection() : cloneDeep(this.projection);
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
    currentPage: 1,
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
                /**
                 * 多对一的关系，这里不可能from是remove吧
                 */
                const result = mergeOperationOper(attr, schema, (from[attr] as any), (into[attr] as any));
                assert(!result);
            }
            else if (typeof rel === 'string') {
                const result = mergeOperationOper(rel, schema, (from[attr] as any), (into[attr] as any));
                assert(!result);
            }
            else if (rel instanceof Array) {
                // 这种情况还不是很清楚，感觉不太可能跑的到 by Xc
                assert(false);
                /* const [entity2] = rel;
                const {
                    index,
                    eliminated,
                } = findOperationToMerge(entity2, schema, from[attr] as any, into[attr] as any);
                if (!index) {
                    (into[attr] as any).push(from[attr]);
                }
                else {
                    const result2 = mergeOperationOper(entity2, schema, from[attr] as any, index);
                    if (result2) {
                        pull(from[attr] as any, index);
                    }
                } */
            }
            else {
                into[attr] = from[attr];
            }
        }
    }
}

/**
 * 确定两个Operation要merge
 * @param entity 
 * @param schema 
 * @param from 
 * @param into 
 */
function mergeOperationOper<ED extends EntityDict & BaseEntityDict, T extends keyof ED>(
    entity: T,
    schema: StorageSchema<ED>,
    from: Omit<ED[T]['Operation'], 'id'>,
    into: ED[T]['Operation']
) {
    const { action, data, filter } = from;
    const { data: dataTo } = into;
    if (action === into.action) {
        switch (action) {
            case 'create': {
                if (dataTo instanceof Array) {
                    if (data instanceof Array) {
                        data.forEach(
                            ele => assert(ele.id)
                        );
                        dataTo.push(...data);
                    }
                    else {
                        assert(data.id);
                        dataTo.push(data as ED[T]['CreateSingle']['data']);
                    }
                }
                else if (!(data instanceof Array) && !data.id) {
                    // 特殊情况，其实就是单次create
                    mergeOperationData(entity, schema, data, dataTo);
                }
                else {
                    const data3 = [dataTo] as ED[T]['CreateMulti']['data'];
                    if (data instanceof Array) {
                        data3.push(...data);
                    }
                    else {
                        data3.push(data as ED[T]['CreateSingle']['data']);
                    }
                    Object.assign(into, {
                        data: data3,
                    });
                }
                return false;
            }
            default: {
                mergeOperationData(entity, schema, data, dataTo);
                return false;
            }
        }
    }
    else {
        if (action === 'update' && into.action === 'create') {
            // 更新刚create的数据，直接加在上面
            const { data: operData } = into;
            if (operData instanceof Array) {
                for (const operData2 of operData) {
                    if (operData2.id === filter!.id) {
                        mergeOperationData(entity, schema, data, operData2);
                        return false;
                    }
                }
            }
            else {
                if (operData.id === filter!.id) {
                    mergeOperationData(entity, schema, data, operData);
                    return false;
                }
            }
        }
        else if (action === 'remove') {
            assert(into.action === 'create');
            // create和remove动作相抵消
            const { data: operData } = into;
            if (operData instanceof Array) {
                for (const operData2 of operData) {
                    if (operData2.id === filter!.id) {
                        if (operData.length > 0) {
                            Object.assign(into, {
                                data: pull(operData, operData2)
                            });
                            return false;
                        }
                        else {
                            return true;
                        }
                    }
                }
            }
            else {
                if (operData.id === filter!.id) {
                    return true;
                }
            }
        }
    }
    assert(false); // merge必须成功
}

function mergeOperationTrigger<ED extends EntityDict & BaseEntityDict, T extends keyof ED>(
    from: Operation<ED, T, true>,
    to: Operation<ED, T>
) {
    const { beforeExecute: be1, afterExecute: ae1 } = from;

    if (be1) {
        assert(!to.beforeExecute);
        to.beforeExecute = be1;
    }
    if (ae1) {
        assert(!to.afterExecute);
        to.afterExecute = ae1;
    }
}

function findOperationToMerge<ED extends EntityDict & BaseEntityDict, T extends keyof ED>(
    entity: T,
    schema: StorageSchema<ED>,
    from: Omit<ED[T]['Operation'], 'id'>,
    existed: ED[T]['Operation'][]
): {
    index: ED[T]['Operation'] | undefined;
    eliminated: ED[T]['Operation'][];
} {
    const { action, filter } = from;
    const eliminated: ED[T]['Operation'][] = [];
    for (const toOperation of existed) {
        if (action === toOperation.action) {
            switch (action) {
                case 'create': {
                    return {
                        index: toOperation,
                        eliminated,
                    };
                }
                default: {
                    // update/remove只合并filter完全相同的项
                    const { filter: filter2, data: data2 } = toOperation;
                    assert(filter && filter2, '更新动作目前应该都有谓词条件');
                    if (same(entity, schema, filter, filter2)) {
                        return {
                            index: toOperation,
                            eliminated,
                        };
                    }
                }
            }
        }
        else {
            if (action === 'update' && toOperation.action === 'create') {
                // 更新刚create的数据，直接加在上面
                const { data: operData } = toOperation;
                if (operData instanceof Array) {
                    for (const operData2 of operData) {
                        if (operData2.id === filter!.id) {
                            return {
                                index: toOperation,
                                eliminated,
                            };
                        }
                    }
                }
                else {
                    if (operData.id === filter!.id) {
                        return {
                            index: toOperation,
                            eliminated,
                        };
                    }
                }
            }
            else if (action === 'remove') {
                if (toOperation.action === 'create') {
                    // create和remove动作相抵消
                    const { data: operData } = toOperation;
                    if (operData instanceof Array) {
                        for (const operData2 of operData) {
                            if (operData2.id === filter!.id) {
                                return {
                                    index: toOperation,
                                    eliminated,
                                };
                            }
                        }
                    }
                    else {
                        if (operData.id === filter!.id) {
                            return {
                                index: toOperation,
                                eliminated,
                            };
                        }
                    }
                }
                else {
                    // update，此时把相同id的update直接去掉
                    const { filter: operFilter } = toOperation;
                    if (filter?.id === operFilter?.id) {
                        eliminated.push(toOperation);
                    }
                }
            }
        }
    }
    // 到这儿说明merge不了
    return {
        index: undefined,
        eliminated,
    };
}
/**
 * 尝试将operation行为merge到现有的operation中去
 * @param operation 
 * @param existed 
 * @return 是否merge成功
 */
function tryMergeOperationToExisted<ED extends EntityDict & BaseEntityDict, T extends keyof ED>(
    entity: T,
    schema: StorageSchema<ED>,
    operation: Operation<ED, T, true>,
    existed: Operation<ED, T>[]
) {
    const { oper } = operation;
    // 有动作的operation是不能合并的
    const existedOperations = existed.filter(ele => !ele.afterExecute && !ele.beforeExecute).map(ele => ele.oper);
    const {
        index,
        eliminated,
    } = findOperationToMerge(entity, schema, oper, existedOperations);

    if (index) {
        // 可以合并
        const origin = existed.find(ele => ele.oper === index);
        assert(origin);
        const result = mergeOperationOper(entity, schema, oper, index);
        if (result) {
            // 说明相互抵消了
            pull(existed, origin);
        }
        else {
            mergeOperationTrigger(operation, origin);
        }
    }
    for (const eli of eliminated) {
        const origin = existed.find(ele => ele.oper === eli);
        pull(existed, origin);
    }

    return !!index;
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

    protected getChildPath(child: Node<ED, keyof ED, Cxt, AD>): string {
        let idx = 0;
        for (const child2 of this.children) {
            if (child === child2) {
                return `${idx}`;
            }
            idx++;
        }

        assert(false);
    }

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

            const { sorter, filters } = await this.constructSelection(true);
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
            await this.refresh(1, true);
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
            await this.refresh(1, true);
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
            await this.refresh(1, true);
        }
    }

    async removeNamedFilterByName(name: string, refresh?: boolean) {
        // filter 根据#name查找
        const fIndex = this.filters.findIndex((ele) => ele['#name'] === name);
        if (fIndex >= 0) {
            this.filters.splice(fIndex, 1);
        }
        if (refresh) {
            await this.refresh(1, true);
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
            await this.refresh(1, true);
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
            await this.refresh(1, true);
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
            await this.refresh(1, true);
        }
    }

    async removeNamedSorterByName(name: string, refresh: boolean) {
        // sorter 根据#name查找
        const fIndex = this.sorters.findIndex((ele) => ele['#name'] === name);
        if (fIndex >= 0) {
            this.sorters.splice(fIndex, 1);
        }
        if (refresh) {
            await this.refresh(1, true);
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

        // 如果本结点是在modi路径上，需要将modi更新之后再得到后项
        const modiIds = this.parent ? this.parent.getModiIds(this) : [];
        const operations = modiIds.map(
            ele => ({
                entity: 'modi',
                operation: {
                    action: 'apply',
                    data: {},
                    filter: {
                        id: ele,
                    },
                }
            })
        ) as Array<{
            entity: keyof ED;
            operation: ED[keyof ED]['Operation'];
        }>;
        operations.push(...this.operations.map(
            ele => ({
                entity: this.entity,
                operation: ele.oper,
            })
        ));

        const { result } = await this.cache.tryRedoOperationsThenSelect(this.entity, {
            data: projection,
            filter: {
                id: {
                    $in: ids,
                }
            } as any,
        }, operations);
        return result;
    }

    async addOperation(oper: Omit<ED[T]['Operation'], 'id'>, beforeExecute?: Operation<ED, T>['beforeExecute'], afterExecute?: Operation<ED, T>['afterExecute']) {
        const operation = {
            oper,
            beforeExecute,
            afterExecute,
        }
        const merged = tryMergeOperationToExisted(this.entity, this.schema, operation, this.operations);
        if (!merged) {
            Object.assign(oper, { id: await generateNewId() })
            this.operations.push(operation as Operation<ED, T>);
        }
        this.setDirty();
    }

    async doBeforeTrigger(): Promise<void> {
        for (const operation of this.operations) {
            if (operation.beforeExecute) {
                await operation.beforeExecute();
            }
        }

        for (const child of this.children) {
            await child.doBeforeTrigger();
        }
    }

    async doAfterTrigger(): Promise<void> {
        for (const operation of this.operations) {
            if (operation.afterExecute) {
                await operation.afterExecute();
            }
        }

        for (const child of this.children) {
            await child.doAfterTrigger();
        }
    }

    async composeOperations() {
        if (!this.dirty) {
            return;
        }
        const childOperations = await Promise.all(
            this.children.map(
                async ele => {
                    const subOper = await ele.composeOperations();
                    if (subOper) {
                        return subOper[0];
                    }
                }
            )
        );

        const operations: ED[T]['Operation'][] = cloneDeep(this.operations.map(ele => ele.oper));
        for (const oper of childOperations) {
            if (oper) {
                const {
                    index,
                    eliminated,
                } = findOperationToMerge(this.entity, this.schema, oper, operations);
                if (index) {
                    // 可以合并
                    const result = mergeOperationOper(this.entity, this.schema, oper, index);
                    if (result) {
                        // 说明相互抵消了
                        pull(operations, index);
                    }
                    else {
                    }
                }
                else {
                    operations.push(oper);
                }


                for (const eli of eliminated) {
                    if (eli) {
                        pull(operations, eli);
                    }
                }
            }
        }

        await repairOperations(this.entity, this.schema, operations);
        return operations;
    }

    async getProjection(): Promise<ED[T]['Selection']['data']> {
        const projection = await super.getProjection();
        if (this.children.length > 0) {
            const subProjection = await this.children[0].getProjection();
            return merge(projection, subProjection);
        }
        return projection;
    }

    async constructSelection(withParent?: true) {
        const { filters, sorters } = this;
        const data = await this.getProjection();
        assert(data, "取数据时找不到projection信息");
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

        if (withParent) {
            const filterOfParent = (this.parent as SingleNode<ED, keyof ED, Cxt, AD>)?.getOtmFilter<T>(this);
            if (filterOfParent) {
                filterArr.push(filterOfParent as any);
            }
        }

        return {
            data,
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
        const currentPage3 = typeof pageNumber === 'number' ? pageNumber - 1 : currentPage - 1;
        const { data: projection, filters, sorter } = await this.constructSelection(true);
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
            this.pagination.currentPage = currentPage3 + 1;
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
    }

    protected getChildPath(child: Node<ED, keyof ED, Cxt, AD>): string {
        for (const k in this.children) {
            if (child === this.children[k]) {
                return k;
            }
        }
        assert(false);
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

        // 如果本结点是在modi路径上，需要将modi更新之后再得到后项
        const modiIds = this.parent ? this.parent.getModiIds(this) : [];
        const operations = modiIds.map(
            ele => ({
                entity: 'modi',
                operation: {
                    action: 'apply',
                    data: {},
                    filter: {
                        id: ele,
                    },
                }
            })
        ) as Array<{
            entity: keyof ED;
            operation: ED[keyof ED]['Operation'];
        }>;
        const [operation] = this.operations;
        let id = this.id;
        if (operation?.oper.action === 'create') {
            id = (operation.oper.data as ED[T]['CreateSingle']['data']).id;
        }
        operations.push(...this.operations.map(
            ele => ({
                entity: this.entity,
                operation: ele.oper,
            })
        ));
        const { result } = await this.cache.tryRedoOperationsThenSelect(this.entity, {
            data: projection,
            filter: {
                id,
            } as any,
        }, operations);
        return result[0];
    }


    async doBeforeTrigger(): Promise<void> {
        for (const operation of this.operations) {
            if (operation.beforeExecute) {
                await operation.beforeExecute();
            }
        }

        for (const k in this.children) {
            const child = this.children[k];
            await child.doBeforeTrigger();
        }
    }


    async doAfterTrigger(): Promise<void> {
        for (const operation of this.operations) {
            if (operation.afterExecute) {
                await operation.afterExecute();
            }
        }

        for (const k in this.children) {
            const child = this.children[k];
            await child.doAfterTrigger();
        }
    }

    async addOperation(oper: Omit<ED[T]['Operation'], 'id'>, beforeExecute?: Operation<ED, T>['beforeExecute'], afterExecute?: Operation<ED, T>['afterExecute']) {
        if (oper.action !== 'create') {
            assert(this.id);
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
        }
        const operation = {
            oper,
            beforeExecute,
            afterExecute,
        };
        if (this.operations.length === 0) {
            // 处理一下create
            if (oper.action === 'create') {
                Object.assign(oper.data, {
                    id: await generateNewId(),
                });
            }
            Object.assign(oper, { id: await generateNewId() });
            this.operations.push(operation as Operation<ED, T>);
        }
        else {
            // singleNode上应当有且只有一个operation，无论什么情况
            const [current] = this.operations;
            Object.assign(current.oper.data, oper.data);
            mergeOperationTrigger(operation, current);
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
                    let subOper;
                    if (childOperations) {
                        if (child instanceof SingleNode) {
                            subOper = childOperations[0];
                        }
                        else {
                            assert(child instanceof ListNode);
                            subOper = childOperations;
                        }
                    }

                    if (subOper) {
                        const sliceIdx = ele.indexOf(':');
                        const ele2 = sliceIdx > 0 ? ele.slice(0, sliceIdx) : ele;
                        if (this.id) {
                            return {
                                id: 'dummy',        // 因为肯定会被merge掉，所以无所谓了
                                action: 'update',
                                data: {
                                    [ele2]: subOper,
                                },
                                filter: {
                                    id: this.id,
                                }
                            } as ED[T]['Operation'];
                        }
                        else {
                            return {
                                id: 'dummy',        // 因为肯定会被merge掉，所以无所谓了
                                action: 'create',
                                data: {
                                    [ele2]: subOper,
                                },
                            } as ED[T]['Operation'];
                        }
                    }
                }
            )
        );

        const operations: ED[T]['Operation'][] = [];
        if (this.operations.length > 0) {
            assert(this.operations.length === 1);
            // 这里不能直接改this.operations，只能克隆一个新的
            operations.push(cloneDeep(this.operations[0].oper));
        }
        else {
            if (this.id) {
                operations.push({
                    id: await generateNewId(),
                    action: 'update',
                    data: {},
                    filter: {
                        id: this.id,
                    } as any,
                });
            }
            else {
                operations.push({
                    id: await generateNewId(),
                    action: 'create',
                    data: {},
                });
            }
        }
        for (const oper of childOperations) {
            if (oper) {
                mergeOperationOper(this.entity, this.schema, oper, operations[0]); // SingleNode貌似不可能不merge成功
            }
        }
        await repairOperations(this.entity, this.schema, operations);
        return operations;
    }

    async getProjection() {
        const projection = await super.getProjection();
        for (const k in this.children) {
            if (k.indexOf(':') === -1) {
                const rel = this.judgeRelation(k);
                if (rel === 2 || typeof rel === 'string') {
                    const subProjection = await this.children[k].getProjection();
                    Object.assign(projection, {
                        [k]: subProjection,
                    });
                }
                else {
                    const child = this.children[k];
                    assert(rel instanceof Array && child instanceof ListNode);
                    const subSelection = await child.constructSelection();
                    const subEntity = child.getEntity();
                    Object.assign(projection, {
                        [k]: Object.assign(subSelection, {
                            $entity: subEntity,
                        })
                    });
                }
            }
        }
        return projection;
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
                // 对于modi对象，在此缓存
                if (this.schema[this.entity].toModi) {
                    const { modi$entity } = value;
                    this.modiIds = (modi$entity as Array<{ id: string }>).map(ele => ele.id);
                }
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
                const sliceIdx = key.indexOf(':');
                const key2 = sliceIdx > 0 ? key.slice(0, sliceIdx) : key;
                const rel = this.judgeRelation(key2);
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

async function repairOperations<ED extends EntityDict & BaseEntityDict, T extends keyof ED>(entity: T, schema: StorageSchema<ED>, operations: ED[T]['Operation'][]) {
    async function repairData<T2 extends keyof ED>(entity2: T2, data: ED[T2]['CreateSingle']['data']) {
        for (const attr in data) {
            const rel = judgeRelation(schema, entity2, attr);
            if (rel === 2) {
                await repairOperations(attr, schema, [data[attr]]);
            }
            else if (typeof rel === 'string') {
                await repairOperations(rel, schema, [data[attr]]);
            }
            else if (rel instanceof Array) {
                await repairOperations(rel[0], schema, (data[attr] as any) instanceof Array ? data[attr] : [data[attr]]);
            }
        }
    }
    for (const operation of operations) {
        if (!operation.id) {
            operation.id = await generateNewId();
        }
        const { data } = operation as ED[T]['Create'];

        if (data instanceof Array) {
            for (const d of data) {
                await repairData(entity, d);
            }
        }
        else {
            await repairData(entity, data);
        }
    }
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
        } else {
            node = new SingleNode<ED, T, Cxt, AD>(
                entity,
                this.schema!,
                this.cache,
                projection,
                projectionShape,
                parentNode
            );
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
            await node.refresh(1, true);
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
        await node.setNamedFilters(filters, refresh);
    }

    @Action
    async addNamedFilter<T extends keyof ED>(
        path: string,
        filter: NamedFilterItem<ED, T>,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.addNamedFilter(filter, refresh);
    }

    @Action
    async removeNamedFilter<T extends keyof ED>(
        path: string,
        filter: NamedFilterItem<ED, T>,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.removeNamedFilter(filter, refresh);
    }

    @Action
    async removeNamedFilterByName<T extends keyof ED>(
        path: string,
        name: string,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.removeNamedFilterByName(name, refresh);
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
        return node.setNamedSorters(sorters, refresh);
    }

    @Action
    async addNamedSorter<T extends keyof ED>(
        path: string,
        sorter: NamedSorterItem<ED, T>,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.addNamedSorter(sorter, refresh);
    }

    @Action
    async removeNamedSorter<T extends keyof ED>(
        path: string,
        sorter: NamedSorterItem<ED, T>,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.removeNamedSorter(sorter, refresh);
    }

    @Action
    async removeNamedSorterByName<T extends keyof ED>(
        path: string,
        name: string,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.removeNamedSorterByName(name, refresh);
    }

    async tryExecute(path: string) {
        const node = this.findNode(path);
        const operations = await node.composeOperations();
        if (operations) {
            return await this.cache.tryRedoOperations(node.getEntity(), operations);
        }
        return false;
    }

    @Action
    async execute(path: string) {
        const node = this.findNode(path);
        assert(node.isDirty());

        node.setExecuting(true);
        try {
            await node.doBeforeTrigger();
            const operations = await node.composeOperations();

            await this.getAspectWrapper().exec('operate', {
                entity: node.getEntity() as string,
                operation: operations!.filter(ele => !!ele),
            });

            await node.doAfterTrigger();

            // 清空缓存
            node.clean();
            node.setExecuting(false);
            return operations;
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