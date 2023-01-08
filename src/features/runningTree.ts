import { assert } from 'oak-domain/lib/utils/assert';
import { cloneDeep, pull, unset, merge, uniq } from "oak-domain/lib/utils/lodash";
import { addFilterSegment, combineFilters, contains, repel, same } from "oak-domain/lib/store/filter";
import { createOperationsFromModies } from 'oak-domain/lib/store/modi';
import { judgeRelation } from "oak-domain/lib/store/relation";
import { EntityDict, StorageSchema, OpRecord, CreateOpResult, RemoveOpResult, DeduceSorterItem, AspectWrapper } from "oak-domain/lib/types";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';

import { NamedFilterItem, NamedSorterItem } from "../types/NamedCondition";
import { Cache } from './cache';
import { Pagination } from '../types/Pagination';
import { Feature } from '../types/Feature';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { generateNewId } from 'oak-domain/lib/utils/uuid';

type Operation<ED extends EntityDict & BaseEntityDict, T extends keyof ED, OmitId extends boolean = false> = {
    oper: OmitId extends true ? Omit<ED[T]['Operation'], 'id'> : ED[T]['Operation'];
    beforeExecute?: () => Promise<void>;
    afterExecute?: () => Promise<void>;
};

abstract class Node<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>,
    AD extends CommonAspectDict<ED, Cxt>> extends Feature {
    protected entity: T;
    // protected fullPath: string;
    protected schema: StorageSchema<ED>;
    protected projection: ED[T]['Selection']['data'] | (() => ED[T]['Selection']['data']);      // 只在Page层有
    protected parent?: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, T, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>;
    protected dirty?: boolean;
    protected cache: Cache<ED, Cxt, FrontCxt, AD>;
    protected loading: boolean;
    protected loadingMore: boolean;
    protected executing: boolean;
    protected modiIds: string[] | undefined;        //  对象所关联的modi


    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, FrontCxt, AD>,
        projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>),
        parent?: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, T, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>,
        path?: string) {
        super();
        this.entity = entity;
        this.schema = schema;
        this.cache = cache;
        this.projection = projection;
        this.parent = parent;
        this.dirty = undefined;
        this.loading = false;
        this.loadingMore = false;
        this.executing = false;
        this.modiIds = undefined;
        if (parent) {
            assert(path);
            parent.addChild(path, this as any);
        }
    }

    getEntity() {
        return this.entity;
    }

    getSchema() {
        return this.schema;
    }

    protected abstract getChildPath(child: Node<ED, keyof ED, Cxt, FrontCxt, AD>): string;
    abstract doBeforeTrigger(): Promise<void>;
    abstract doAfterTrigger(): Promise<void>;
    abstract checkIfClean(): void;

    /**
     * 这个函数从某个结点向父亲查询，看所在路径上是否有需要被应用的modi
     */
    getActiveModies(child: Node<ED, keyof ED, Cxt, FrontCxt, AD>): BaseEntityDict['modi']['OpSchema'][] | undefined {
        const childPath = this.getChildPath(child);
        if (childPath.includes(':next')) {
            const { modiIds } = this;
            // 如果是需要modi的路径，在这里应该就可以返回了，目前应该不存在modi嵌套modi
            if (modiIds && modiIds.length > 0) {
                const modies = this.cache.get('modi', {
                    data: {
                        id: 1,
                        targetEntity: 1,
                        entity: 1,
                        entityId: 1,
                        iState: 1,
                        action: 1,
                        data: 1,
                        filter: 1,
                    },
                    filter: {
                        id: {
                            $in: modiIds,
                        },
                        iState: 'active',
                    }
                });
                return modies as BaseEntityDict['modi']['OpSchema'][];
            }
            return [];
        }
        const { toModi } = this.schema[this.entity];
        if (toModi) {
            // 如果这就是一个toModi的对象，则不用再向上查找了
            return;
        }
        if (this.parent) {
            return this.parent.getActiveModies(this);
        }
        return;
    }

    setDirty() {
        if (!this.dirty) {
            this.dirty = true;
        }
        this.publish();
        if (this.parent) {
            this.parent.setDirty();
        }
    }

    isDirty() {
        return !!this.dirty;
    }

    isLoading() {
        return this.loading;
    }

    protected setLoading(loading: boolean) {
        this.loading = loading;
    }

    isLoadingMore() {
        return this.loadingMore;
    }

    isExecuting() {
        return this.executing;
    }

    setExecuting(executing: boolean) {
        this.executing = executing;
        this.publish();
    }

    getParent() {
        return this.parent;
    }

    protected getProjection() {
        return typeof this.projection === 'function' ? this.projection() : cloneDeep(this.projection);
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
            else if (rel instanceof Array && !attr.endsWith('$$aggr')) {
                /**
                 * 两个一对多的list要合并，直接合并list就可以了，前端设计上应该不可能出现两个一对多的list相交的case
                 * $extraFile$XXX:1     $extraFile$XXX:2
                 */
                // (into[attr] as unknown as ED[keyof ED]['Operation'][]).push(...(from[attr] as unknown as ED[keyof ED]['Operation'][]));
                const [entity2] = rel;
                const mergeInner = (item: ED[keyof ED]['Operation']) => {
                    const {
                        index,
                        eliminated,
                    } = findOperationToMerge(entity2, schema, item, into[attr] as any);
                    if (!index) {
                        (into[attr] as any).push(item);
                    }
                    else {
                        const result2 = mergeOperationOper(entity2, schema, item, index);
                        if (result2) {
                            pull(into[attr] as any, index);
                        }
                    }

                    for (const eli of eliminated) {
                        pull((into[attr] as unknown as ED[keyof ED]['Operation'][]), eli);
                    }
                };
                if (from[attr] instanceof Array) {
                    for (const operation of from[attr] as unknown as ED[keyof ED]['Operation'][]) {
                        mergeInner(operation);
                    }
                }
                else {
                    assert(false);      // 前台感觉是跑不出这个case的
                    mergeInner(from[attr] as unknown as ED[keyof ED]['Operation']);
                }
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
    if (action === 'create') {
        assert(into.action === 'create');
        /**
         * 前端的页面设计，如果要merge两个create动作，要么都是single，要么都是array
         * 不应该出现array和single并存的case
         */
        if (dataTo instanceof Array) {
            assert(data instanceof Array);
            data.forEach(
                ele => assert(ele.id)
            );
            dataTo.push(...data);
        }
        else {
            assert(!(data instanceof Array));
            mergeOperationData(entity, schema, data, dataTo);
        }
        return false;
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
            // 当前action都是update
            if (operData.id === filter!.id) {
                return true;
            }
        }
    }
    else {
        assert(into.action !== 'remove');
        if (into.action === 'create') {
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
        else {
            mergeOperationData(entity, schema, data, dataTo);
            if (action !== 'update') {
                assert(into.action === 'update' || into.action === action);
                if (process.env.NODE_ENV === 'development') {
                    console.warn(`合并了${action}到update动作，请确认合理性`);
                }
                into.action = action;
            }
            return false;
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
    if (action === 'create') {
        // action不可能和当前已经的某个动作发生merge
        return {
            index: undefined,
            eliminated,
        };
    }
    for (const toOperation of existed) {
        if (action === toOperation.action) {
            switch (action) {
                case 'create': {
                    // 两个create不可能merge，如果是many to one，则不用走到这里判断
                    break;
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
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>,
    AD extends CommonAspectDict<ED, Cxt>
> extends Node<ED, T, Cxt, FrontCxt, AD> {
    private children: Record<string, SingleNode<ED, T, Cxt, FrontCxt, AD>>;
    private updates: Record<string, {
        operation: ED[T]['CreateSingle'] | ED[T]['Update'] | ED[T]['Remove'],
        beforeExecute?: () => Promise<void>;
        afterExecute?: () => Promise<void>;
    }>;

    private filters: NamedFilterItem<ED, T>[];
    private sorters: NamedSorterItem<ED, T>[];
    private pagination: Pagination;
    private ids: string[] | undefined;

    private syncHandler: (records: OpRecord<ED>[]) => void;

    getChildPath(child: SingleNode<ED, T, Cxt, FrontCxt, AD>): string {
        let idx = 0;
        for (const k in this.children) {
            if (this.children[k] === child) {
                return k;
            }
            idx++;
        }

        assert(false);
    }

    /* setLoading(loading: boolean) {
        super.setLoading(loading);
        for (const k in this.children) {
            this.children[k].setLoading(loading);
        }
    } */

    checkIfClean(): void {
        if (Object.keys(this.updates).length > 0) {
            return;
        }
        for (const k in this.children) {
            if (this.children[k].isDirty()) {
                return;
            }
        }
        if (this.isDirty()) {
            this.dirty = false;
            this.parent?.checkIfClean();
        }
    }

    onCacheSync(records: OpRecord<ED>[]) {
        // 只需要处理insert
        if (this.loading) {
            return;
        }
        if (!this.ids) {
            return;
        }
        let needRefresh = false;
        for (const record of records) {
            const { a } = record;
            switch (a) {
                case 'c': {
                    const { e } = record as CreateOpResult<ED, T>;
                    if (e === this.entity) {
                        needRefresh = true;
                    }
                    break;
                }
                case 'r': {
                    const { e } = record as RemoveOpResult<ED, T>;
                    if (e === this.entity) {
                        needRefresh = true;
                    }
                    break;
                }
                default: {
                    break;
                }
            }
            if (needRefresh) {
                break;
            }
        }
        /**
         * 这样处理可能会导致对B对象的删除或插入影响到A对象的list结果，当A的filter存在in B的查询时
         * 典型的例子如userRelationList中对user的查询
         * filter是： {
                    id: {
                        $in: {
                            entity: `user${entityStr}`,
                            data: {
                                userId: 1,
                            },
                            filter: {
                                [`${entity}Id`]: entityId,
                            },
                        },
                    },
                }
            此时对userRelation的删除动作就会导致user不会被移出list
         */
        if (needRefresh) {
            const { filter, sorter } = this.constructSelection(true);
            const result = this.cache.get(this.getEntity(), {
                data: {
                    id: 1,
                },
                filter,
                sorter
            });
            this.ids = result.map(ele => ele.id) as unknown as string[];
            // 此时有可能原来的children上的id发生了变化
        }
    }

    destroy(): void {
        this.cache.unbindOnSync(this.syncHandler);
        for (const k in this.children) {
            this.children[k].destroy();
        }
    }

    constructor(
        entity: T,
        schema: StorageSchema<ED>,
        cache: Cache<ED, Cxt, FrontCxt, AD>,
        projection:
            | ED[T]['Selection']['data']
            | (() => Promise<ED[T]['Selection']['data']>),
        parent?: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>,
        path?: string,
        filters?: NamedFilterItem<ED, T>[],
        sorters?: NamedSorterItem<ED, T>[],
        pagination?: Pagination
    ) {
        super(entity, schema, cache, projection, parent, path);
        this.children = {};
        this.filters = filters || [];
        this.sorters = sorters || [];
        this.pagination = pagination || DEFAULT_PAGINATION;
        this.updates = {};

        this.syncHandler = (records) => this.onCacheSync(records);
        this.cache.bindOnSync(this.syncHandler);
    }

    getPagination() {
        return this.pagination;
    }

    setPagination(pagination: Pagination) {
        const newPagination = Object.assign(this.pagination, pagination);
        this.pagination = newPagination;
        this.refresh();
    }

    getChild(
        path: string,
    ): SingleNode<ED, T, Cxt, FrontCxt, AD> | undefined {
        return this.children[path];
    }

    getChildren() {
        return this.children;
    }

    addChild(path: string, node: SingleNode<ED, T, Cxt, FrontCxt, AD>) {
        assert(!this.children[path]);
        assert(path.length > 10, 'List的path改成了id');
        this.children[path] = node;
    }

    removeChild(path: string) {
        unset(this.children, path);
    }

    getNamedFilters() {
        return this.filters;
    }

    getNamedFilterByName(name: string) {
        const filter = this.filters.find((ele) => ele['#name'] === name);
        return filter;
    }

    setNamedFilters(filters: NamedFilterItem<ED, T>[], refresh?: boolean) {
        this.filters = filters;
        if (refresh) {
            this.refresh(1, true);
        }
        else {
            this.publish();
        }
    }

    addNamedFilter(filter: NamedFilterItem<ED, T>, refresh?: boolean) {
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
            this.refresh(1, true);
        }
        else {
            this.publish();
        }
    }

    removeNamedFilter(filter: NamedFilterItem<ED, T>, refresh?: boolean) {
        // filter 根据#name查找
        const fIndex = this.filters.findIndex(
            (ele) => filter['#name'] && ele['#name'] === filter['#name']
        );
        if (fIndex >= 0) {
            this.filters.splice(fIndex, 1);
        }
        if (refresh) {
            this.refresh(1, true);
        }
        else {
            this.publish();
        }
    }

    removeNamedFilterByName(name: string, refresh?: boolean) {
        // filter 根据#name查找
        const fIndex = this.filters.findIndex((ele) => ele['#name'] === name);
        if (fIndex >= 0) {
            this.filters.splice(fIndex, 1);
        }
        if (refresh) {
            this.refresh(1, true);
        }
        else {
            this.publish();
        }
    }

    getNamedSorters() {
        return this.sorters;
    }

    getNamedSorterByName(name: string) {
        const sorter = this.sorters.find((ele) => ele['#name'] === name);
        return sorter;
    }

    setNamedSorters(sorters: NamedSorterItem<ED, T>[], refresh?: boolean) {
        this.sorters = sorters;
        if (refresh) {
            this.refresh(1, true);
        }
        else {
            this.publish();
        }
    }

    addNamedSorter(sorter: NamedSorterItem<ED, T>, refresh?: boolean) {
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
            this.refresh(1, true);
        }
        else {
            this.publish();
        }
    }

    removeNamedSorter(sorter: NamedSorterItem<ED, T>, refresh?: boolean) {
        // sorter 根据#name查找
        const fIndex = this.sorters.findIndex(
            (ele) => sorter['#name'] && ele['#name'] === sorter['#name']
        );
        if (fIndex >= 0) {
            this.sorters.splice(fIndex, 1);
        }
        if (refresh) {
            this.refresh(1, true);
        }
        else {
            this.publish();
        }
    }

    removeNamedSorterByName(name: string, refresh: boolean) {
        // sorter 根据#name查找
        const fIndex = this.sorters.findIndex((ele) => ele['#name'] === name);
        if (fIndex >= 0) {
            this.sorters.splice(fIndex, 1);
        }
        if (refresh) {
            this.refresh(1, true);
        }
        else {
            this.publish();
        }
    }

    getFreshValue(): Array<Partial<ED[T]['Schema']>> {
        // 在createOperation中的数据也是要返回的
        const createdIds: string[] = [];
        for (const k in this.updates) {
            const { operation } = this.updates[k];
            if (operation.action === 'create') {
                const { data } = operation;
                assert(!(data instanceof Array));
                createdIds.push(data.id);
            }
        }

        // 如果本结点是在modi路径上，需要将modi更新之后再得到后项
        const modies = this.parent && this.parent.getActiveModies(this);
        const operations = modies ? createOperationsFromModies(modies) as Array<{
            entity: keyof ED;
            operation: ED[keyof ED]['Operation'];
        }> : [];
        operations.push(...Object.keys(this.updates).map(
            ele => ({
                entity: this.entity,
                operation: this.updates[ele].operation,
            })
        ));

        // 如果有modi，则不能以ids作为当前对象，需要向上层获得filter应用了modi之后再找过
        const selection = this.constructSelection(true);
        if (selection.validParentFilter || createdIds.length > 0) {
            if (undefined === modies) {
                Object.assign(selection, {
                    filter: {
                        id: {
                            $in: createdIds.concat(this.ids || []),
                        }
                    }
                });
            }
            else if (createdIds.length > 0) {
                const { filter } = selection;
                Object.assign(selection, {
                    filter: combineFilters([filter, { id: { $in: createdIds } }].filter(ele => !!ele), true),
                });
            }

            const result = this.cache.tryRedoOperationsThenSelect(this.entity, selection, operations, this.isLoading() || this.isLoadingMore());
            return result;
        }
        return [];
    }

    addItem(item: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        const id = generateNewId();
        assert(!this.updates[id]);
        this.updates[id] = {
            beforeExecute,
            afterExecute,
            operation: {
                id: generateNewId(),
                action: 'create',
                data: Object.assign(item, { id }),
            },
        };
        this.setDirty();
    }

    removeItem(id: string, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        if (this.updates[id] && this.updates[id].operation.action === 'create') {
            // 如果是新增项，在这里抵消
            unset(this.updates, id);
        }
        else {
            this.updates[id] = {
                beforeExecute,
                afterExecute,
                operation: {
                    id: generateNewId(),
                    action: 'remove',
                    data: {},
                    filter: {
                        id,
                    },
                } as ED[T]['Remove'],
            };
        }
        this.setDirty();
    }

    recoverItem(id: string) {
        const { operation } = this.updates[id];
        assert(operation.action === 'remove');
        unset(this.updates, id);
        this.setDirty();
    }

    /**
     * 目前只支持根据itemId进行更新
     * @param data 
     * @param id 
     * @param beforeExecute 
     * @param afterExecute 
     */
    updateItem(data: ED[T]['Update']['data'], id: string, action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        assert(Object.keys(this.children).length === 0, `更新子结点应该落在相应的component上`);
        if (this.updates[id]) {
            const { operation } = this.updates[id];
            const { data: dataOrigin } = operation;
            merge(dataOrigin, data);
            if (action && operation.action !== action) {
                assert(operation.action === 'update');
                operation.action = action;
            }
        }
        else {
            this.updates[id] = {
                beforeExecute,
                afterExecute,
                operation: {
                    id: generateNewId(),
                    action: action || 'update',
                    data,
                    filter: {
                        id,
                    },
                } as ED[T]['Update'],
            };
        }
        this.setDirty();
    }

    async updateItems(data: Record<string, ED[T]['Update']['data']>, action?: ED[T]['Action']) {
        for (const id in data) {
            await this.updateItem(data[id], id, action);
        }
    }

    async doBeforeTrigger(): Promise<void> {
        for (const k in this.updates) {
            const update = this.updates[k];
            if (update.beforeExecute) {
                await update.beforeExecute();
            }
        }

        for (const k in this.children) {
            await this.children[k].doBeforeTrigger();
        }
    }

    async doAfterTrigger(): Promise<void> {
        for (const k in this.updates) {
            const update = this.updates[k];
            if (update.afterExecute) {
                await update.afterExecute();
            }
        }

        for (const k in this.children) {
            await this.children[k].doAfterTrigger();
        }
    }

    getParentFilter(childNode: SingleNode<ED, T, Cxt, FrontCxt, AD>): ED[T]['Selection']['filter'] | undefined {
        for (const id in this.children) {
            if (this.children[id] === childNode) {
                return {
                    id,
                };
            }
        }
    }

    composeOperations(): Array<{ entity: T, operation: ED[T]['Operation'] }> | undefined {
        if (!this.dirty) {
            return;
        }
        const childOperations: Record<string, ED[T]['Update']> = {};
        for (const id in this.children) {
            const childOperation = this.children[id].composeOperations();
            if (childOperation) {
                assert(childOperation.length === 1);
                childOperations[id] = childOperation[0].operation;
            }
        }

        const operations: ED[T]['Operation'][] = [];
        for (const id in this.updates) {
            const operation = cloneDeep(this.updates[id].operation);
            if (childOperations[id]) {
                const childOperation = childOperations[id];
                // 在list有operation在singleNode上也有目前只允许一种情况，即list上create，在single上update
                assert(operation.action === 'create' && childOperation.action === 'update');
                Object.assign(operation.data, childOperation.data);
                unset(childOperations, id);
            }
            operations.push(operation);
        }
        operations.push(...Object.values(childOperations));
        return operations.map(
            ele => Object.assign({
                operation: ele,
                entity: this.entity,
            })
        );
    }

    getProjection(): ED[T]['Selection']['data'] {
        const projection = super.getProjection();
        // List必须自主决定Projection
        /* if (this.children.length > 0) {
            const subProjection = await this.children[0].getProjection();
            return merge(projection, subProjection);
        } */
        return projection;
    }

    constructSelection(withParent?: true) {
        const { filters, sorters } = this;
        const data = this.getProjection();
        let validParentFilter = true;
        assert(data, "取数据时找不到projection信息");
        const sorterArr = sorters.map((ele) => {
            const { sorter } = ele;
            if (typeof sorter === 'function') {
                return sorter();
            }
            return sorter;
        }).filter((ele) => !!ele) as DeduceSorterItem<ED[T]['Schema']>[];
        const filterArr = filters.map((ele) => {
            const { filter } = ele;
            if (typeof filter === 'function') {
                return filter();
            }
            return filter;
        });

        if (withParent && this.parent) {
            if (this.parent instanceof SingleNode) {
                const filterOfParent = this.parent.getParentFilter<T>(this);
                if (filterOfParent) {
                    filterArr.push(filterOfParent as any);
                }
                else {
                    // 说明有父结点但是却没有相应的约束，此时不应该去refresh(是一个insert动作)
                    validParentFilter = false;
                }
            }
        }

        const filters2 = filterArr.filter(ele => !!ele);
        const filter = filters2.length > 0 ? combineFilters<ED, T>(filters2) : {};
        return {
            data,
            filter,
            sorter: sorterArr,
            validParentFilter,
        }
    }

    async refresh(pageNumber?: number, getCount?: true, append?: boolean) {
        const { entity, pagination } = this;
        const { currentPage, pageSize } = pagination;
        const currentPage3 = typeof pageNumber === 'number' ? pageNumber - 1 : currentPage - 1;
        const { data: projection, filter, sorter, validParentFilter } = this.constructSelection(true);
        assert(projection, `页面没有定义投影「ListNode, ${this.entity as string}」`);
        // 若不存在有效的父过滤条件（父有值或本结点就是顶层结点），则不能刷新
        if (validParentFilter) {
            try {
                this.setLoading(true);
                if (append) {
                    this.loadingMore = true;
                }
                this.publish();
                await this.cache.refresh(
                    entity,
                    {
                        data: projection,
                        filter,
                        sorter,
                        indexFrom: currentPage3 * pageSize,
                        count: pageSize,
                    },
                    undefined,
                    getCount,
                    ({ data, count }) => {
                        this.pagination.currentPage = currentPage3 + 1;
                        this.pagination.more = data.length === pageSize;
                        this.setLoading(false);
                        if (append) {
                            this.loadingMore = false;
                        }
                        if (getCount) {
                            this.pagination.total = count;
                        }

                        const ids = data.map(
                            ele => ele.id!
                        ) as string[];
                        if (append) {
                            this.ids = (this.ids || []).concat(ids)
                        }
                        else {
                            this.ids = ids;
                        }
                    }
                );
            }
            catch (err) {
                this.setLoading(false);
                if (append) {
                    this.loadingMore = false;
                }
                throw err;
            }
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

    setCurrentPage(currentPage: number, append?: boolean) {
        this.refresh(currentPage, undefined, append);
    }

    clean() {
        this.dirty = undefined;
        this.updates = {};

        for (const k in this.children) {
            this.children[k].clean();
        }
        this.publish();
    }

    getChildOperation(child: SingleNode<ED, T, Cxt, FrontCxt, AD>) {
        let childId: string = '';
        for (const k in this.children) {
            if (this.children[k] === child) {
                childId = k;
                break;
            }
        }
        assert(childId);
        if (this.updates && this.updates[childId]) {
            return this.updates[childId].operation;
        }
    }
}

class SingleNode<ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>,
    AD extends CommonAspectDict<ED, Cxt>> extends Node<ED, T, Cxt, FrontCxt, AD> {
    private id?: string;
    private children: {
        [K: string]: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, keyof ED, Cxt, FrontCxt, AD>;
    };
    private operation?: {
        beforeExecute?: () => Promise<void>;
        afterExecute?: () => Promise<void>;
        operation: ED[T]['CreateSingle'] | ED[T]['Update'] | ED[T]['Remove'];
    };

    constructor(entity: T, schema: StorageSchema<ED>, cache: Cache<ED, Cxt, FrontCxt, AD>,
        projection: ED[T]['Selection']['data'] | (() => Promise<ED[T]['Selection']['data']>),
        parent?: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, T, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>,
        path?: string,
        id?: string) {
        super(entity, schema, cache, projection, parent, path);
        this.children = {};
        if (id) {
            this.id = id;
        }
        else {
            // 若没有父结点上的filter，则一定是create动作
            const filter = this.tryGetParentFilter();
            if (!filter) {
                this.create({});
            }
        }
    }

    private tryGetParentFilter() {
        const parent = this.getParent();
        if (parent instanceof SingleNode) {
            const filter = parent.getParentFilter<T>(this);
            return filter;
        }
        else if (parent instanceof ListNode) {
            return parent.getParentFilter(this);
        }
    }

    protected getChildPath(child: Node<ED, keyof ED, Cxt, FrontCxt, AD>): string {
        for (const k in this.children) {
            if (child === this.children[k]) {
                return k;
            }
        }
        assert(false);
    }

    /*  setLoading(loading: boolean) {
         super.setLoading(loading);
         for (const k in this.children) {
             this.children[k].setLoading(loading);
         }
     } */

    checkIfClean(): void {
        if (this.operation) {
            return;
        }
        for (const k in this.children) {
            if (this.children[k].isDirty()) {
                return;
            }
        }
        if (this.isDirty()) {
            this.dirty = false;
            this.parent?.checkIfClean();
        }
    }

    destroy(): void {
        for (const k in this.children) {
            this.children[k].destroy();
        }
    }

    getChild(path: string): SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, keyof ED, Cxt, FrontCxt, AD> {
        return this.children[path];
    }

    setId(id: string) {
        this.id = id;
        this.refresh();
    }

    unsetId() {
        this.id = undefined;
        this.publish();
    }

    // 最好用getFreshValue取值
    getId() {
        if (this.id) {
            return this.id;
        }
        const value = this.getFreshValue();
        return value?.id;
    }

    getChildren() {
        return this.children;
    }

    addChild(path: string, node: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, keyof ED, Cxt, FrontCxt, AD>) {
        assert(!this.children[path]);
        this.children[path] = node;
    }

    removeChild(path: string) {
        unset(this.children, path);
    }

    getFreshValue(disableOperation?: boolean): Partial<ED[T]['Schema']> | undefined {
        const projection = this.getProjection(false);

        // 如果本结点是在modi路径上，需要将modi更新之后再得到后项
        const modies = this.parent && this.parent.getActiveModies(this);
        const operations = modies ? createOperationsFromModies(modies) as Array<{
            entity: keyof ED;
            operation: ED[keyof ED]['Operation'];
        }> : [];
        const filter = this.getFilter();
        if (filter) {
            assert(!disableOperation);
            if (this.operation) {
                operations.push({
                    entity: this.entity,
                    operation: this.operation.operation,
                });
            }
            // 如果是listNode下的一个子结点，则父结点上对应的operation也需要被redo
            const parent = this.getParent();
            if (parent instanceof ListNode) {
                const parentOperation = parent.getChildOperation(this);
                if (parentOperation) {
                    operations.push({
                        entity: this.entity,
                        operation: parentOperation,
                    });
                }
            }
            const result = this.cache.tryRedoOperationsThenSelect(this.entity, {
                data: projection,
                filter,
            }, operations, this.isLoading());
            return result[0];
        }
    }


    async doBeforeTrigger(): Promise<void> {
        if (this.operation?.beforeExecute) {
            await this.operation.beforeExecute();
        }

        for (const k in this.children) {
            const child = this.children[k];
            await child.doBeforeTrigger();
        }
    }

    async doAfterTrigger(): Promise<void> {
        if (this.operation?.afterExecute) {
            await this.operation.afterExecute();
        }

        for (const k in this.children) {
            const child = this.children[k];
            await child.doAfterTrigger();
        }
    }

    create(data: Partial<Omit<ED[T]['CreateSingle']['data'], 'id'>>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        const id = generateNewId();
        this.operation = {
            operation: {
                id: generateNewId(),
                action: 'create',
                data: Object.assign({}, data, { id }),
            },
            beforeExecute,
            afterExecute,
        };
        this.setDirty();
    }

    update(data: ED[T]['Update']['data'], action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        if (!this.operation) {
            // 还是有可能是create
            const isCreate = !this.id && !this.tryGetParentFilter();
            const operation: ED[T]['Update'] = isCreate ? {
                id: generateNewId(),
                action: 'create',
                data: Object.assign({}, data, {
                    id: generateNewId(),
                }),
            } : {
                id: generateNewId(),
                action: action || 'update',
                data,
            };
            if (this.id) {
                Object.assign(operation, {
                    filter: {
                        id: this.id,
                    },
                });
            }
            this.operation = {
                operation,
                beforeExecute,
                afterExecute,
            };
        }
        else {
            const { operation } = this.operation;
            assert(['create', 'update', action].includes(operation.action));
            Object.assign(operation.data, data);
            if (action && operation.action !== action) {
                operation.action = action;
            }
        }
        this.setDirty();
    }

    remove(beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        const operation: ED[T]['Remove'] = {
            id: generateNewId(),
            action: 'remove',
            data: {},
        };
        if (this.id) {
            Object.assign(operation, {
                filter: {
                    id: this.id,
                },
            });
        }
        this.operation = {
            operation,
            beforeExecute,
            afterExecute,
        };
        this.setDirty();
    }

    composeOperations(): Array<{
        entity: T;
        operation: ED[T]['Operation'];
    }> | undefined {
        if (!this.dirty) {
            return;
        }
        const filter = this.getFilter();
        const operation: ED[T]['Update'] = this.operation ? cloneDeep(this.operation.operation) : {
            id: generateNewId(),
            action: 'update',
            data: {},
        };
        if (filter) {
            Object.assign(operation, {
                filter,
            });
        }

        for (const ele in this.children) {
            const child = this.children[ele];
            const childOperations = child!.composeOperations();
            const sliceIdx = ele.indexOf(':');
            const ele2 = sliceIdx > 0 ? ele.slice(0, sliceIdx) : ele;
            if (childOperations) {
                if (child instanceof SingleNode) {
                    assert(childOperations.length === 1);
                    assert(!operation.data[ele2]);      // 多对一的子结点不应该有多项
                    Object.assign(operation.data, {
                        [ele2]: childOperations[0].operation,
                    });
                }
                else {
                    assert(child instanceof ListNode);
                    const childOpers = childOperations.map(
                        ele => ele.operation
                    );
                    if (operation.data[ele2]) {
                        operation.data[ele2].push(...childOpers);
                    }
                    else {
                        operation.data[ele2] = childOpers;
                    }
                }
            }
        }

        return [{
            entity: this.entity,
            operation: operation!,
        }];
    }

    getProjection(withDecendants?: boolean) {
        if (this.parent && this.parent instanceof ListNode) {
            return this.parent.getProjection();
        }
        const projection = super.getProjection();
        if (withDecendants) {
            for (const k in this.children) {
                if (k.indexOf(':') === -1) {
                    const rel = this.judgeRelation(k);
                    if (rel === 2) {
                        const subProjection = this.children[k].getProjection(true);
                        Object.assign(projection, {
                            entity: 1,
                            entityId: 1,
                            [k]: subProjection,
                        });
                    }
                    else if (typeof rel === 'string') {
                        const subProjection = this.children[k].getProjection(true);
                        Object.assign(projection, {
                            [`${k}Id`]: 1,
                            [k]: subProjection,
                        });
                    }
                    else if (!k.endsWith('$$aggr')) {
                        const child = this.children[k];
                        assert(rel instanceof Array && child instanceof ListNode);
                        const subSelection = child.constructSelection();
                        const subEntity = child.getEntity();
                        Object.assign(projection, {
                            [k]: Object.assign(subSelection, {
                                $entity: subEntity,
                            })
                        });
                    }
                }
            }
        }
        return projection;
    }

    async refresh() {
        // SingleNode如果是非根结点，其id应该在第一次refresh的时候来确定        
        const projection = this.getProjection();
        assert(projection, `页面没有定义投影「SingleNode, ${this.entity as string}」`);
        const filter = this.getFilter(true);
        if (filter) {
            this.setLoading(true);
            this.publish();
            try {
                await this.cache.refresh(this.entity, {
                    data: projection,
                    filter,
                }, undefined, undefined, ({ data: [value] }) => {
                    // 对于modi对象，在此缓存
                    if (this.schema[this.entity].toModi && value) {
                        const { modi$entity } = value;
                        this.modiIds = (modi$entity as Array<BaseEntityDict['modi']['OpSchema']>).map(ele => ele.id)
                    }
                    this.setLoading(false);
                });
            }
            catch (err) {
                this.setLoading(false);
                throw err;
            }
        }
    }

    clean() {
        this.dirty = undefined;
        this.operation = undefined;

        for (const child in this.children) {
            this.children[child]!.clean();
        }
        this.publish();
    }

    getFilter(disableOperation?: boolean): ED[T]['Selection']['filter'] | undefined {
        if (this.id) {
            return {
                id: this.id,
            };
        }
        if (!disableOperation && this.operation && this.operation.operation.action === 'create') {
            return {
                id: this.operation.operation.data.id!,
            };
        }
        const parentFilter = this.tryGetParentFilter();
        return parentFilter;
    }

    /**
     * getParentFilter不能假设一定已经有数据，只能根据当前filter的条件去构造
     * @param childNode 
     * @param disableOperation 
     * @returns 
     */
    getParentFilter<T2 extends keyof ED>(childNode: Node<ED, keyof ED, Cxt, FrontCxt, AD>): ED[T2]['Selection']['filter'] | undefined {
        const filter = this.getFilter(true);
        const value = this.getFreshValue();
        const id = this.id;

        for (const key in this.children) {
            if (childNode === this.children[key]) {
                const sliceIdx = key.indexOf(':');
                const key2 = sliceIdx > 0 ? key.slice(0, sliceIdx) : key;
                const rel = this.judgeRelation(key2);
                if (rel === 2) {
                    // 基于entity/entityId的多对一
                    if (value?.entityId) {
                        return {
                            id: value!.entityId!,
                        };
                    }
                    else if (filter) {
                        return {
                            id: {
                                $in: {
                                    entity: this.entity,
                                    data: {
                                        entityId: 1,
                                    },
                                    filter: addFilterSegment(filter, {
                                        entity: childNode.getEntity(),
                                    }),
                                }
                            },
                        };
                    }
                    else {
                        return;
                    }
                }
                else if (typeof rel === 'string') {
                    if (value && value[`${rel}Id`]) {
                        return {
                            id: value[`${rel}Id`],
                        };
                    }
                    else if (filter) {
                        return {
                            id: {
                                $in: {
                                    entity: this.entity,
                                    data: {
                                        [`${rel}Id`]: 1,
                                    },
                                    filter,
                                },
                            },
                        };
                    }
                    else {
                        return;
                    }
                }
                else {
                    assert(rel instanceof Array && !key2.endsWith('$$aggr'));
                    if (rel[1]) {
                        // 基于普通外键的一对多
                        if (id || value) {
                            return {
                                [rel[1]]: id || value!.id,
                            };
                        }
                        else if (filter) {
                            return {
                                [rel[1].slice(0, rel[1].length - 2)]: filter,
                            };
                        }
                        else {
                            return;
                        }
                    }
                    else {
                        // 基于entity/entityId的一对多
                        if (id || value) {
                            return {
                                entity: this.entity,
                                entityId: id || value!.id,
                            };
                        }
                        else if (filter) {
                            return {
                                [this.entity]: filter,
                            };
                        }
                        else {
                            return;
                        }
                    }
                }
            }
        }
        assert(false);
    }
}

class VirtualNode<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>,
    AD extends CommonAspectDict<ED, Cxt>
> extends Feature {
    private dirty: boolean;
    private children: Record<string, SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, keyof ED, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>>;
    constructor(path?: string, parent?: VirtualNode<ED, Cxt, FrontCxt, AD>) {
        super();
        this.dirty = false;
        this.children = {};
        if (parent) {
            parent.addChild(path!, this);
        }
    }
    getActiveModies(child: any): undefined {
        return;
    }
    setDirty() {
        this.dirty = true;
        this.publish();
    }
    addChild(
        path: string, child: SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, keyof ED, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>) {
        // 规范virtualNode子结点的命名路径和类型，entity的singleNode必须被命名为entity或entity:number，ListNode必须被命名为entitys或entitys:number
        assert(!this.children[path]);
        this.children[path] = child;
        if (child instanceof SingleNode || child instanceof ListNode) {
            const entity = child.getEntity() as string;
            if (child instanceof SingleNode) {
                assert(path === entity || path.startsWith(`${entity}:`), `oakPath「${path}」不符合命名规范，请以「${entity}」为命名起始标识`);
            }
            else {
                assert(path === `${entity}s` || path.startsWith(`${entity}s:`), `oakPath「${path}」不符合命名规范，请以「${entity}s」为命名起始标识`);
            }
        }
    }
    getChild(path: string) {
        return this.children[path];
    }
    getParent() {
        return undefined;
    }
    destroy() {
        for (const k in this.children) {
            this.children[k].destroy();
        }
    }
    getFreshValue() {
        return undefined;
    }
    isDirty() {
        return this.dirty;
    }
    async refresh() {
        await Promise.all(
            Object.keys(this.children).map(
                ele => this.children[ele].refresh()
            )
        );
        this.publish();
    }
    composeOperations(): Array<{ entity: keyof ED, operation: ED[keyof ED]['Operation'] }> | undefined {
        /**
         * 当一个virtualNode有多个子结点，而这些子结点的前缀一致时，标识这些子结点其实是指向同一个对象，此时需要合并
         */
        const operationss = [];
        const operationDict: Record<string, any> = {};
        for (const ele in this.children) {
            const operation = this.children[ele].composeOperations();
            if (operation) {
                const idx = ele.indexOf(':') !== -1 ? ele.slice(0, ele.indexOf(':')) : ele;
                if (operationDict[idx]) {
                    assert(false, '这种情况不应当再出现');
                    // 需要合并这两个子结点的动作       todo 两个子结点指向同一个对象，这种情况应当要消除
                    /* if (this.children[ele] instanceof SingleNode) {
                        // mergeOperationOper(this.children[ele].getEntity(), this.children[ele].getSchema(), operation[0], operationDict[idx][0]);
                    }
                    else {
                        console.warn('发生virtualNode上的list页面的动作merge，请查看');
                        operationDict[idx].push(...operation);
                    } */
                }
                else {
                    operationDict[idx] = operation;
                }
            }
        }
        for (const k in operationDict) {
            operationss.push(...operationDict[k]);
        }

        return operationss;
    }
    setExecuting(executing: boolean) {
        for (const ele in this.children) {
            this.children[ele].setExecuting(executing);
        }
        this.publish();
    }
    async doBeforeTrigger() {
        for (const ele in this.children) {
            await this.children[ele].doBeforeTrigger();
        }
    }
    async doAfterTrigger() {
        for (const ele in this.children) {
            await this.children[ele].doAfterTrigger();
        }
    }
    clean() {
        this.dirty = false;
        for (const ele in this.children) {
            this.children[ele].clean();
        }
    }
    checkIfClean() {
        for (const k in this.children) {
            if (this.children[k].isDirty()) {
                return;
            }
        }
        this.dirty = false;
    }
}

export type CreateNodeOptions<ED extends EntityDict & BaseEntityDict, T extends keyof ED> = {
    path: string;
    entity?: T;
    isList?: boolean;
    isPicker?: boolean;
    projection?: ED[T]['Selection']['data'] | (() => ED[T]['Selection']['data']);
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
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>,
    AD extends CommonAspectDict<ED, Cxt>
> extends Feature {
    private cache: Cache<ED, Cxt, FrontCxt, AD>;
    private schema: StorageSchema<ED>;
    private root: Record<
        string,
        SingleNode<ED, keyof ED, Cxt, FrontCxt, AD> | ListNode<ED, keyof ED, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>
    >;
    private aspectWrapper: AspectWrapper<ED, Cxt, AD>;

    constructor(
        aspectWrapper: AspectWrapper<ED, Cxt, AD>,
        cache: Cache<ED, Cxt, FrontCxt, AD>,
        schema: StorageSchema<ED>
    ) {
        super();
        this.aspectWrapper = aspectWrapper;
        this.cache = cache;
        this.schema = schema;
        this.root = {};
    }

    createNode<T extends keyof ED>(options: CreateNodeOptions<ED, T>) {
        const {
            entity,
            pagination,
            path: fullPath,
            filters,
            sorters,
            projection,
            isList,
            id,
        } = options;
        let node: ListNode<ED, T, Cxt, FrontCxt, AD> | SingleNode<ED, T, Cxt, FrontCxt, AD> | VirtualNode<ED, Cxt, FrontCxt, AD>;
        const { parent, path } = analyzePath(fullPath);
        const parentNode = parent ? this.findNode(parent) : undefined;
        if (this.findNode(fullPath)) {
            // 目前只有一种情况合法，即parentNode是list，列表中的位置移动引起的重用
            if (parentNode instanceof ListNode) {
            }
            else if (process.env.NODE_ENV === 'development') {
                console.error(`创建node时发现已有结点，不能重用。「${fullPath}」`);
            }
            return this.findNode(fullPath)!;
        }

        if (entity) {
            if (isList) {
                assert(!(parentNode instanceof ListNode));
                assert(projection, `页面没有定义投影「${path}」`);
                node = new ListNode<ED, T, Cxt, FrontCxt, AD>(
                    entity,
                    this.schema!,
                    this.cache,
                    projection,
                    parentNode,
                    path,
                    filters,
                    sorters,
                    pagination
                );
            } else {
                node = new SingleNode<ED, T, Cxt, FrontCxt, AD>(
                    entity,
                    this.schema!,
                    this.cache,
                    projection!,
                    parentNode as VirtualNode<ED, Cxt, FrontCxt, AD>,      // 过编译
                    path,
                    id
                );
            }
        }
        else {
            assert(!parentNode || parentNode instanceof VirtualNode);
            node = new VirtualNode(path, parentNode);
        }
        if (!parentNode) {
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
            if (!node) {
                return;
            }
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

    addItem<T extends keyof ED>(path: string, data: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.addItem(data, beforeExecute, afterExecute);
    }

    removeItem(path: string, id: string, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.removeItem(id, beforeExecute, afterExecute);
    }

    updateItem<T extends keyof ED>(path: string, data: ED[T]['Update']['data'], id: string, action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.updateItem(data, id, action, beforeExecute, afterExecute);
    }

    recoverItem(path: string, id: string) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.recoverItem(id);
    }

    async create<T extends keyof ED>(path: string, data: Omit<ED[T]['CreateSingle']['data'], 'id'>, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        const node = this.findNode(path);
        assert(node instanceof SingleNode);
        await node.create(data, beforeExecute, afterExecute);
    }

    update<T extends keyof ED>(path: string, data: ED[T]['Update']['data'], action?: ED[T]['Action'], beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        const node = this.findNode(path);
        assert(node instanceof SingleNode);
        node.update(data, action, beforeExecute, afterExecute);
    }

    remove(path: string, beforeExecute?: () => Promise<void>, afterExecute?: () => Promise<void>) {
        const node = this.findNode(path);
        assert(node instanceof SingleNode);
        node.remove(beforeExecute, afterExecute);
    }

    isLoading(path: string) {
        const node = this.findNode(path);
        assert(node && (node instanceof SingleNode || node instanceof ListNode));
        return node.isLoading();
    }

    isLoadingMore(path: string) {
        const node = this.findNode(path);
        assert(node && (node instanceof SingleNode || node instanceof ListNode));
        return node.isLoadingMore();
    }

    isExecuting(path: string) {
        const node = this.findNode(path);
        assert(node && (node instanceof SingleNode || node instanceof ListNode));
        return node.isExecuting();
    }

    async refresh(path: string) {
        const node = this.findNode(path);
        if (node instanceof ListNode) {
            await node.refresh(1, true);
        }
        else if (node) {
            // 有无entity的case不创建结点
            await node.refresh();
        }
    }

    async loadMore(path: string) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        await node.loadMore();
    }

    getPagination(path: string) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.getPagination();
    }

    setId(path: string, id: string) {
        const node = this.findNode(path);
        assert(node instanceof SingleNode);
        return node.setId(id);
    }

    unsetId(path: string) {
        const node = this.findNode(path);
        assert(node instanceof SingleNode);
        node.unsetId();
    }

    getId(path: string) {
        const node = this.findNode(path);
        assert(node instanceof SingleNode);
        return node.getId();
    }

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

    setNamedFilters<T extends keyof ED>(
        path: string,
        filters: NamedFilterItem<ED, T>[],
        refresh: boolean = true
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.setNamedFilters(filters, refresh);
    }

    addNamedFilter<T extends keyof ED>(
        path: string,
        filter: NamedFilterItem<ED, T>,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.addNamedFilter(filter, refresh);
    }

    removeNamedFilter<T extends keyof ED>(
        path: string,
        filter: NamedFilterItem<ED, T>,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.removeNamedFilter(filter, refresh);
    }

    removeNamedFilterByName<T extends keyof ED>(
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

    setNamedSorters<T extends keyof ED>(
        path: string,
        sorters: NamedSorterItem<ED, T>[],
        refresh: boolean = true
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.setNamedSorters(sorters, refresh);
    }

    addNamedSorter<T extends keyof ED>(
        path: string,
        sorter: NamedSorterItem<ED, T>,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.addNamedSorter(sorter, refresh);
    }

    removeNamedSorter<T extends keyof ED>(
        path: string,
        sorter: NamedSorterItem<ED, T>,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.removeNamedSorter(sorter, refresh);
    }


    removeNamedSorterByName(
        path: string,
        name: string,
        refresh: boolean = false
    ) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.removeNamedSorterByName(name, refresh);
    }

    tryExecute(path: string) {
        const node = this.findNode(path)!;
        const operations = node.composeOperations();
        if (operations && operations.length > 0) {
            return this.cache.tryRedoOperations(operations);
        }
        return false;
    }

    getOperations(path: string) {
        const node = this.findNode(path)!;
        const operations = node.composeOperations();
        return operations;
    }

    async execute<T extends keyof ED>(path: string, action?: ED[T]['Action']) {
        const node = this.findNode(path)!;
        if (action) {
            if (node instanceof SingleNode) {
                node.update({}, action);
            }
            else {
                assert(node instanceof ListNode);
                assert(false);      // 对list的整体action等遇到了再实现
            }
        }
        assert(node.isDirty());

        node.setExecuting(true);
        try {
            await node.doBeforeTrigger();
            const operations = (node.composeOperations())!;

            // 这里理论上virtualNode下面也可以有多个不同的entity的组件，但实际中不应当出现这样的设计
            const entities = uniq(
                operations.filter(ele => !!ele).map(
                    ele => ele.entity
                ));
            assert(entities.length === 1);

            await this.cache.exec('operate', {
                entity: entities[0],
                operation: operations.filter(ele => !!ele).map(ele => ele.operation),
            }, () => {
                // 清空缓存
                node.clean();
                node.setExecuting(false);
            });

            await node.doAfterTrigger();

            return operations;
        }
        catch (err) {
            node.setExecuting(false);
            throw err;
        }
    }

    clean(path: string) {
        const node = this.findNode(path)!;

        node.clean();
        const parent = node.getParent();
        if (parent) {
            parent.checkIfClean();
        }
    }

    getRoot() {
        return this.root;
    }

    subscribeNode(callback: () => any, path: string): () => void {
        const node = this.findNode(path)!;
        node.clearSubscribes(); // 每个node只会与一个组件相关联，在list中可能会切换node与组件的关系，这里先clear掉  by Xc
        return node.subscribe(callback);
    }
}