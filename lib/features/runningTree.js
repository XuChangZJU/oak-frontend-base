"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunningTree = void 0;
const assert_1 = __importDefault(require("assert"));
const lodash_1 = require("lodash");
const filter_1 = require("oak-domain/lib/store/filter");
const relation_1 = require("oak-domain/lib/store/relation");
const mockId_1 = require("../utils/mockId");
const Feature_1 = require("../types/Feature");
class Node {
    entity;
    // protected fullPath: string;
    schema;
    projection; // 只在Page层有
    parent;
    action;
    dirty;
    updateData;
    cache;
    refreshing;
    beforeExecute;
    afterExecute;
    constructor(entity, schema, cache, projection, parent, action, updateData) {
        this.entity = entity;
        this.schema = schema;
        this.cache = cache;
        this.projection = projection;
        this.parent = parent;
        this.action = action;
        this.dirty = false;
        this.refreshing = false;
        this.updateData = updateData || {};
        this.cache.bindOnSync((records) => this.onCachSync(records));
    }
    getEntity() {
        return this.entity;
    }
    setLocalUpdateData(attr, value) {
        const rel = this.judgeRelation(attr);
        let subEntity = undefined;
        if (rel === 2) {
            if (value) {
                (0, lodash_1.assign)(this.updateData, {
                    entity: attr,
                    entityId: value,
                });
            }
            else {
                (0, lodash_1.assign)(this.updateData, {
                    entity: undefined,
                    entityId: undefined,
                });
            }
            subEntity = attr;
        }
        else if (typeof rel === 'string') {
            if (value) {
                (0, lodash_1.assign)(this.updateData, {
                    [`${attr}Id`]: value,
                });
            }
            else {
                (0, lodash_1.assign)(this.updateData, {
                    [`${attr}Id`]: undefined,
                });
            }
            subEntity = rel;
        }
        else {
            (0, assert_1.default)(rel === 1);
            (0, lodash_1.assign)(this.updateData, {
                [attr]: value,
            });
        }
        if (subEntity) {
            // 说明是更新了外键
            this.setForeignKey(attr, subEntity, value);
        }
    }
    setUpdateData(attr, value) {
        this.setLocalUpdateData(attr, value);
        this.setDirty();
        this.refreshValue();
    }
    getUpdateData() {
        return this.updateData;
    }
    setMultiUpdateData(updateData) {
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
    setAction(action) {
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
    setBeforeExecute(_beforeExecute) {
        this.beforeExecute = _beforeExecute;
    }
    setAfterExecute(_afterExecute) {
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
    judgeRelation(attr) {
        return (0, relation_1.judgeRelation)(this.schema, this.entity, attr);
    }
    contains(filter, conditionalFilter) {
        return (0, filter_1.contains)(this.entity, this.schema, filter, conditionalFilter);
    }
    repel(filter1, filter2) {
        return (0, filter_1.repel)(this.entity, this.schema, filter1, filter2);
    }
}
const DEFAULT_PAGINATION = {
    step: 20,
    append: true,
    indexFrom: 0,
    more: true,
};
class ListNode extends Node {
    children;
    newBorn; // 新插入的结点
    filters;
    sorters;
    pagination;
    projectionShape;
    async onCachSync(records) {
        if (this.refreshing) {
            return;
        }
        const createdIds = [];
        let removeIds = false;
        for (const record of records) {
            const { a } = record;
            switch (a) {
                case 'c': {
                    const { e, d } = record;
                    if (e === this.entity) {
                        if (d instanceof Array) {
                            d.forEach((dd) => {
                                const { id } = dd;
                                createdIds.push(id);
                            });
                        }
                        else {
                            const { id } = d;
                            createdIds.push(id);
                        }
                    }
                    break;
                }
                case 'r': {
                    const { e, f } = record;
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
            const currentIds = this.children.map(ele => ele.getFreshValue()?.id).filter(ele => !!ele);
            const filter = (0, filter_1.combineFilters)([{
                    id: {
                        $in: currentIds.concat(createdIds),
                    }
                }, ...(this.filters).map(ele => ele.filter)]);
            const sorterss = (await Promise.all(this.sorters.map(async (ele) => {
                const { sorter } = ele;
                if (typeof sorter === 'function') {
                    return await sorter();
                }
                else {
                    return sorter;
                }
            }))).filter(ele => !!ele);
            const projection = typeof this.projection === 'function' ? await this.projection() : this.projection;
            const value = await this.cache.get(this.entity, {
                data: projection,
                filter,
                sorter: sorterss,
            }, 'listNode:onCachSync', { obscure: true });
            this.setValue(value);
        }
    }
    async setForeignKey(attr, entity, id) {
        // todo 对list的update外键的情况等遇到了再写 by Xc
    }
    refreshValue() {
    }
    constructor(entity, schema, cache, projection, projectionShape, parent, action, updateData, filters, sorters, pagination) {
        super(entity, schema, cache, projection, parent, action, updateData);
        this.projectionShape = projectionShape;
        this.children = [];
        this.newBorn = [];
        this.filters = filters || [];
        this.sorters = sorters || [];
        this.pagination = pagination || DEFAULT_PAGINATION;
    }
    getChild(path) {
        const idx = parseInt(path, 10);
        (0, assert_1.default)(typeof idx === 'number');
        if (idx < this.children.length) {
            return this.children[idx];
        }
        else {
            const idx2 = idx - this.children.length;
            // assert(idx2 < this.newBorn.length);  // 在删除结点时可能还是会跑到
            return this.newBorn[idx2];
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
    removeChild(path) {
        const idx = parseInt(path, 10);
        (0, assert_1.default)(typeof idx === 'number');
        this.children.splice(idx, 1);
    }
    setValue(value) {
        this.children = [];
        value && value.forEach((ele, idx) => {
            const node = new SingleNode(this.entity, this.schema, this.cache, this.projection, this.projectionShape, this);
            this.children[idx] = node;
            node.setValue(ele);
        });
    }
    appendValue(value) {
        value && value.forEach((ele, idx) => {
            const node = new SingleNode(this.entity, this.schema, this.cache, this.projection, this.projectionShape, this);
            this.children[this.children.length + idx] = node;
            node.setValue(ele);
        });
    }
    getNamedFilters() {
        return this.filters;
    }
    getNamedFilterByName(name) {
        const filter = this.filters.find((ele) => ele['#name'] === name);
        return filter;
    }
    setNamedFilters(filters) {
        this.filters = filters;
    }
    addNamedFilter(filter) {
        // filter 根据#name查找
        const fIndex = this.filters.findIndex(ele => filter['#name'] && ele['#name'] === filter['#name']);
        if (fIndex >= 0) {
            this.filters.splice(fIndex, 1, filter);
        }
        else {
            this.filters.push(filter);
        }
    }
    removeNamedFilter(filter) {
        // filter 根据#name查找
        const fIndex = this.filters.findIndex(ele => filter['#name'] && ele['#name'] === filter['#name']);
        if (fIndex >= 0) {
            this.filters.splice(fIndex, 1);
        }
    }
    removeNamedFilterByName(name) {
        // filter 根据#name查找
        const fIndex = this.filters.findIndex(ele => ele['#name'] === name);
        if (fIndex >= 0) {
            this.filters.splice(fIndex, 1);
        }
    }
    getNamedSorters() {
        return this.sorters;
    }
    getNamedSorterByName(name) {
        const sorter = this.sorters.find((ele) => ele['#name'] === name);
        return sorter;
    }
    setNamedSorters(sorters) {
        this.sorters = sorters;
    }
    addNamedSorter(sorter) {
        // sorter 根据#name查找
        const fIndex = this.sorters.findIndex(ele => sorter['#name'] && ele['#name'] === sorter['#name']);
        if (fIndex >= 0) {
            this.sorters.splice(fIndex, 1, sorter);
        }
        else {
            this.sorters.push(sorter);
        }
    }
    removeNamedSorter(sorter) {
        // sorter 根据#name查找
        const fIndex = this.sorters.findIndex(ele => sorter['#name'] && ele['#name'] === sorter['#name']);
        if (fIndex >= 0) {
            this.sorters.splice(fIndex, 1);
        }
    }
    removeNamedSorterByName(name) {
        // sorter 根据#name查找
        const fIndex = this.sorters.findIndex(ele => ele['#name'] === name);
        if (fIndex >= 0) {
            this.sorters.splice(fIndex, 1);
        }
    }
    getFreshValue() {
        const value = this.children.map(ele => ele.getFreshValue()).concat(this.newBorn.map(ele => ele.getFreshValue()));
        if (this.isDirty()) {
            const action = this.action || 'update';
            if (action === 'remove') {
                return []; // 这个可能跑到吗？
            }
            return value.map(ele => (0, lodash_1.assign)({}, ele, this.updateData));
        }
        else {
            return value;
        }
    }
    getAction() {
        (0, assert_1.default)(this.dirty);
        return this.action || 'update';
    }
    async composeOperation(action, execute) {
        if (!this.isDirty()) {
            if (action) {
                (0, assert_1.default)(action === 'create'); // 在list页面测试create是否允许？
                return {
                    action,
                    data: {},
                };
            }
            return;
        }
        // todo 这里的逻辑还没有测试过
        if (action || this.action) {
            return {
                action: action || this.getAction(),
                data: (0, lodash_1.cloneDeep)(this.updateData),
                filter: (0, filter_1.combineFilters)(this.filters.map(ele => ele.filter)),
            }; // todo 这里以后再增加对选中id的过滤
        }
        const actions = [];
        for (const node of this.children) {
            const subAction = await node.composeOperation(undefined, execute);
            if (subAction) {
                actions.push(subAction);
            }
        }
        for (const node of this.newBorn) {
            const subAction = await node.composeOperation(undefined, execute);
            if (subAction) {
                actions.push(subAction);
            }
        }
        return actions;
    }
    async refresh(scene) {
        const { filters, sorters, pagination, entity } = this;
        const { step } = pagination;
        const proj = await this.getProjection();
        (0, assert_1.default)(proj);
        const sorterss = (await Promise.all(sorters.map(async (ele) => {
            const { sorter } = ele;
            if (typeof sorter === 'function') {
                return await sorter();
            }
            else {
                return sorter;
            }
        }))).filter(ele => !!ele);
        const filterss = await Promise.all(filters.map(async (ele) => {
            const { filter } = ele;
            if (typeof filter === 'function') {
                return await filter();
            }
            return filter;
        }));
        this.refreshing = true;
        const { result } = await this.cache.refresh(entity, {
            data: proj,
            filter: filterss.length > 0 ? (0, filter_1.combineFilters)(filterss.filter(ele => !!ele)) : undefined,
            sorter: sorterss,
            indexFrom: 0,
            count: step,
        }, scene);
        this.pagination.indexFrom = 0;
        this.pagination.more = result.length === step;
        this.refreshing = false;
        this.setValue(result);
    }
    async loadMore(scene) {
        const { filters, sorters, pagination, entity } = this;
        const { step, more } = pagination;
        if (!more) {
            return;
        }
        const proj = await this.getProjection();
        (0, assert_1.default)(proj);
        const sorterss = (await Promise.all(sorters.map(async (ele) => {
            const { sorter } = ele;
            if (typeof sorter === 'function') {
                return await sorter();
            }
            else {
                return sorter;
            }
        }))).filter(ele => !!ele);
        const filterss = await Promise.all(filters.map(async (ele) => {
            const { filter } = ele;
            if (typeof filter === 'function') {
                return await filter();
            }
            return filter;
        }));
        this.refreshing = true;
        const { result } = await this.cache.refresh(entity, {
            data: proj,
            filter: filterss.length > 0 ? (0, filter_1.combineFilters)(filterss.filter(ele => !!ele)) : undefined,
            sorter: sorterss,
            indexFrom: this.pagination.indexFrom + step,
            count: step,
        }, scene);
        this.pagination.indexFrom = this.pagination.indexFrom + step;
        this.pagination.more = result.length === step;
        this.refreshing = false;
        this.appendValue(result);
    }
    resetUpdateData() {
        this.updateData = {};
        this.action = undefined;
        this.dirty = false;
        this.children.forEach((ele) => ele.resetUpdateData());
        this.newBorn = [];
    }
    pushNewBorn(options) {
        const { updateData, beforeExecute, afterExecute } = options;
        const node = new SingleNode(this.entity, this.schema, this.cache, this.projection, this.projectionShape, this, 'create');
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
    popNewBorn(path) {
        const index = parseInt(path, 10);
        (0, assert_1.default)(typeof index === 'number' && index >= this.children.length);
        const index2 = index - this.children.length;
        (0, assert_1.default)(index2 < this.newBorn.length);
        this.newBorn.splice(index2, 1);
    }
    // 将本结点的freshValue更正成data的要求，其中updateData要和现有的数据去重
    setUniqueChildren(data) {
        const convertForeignKey = (origin) => {
            const result = {};
            for (const attr in origin) {
                const rel = this.judgeRelation(attr);
                if (rel === 2) {
                    (0, lodash_1.assign)(result, {
                        entity: attr,
                        entityId: origin[attr],
                    });
                }
                else if (typeof rel === 'string') {
                    (0, lodash_1.assign)(result, {
                        [`${attr}Id`]: origin[attr],
                    });
                }
                else {
                    (0, assert_1.default)(rel === 1);
                    (0, lodash_1.assign)(result, {
                        [attr]: origin[attr],
                    });
                }
            }
            return result;
        };
        const same = (from, to) => {
            if (!from) {
                return false;
            }
            for (const attr in to) {
                if (from[attr] !== to[attr]) {
                    return false;
                }
            }
            return true;
        };
        const uds = [];
        for (const dt of data) {
            let existed = false;
            const { updateData } = dt;
            const ud2 = convertForeignKey(updateData);
            uds.push(ud2);
            for (const child of this.children) {
                if (same(child.getFreshValue(true), ud2)) {
                    if (child.getAction() === 'remove') {
                        // 这里把updateData全干掉了，如果本身是先update再remove或许会有问题 by Xc
                        child.resetUpdateData();
                    }
                    existed = true;
                    break;
                }
            }
            for (const child of this.newBorn) {
                if (same(child.getFreshValue(true), ud2)) {
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
                if (same(child.getFreshValue(true), ud)) {
                    included = true;
                    break;
                }
            }
            if (!included) {
                child.setAction('remove');
            }
        }
        const newBorn2 = [];
        for (const child of this.newBorn) {
            for (const ud of uds) {
                if (same(child.getFreshValue(true), ud)) {
                    newBorn2.push(child);
                    break;
                }
            }
        }
        this.newBorn = newBorn2;
    }
}
class SingleNode extends Node {
    id;
    value;
    freshValue;
    children;
    async onCachSync(records) {
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
                    const { e, d } = record;
                    if (e === this.entity) {
                        if (d instanceof Array) {
                            if (d.find(dd => dd.id === this.id)) {
                                needReGetValue = true;
                            }
                        }
                        else if (d.id === this.id) {
                            // this.id应该是通过父结点来设置到子结点上
                            needReGetValue = true;
                        }
                    }
                    break;
                }
                case 'r':
                case 'u': {
                    const { e, f } = record;
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
                    const { d } = record;
                    for (const e in d) {
                        if (needReGetValue === true) {
                            break;
                        }
                        if (e === this.entity) {
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
            }, 'onCacheSync');
            this.setValue(value);
        }
    }
    constructor(entity, schema, cache, projection, projectionShape, parent, action, updateData) {
        super(entity, schema, cache, projection, parent, action, updateData);
        this.children = {};
        const ownKeys = [];
        (0, lodash_1.keys)(projectionShape).forEach((attr) => {
            const proj = typeof projection === 'function' ? async () => {
                const projection2 = await projection();
                return projection2[attr];
            } : projection[attr];
            const rel = this.judgeRelation(attr);
            if (rel === 2) {
                const node = new SingleNode(attr, this.schema, this.cache, proj, projectionShape[attr], this);
                (0, lodash_1.assign)(this.children, {
                    [attr]: node,
                });
            }
            else if (typeof rel === 'string') {
                const node = new SingleNode(rel, this.schema, this.cache, proj, projectionShape[attr], this);
                (0, lodash_1.assign)(this.children, {
                    [attr]: node,
                });
            }
            else if (typeof rel === 'object' && rel instanceof Array) {
                const { data: subProjectionShape } = projectionShape[attr];
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
                    sorters.forEach(ele => node.addNamedSorter({
                        sorter: ele
                    }));
                }
                (0, lodash_1.assign)(this.children, {
                    [attr]: node,
                });
            }
            else {
                ownKeys.push(attr);
            }
        });
    }
    getChild(path) {
        return this.children[path];
    }
    getChildren() {
        return this.children;
    }
    removeChild(path) {
        (0, lodash_1.unset)(this.children, path);
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
                this.freshValue = (0, lodash_1.assign)({
                    id: (0, mockId_1.generateMockId)(),
                }, this.value, this.updateData);
            }
            else {
                this.freshValue = (0, lodash_1.assign)({}, this.value, this.updateData);
            }
        }
    }
    setValue(value) {
        for (const attr in this.children) {
            const node = this.children[attr];
            if (value && value[attr]) {
                node.setValue(value[attr]);
                if (node instanceof ListNode) {
                    const rel = this.judgeRelation(attr);
                    (0, assert_1.default)(rel instanceof Array);
                    const filter = rel[1] ? {
                        [rel[1]]: value.id,
                    } : {
                        entityId: value.id,
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
        this.id = value && value.id;
        this.value = value;
        this.refreshValue();
    }
    getFreshValue(ignoreRemoved) {
        if (ignoreRemoved) {
            return (0, lodash_1.assign)({}, this.value, this.updateData);
        }
        const freshValue = this.freshValue && (0, lodash_1.cloneDeep)(this.freshValue);
        if (freshValue) {
            for (const k in this.children) {
                (0, lodash_1.assign)(freshValue, {
                    [k]: this.children[k].getFreshValue(),
                });
            }
        }
        return freshValue;
    }
    getAction() {
        return this.action || (this.id ? 'update' : 'create');
    }
    async composeOperation(action2, execute) {
        if (!action2 && !this.isDirty()) {
            return;
        }
        const action = action2 || this.getAction();
        const operation = action === 'create' ? {
            action: 'create',
            data: (0, lodash_1.assign)({}, this.updateData, { id: execute ? await generateNewId() : (0, mockId_1.generateMockId)() }),
        } : {
            action,
            data: (0, lodash_1.cloneDeep)(this.updateData),
            filter: {
                id: this.id,
            },
        };
        for (const attr in this.children) {
            const subAction = await this.children[attr].composeOperation(undefined, execute);
            if (subAction) {
                (0, lodash_1.assign)(operation.data, {
                    [attr]: subAction,
                });
            }
        }
        return operation;
    }
    async refresh(scene) {
        const projection = await this.getProjection();
        if (this.id) {
            this.refreshing = true;
            const { result: [value] } = await this.cache.refresh(this.entity, {
                data: projection,
                filter: {
                    id: this.id,
                },
            }, scene);
            this.refreshing = false;
            this.setValue(value);
        }
    }
    resetUpdateData(attrs) {
        const attrsReset = attrs || Object.keys(this.updateData);
        for (const attr in this.children) {
            const rel = this.judgeRelation(attr);
            if (rel === 2) {
                if (attrsReset.includes('entityId')) {
                    this.children[attr].setValue(this.value && this.value[attr]);
                }
                else {
                    this.children[attr].setValue(undefined);
                }
            }
            else if (typeof rel === 'string') {
                if (attrsReset.includes(`${attr}Id`)) {
                    this.children[attr].setValue(this.value && this.value[attr]);
                }
                else {
                    this.children[attr].setValue(undefined);
                }
            }
            else if (typeof rel === 'object') {
                (0, assert_1.default)(!attrsReset.includes(attr));
            }
            this.children[attr].resetUpdateData();
        }
        (0, lodash_1.unset)(this.updateData, attrsReset);
        // this.action = undefined;
        if (!attrs) {
            this.dirty = false;
            this.action = undefined;
        }
        this.refreshValue();
    }
    async setForeignKey(attr, entity, id) {
        // 如果修改了外键且对应的外键上有子结点，在这里把子结点的value更新掉
        if (this.children[attr]) {
            const proj = typeof this.projection === 'function' ? await this.projection() : this.projection;
            const subProj = proj[attr];
            const newId = id || this.value?.id;
            const [value] = newId ? await this.cache.get(entity, {
                data: subProj,
                filter: {
                    id: newId,
                },
            }, 'SingleNode:setForeignKey') : [undefined];
            this.children[attr].setValue(value);
        }
    }
}
class RunningTree extends Feature_1.Feature {
    cache;
    schema;
    root;
    constructor(cache) {
        super();
        this.cache = cache;
        this.root = {};
    }
    async createNode(options) {
        const { entity, parent, pagination, path, filters, sorters, id, ids, action, updateData, projection, isList, isPicker, beforeExecute, afterExecute, } = options;
        let node;
        const parentNode = parent ? this.findNode(parent) : undefined;
        const projectionShape = typeof projection === 'function' ? await projection() : projection;
        if (isList) {
            node = new ListNode(entity, this.schema, this.cache, projection, projectionShape, parentNode, action, updateData, filters, sorters, pagination);
        }
        else {
            node = new SingleNode(entity, this.schema, this.cache, projection, projectionShape, parentNode, action, updateData);
            if (id) {
                node.setValue({ id });
            }
        }
        if (parentNode) {
            // todo，这里有几种情况，待处理
        }
        else {
            (0, assert_1.default)(!this.root[path]);
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
    findNode(path) {
        if (this.root[path]) {
            return this.root[path];
        }
        const paths = path.split('.');
        let node = this.root[paths[0]];
        let iter = 1;
        while (iter < paths.length && node) {
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
                (0, assert_1.default)(this.root.hasOwnProperty(path));
                (0, lodash_1.unset)(this.root, path);
            }
        }
    }
    setStorageSchema(schema) {
        this.schema = schema;
    }
    async applyOperation(entity, value, operation, projection, scene) {
        if (operation instanceof Array) {
            (0, assert_1.default)(value instanceof Array);
            for (const action of operation) {
                switch (action.action) {
                    case 'create': {
                        value.push(await this.applyOperation(entity, {}, action, projection, scene));
                        break;
                    }
                    case 'remove': {
                        const { filter } = action;
                        (0, assert_1.default)(filter.id);
                        const row = value.find(ele => ele.id === filter.id);
                        (0, lodash_1.pull)(value, row);
                        break;
                    }
                    default: {
                        const { filter } = action;
                        (0, assert_1.default)(filter.id);
                        const row = value.find(ele => ele.id === filter.id);
                        await this.applyOperation(entity, row, action, projection, scene);
                    }
                }
            }
            return value;
        }
        else {
            if (value instanceof Array) {
                // todo 这里还有种可能不是对所有的行，只对指定id的行操作
                return (await Promise.all(value.map(async (row) => await this.applyOperation(entity, row, operation, projection, scene)))).filter(ele => !!ele);
            }
            else {
                const { action, data } = operation;
                const applyUpsert = async (row, actionData) => {
                    for (const attr in actionData) {
                        const relation = (0, relation_1.judgeRelation)(this.schema, entity, attr);
                        if (relation === 1) {
                            (0, lodash_1.set)(row, attr, actionData[attr]);
                        }
                        else if (relation === 2) {
                            // 基于entity/entityId的多对一
                            if (projection[attr]) {
                                (0, lodash_1.set)(row, attr, await this.applyOperation(attr, row[attr], actionData[attr], projection[attr], scene));
                                if (row[attr]) {
                                    (0, lodash_1.assign)(row, {
                                        entity: attr,
                                        entityId: row[attr]['id'],
                                    });
                                }
                                else {
                                    (0, lodash_1.assign)(row, {
                                        entity: undefined,
                                        entityId: undefined,
                                    });
                                }
                            }
                        }
                        else if (typeof relation === 'string') {
                            if (projection[attr]) {
                                (0, lodash_1.set)(row, attr, await this.applyOperation(relation, row[attr], actionData[attr], projection[attr], scene));
                                if (row[attr]) {
                                    (0, lodash_1.assign)(row, {
                                        [`${attr}Id`]: row[attr]['id'],
                                    });
                                }
                                else {
                                    (0, lodash_1.assign)(row, {
                                        [`${attr}Id`]: undefined,
                                    });
                                }
                            }
                        }
                        else {
                            (0, assert_1.default)(relation instanceof Array);
                            if (projection[attr]) {
                                (0, lodash_1.set)(row, attr, await this.applyOperation(relation[0], row[attr], actionData[attr], projection[attr]['data'], scene));
                                row[attr].forEach((ele) => {
                                    if (relation[1]) {
                                        (0, lodash_1.assign)(ele, {
                                            [relation[1]]: row.id,
                                        });
                                    }
                                    else {
                                        (0, lodash_1.assign)(ele, {
                                            entity,
                                            entityId: row.id,
                                        });
                                    }
                                });
                            }
                        }
                    }
                    // 这里有一种额外的情况，actionData中更新了某项外键而projection中有相应的请求
                    for (const attr in projection) {
                        if (!actionData.hasOwnProperty(attr)) {
                            const relation = (0, relation_1.judgeRelation)(this.schema, entity, attr);
                            if (relation === 2 &&
                                (actionData.hasOwnProperty('entity') || actionData.hasOwnProperty('entityId'))) {
                                const entity = actionData.entity || row.entity;
                                const entityId = actionData.entityId || row.entityId;
                                const [entityRow] = await this.cache.get(entity, {
                                    data: projection[attr],
                                    filter: {
                                        id: entityId,
                                    },
                                }, scene);
                                (0, lodash_1.set)(row, attr, entityRow);
                            }
                            else if (typeof relation === 'string' && actionData.hasOwnProperty(`${attr}Id`)) {
                                const [entityRow] = await this.cache.get(relation, {
                                    data: projection[attr],
                                    filter: {
                                        id: actionData[`${attr}Id`],
                                    },
                                }, scene);
                                (0, lodash_1.set)(row, attr, entityRow);
                            }
                        }
                    }
                };
                switch (action) {
                    case 'create': {
                        await applyUpsert(value, data);
                        return value;
                    }
                    case 'remove': {
                        return undefined;
                    }
                    default: {
                        await applyUpsert(value, data);
                        return value;
                    }
                }
            }
        }
    }
    getFreshValue(path) {
        const node = this.findNode(path);
        let value = node && node.getFreshValue();
        return value;
    }
    isDirty(path) {
        const node = this.findNode(path);
        return node ? node.isDirty() : false;
    }
    async setUpdateDataInner(path, attr, value) {
        let node = this.findNode(path);
        const attrSplit = attr.split('.');
        let idx = 0;
        for (const split of attrSplit) {
            const entity = node.getEntity();
            const relation = (0, relation_1.judgeRelation)(this.schema, entity, split);
            if (relation === 1) {
                // todo transform data format
                const attrName = attrSplit.slice(idx).join('.');
                node.setUpdateData(attrName, value);
                return;
            }
            else {
                // node.setDirty();
                node = node.getChild(split);
                idx++;
            }
        }
    }
    async setUpdateData(path, attr, value) {
        await this.setUpdateDataInner(path, attr, value);
    }
    async setAction(path, action) {
        const node = this.findNode(path);
        node.setAction(action);
    }
    setForeignKey(parent, attr, id) {
        const parentNode = this.findNode(parent);
        (0, assert_1.default)(parentNode instanceof SingleNode);
        parentNode.setUpdateData(attr, id);
    }
    addForeignKeys(parent, attr, ids) {
        const parentNode = this.findNode(parent);
        (0, assert_1.default)(parentNode instanceof ListNode);
        ids.forEach((id) => {
            const node = parentNode.pushNewBorn({});
            node.setUpdateData(attr, id);
        });
    }
    setUniqueForeignKeys(parent, attr, ids) {
        const parentNode = this.findNode(parent);
        (0, assert_1.default)(parentNode instanceof ListNode);
        parentNode.setUniqueChildren(ids.map((id) => ({
            updateData: {
                [attr]: id,
            }
        })));
    }
    async refresh(path) {
        const node = this.findNode(path);
        await node.refresh(path);
    }
    async loadMore(path) {
        const node = this.findNode(path);
        (0, assert_1.default)(node instanceof ListNode);
        await node.loadMore(path);
    }
    getNamedFilters(path) {
        const node = this.findNode(path);
        (0, assert_1.default)(node instanceof ListNode);
        return node.getNamedFilters();
    }
    getNamedFilterByName(path, name) {
        const node = this.findNode(path);
        (0, assert_1.default)(node instanceof ListNode);
        return node.getNamedFilterByName(name);
    }
    async setNamedFilters(path, filters, refresh = true) {
        const node = this.findNode(path);
        (0, assert_1.default)(node instanceof ListNode);
        node.setNamedFilters(filters);
        if (refresh) {
            await node.refresh(path);
        }
    }
    async addNamedFilter(path, filter, refresh = false) {
        const node = this.findNode(path);
        (0, assert_1.default)(node instanceof ListNode);
        node.addNamedFilter(filter);
        if (refresh) {
            await node.refresh(path);
        }
    }
    async removeNamedFilter(path, filter, refresh = false) {
        const node = this.findNode(path);
        (0, assert_1.default)(node instanceof ListNode);
        node.removeNamedFilter(filter);
        if (refresh) {
            await node.refresh(path);
        }
    }
    async removeNamedFilterByName(path, name, refresh = false) {
        const node = this.findNode(path);
        (0, assert_1.default)(node instanceof ListNode);
        node.removeNamedFilterByName(name);
        if (refresh) {
            await node.refresh(path);
        }
    }
    getNamedSorters(path) {
        const node = this.findNode(path);
        (0, assert_1.default)(node instanceof ListNode);
        return node.getNamedSorters();
    }
    getNamedSorterByName(path, name) {
        const node = this.findNode(path);
        (0, assert_1.default)(node instanceof ListNode);
        return node.getNamedSorterByName(name);
    }
    async setNamedSorters(path, sorters, refresh = true) {
        const node = this.findNode(path);
        (0, assert_1.default)(node instanceof ListNode);
        node.setNamedSorters(sorters);
        if (refresh) {
            await node.refresh(path);
        }
    }
    async addNamedSorter(path, sorter, refresh = false) {
        const node = this.findNode(path);
        (0, assert_1.default)(node instanceof ListNode);
        node.addNamedSorter(sorter);
        if (refresh) {
            await node.refresh(path);
        }
    }
    async removeNamedSorter(path, sorter, refresh = false) {
        const node = this.findNode(path);
        (0, assert_1.default)(node instanceof ListNode);
        node.removeNamedSorter(sorter);
        if (refresh) {
            await node.refresh(path);
        }
    }
    async removeNamedSorterByName(path, name, refresh = false) {
        const node = this.findNode(path);
        (0, assert_1.default)(node instanceof ListNode);
        node.removeNamedSorterByName(name);
        if (refresh) {
            await node.refresh(path);
        }
    }
    async testAction(path, action, execute) {
        const node = this.findNode(path);
        if (execute) {
            await this.beforeExecute(node, action);
        }
        const operation = await node.composeOperation(action, execute);
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
            (0, assert_1.default)(false);
        }
        return {
            node,
            operation,
        };
    }
    async beforeExecute(node2, action) {
        async function beNode(node, action2) {
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
    async execute(path, action) {
        const { node, operation } = await this.testAction(path, action, true);
        await this.getAspectProxy().operate({
            entity: node.getEntity(),
            operation,
        }, path);
        // 清空缓存
        node.resetUpdateData();
        return operation;
    }
    pushNode(path, options) {
        const parent = this.findNode(path);
        (0, assert_1.default)(parent instanceof ListNode);
        parent.pushNewBorn(options);
    }
    async removeNode(parent, path) {
        const parentNode = this.findNode(parent);
        const node = parentNode.getChild(path);
        (0, assert_1.default)(parentNode instanceof ListNode && node instanceof SingleNode); // 现在应该不可能remove一个list吧，未来对list的处理还要细化
        if (node.getAction() !== 'create') {
            // 不是增加，说明是删除数据
            await this.getAspectProxy().operate({
                entity: node.getEntity(),
                operation: {
                    action: 'remove',
                    data: {},
                    filter: {
                        id: node.getFreshValue().id,
                    },
                }
            }, parent);
        }
        else {
            // 删除子结点
            parentNode.popNewBorn(path);
        }
    }
    resetUpdateData(path) {
        const node = this.findNode(path);
        node.resetUpdateData();
    }
}
__decorate([
    Feature_1.Action
], RunningTree.prototype, "setUpdateData", null);
__decorate([
    Feature_1.Action
], RunningTree.prototype, "setForeignKey", null);
__decorate([
    Feature_1.Action
], RunningTree.prototype, "addForeignKeys", null);
__decorate([
    Feature_1.Action
], RunningTree.prototype, "setUniqueForeignKeys", null);
__decorate([
    Feature_1.Action
], RunningTree.prototype, "refresh", null);
__decorate([
    Feature_1.Action
], RunningTree.prototype, "loadMore", null);
__decorate([
    Feature_1.Action
], RunningTree.prototype, "setNamedFilters", null);
__decorate([
    Feature_1.Action
], RunningTree.prototype, "addNamedFilter", null);
__decorate([
    Feature_1.Action
], RunningTree.prototype, "removeNamedFilter", null);
__decorate([
    Feature_1.Action
], RunningTree.prototype, "removeNamedFilterByName", null);
__decorate([
    Feature_1.Action
], RunningTree.prototype, "setNamedSorters", null);
__decorate([
    Feature_1.Action
], RunningTree.prototype, "addNamedSorter", null);
__decorate([
    Feature_1.Action
], RunningTree.prototype, "removeNamedSorter", null);
__decorate([
    Feature_1.Action
], RunningTree.prototype, "removeNamedSorterByName", null);
__decorate([
    Feature_1.Action
], RunningTree.prototype, "execute", null);
__decorate([
    Feature_1.Action
], RunningTree.prototype, "pushNode", null);
__decorate([
    Feature_1.Action
], RunningTree.prototype, "removeNode", null);
__decorate([
    Feature_1.Action
], RunningTree.prototype, "resetUpdateData", null);
exports.RunningTree = RunningTree;
