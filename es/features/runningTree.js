import { assert } from 'oak-domain/lib/utils/assert';
import { cloneDeep, unset, uniq } from "oak-domain/lib/utils/lodash";
import { checkFilterContains, combineFilters } from "oak-domain/lib/store/filter";
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
        this.loading = 0;
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
        return !!this.loading;
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
    currentPage: 0,
    pageSize: 20,
    more: true,
    total: 0,
};
class ListNode extends Node {
    updates;
    filters;
    sorters;
    getTotal;
    pagination;
    sr;
    syncHandler;
    setFiltersAndSortedApplied() {
        this.filters.forEach(ele => ele.applied = true);
        this.sorters.forEach(ele => ele.applied = true);
    }
    setLoading(loading) {
        if (this.loading === 0) {
            super.setLoading(loading);
        }
    }
    setUnloading(loading) {
        if (this.loading === loading) {
            super.setLoading(0);
        }
    }
    startLoading() {
        const number = Math.random() + 1;
        this.setLoading(number);
    }
    endLoading() {
        const number = this.loading;
        this.setUnloading(number);
    }
    checkIfClean() {
        if (Object.keys(this.updates).length > 0) {
            return;
        }
        if (this.isDirty()) {
            this.dirty = false;
            this.parent?.checkIfClean();
        }
    }
    onCacheSync(records) {
        // 只需要处理当listNode为首页且插入/删除项满足条件的情况
        if (this.loading || this.pagination.currentPage !== 1) {
            return;
        }
        let needReRender = false;
        for (const record of records) {
            const { a } = record;
            switch (a) {
                case 'c': {
                    const { e, d } = record;
                    if (e === this.entity) {
                        const context = this.cache.begin();
                        const { filter } = this.constructSelection();
                        if (d instanceof Array) {
                            d.forEach((dd) => {
                                if (!filter || (!this.sr.hasOwnProperty(dd.id) && checkFilterContains(e, context, filter, {
                                    id: dd.id,
                                }))) {
                                    this.sr[dd.id] = {}; // 如果有aggr怎么办，一般有aggr的页面不会出现这种情况，以后再说
                                    if (typeof this.pagination.total === 'number') {
                                        this.pagination.total += 1;
                                    }
                                    needReRender = true;
                                }
                            });
                        }
                        else {
                            if (!filter || (!this.sr.hasOwnProperty(d.id) && checkFilterContains(e, context, filter, {
                                id: d.id,
                            }))) {
                                this.sr[d.id] = {}; // 如果有aggr怎么办，一般有aggr的页面不会出现这种情况，以后再说
                                if (typeof this.pagination.total === 'number') {
                                    this.pagination.total += 1;
                                }
                                needReRender = true;
                            }
                        }
                        context.commit();
                    }
                    break;
                }
                case 'r': {
                    const { e, f } = record;
                    if (e === this.entity) {
                        if (!f) {
                            this.sr = {};
                            this.pagination.total = 0;
                            needReRender = true;
                        }
                        else if (f.id && typeof f.id === 'string') {
                            // 绝大多数删除情况
                            if (this.sr.hasOwnProperty(f.id)) {
                                unset(this.sr, f.id);
                                if (typeof this.pagination.total === 'number') {
                                    this.pagination.total -= 1;
                                }
                                needReRender = true;
                            }
                        }
                        else {
                            const context = this.cache.begin();
                            for (const id in this.sr) {
                                if (!f || checkFilterContains(e, context, f, { id })) {
                                    unset(this.sr, id);
                                    if (typeof this.pagination.total === 'number') {
                                        this.pagination.total -= 1;
                                    }
                                    needReRender = true;
                                }
                            }
                            context.commit();
                        }
                    }
                    break;
                }
                default: {
                    break;
                }
            }
            if (needReRender) {
                break;
            }
        }
    }
    destroy() {
        this.cache.unbindOnSync(this.syncHandler);
    }
    constructor(entity, schema, cache, relationAuth, projection, parent, path, filters, sorters, getTotal, pagination, actions, cascadeActions) {
        super(entity, schema, cache, relationAuth, projection, parent, path, actions, cascadeActions);
        this.filters = filters || [];
        this.sorters = sorters || [];
        this.getTotal = getTotal;
        this.pagination = pagination ? {
            ...pagination,
            currentPage: pagination.currentPage - 1,
            more: true,
            total: 0,
        } : DEFAULT_PAGINATION;
        this.updates = {};
        this.sr = {};
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
            this.refresh(0, false);
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
            this.refresh(0, false);
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
            this.refresh(0, false);
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
            this.refresh(0, false);
        }
        else {
            this.publish();
        }
    }
    getNamedSorters() {
        return this.sorters;
    }
    getNamedSorterByName(name) {
        const sorter = this.sorters.find((ele) => ele && ele['#name'] === name);
        return sorter;
    }
    setNamedSorters(sorters, refresh) {
        this.sorters = sorters.map(ele => Object.assign({}, ele, { applied: false }));
        if (refresh) {
            this.refresh(0, false);
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
            this.refresh(0, false);
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
            this.refresh(0, false);
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
            this.refresh(0, false);
        }
        else {
            this.publish();
        }
    }
    getFreshValue() {
        /**
         * 现在简化情况，只取sr中有id的数据
         */
        const ids = Object.keys(this.sr);
        const { data, sorter } = this.constructSelection(true, false, true);
        const result = this.cache.get(this.entity, {
            data,
            filter: {
                id: {
                    $in: ids,
                }
            },
            sorter,
        }, true, this.sr);
        return result;
    }
    addItem(item) {
        // 如果数据键值是一个空字符串则更新成null
        for (const k in item) {
            if (item[k] === '') {
                Object.assign(item, {
                    [k]: null,
                });
            }
        }
        const id = generateNewId();
        assert(!this.updates[id]);
        this.updates[id] = {
            id: generateNewId(),
            action: 'create',
            data: Object.assign(item, { id }),
        };
        this.sr[id] = {};
        this.setDirty();
        return id;
    }
    removeItem(id) {
        if (this.updates[id] &&
            this.updates[id].action === 'create') {
            // 如果是新增项，在这里抵消
            unset(this.updates, id);
            unset(this.sr, id);
        }
        else {
            this.updates[id] = {
                id: generateNewId(),
                action: 'remove',
                data: {},
                filter: {
                    id,
                },
            };
        }
        this.setDirty();
    }
    recoverItem(id) {
        const operation = this.updates[id];
        assert(operation?.action === 'remove');
        unset(this.updates, id);
        this.setDirty();
    }
    resetItem(id) {
        const operation = this.updates[id];
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
    updateItem(data, id, action) {
        // 如果数据键值是一个空字符串则更新成null
        for (const k in data) {
            if (data[k] === '') {
                Object.assign(data, {
                    [k]: null,
                });
            }
        }
        if (this.updates[id]) {
            const operation = this.updates[id];
            const { data: dataOrigin } = operation;
            Object.assign(dataOrigin, data);
            if (action && operation.action !== action) {
                assert(operation.action === 'update');
                operation.action = action;
            }
        }
        else {
            this.updates[id] = {
                id: generateNewId(),
                action: action || 'update',
                data,
                filter: {
                    id,
                },
            };
        }
        this.setDirty();
    }
    updateItems(data, action) {
        for (const id in data) {
            this.updateItem(data[id], id, action);
        }
    }
    composeOperations() {
        if (!this.dirty) {
            return;
        }
        const operations = [];
        for (const id in this.updates) {
            if (this.updates[id]) {
                operations.push({
                    entity: this.entity,
                    operation: cloneDeep(this.updates[id]),
                });
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
        const { sorters, getTotal } = this;
        const data = this.getProjection();
        assert(data, '取数据时找不到projection信息');
        const sorterArr = sorters.filter(ele => !ignoreUnapplied || ele.applied).map((ele) => {
            const { sorter } = ele;
            if (typeof sorter === 'function') {
                return sorter();
            }
            return sorter;
        }).flat().filter((ele) => !!ele);
        const filters = this.constructFilters(withParent, ignoreNewParent, ignoreUnapplied);
        const filters2 = filters?.filter((ele) => !!ele);
        const filter = filters2 ? combineFilters(this.entity, this.schema, filters2) : undefined;
        return {
            data,
            filter,
            sorter: sorterArr,
            total: getTotal,
        };
    }
    /**
     * 存留查询结果
     */
    saveRefreshResult(sr, append, currentPage) {
        const { data, total } = sr;
        this.pagination.more = Object.keys(data).length === this.pagination.pageSize;
        if (currentPage) {
            this.pagination.currentPage = currentPage;
        }
        if (typeof total === 'number') {
            this.pagination.total = total;
        }
        if (append) {
            this.sr = {
                ...this.sr,
                ...data,
            };
        }
        else {
            this.sr = data;
        }
    }
    async refresh(pageNumber, append) {
        const { entity, pagination } = this;
        const { currentPage, pageSize, randomRange } = pagination;
        const currentPage3 = typeof pageNumber === 'number' ? pageNumber : currentPage;
        assert(!randomRange || !currentPage3, 'list在访问数据时，如果设置了randomRange，则不应再有pageNumber');
        const { data: projection, filter, sorter, total, } = this.constructSelection(true, true);
        // 若不存在有效的过滤条件（若有父结点但却为空时，说明父结点是一个create动作，不用刷新），则不能刷新
        if ((!this.getParent() || this.getParent() instanceof VirtualNode || filter) && projection) {
            try {
                this.startLoading();
                if (append) {
                    this.loadingMore = true;
                }
                this.publishRecursively();
                await this.cache.refresh(entity, {
                    data: projection,
                    filter,
                    sorter,
                    indexFrom: currentPage3 * pageSize,
                    count: pageSize,
                    randomRange,
                    total: currentPage3 === 0 ? total : undefined,
                }, undefined, (selectResult) => {
                    this.saveRefreshResult(selectResult, append, currentPage3);
                    this.endLoading();
                    this.setFiltersAndSortedApplied();
                    if (append) {
                        this.loadingMore = false;
                    }
                });
                this.publishRecursively();
            }
            catch (err) {
                this.endLoading();
                if (append) {
                    this.loadingMore = false;
                }
                this.publishRecursively();
                throw err;
            }
        }
        else {
            // 不刷新也publish一下，触发页面reRender，不然有可能导致页面不进入formData
            this.publishRecursively();
        }
    }
    async loadMore() {
        const { filters, sorters, pagination, entity } = this;
        const { pageSize, more, currentPage } = pagination;
        if (!more) {
            return;
        }
        const currentPage2 = currentPage + 1;
        await this.refresh(currentPage2, true);
    }
    setCurrentPage(currentPage, append) {
        this.refresh(currentPage, append);
    }
    clean() {
        if (this.dirty) {
            const originUpdates = this.updates;
            this.updates = {};
            for (const k in originUpdates) {
                if (originUpdates[k].action === 'create') {
                    unset(this.sr, originUpdates[k].data.id);
                }
            }
            this.dirty = undefined;
            this.publish();
        }
    }
    // 查看这个list上所有数据必须遵守的限制
    getIntrinsticFilters() {
        const filters = this.constructFilters(undefined, true, true);
        return combineFilters(this.entity, this.schema, filters || []);
    }
    publishRecursively() {
        this.publish();
    }
}
class SingleNode extends Node {
    id;
    sr;
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
    setFiltersAndSortedApplied() {
        for (const k in this.children) {
            this.children[k].setFiltersAndSortedApplied();
        }
    }
    setLoading(loading) {
        if (this.loading === 0) {
            super.setLoading(loading);
            for (const k in this.children) {
                this.children[k].setLoading(loading);
            }
        }
    }
    setUnloading(loading) {
        if (this.loading === loading) {
            super.setLoading(0);
            for (const k in this.children) {
                this.children[k].setUnloading(loading);
            }
        }
    }
    startLoading() {
        const number = Math.random() + 1;
        this.setLoading(number);
    }
    endLoading() {
        const loading = this.loading;
        this.setUnloading(loading);
    }
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
            if (this.operation?.action === 'create') {
                if (this.operation.data.id === id) {
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
        if (this.operation && this.operation?.action === 'create') {
            return this.operation.data.id;
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
        if (projection && id) {
            const result = this.cache.get(this.entity, {
                data: projection,
                filter: {
                    id,
                },
            }, true, {
                [id]: this.sr,
            });
            return result[0];
        }
    }
    create(data) {
        const id = generateNewId();
        assert(!this.id && !this.dirty, 'create前要保证singleNode为空');
        // 如果数据键值是一个空字符串则更新成null
        for (const k in data) {
            if (data[k] === '') {
                Object.assign(data, {
                    [k]: null,
                });
            }
        }
        this.operation = {
            id: generateNewId(),
            action: 'create',
            data: Object.assign({}, data, { id }),
        };
        this.setDirty();
    }
    update(data, action) {
        // 如果数据键值是一个空字符串则更新成null
        for (const k in data) {
            if (data[k] === '') {
                Object.assign(data, {
                    [k]: null,
                });
            }
        }
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
                this.operation = operation;
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
                this.operation = operation;
            }
        }
        else {
            const operation = this.operation;
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
    remove() {
        assert(this.id);
        const operation = {
            id: generateNewId(),
            action: 'remove',
            data: {},
            filter: {
                id: this.id,
            },
        };
        this.operation = operation;
        this.setDirty();
    }
    setDirty() {
        if (!this.operation) {
            // 这种情况是下面的子结点setDirty引起的连锁设置
            assert(this.id);
            this.operation = {
                id: generateNewId(),
                action: 'update',
                data: {},
                filter: {
                    id: this.id,
                }
            };
        }
        super.setDirty();
    }
    composeOperations() {
        if (this.dirty) {
            const operation = this.operation && cloneDeep(this.operation);
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
        const projection = super.getProjection();
        if (projection && withDecendants) {
            for (const k in this.children) {
                if (projection[k] && process.env.NODE_ENV === 'development') {
                    console.warn(`父结点都定义了${k}路径上的projection，和子结点产生冲突`);
                }
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
    saveRefreshResult(data) {
        const ids = Object.keys(data);
        assert(ids.length === 1);
        this.id = ids[0];
        this.sr = data[ids[0]];
        /**
         * 把返回的结果中的total和aggr相关的值下降到相关的子结点上去
         */
        const value = this.getFreshValue();
        for (const k in this.sr) {
            const child = this.children[k];
            if (child) {
                const rel = this.judgeRelation(k);
                if (rel === 2) {
                    assert(child instanceof SingleNode);
                    assert(value.entity === child.getEntity());
                    child.saveRefreshResult({
                        [value.entityId]: this.sr[k],
                    });
                }
                else if (typeof rel === 'string') {
                    assert(child instanceof SingleNode);
                    assert(rel === child.getEntity());
                    child.saveRefreshResult({
                        [value[`${k}Id`]]: this.sr[k],
                    });
                }
                else {
                    assert(rel instanceof Array);
                    assert(child instanceof ListNode);
                    child.saveRefreshResult(this.sr[k]);
                }
            }
        }
    }
    async refresh() {
        // SingleNode如果是非根结点，其id应该在第一次refresh的时候来确定        
        const projection = this.getProjection(true);
        const filter = this.getFilter();
        if (projection && filter) {
            this.startLoading();
            this.publishRecursively();
            try {
                await this.cache.refresh(this.entity, {
                    data: projection,
                    filter,
                }, undefined, (result) => {
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
                    this.saveRefreshResult(result.data);
                    this.setFiltersAndSortedApplied();
                    this.endLoading();
                    //this.clean();
                });
                this.publishRecursively();
            }
            catch (err) {
                this.endLoading();
                this.publishRecursively();
                throw err;
            }
        }
        else {
            // 不刷新也publish一下，触发页面reRender，不然有可能导致页面不进入formData
            this.publishRecursively();
        }
    }
    clean() {
        if (this.dirty) {
            this.operation = undefined;
            for (const child in this.children) {
                this.children[child].clean();
            }
            this.dirty = undefined;
            this.publish();
        }
    }
    getFilter() {
        // 如果是新建，等于没有filter
        if (this.operation?.action === 'create') {
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
        return;
    }
    publishRecursively() {
        this.publish();
        for (const child in this.children) {
            this.children[child].publishRecursively();
        }
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
        this.publishRecursively();
        try {
            if (Object.keys(this.children).length > 0) {
                await Promise.all(Object.keys(this.children).map(ele => this.children[ele].refresh()));
            }
            this.loading = false;
            this.publishRecursively();
        }
        catch (err) {
            this.loading = false;
            this.publishRecursively();
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
        this.publishRecursively();
    }
    isExecuting() {
        return this.executing;
    }
    isLoading() {
        return this.loading;
    }
    clean() {
        for (const ele in this.children) {
            this.children[ele].clean();
        }
        this.dirty = false;
        this.publishRecursively();
    }
    checkIfClean() {
        for (const k in this.children) {
            if (this.children[k].isDirty()) {
                return;
            }
        }
        this.dirty = false;
    }
    publishRecursively() {
        this.publish();
        for (const child in this.children) {
            this.children[child].publishRecursively();
        }
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
        const { entity, pagination, path: fullPath, filters, sorters, projection, isList, id, actions, cascadeActions, getTotal, } = options;
        let node;
        const { parent, path } = analyzePath(fullPath);
        const parentNode = parent ? this.findNode(parent) : undefined;
        node = this.findNode(fullPath);
        if (node) {
            // 现在都允许结点不析构
            if (entity) {
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
                else {
                    assert(node instanceof SingleNode);
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
            }
            return node;
        }
        if (entity) {
            if (isList) {
                assert(!(parentNode instanceof ListNode));
                // assert(projection, `页面没有定义投影「${path}」`);
                node = new ListNode(entity, this.schema, this.cache, this.relationAuth, projection, parentNode, path, filters, sorters, getTotal, pagination, actions, cascadeActions);
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
            assert(node instanceof SingleNode || node instanceof VirtualNode, '不再允许listnode带更深的子结点');
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
    addItem(path, data) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        return node.addItem(data);
    }
    removeItem(path, id) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.removeItem(id);
    }
    updateItem(path, data, id, action) {
        const node = this.findNode(path);
        assert(node instanceof ListNode);
        node.updateItem(data, id, action);
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
    create(path, data) {
        const node = this.findNode(path);
        assert(node instanceof SingleNode);
        node.create(data);
    }
    update(path, data, action) {
        const node = this.findNode(path);
        assert(node instanceof SingleNode);
        node.update(data, action);
    }
    remove(path) {
        const node = this.findNode(path);
        assert(node instanceof SingleNode);
        node.remove();
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
        if (!node?.isLoading()) {
            if (node instanceof ListNode) {
                await node.refresh(0, false);
            }
            else if (node) {
                await node.refresh();
            }
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
        const pn = node.getPagination();
        return {
            ...pn,
            currentPage: pn.currentPage + 1,
        };
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
    getEntity(path) {
        const node = this.findNode(path);
        assert(node instanceof Node);
        return node.getEntity();
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
        return node.setCurrentPage(currentPage - 1);
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
            const operations = node.composeOperations();
            // 这里理论上virtualNode下面也可以有多个不同的entity的组件，但实际中不应当出现这样的设计
            if (operations.length > 0) {
                const entities = uniq(operations.filter((ele) => !!ele).map((ele) => ele.entity));
                assert(entities.length === 1);
                const result = await this.cache.operate(entities[0], operations
                    .filter((ele) => !!ele)
                    .map((ele) => ele.operation), undefined, () => {
                    // 清空缓存
                    node.clean();
                    if (node instanceof SingleNode) {
                        assert(operations.length === 1);
                        // 这逻辑有点扯，页面自己决定后续逻辑  by Xc 20231108
                        // if (operations[0].operation.action === 'create') {
                        //     // 如果是create动作，给结点赋上id，以保证页面数据的完整性
                        //     const { id } = operations[0].operation.data as ED[keyof ED]['CreateSingle']['data'];
                        //     node.setId(id);
                        // }
                    }
                    node.setExecuting(false);
                });
                return result;
            }
            node.clean();
            node.setExecuting(false);
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
