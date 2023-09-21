import { assert } from 'oak-domain/lib/utils/assert';
import { cloneDeep, unset, merge, uniq } from "oak-domain/lib/utils/lodash";
import { combineFilters } from "oak-domain/lib/store/filter";
import { createOperationsFromModies } from 'oak-domain/lib/store/modi';
import { judgeRelation } from "oak-domain/lib/store/relation";
import { Feature } from '../types/Feature';
import { generateNewId } from 'oak-domain/lib/utils/uuid';
export const MODI_NEXT_PATH_SUFFIX = ':next';
class Node extends Feature {
    entity;
    // protected fullPath: string;
    schema;
    projection; // 只在Page层有
    parent;
    dirty;
    cache;
    loading;
    loadingMore;
    executing;
    modiIds; //  对象所关联的modi
    actions;
    cascadeActions;
    relationAuth;
    constructor(entity, schema, cache, relationAuth, projection, parent, path, actions, cascadeActions) {
        super();
        this.entity = entity;
        this.schema = schema;
        this.cache = cache;
        this.relationAuth = relationAuth;
        this.projection = projection;
        this.parent = parent;
        this.dirty = undefined;
        this.loading = false;
        this.loadingMore = false;
        this.executing = false;
        this.modiIds = undefined;
        this.actions = actions;
        this.cascadeActions = cascadeActions;
        if (parent) {
            assert(path);
            parent.addChild(path, this);
        }
    }
    getEntity() {
        return this.entity;
    }
    getSchema() {
        return this.schema;
    }
    /**
     * 这个函数从某个结点向父亲查询，看所在路径上是否有需要被应用的modi
     */
    getActiveModiOperations() {
        const { modiIds } = this;
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
            assert(modies);
            return createOperationsFromModies(modies);
        }
        // 如果当前层没有，向上查找。只要有就返回，目前应该不存在多层modi
        if (this.parent) {
            if (this.parent instanceof ListNode || this.parent instanceof SingleNode) {
                return this.parent.getActiveModiOperations();
            }
        }
    }
    setDirty() {
        if (!this.dirty) {
            this.dirty = true;
        }
        // 现在必须要将父结点都置dirty了再publish，因为整棵树是在一起redoOperation了
        if (this.parent) {
            this.parent.setDirty();
        }
        this.publish();
    }
    isDirty() {
        return !!this.dirty;
    }
    isLoading() {
        return this.loading || (!!this.parent && this.parent.isLoading());
    }
    setLoading(loading) {
        this.loading = loading;
    }
    isLoadingMore() {
        return this.loadingMore;
    }
    isExecuting() {
        return this.executing;
    }
    setExecuting(executing) {
        this.executing = executing;
        this.publish();
    }
    getParent() {
        return this.parent;
    }
    getProjection() {
        const projection = typeof this.projection === 'function' ? this.projection() : (this.projection && cloneDeep(this.projection));
        return projection;
    }
    setProjection(projection) {
        assert(!this.projection);
        this.projection = projection;
    }
    judgeRelation(attr) {
        const attr2 = attr.split(':')[0]; // 处理attr:prev
        return judgeRelation(this.schema, this.entity, attr2);
    }
}
const DEFAULT_PAGINATION = {
    currentPage: 1,
    pageSize: 20,
    append: true,
    more: true,
};
class ListNode extends Node {
    children;
    updates;
    filters;
    sorters;
    pagination;
    ids;
    aggr;
    syncHandler;
    getChildPath(child) {
        let idx = 0;
        for (const k in this.children) {
            if (this.children[k] === child) {
                return k;
            }
            idx++;
        }
        assert(false);
    }
    setFiltersAndSortedApplied() {
        this.filters.forEach(ele => ele.applied = true);
        this.sorters.forEach(ele => ele.applied = true);
        for (const k in this.children) {
            this.children[k].setFiltersAndSortedApplied();
        }
    }
    /* setLoading(loading: boolean) {
        super.setLoading(loading);
        for (const k in this.children) {
            this.children[k].setLoading(loading);
        }
    } */
    checkIfClean() {
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
    onCacheSync(records) {
        // 只需要处理insert
        // todo 这里处理有点问题，因为前台的sorter在处理enum类型时的结果和后台不一致，会导致数据顺序变乱 by Xc 20230809
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
                    const { e } = record;
                    if (e === this.entity) {
                        needRefresh = true;
                    }
                    break;
                }
                case 'r': {
                    const { e } = record;
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
            const { filter, sorter } = this.constructSelection(true, false, true);
            if (filter) {
                const result = this.cache.get(this.getEntity(), {
                    data: {
                        id: 1,
                    },
                    filter,
                    sorter,
                }, true);
                this.ids = result.map((ele) => ele.id);
            }
        }
    }
    destroy() {
        this.cache.unbindOnSync(this.syncHandler);
        for (const k in this.children) {
            this.children[k].destroy();
        }
    }
    constructor(entity, schema, cache, relationAuth, projection, parent, path, filters, sorters, pagination, actions, cascadeActions) {
        super(entity, schema, cache, relationAuth, projection, parent, path, actions, cascadeActions);
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
    setPagination(pagination, dontRefresh) {
        const newPagination = Object.assign(this.pagination, pagination);
        this.pagination = newPagination;
        if (!dontRefresh) {
            this.refresh();
        }
    }
    getChild(path) {
        return this.children[path];
    }
    getChildren() {
        return this.children;
    }
    addChild(path, node) {
        assert(!this.children[path]);
        // assert(path.length > 10, 'List的path改成了id');
        this.children[path] = node;
    }
    removeChild(path) {
        unset(this.children, path);
    }
    getNamedFilters() {
        return this.filters;
    }
    getNamedFilterByName(name) {
        const filter = this.filters.find((ele) => ele['#name'] === name);
        return filter;
    }
    setNamedFilters(filters, refresh) {
        this.filters = filters.map((ele) => Object.assign({}, ele, { applied: false }));
        if (refresh) {
            this.refresh(1, true);
        }
        else {
            this.publish();
        }
    }
    addNamedFilter(filter, refresh) {
        // filter 根据#name查找
        const fIndex = this.filters.findIndex((ele) => filter['#name'] && ele['#name'] === filter['#name']);
        if (fIndex >= 0) {
            this.filters.splice(fIndex, 1, Object.assign({}, filter, { applied: false }));
        }
        else {
            this.filters.push(Object.assign({}, filter, { applied: false }));
        }
        if (refresh) {
            this.refresh(1, true);
        }
        else {
            this.publish();
        }
    }
    removeNamedFilter(filter, refresh) {
        // filter 根据#name查找
        const fIndex = this.filters.findIndex((ele) => filter['#name'] && ele['#name'] === filter['#name']);
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
    removeNamedFilterByName(name, refresh) {
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
    getNamedSorterByName(name) {
        const sorter = this.sorters.find((ele) => ele['#name'] === name);
        return sorter;
    }
    setNamedSorters(sorters, refresh) {
        this.sorters = sorters.map(ele => Object.assign({}, ele, { applied: false }));
        if (refresh) {
            this.refresh(1, true);
        }
        else {
            this.publish();
        }
    }
    addNamedSorter(sorter, refresh) {
        // sorter 根据#name查找
        const fIndex = this.sorters.findIndex((ele) => sorter['#name'] && ele['#name'] === sorter['#name']);
        if (fIndex >= 0) {
            this.sorters.splice(fIndex, 1, Object.assign({}, sorter, { applied: false }));
        }
        else {
            this.sorters.push(Object.assign({}, sorter, { applied: false }));
        }
        if (refresh) {
            this.refresh(1, true);
        }
        else {
            this.publish();
        }
    }
    removeNamedSorter(sorter, refresh) {
        // sorter 根据#name查找
        const fIndex = this.sorters.findIndex((ele) => sorter['#name'] && ele['#name'] === sorter['#name']);
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
    removeNamedSorterByName(name, refresh) {
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
    getFreshValue() {
        /**
         * 满足当前结点的数据应当是所有满足当前filter条件且ids在当前ids中的数据
         * 但如果是当前事务create的行则例外（当前页面上正在create的数据）
         *
         * bug: 这里可能会造成不满足ids约束的行上发起fetch missed rows的操作，如果后台阻止了这样的row的返回值（加上了额外的条件filter）
         * 返回空行，会造成无限发请求的严重bug
         * 先修正为先取id，再取一次数据
         *
         * 修改memeory-tree，当属性缺失不再报missedRow，改回直接用filter去取数据的逻辑
         *
         * 这里不能用sorter排序，enum的排序顺序目前前后台尚不一致 by Xc 20230809
         */
        const { data, filter } = this.constructSelection(true, false, true);
        if (filter || this.ids) {
            const filter2 = filter && this.ids ? {
                $or: [filter, {
                        id: {
                            $in: this.ids || [],
                        }
                    }]
            } : filter || {
                id: {
                    $in: this.ids,
                }
            };
            const result = this.cache.get(this.entity, {
                data,
                filter: filter2,
            }, true);
            const r2 = result.filter(ele => this.ids ? (ele.$$createAt$$ === 1 || (this.ids?.includes(ele.id))) : true).sort((ele1, ele2) => {
                if (ele1.$$createAt$$ === 1) {
                    return -1;
                }
                else if (ele2.$$createAt$$ === 1) {
                    return -1;
                }
                const idx1 = this.ids.indexOf(ele1.id);
                const idx2 = this.ids.indexOf(ele2.id);
                return idx1 - idx2;
            });
            if (this.aggr) {
                // 如果有聚合查询的结果，这里按理不应该有aggregate和create同时出现，但也以防万一
                this.aggr.forEach((ele, idx) => {
                    const id = this.ids[idx];
                    assert(id);
                    const row = r2.find(ele => ele.id === id);
                    assert(id);
                    merge(row, ele);
                });
            }
            return r2;
        }
        return [];
        /* const finalIds = result.filter(
            ele => ele.$$createAt$$ === 1
        ).map(ele => ele.id).concat(this.ids);
        return this.cache.get(this.entity, {
            data,
            filter: {
                id: { $in: finalIds },
            },
            sorter,
        }, this.isLoading()); */
    }
    addItem(item, beforeExecute, afterExecute) {
        const id = generateNewId();
        assert(!this.updates[id]);
        this.updates[id] = {
            beforeExecute,
            afterExecute,
            operation: {
                id: generateNewId(),
                action: 'create',
                data: item.id ? item : Object.assign(item, { id }),
            },
        };
        this.setDirty();
        return id;
    }
    removeItem(id, beforeExecute, afterExecute) {
        if (this.updates[id] &&
            this.updates[id].operation?.action === 'create') {
            // 如果是新增项，在这里抵消
            unset(this.updates, id);
            this.removeChild(id);
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
                },
            };
        }
        this.setDirty();
    }
    recoverItem(id) {
        const { operation } = this.updates[id];
        assert(operation?.action === 'remove');
        unset(this.updates, id);
        this.setDirty();
    }
    resetItem(id) {
        const { operation } = this.updates[id];
        assert(operation?.action === 'update');
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
    updateItem(data, id, action, beforeExecute, afterExecute) {
        // assert(Object.keys(this.children).length === 0, `更新子结点应该落在相应的component上`);
        if (this.children && this.children[id]) {
            // 实际中有这样的case出现，当使用actionButton时。先这样处理。by Xc 20230214
            return this.children[id].update(data, action, beforeExecute, afterExecute);
        }
        if (this.updates[id]) {
            const { operation } = this.updates[id];
            assert(operation);
            const { data: dataOrigin } = operation;
            Object.assign(dataOrigin, data);
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
                },
            };
        }
        this.setDirty();
    }
    async updateItems(data, action) {
        for (const id in data) {
            await this.updateItem(data[id], id, action);
        }
    }
    async doBeforeTrigger() {
        for (const k in this.children) {
            await this.children[k].doBeforeTrigger();
        }
        for (const k in this.updates) {
            const update = this.updates[k];
            if (update.beforeExecute) {
                await update.beforeExecute();
                update.beforeExecute = undefined;
            }
        }
    }
    async doAfterTrigger() {
        for (const k in this.children) {
            await this.children[k].doAfterTrigger();
        }
        for (const k in this.updates) {
            const update = this.updates[k];
            if (update.afterExecute) {
                await update.afterExecute();
            }
            // afterExecute完了肯定可以清除结点了
            assert(!update.operation && !update.beforeExecute);
            unset(this.updates, k);
        }
        this.dirty = false;
    }
    getParentFilter(childNode) {
        for (const id in this.children) {
            if (this.children[id] === childNode) {
                return {
                    id,
                };
            }
        }
    }
    composeOperations() {
        if (!this.dirty) {
            return;
        }
        const operations = [];
        for (const id in this.updates) {
            if (this.updates[id].operation) {
                operations.push({
                    entity: this.entity,
                    operation: cloneDeep(this.updates[id].operation),
                });
            }
        }
        for (const id in this.children) {
            const childOperation = this.children[id].composeOperations();
            if (childOperation) {
                // 现在因为后台有not null检查，不能先create再update，所以还是得合并成一个
                assert(childOperation.length === 1);
                const { operation } = childOperation[0];
                const { action, data, filter } = operation;
                assert(!['create', 'remove'].includes(action), '在list结点上对子结点进行增删请使用父结点的addItem/removeItem，不要使用子结点的create/remove');
                assert(filter.id === id);
                const sameNodeOperation = operations.find(ele => ele.operation.action === 'create' && ele.operation.data.id === id || ele.operation.filter?.id === id);
                if (sameNodeOperation) {
                    if (sameNodeOperation.operation.action !== 'remove') {
                        Object.assign(sameNodeOperation.operation.data, data);
                    }
                }
                else {
                    operations.push(...childOperation);
                }
            }
        }
        return operations;
    }
    getProjection() {
        const projection = super.getProjection();
        // List必须自主决定Projection
        /* if (this.children.length > 0) {
            const subProjection = await this.children[0].getProjection();
            return merge(projection, subProjection);
        } */
        return projection;
    }
    constructFilters(withParent, ignoreNewParent, ignoreUnapplied) {
        const { filters: ownFilters } = this;
        const filters = ownFilters.filter(ele => !ignoreUnapplied || ele.applied === true || ele.applied === undefined // 如果是undefined，说明不可以移除（构造时就存在），也得返回
        ).map((ele) => {
            const { filter } = ele;
            if (typeof filter === 'function') {
                return filter();
            }
            return filter;
        });
        if (withParent && this.parent) {
            if (this.parent instanceof SingleNode) {
                const filterOfParent = this.parent.getParentFilter(this, ignoreNewParent);
                if (filterOfParent) {
                    filters.push(filterOfParent);
                }
                else {
                    // 说明有父结点但是却没有相应的约束，此时不应该去refresh(是一个insert动作)
                    return undefined;
                }
            }
        }
        // 返回的filter在上层做check的时候可能被改造掉
        return cloneDeep(filters);
    }
    constructSelection(withParent, ignoreNewParent, ignoreUnapplied) {
        const { sorters } = this;
        const data = this.getProjection();
        assert(data, '取数据时找不到projection信息');
        const sorterArr = sorters.filter(ele => !ignoreUnapplied || ele.applied).map((ele) => {
            const { sorter } = ele;
            if (typeof sorter === 'function') {
                return sorter();
            }
            return sorter;
        })
            .filter((ele) => !!ele);
        const filters = this.constructFilters(withParent, ignoreNewParent, ignoreUnapplied);
        const filters2 = filters?.filter((ele) => !!ele);
        const filter = filters2 ? combineFilters(this.entity, this.schema, filters2) : undefined;
        return {
            data,
            filter,
            sorter: sorterArr,
        };
    }
    async refresh(pageNumber, getCount, append) {
        const { entity, pagination } = this;
        const { currentPage, pageSize, randomRange } = pagination;
        const currentPage3 = typeof pageNumber === 'number' ? pageNumber - 1 : currentPage - 1;
        assert(!randomRange || !currentPage3, 'list在访问数据时，如果设置了randomRange，则不应再有pageNumber');
        const { data: projection, filter, sorter, } = this.constructSelection(true, true);
        // 若不存在有效的过滤条件（若有父结点但却为空时，说明父结点是一个create动作，不用刷新），则不能刷新
        if ((!this.getParent() || filter) && projection) {
            try {
                this.setLoading(true);
                if (append) {
                    this.loadingMore = true;
                }
                this.publish();
                await this.cache.refresh(entity, {
                    data: projection,
                    filter,
                    sorter,
                    indexFrom: currentPage3 * pageSize,
                    count: pageSize,
                    randomRange,
                }, undefined, getCount, ({ ids, count, aggr }) => {
                    this.pagination.currentPage = currentPage3 + 1;
                    this.pagination.more = ids.length === pageSize;
                    this.setLoading(false);
                    this.setFiltersAndSortedApplied();
                    if (append) {
                        this.loadingMore = false;
                    }
                    if (getCount) {
                        this.pagination.total = count;
                    }
                    if (append) {
                        this.ids = (this.ids || []).concat(ids);
                    }
                    else {
                        this.ids = ids;
                    }
                    if (append) {
                        this.aggr = (this.aggr || []).concat(aggr || []);
                    }
                    else {
                        this.aggr = aggr;
                    }
                });
                this.publish();
            }
            catch (err) {
                this.setLoading(false);
                if (append) {
                    this.loadingMore = false;
                }
                this.publish();
                throw err;
            }
        }
        else {
            // 不刷新也publish一下，触发页面reRender，不然有可能导致页面不进入formData
            this.publish();
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
    setCurrentPage(currentPage, append) {
        this.refresh(currentPage, undefined, append);
    }
    clean(preserveAfterExecute) {
        if (this.dirty) {
            const originUpdates = this.updates;
            this.updates = {};
            if (preserveAfterExecute) {
                for (const k in originUpdates) {
                    if (originUpdates[k].afterExecute) {
                        this.updates[k] = {
                            afterExecute: originUpdates[k].afterExecute,
                        };
                    }
                }
            }
            for (const k in this.children) {
                this.children[k].clean(preserveAfterExecute);
            }
            if (!preserveAfterExecute) {
                this.dirty = undefined;
            }
            else {
                // preserveAfterExecute一定发生在execute，后面的cache会publish
                this.publish();
            }
        }
    }
    getChildOperation(child) {
        let childId = '';
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
    // 查看这个list上所有数据必须遵守的限制
    getIntrinsticFilters() {
        const filters = this.constructFilters(undefined, true, true);
        return combineFilters(this.entity, this.schema, filters || []);
    }
}
class SingleNode extends Node {
    id;
    aggr;
    children;
    filters;
    operation;
    constructor(entity, schema, cache, relationAuth, projection, parent, path, id, filters, actions, cascadeActions) {
        super(entity, schema, cache, relationAuth, projection, parent, path, actions, cascadeActions);
        this.children = {};
        this.filters = filters;
        if (!id) {
            // 不传id先假设是创建动作
            this.create({});
            // this.id = this.operation!.operation.data.id;
        }
        else {
            this.id = id;
        }
    }
    getChildPath(child) {
        for (const k in this.children) {
            if (child === this.children[k]) {
                return k;
            }
        }
        assert(false);
    }
    setFiltersAndSortedApplied() {
        for (const k in this.children) {
            this.children[k].setFiltersAndSortedApplied();
        }
    }
    /*  setLoading(loading: boolean) {
         super.setLoading(loading);
         for (const k in this.children) {
             this.children[k].setLoading(loading);
         }
     } */
    checkIfClean() {
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
    destroy() {
        for (const k in this.children) {
            this.children[k].destroy();
        }
    }
    getChild(path) {
        return this.children[path];
    }
    setId(id) {
        if (id !== this.id) {
            // 如果本身是create， 这里无视就行（因为框架原因会调用一次）
            if (this.operation?.operation?.action === 'create') {
                if (this.operation.operation.data.id === id) {
                    return;
                }
            }
            assert(!this.dirty, 'setId时结点是dirty，在setId之前应当处理掉原有的update');
            this.id = id;
            this.publish();
        }
    }
    unsetId() {
        if (this.id) {
            this.id = undefined;
            this.publish();
        }
    }
    getId() {
        if (this.id) {
            return this.id;
        }
        if (this.operation && this.operation.operation?.action === 'create') {
            return this.operation.operation.data.id;
        }
    }
    getChildren() {
        return this.children;
    }
    addChild(path, node) {
        assert(!this.children[path]);
        this.children[path] = node;
    }
    removeChild(path) {
        unset(this.children, path);
    }
    getFreshValue() {
        const projection = this.getProjection(false);
        const id = this.getId();
        if (projection) {
            const result = this.cache.get(this.entity, {
                data: projection,
                filter: {
                    id,
                },
            }, true);
            if (this.aggr) {
                merge(result[0], this.aggr);
            }
            return result[0];
        }
    }
    async doBeforeTrigger() {
        for (const k in this.children) {
            const child = this.children[k];
            await child.doBeforeTrigger();
        }
        if (this.operation?.beforeExecute) {
            await this.operation.beforeExecute();
            this.operation.beforeExecute = undefined;
        }
    }
    async doAfterTrigger() {
        for (const k in this.children) {
            const child = this.children[k];
            await child.doAfterTrigger();
        }
        if (this.operation?.afterExecute) {
            await this.operation.afterExecute();
            assert(!this.operation.operation && !this.operation.beforeExecute);
            this.operation = undefined;
        }
        this.dirty = false;
    }
    create(data, beforeExecute, afterExecute) {
        const id = generateNewId();
        assert(!this.id && !this.dirty, 'create前要保证singleNode为空');
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
    update(data, action, beforeExecute, afterExecute) {
        if (!this.operation) {
            if (this.id) {
                const operation = {
                    id: generateNewId(),
                    action: action || 'update',
                    data,
                };
                Object.assign(operation, {
                    filter: {
                        id: this.id,
                    },
                });
                this.operation = {
                    operation,
                    beforeExecute,
                    afterExecute,
                };
            }
            else {
                // 有可能是create，上层不考虑两者的区别
                assert(!action);
                const operation = {
                    id: generateNewId(),
                    action: 'create',
                    data: Object.assign({}, data, {
                        id: generateNewId(),
                    }),
                };
                this.operation = {
                    operation,
                    beforeExecute,
                    afterExecute,
                };
            }
        }
        else {
            const { operation } = this.operation;
            assert(operation);
            assert(['create', 'update', action].includes(operation.action));
            Object.assign(operation.data, data);
            if (action && operation.action !== action) {
                operation.action = action;
            }
        }
        // 处理外键，如果update的数据中有相应的外键，其子对象上的动作应当被clean掉
        for (const attr in data) {
            if (attr === 'entityId') {
                assert(data.entity, '设置entityId时请将entity也传入');
                if (this.children[data.entity]) {
                    this.children[data.entity].clean();
                }
            }
            else if (this.schema[this.entity].attributes[attr]?.type === 'ref') {
                const refKey = attr.slice(0, attr.length - 2);
                if (this.children[refKey]) {
                    this.children[refKey].clean();
                }
            }
        }
        this.setDirty();
    }
    remove(beforeExecute, afterExecute) {
        assert(this.id);
        const operation = {
            id: generateNewId(),
            action: 'remove',
            data: {},
            filter: {
                id: this.id,
            },
        };
        this.operation = {
            operation,
            beforeExecute,
            afterExecute,
        };
        this.setDirty();
    }
    setDirty() {
        if (!this.operation) {
            // 这种情况是下面的子结点setDirty引起的连锁设置
            assert(this.id);
            this.operation = {
                operation: {
                    id: generateNewId(),
                    action: 'update',
                    data: {},
                    filter: {
                        id: this.id,
                    }
                }
            };
        }
        super.setDirty();
    }
    composeOperations() {
        if (this.dirty) {
            const operation = this.operation?.operation && cloneDeep(this.operation.operation);
            if (operation) {
                for (const ele in this.children) {
                    const ele2 = ele.includes(':') ? ele.slice(0, ele.indexOf(':')) : ele;
                    const child = this.children[ele];
                    const childOperations = child.composeOperations();
                    if (childOperations) {
                        if (child instanceof SingleNode) {
                            assert(childOperations.length === 1);
                            if (!operation.data[ele2]) {
                                Object.assign(operation.data, {
                                    [ele2]: childOperations[0].operation,
                                });
                            }
                            else {
                                // 目前应该只允许一种情况，就是父create，子update
                                assert(operation.data[ele2].action === 'create' && childOperations[0].operation.action === 'update');
                                Object.assign(operation.data[ele2].data, childOperations[0].operation.data);
                            }
                        }
                        else {
                            assert(child instanceof ListNode);
                            const childOpers = childOperations.map(ele => ele.operation);
                            if (childOpers.length > 0) {
                                if (!operation.data[ele2]) {
                                    operation.data[ele2] = childOpers;
                                }
                                else {
                                    operation.data[ele2].push(...childOpers);
                                }
                            }
                        }
                    }
                }
                return [{
                        entity: this.entity,
                        operation,
                    }];
            }
        }
    }
    getProjection(withDecendants) {
        if (this.parent && this.parent instanceof ListNode) {
            return this.parent.getProjection();
        }
        const projection = super.getProjection();
        if (projection && withDecendants) {
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
        // SingleNode如果是ListNode的子结点，则不必refresh（优化，ListNode有义务负责子层对象的数据）
        if (this.parent && this.parent instanceof ListNode && this.parent.getEntity() === this.getEntity()) {
            this.publish();
            return;
        }
        // SingleNode如果是非根结点，其id应该在第一次refresh的时候来确定        
        const projection = this.getProjection(true);
        const filter = this.getFilter();
        if (projection && filter) {
            this.setLoading(true);
            this.publish();
            try {
                const { data: [value] } = await this.cache.refresh(this.entity, {
                    data: projection,
                    filter,
                }, undefined, undefined, ({ aggr }) => {
                    // 刷新后所有的更新都应当被丢弃（子层上可能会自动建立了this.create动作） 这里可能会有问题 by Xc 20230329
                    if (this.schema[this.entity].toModi) {
                        // 对于modi对象，在此缓存modiIds
                        const rows = this.cache.get('modi', {
                            data: {
                                id: 1,
                            },
                            filter: {
                                entity: this.entity,
                                entityId: this.id,
                                iState: 'active',
                            }
                        });
                        if (rows.length > 0) {
                            this.modiIds = rows.map(ele => ele.id);
                        }
                    }
                    this.aggr = aggr && aggr[0];
                    this.setFiltersAndSortedApplied();
                    this.setLoading(false);
                    //this.clean();
                });
                this.publish();
            }
            catch (err) {
                this.setLoading(false);
                this.publish();
                throw err;
            }
        }
        else {
            // 不刷新也publish一下，触发页面reRender，不然有可能导致页面不进入formData
            this.publish();
        }
    }
    clean(preserveAfterExecute) {
        if (this.dirty) {
            if (preserveAfterExecute && this.operation?.afterExecute) {
                this.operation.operation = undefined;
            }
            else {
                this.operation = undefined;
            }
            for (const child in this.children) {
                this.children[child].clean(preserveAfterExecute);
            }
            if (!preserveAfterExecute) {
                this.dirty = undefined;
            }
            else {
                this.publish();
            }
        }
    }
    getFilter() {
        // 如果是新建，等于没有filter
        if (this.operation?.operation?.action === 'create') {
            return;
        }
        // singleNode的filter可以优化权限的判断范围
        let filter = {
            id: this.id,
        };
        if (this.filters) {
            filter = combineFilters(this.entity, this.schema, this.filters.map(ele => typeof ele.filter === 'function' ? ele.filter() : ele.filter).concat(filter));
        }
        return filter;
    }
    getIntrinsticFilters() {
        return this.getFilter();
    }
    /**
     * getParentFilter不能假设一定已经有数据，只能根据当前filter的条件去构造
     * @param childNode
     * @param disableOperation
     * @returns
     */
    getParentFilter(childNode, ignoreNewParent) {
        const value = this.getFreshValue();
        if (value && value.$$createAt$$ === 1 && ignoreNewParent) {
            return;
        }
        for (const key in this.children) {
            if (childNode === this.children[key]) {
                const rel = this.judgeRelation(key);
                if (rel === 2) {
                    assert(false, '当前SingleNode应该自主管理id');
                    // 基于entity/entityId的多对一
                    /*  if (value) {
                         // 要么没有行(因为属性不全所以没有返回行，比如从list -> detail)；如果取到了行但此属性为空，则说明一定是singleNode到singleNode的create
                         if (value?.entityId) {
                             assert(value?.entity === this.children[key].getEntity());
                             return {
                                 id: value!.entityId!,
                             };
                         }
                         return;
                     }
                     const filter = this.getFilter();
                     if (filter) {
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
                     } */
                }
                else if (typeof rel === 'string') {
                    assert(false, '当前SingleNode应该自主管理id');
                    /* if (value) {
                        // 要么没有行(因为属性不全所以没有返回行，比如从list -> detail)；如果取到了行但此属性为空，则说明一定是singleNode到singleNode的create
                        if (value && value[`${rel}Id`]) {
                            return {
                                id: value[`${rel}Id`],
                            };
                        }
                        return;
                    }
                    const filter = this.getFilter();
                    if (filter) {
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
                    } */
                }
                else {
                    assert(rel instanceof Array && !key.endsWith('$$aggr'));
                    if (rel[1]) {
                        // 基于普通外键的一对多
                        if (value) {
                            return {
                                [rel[1]]: value.id,
                            };
                        }
                        const filter = this.getFilter();
                        if (filter) {
                            if (filter.id && Object.keys(filter).length === 1) {
                                return {
                                    [rel[1]]: filter.id,
                                };
                            }
                            return {
                                [rel[1].slice(0, rel[1].length - 2)]: filter,
                            };
                        }
                    }
                    else {
                        // 基于entity/entityId的一对多 
                        if (value) {
                            return {
                                entity: this.entity,
                                entityId: value.id,
                            };
                        }
                        const filter = this.getFilter();
                        if (filter) {
                            if (filter.id && Object.keys(filter).length === 1) {
                                return {
                                    entity: this.entity,
                                    entityId: filter.id,
                                };
                            }
                            return {
                                [this.entity]: filter,
                            };
                        }
                    }
                }
            }
        }
        return;
    }
}
class VirtualNode extends Feature {
    dirty;
    executing;
    loading = false;
    children;
    constructor(path, parent) {
        super();
        this.dirty = false;
        this.executing = false;
        this.children = {};
        if (parent) {
            parent.addChild(path, this);
        }
    }
    getActiveModies(child) {
        return;
    }
    setDirty() {
        this.dirty = true;
        this.publish();
    }
    setFiltersAndSortedApplied() {
        for (const k in this.children) {
            this.children[k].setFiltersAndSortedApplied();
        }
    }
    addChild(path, child) {
        // 规范virtualNode子结点的命名路径和类型，entity的singleNode必须被命名为entity或entity:number，ListNode必须被命名为entitys或entitys:number
        assert(!this.children[path]);
        this.children[path] = child;
        if (child instanceof SingleNode || child instanceof ListNode) {
            const entity = child.getEntity();
            if (child instanceof SingleNode) {
                assert(path === entity || path.startsWith(`${entity}:`), `oakPath「${path}」不符合命名规范，请以「${entity}:」为命名起始标识`);
            }
            else {
                assert(path === `${entity}s` || path.startsWith(`${entity}s:`), `oakPath「${path}」不符合命名规范，请以「${entity}s:」为命名起始标识`);
            }
        }
    }
    getChild(path) {
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
        this.loading = true;
        try {
            await Promise.all(Object.keys(this.children).map(ele => this.children[ele].refresh()));
            this.loading = false;
            this.publish();
        }
        catch (err) {
            this.loading = false;
            throw err;
        }
    }
    composeOperations() {
        /**
         * 当一个virtualNode有多个子结点，而这些子结点的前缀一致时，标识这些子结点其实是指向同一个对象，此时需要合并
         */
        const operationss = [];
        const operationDict = {};
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
    setExecuting(executing) {
        this.executing = executing;
        this.publish();
    }
    isExecuting() {
        return this.executing;
    }
    isLoading() {
        return this.loading;
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
        this.dirty = false;
    }
    clean(preserveAfterExecute) {
        for (const ele in this.children) {
            this.children[ele].clean(preserveAfterExecute);
        }
        if (!preserveAfterExecute) {
            this.dirty = false;
        }
        else {
            this.publish();
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
function analyzePath(path) {
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
export class RunningTree extends Feature {
    cache;
    schema;
    root;
    relationAuth; // todo 用这个来帮助selection加上要取的权限相关的数据
    constructor(cache, schema, relationAuth) {
        super();
        // this.aspectWrapper = aspectWrapper;
        this.cache = cache;
        this.schema = schema;
        this.relationAuth = relationAuth;
        this.root = {};
    }
    createNode(options) {
        const { entity, pagination, path: fullPath, filters, sorters, projection, isList, id, actions, cascadeActions, } = options;
        let node;
        const { parent, path } = analyzePath(fullPath);
        const parentNode = parent ? this.findNode(parent) : undefined;
        if (this.findNode(fullPath)) {
            // 现在都允许结点不析构
            const node = this.findNode(fullPath);
            if (node instanceof ListNode) {
                assert(isList && node.getEntity() === entity);
                if (!node.getProjection() && projection) {
                    node.setProjection(projection);
                    if (filters) {
                        node.setNamedFilters(filters);
                    }
                    if (sorters) {
                        node.setNamedSorters(sorters);
                    }
                    if (pagination) {
                        node.setPagination(pagination, false); // 创建成功后会统一refresh
                    }
                }
                else if (projection) {
                    // 这里有一个例外是queryPanel这种和父结点共用此结点的抽象组件
                    // assert(false, `创建node时发现path[${fullPath}]已经存在有效的ListNod结点，这种情况不应该存在`);
                }
            }
            else if (node instanceof SingleNode) {
                assert(!isList && node.getEntity() === entity);
                if (!node.getProjection() && projection) {
                    node.setProjection(projection);
                    if (id) {
                        const id2 = node.getId();
                        assert(id === id2, `重用path[${fullPath}]上的singleNode时，其上没有置有效id，这种情况id应当由父结点设置`);
                    }
                }
                else {
                    // 目前只有一种情况合法，即parentNode是list，列表中的位置移动引起的重用
                    // assert(parentNode instanceof ListNode, `创建node时发现path[${fullPath}]已有有效的SingleNode结点，本情况不应当存在`);
                }
            }
            else {
                // assert(false, `创建node时发现path[${fullPath}]已有有效的VirtualNode结点，本情况不应当存在`);
            }
            return node;
        }
        if (entity) {
            if (isList) {
                assert(!(parentNode instanceof ListNode));
                // assert(projection, `页面没有定义投影「${path}」`);
                node = new ListNode(entity, this.schema, this.cache, this.relationAuth, projection, parentNode, path, filters, sorters, pagination, actions, cascadeActions);
            }
            else {
                node = new SingleNode(entity, this.schema, this.cache, this.relationAuth, projection, parentNode, // 过编译
                path, id, filters, actions, cascadeActions);
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
    checkSingleNodeIsModiNode(node) {
        const id = node.getId();
        if (id) {
            const modies = this.cache.get('modi', {
                data: {
                    id: 1,
                },
                filter: {
                    targetEntity: node.getEntity(),
                    action: 'create',
                    data: {
                        id,
                    },
                    iState: 'active',
                }
            });
            return modies.length > 0;
        }
        return false;
    }
    checkIsModiNode(path) {
        if (!path.includes(MODI_NEXT_PATH_SUFFIX)) {
            return false;
        }
        const node = this.findNode(path);
        if (node instanceof SingleNode) {
            return this.checkSingleNodeIsModiNode(node);
        }
        else {
            assert(node instanceof ListNode);
            const parent = node.getParent();
            assert(parent instanceof SingleNode);
            return this.checkSingleNodeIsModiNode(parent);
        }
    }
    findNode(path) {
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
            node = node.getChild(childPath);
        }
        return node;
    }
    destroyNode(path) {
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
                assert(this.root.hasOwnProperty(path));
                unset(this.root, path);
            }
            node.destroy();
        }
    }
    getFreshValue(path) {
        const node = this.findNode(path);
        const paths = path.split('.');
        const root = this.root[paths[0]];
        const includeModi = path.includes(MODI_NEXT_PATH_SUFFIX);
        if (node) {
            this.cache.begin();
            try {
                assert(node instanceof ListNode || node instanceof SingleNode);
                if (includeModi) {
                    const opers2 = node.getActiveModiOperations();
                    if (opers2) {
                        this.cache.redoOperation(opers2);
                    }
                }
                const opers = root?.composeOperations();
                if (opers) {
                    this.cache.redoOperation(opers);
                }
                const value = node.getFreshValue();
                this.cache.rollback();
                return value;
            }
            catch (err) {
                this.cache.rollback();
                throw err;
            }
        }
    }
    isDirty(path) {
        const node = this.findNode(path);
        return node ? node.isDirty() : false;
    }
    addItem(path, data, beforeExecute, afterExecute) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.addItem(data, beforeExecute, afterExecute);
    }
    removeItem(path, id, beforeExecute, afterExecute) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.removeItem(id, beforeExecute, afterExecute);
    }
    updateItem(path, data, id, action, beforeExecute, afterExecute) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.updateItem(data, id, action, beforeExecute, afterExecute);
    }
    recoverItem(path, id) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.recoverItem(id);
    }
    resetItem(path, id) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.resetItem(id);
    }
    create(path, data, beforeExecute, afterExecute) {
        const node = this.findNode(path);
        assert(node instanceof SingleNode);
        node.create(data, beforeExecute, afterExecute);
    }
    update(path, data, action, beforeExecute, afterExecute) {
        const node = this.findNode(path);
        assert(node instanceof SingleNode);
        node.update(data, action, beforeExecute, afterExecute);
    }
    remove(path, beforeExecute, afterExecute) {
        const node = this.findNode(path);
        assert(node instanceof SingleNode);
        node.remove(beforeExecute, afterExecute);
    }
    isCreation(path) {
        const node = this.findNode(path);
        assert(node instanceof SingleNode);
        const oper = node.composeOperations();
        return !!(oper && oper[0].operation.action === 'create');
    }
    isLoading(path) {
        const node = this.findNode(path);
        return node?.isLoading();
    }
    isLoadingMore(path) {
        const node = this.findNode(path);
        assert(!node || (node instanceof SingleNode || node instanceof ListNode));
        return node?.isLoadingMore();
    }
    isExecuting(path) {
        const node = this.findNode(path);
        return node ? node.isExecuting() : false;
    }
    async refresh(path) {
        /* if (path.includes(MODI_NEXT_PATH_SUFFIX)) {
            return;
        } */
        const node = this.findNode(path);
        if (node instanceof ListNode) {
            await node.refresh(1, true);
        }
        else if (node) {
            await node.refresh();
        }
    }
    async loadMore(path) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        await node.loadMore();
    }
    getPagination(path) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.getPagination();
    }
    setId(path, id) {
        const node = this.findNode(path);
        assert(node instanceof SingleNode);
        return node.setId(id);
    }
    unsetId(path) {
        const node = this.findNode(path);
        assert(node instanceof SingleNode);
        node.unsetId();
    }
    getId(path) {
        const node = this.findNode(path);
        assert(node instanceof SingleNode);
        return node.getId();
    }
    setPageSize(path, pageSize) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        // 切换分页pageSize就重新设置
        return node.setPagination({
            pageSize,
            currentPage: 1,
            more: true,
        });
    }
    setCurrentPage(path, currentPage) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.setCurrentPage(currentPage);
    }
    getNamedFilters(path) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.getNamedFilters();
    }
    getNamedFilterByName(path, name) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.getNamedFilterByName(name);
    }
    setNamedFilters(path, filters, refresh = true) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.setNamedFilters(filters, refresh);
    }
    addNamedFilter(path, filter, refresh = false) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.addNamedFilter(filter, refresh);
    }
    removeNamedFilter(path, filter, refresh = false) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.removeNamedFilter(filter, refresh);
    }
    removeNamedFilterByName(path, name, refresh = false) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.removeNamedFilterByName(name, refresh);
    }
    getNamedSorters(path) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.getNamedSorters();
    }
    getNamedSorterByName(path, name) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.getNamedSorterByName(name);
    }
    setNamedSorters(path, sorters, refresh = true) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.setNamedSorters(sorters, refresh);
    }
    addNamedSorter(path, sorter, refresh = false) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.addNamedSorter(sorter, refresh);
    }
    removeNamedSorter(path, sorter, refresh = false) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.removeNamedSorter(sorter, refresh);
    }
    removeNamedSorterByName(path, name, refresh = false) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.removeNamedSorterByName(name, refresh);
    }
    getIntrinsticFilters(path) {
        const node = this.findNode(path);
        assert(node instanceof ListNode || node instanceof SingleNode);
        return node.getIntrinsticFilters();
    }
    tryExecute(path) {
        const node = this.findNode(path);
        const operations = node?.composeOperations();
        if (operations && operations.length > 0) {
            return this.cache.tryRedoOperations(operations);
        }
        return false;
    }
    getOperations(path) {
        const node = this.findNode(path);
        const operations = node?.composeOperations();
        return operations;
    }
    async execute(path, action) {
        const node = this.findNode(path);
        if (action) {
            if (node instanceof SingleNode) {
                node.update({}, action);
            }
            else {
                assert(node instanceof ListNode);
                assert(false); // 对list的整体action等遇到了再实现
            }
        }
        assert(node.isDirty());
        node.setExecuting(true);
        try {
            await node.doBeforeTrigger();
            const operations = node.composeOperations();
            // 这里理论上virtualNode下面也可以有多个不同的entity的组件，但实际中不应当出现这样的设计
            if (operations.length > 0) {
                const entities = uniq(operations.filter((ele) => !!ele).map((ele) => ele.entity));
                assert(entities.length === 1);
                const result = await this.cache.operate(entities[0], operations
                    .filter((ele) => !!ele)
                    .map((ele) => ele.operation), undefined, () => {
                    // 清空缓存
                    node.clean(true);
                    node.setExecuting(false);
                });
                await node.doAfterTrigger();
                return result;
            }
            node.clean(true);
            node.setExecuting(false);
            await node.doAfterTrigger();
            return { message: 'No Operation' };
        }
        catch (err) {
            node.setExecuting(false);
            throw err;
        }
    }
    clean(path) {
        const node = this.findNode(path);
        node.clean();
        const parent = node.getParent();
        if (parent) {
            parent.checkIfClean();
        }
    }
    getRoot() {
        return this.root;
    }
    subscribeNode(callback, path) {
        const node = this.findNode(path);
        /**
         * 当list上的结点更新路径时，会重复subscribe多条子路径结点，目前的数据结构不能支持在didUpdate的时候进行unsbscribe
         * 这里先将path返回，由结点自主判定是否需要reRender
         * by Xc 20230219
         * 原先用的clearSubscribes，是假设没有结点共用路径，目前看来这个假设不成立
         */
        // node.clearSubscribes();
        return node.subscribe(() => {
            callback(path);
        });
    }
}
