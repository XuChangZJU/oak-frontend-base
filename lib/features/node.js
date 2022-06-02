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
exports.RunningNode = exports.Node = void 0;
const lodash_1 = require("lodash");
const filter_1 = require("oak-domain/lib/store/filter");
const Feature_1 = require("../types/Feature");
const assert_1 = __importDefault(require("assert"));
const lodash_2 = require("lodash");
const relation_1 = require("oak-domain/lib/store/relation");
const mockId_1 = require("../utils/mockId");
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
    refreshFn;
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
    setUpdateData(attr, value) {
        this.setDirty();
        (0, lodash_1.set)(this.updateData, attr, value);
    }
    getUpdateData() {
        return this.updateData;
    }
    setWholeUpdateData(updateData) {
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
    setAction(action) {
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
    registerValueSentry(refreshFn) {
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
}
exports.Node = Node;
const DEFAULT_PAGINATION = {
    step: 20,
    append: true,
    indexFrom: 0,
    more: true,
};
class ListNode extends Node {
    ids;
    children;
    newBorn; // 新插入的结点
    value;
    filters;
    sorters;
    pagination;
    constructor(entity, schema, cache, projection, parent, pagination, filters, sorters, ids, action, updateData) {
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
        (0, assert_1.default)(this.dirty);
        return this.action || 'update';
    }
    async composeOperation(action, realId) {
        if (!action && !this.isDirty()) {
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
    getNewBorn() {
        return this.newBorn;
    }
    addChild(node, path) {
        const { children, newBorn } = this;
        if (path) {
            const idx = parseInt(path, 10);
            (0, assert_1.default)(idx < this.ids.length);
            node.setValue(this.value[idx]);
            (0, assert_1.default)(!children[idx]);
            children[idx] = node;
        }
        else {
            node.setAction('create');
            newBorn.push(node);
        }
    }
    removeChild(path) {
        const { children, newBorn } = this;
        const idx = parseInt(path, 10);
        if (idx >= this.ids.length) {
            const idx2 = idx - this.ids.length;
            (0, assert_1.default)(idx2 < newBorn.length);
            newBorn.splice(idx2, 1);
        }
        else {
            (0, assert_1.default)(children[idx]);
            (0, lodash_1.unset)(children, idx);
        }
    }
    getChild(path, create) {
        if (path) {
            let node;
            const idx = parseInt(path, 10);
            if (idx >= this.ids.length) {
                const idx2 = idx - this.ids.length;
                // assert(idx2 < this.newBorn.length);
                node = this.newBorn[idx2];
            }
            else {
                node = this.children[idx];
                if (create && !node) {
                    node = new SingleNode(this.entity, this.schema, this.cache, undefined, this, this.ids[idx]);
                    this.addChild(node, path);
                }
            }
            return node;
        }
        else {
            // 不传path说明是在list里增加一个结点，直接插入到newBorn里
            (0, assert_1.default)(create);
            const node = new SingleNode(this.entity, this.schema, this.cache, undefined, this, undefined);
            this.addChild(node);
            return node;
        }
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
    async refresh(scene) {
        const { filters, sorters, pagination, entity } = this;
        const { step } = pagination;
        const proj = await this.getProjection();
        (0, assert_1.default)(proj);
        const sorterss = await Promise.all(sorters.map(async (ele) => {
            const { sorter } = ele;
            if (typeof sorter === 'function') {
                return await sorter();
            }
            else {
                return sorter;
            }
        }));
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
            filter: filterss.length > 0 ? (0, filter_1.combineFilters)(filterss) : undefined,
            sorter: sorterss,
            indexFrom: 0,
            count: step,
        }, scene);
        const ids = result.map(ele => ele.id);
        (0, assert_1.default)(ids);
        this.ids = ids;
        this.pagination.indexFrom = 0;
        this.pagination.more = ids.length === step;
        this.refreshing = false;
    }
    updateChildrenValue() {
        this.children.forEach((ele, idx) => ele.setValue(this.value[idx]));
    }
    async reGetValue() {
        const { entity, ids } = this;
        const projection = await this.getProjection();
        (0, assert_1.default)(projection);
        if (ids.length > 0) {
            const rows = await this.cache.get(entity, {
                data: projection,
                filter: {
                    id: {
                        $in: ids,
                    }
                },
            }, 'reGetValue');
            this.value = ids.map((id) => rows.find((ele) => ele.id === id)).filter(ele => !!ele);
        }
        else {
            this.value = [];
        }
        this.updateChildrenValue();
    }
    async onRecordSynchoronized(records) {
        let needReGetValue = false;
        if (this.refreshing) {
            return;
        }
        for (const record of records) {
            const { a } = record;
            switch (a) {
                case 'c': {
                    const { e, d } = record;
                    if (e === this.entity) {
                        const { id } = d;
                        const filter = (0, filter_1.combineFilters)([{ id }, ...(this.filters).map(ele => ele.filter)]);
                        const rows = await this.cache.get(e, {
                            data: {
                                id: 1,
                            },
                            filter,
                        }, 'onRecordSynchoronized', { obscure: true });
                        if (rows.length > 0) {
                            // todo 这里更严格应该还要考虑sorter，但前端可能没有完整的供sort用的cache数据
                            this.ids.push(id);
                            needReGetValue = true;
                        }
                    }
                    break;
                }
                case 'r':
                case 'u': {
                    const { e, f } = record;
                    if (e === this.entity) {
                        // todo 这里更严格应该考虑f对当前value有无影响，同上面一样这里可能没有完整的供f用的cache数据
                        needReGetValue = true;
                    }
                    break;
                }
                case 's': {
                    const { d } = record;
                    for (const e in d) {
                        if (e === this.entity) {
                            for (const id in d[e]) {
                                if (this.ids.includes(id)) {
                                    needReGetValue = true;
                                    break;
                                }
                                else {
                                    const filter = (0, filter_1.combineFilters)([{ id }, ...(this.filters.map(ele => ele.filter))]);
                                    const rows = await this.cache.get(e, {
                                        data: {
                                            id: 1,
                                        },
                                        filter,
                                    }, 'onRecordSynchoronized', { obscure: true });
                                    if (rows.length > 0) {
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
    setValue(value) {
        this.value = value;
        if (value instanceof Array) {
            this.ids = value.map(ele => ele.id);
        }
        this.updateChildrenValue();
    }
    resetUpdateData() {
        this.updateData = {};
        // this.action = undefined;
        this.dirty = false;
        this.children.forEach((ele) => ele.resetUpdateData());
    }
    async nextPage() {
    }
    async prevPage() {
    }
}
class SingleNode extends Node {
    id;
    value;
    children;
    constructor(entity, schema, cache, projection, parent, id, action, updateData) {
        super(entity, schema, cache, projection, parent, action, updateData);
        this.id = id;
        this.children = {};
        if (projection) {
            this.registerValueSentry((record) => this.onRecordSynchoronized(record));
        }
    }
    async refresh(scene) {
        const projection = await this.getProjection();
        (0, assert_1.default)(projection);
        if (this.action !== 'create') {
            this.refreshing = true;
            await this.cache.refresh(this.entity, {
                data: projection,
                filter: {
                    id: this.id,
                },
            }, scene);
            this.refreshing = false;
        }
    }
    getAction() {
        return this.action || (this.id ? 'update' : 'create');
    }
    getId() {
        return this.id;
    }
    async composeOperation(action2, realId) {
        if (!action2 && !this.isDirty()) {
            return;
        }
        const action = action2 || this.getAction();
        const operation = action === 'create' ? {
            action: 'create',
            data: (0, lodash_2.assign)({}, this.updateData, { id: realId ? await generateNewId() : (0, mockId_1.generateMockId)() }),
        } : {
            action,
            data: (0, lodash_1.cloneDeep)(this.updateData) || {},
            filter: {
                id: this.id,
            },
        };
        for (const attr in this.children) {
            const subAction = await this.children[attr].composeOperation(undefined, realId);
            if (subAction) {
                (0, lodash_2.assign)(operation.data, {
                    [attr]: subAction,
                });
            }
        }
        return operation;
    }
    addChild(path, node) {
        const { children } = this;
        (0, assert_1.default)(!children[path]);
        (0, lodash_2.assign)(children, {
            [path]: node,
        });
    }
    removeChild(path) {
        const { children } = this;
        (0, assert_1.default)(children[path]);
        (0, lodash_1.unset)(children, path);
    }
    getChildren() {
        return this.children;
    }
    getChild(path, create) {
        let node = this.children[path];
        if (create && !node) {
            const relation = (0, relation_1.judgeRelation)(this.schema, this.entity, path);
            if (relation === 2) {
                // 基于entityId的多对一
                if (this.value && this.value.entityId) {
                    node = new SingleNode(path, this.schema, this.cache, undefined, this, this.value.entityId);
                }
                else {
                    // 新建对象并关联
                    (0, assert_1.default)(!this.value || this.value.entity);
                    node = new SingleNode(path, this.schema, this.cache, undefined, this, undefined, 'create');
                }
            }
            else if (typeof relation === 'string') {
                if (this.value && this.value[`${path}Id`]) {
                    node = new SingleNode(relation, this.schema, this.cache, undefined, this, this.value[`${path}Id`]);
                }
                else {
                    // 新建对象并关联
                    (0, assert_1.default)(!this.value || !this.value.entity);
                    node = new SingleNode(path, this.schema, this.cache, undefined, this, undefined, 'create');
                }
            }
            else {
                (0, assert_1.default)(relation instanceof Array);
                node = new ListNode(relation[0], this.schema, this.cache, undefined, this, undefined, undefined, undefined, this.value && this.value[path].map((ele) => ele.id));
            }
            node.setValue(this.value && this.value[path]);
            this.addChild(path, node);
        }
        return node;
    }
    getFilter() {
        return {
            id: this.id,
        };
    }
    updateChildrenValues() {
        for (const attr in this.children) {
            const value = this.value[attr];
            this.children[attr]?.setValue(value);
        }
    }
    async reGetValue() {
        const { entity, id } = this;
        const projection = await this.getProjection();
        (0, assert_1.default)(projection);
        if (id) {
            const filter = {
                id,
            };
            const value = await this.cache.get(entity, {
                data: projection,
                filter,
            }, 'reGetValue');
            this.value = value[0];
            this.updateChildrenValues();
        }
    }
    getValue() {
        return this.value;
    }
    setValue(value) {
        this.value = value;
        this.id = value && value.id;
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
    async onRecordSynchoronized(records) {
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
                    const { e, f } = record;
                    if (e === this.entity) {
                        // todo 这里更严格应该考虑f对当前filter有无影响，同上面一样这里可能没有完整的供f用的cache数据
                        needReGetValue = true;
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
            await this.reGetValue();
        }
    }
    createPicker(path, projection, pagination, filters, sorters) {
        const rel = (0, relation_1.judgeRelation)(this.schema, this.entity, path);
        let entity;
        if (rel === 2) {
            entity = path;
        }
        else {
            (0, assert_1.default)(typeof rel === 'string');
            entity = rel;
        }
        const node = new ListNode(entity, this.schema, this.cache, projection, this, pagination, filters, sorters);
        this.addChild(path, node);
        return node;
    }
}
class RunningNode extends Feature_1.Feature {
    cache;
    schema;
    root;
    constructor(cache) {
        super();
        this.cache = cache;
        this.root = {};
    }
    createNode(options) {
        const { entity, parent, pagination, path, filters, sorters, id, ids, action, updateData, projection, isList, isPicker, beforeExecute, afterExecute, } = options;
        let node;
        const parentNode = parent && this.findNode(parent, true);
        if (parentNode) {
            if (isPicker) {
                // 如果是picker，使用list来选择
                (0, assert_1.default)(path);
                (0, assert_1.default)(parentNode instanceof SingleNode);
                node = parentNode.createPicker(path, projection, pagination, filters, sorters);
            }
            else {
                (0, assert_1.default)(path || parentNode instanceof ListNode);
                node = (parentNode.getChild(path, true));
            }
            if (action) {
                node.setAction(action);
            }
            if (updateData) {
                node.setWholeUpdateData(updateData);
            }
        }
        else {
            (0, assert_1.default)(entity && path);
            if (isPicker || isList) {
                node = new ListNode(entity, this.schema, this.cache, projection, undefined, pagination, filters, sorters, ids, action, updateData);
            }
            else {
                node = new SingleNode(entity, this.schema, this.cache, projection, undefined, id, action, updateData);
            }
            this.root[path] = node;
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
    addNode(options) {
        return this.createNode(options);
    }
    async removeNode(options) {
        const { parent, path } = options;
        const parentNode = this.findNode(parent);
        const node = parentNode.getChild(path);
        (0, assert_1.default)(node instanceof SingleNode); // 现在应该不可能remove一个list吧，未来对list的处理还要细化
        if (node.getId()) {
            // 如果有id，说明是删除数据
            await this.getAspectProxy().operate({
                entity: node.getEntity(),
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
    destroyNode(path) {
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
                (0, assert_1.default)(childPath === path);
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
                        value.push(await this.applyOperation(entity, undefined, action, projection, scene));
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
                                    (0, lodash_2.assign)(row, {
                                        entity: attr,
                                        entityId: row[attr]['id'],
                                    });
                                }
                                else {
                                    (0, lodash_2.assign)(row, {
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
                                    (0, lodash_2.assign)(row, {
                                        [`${attr}Id`]: row[attr]['id'],
                                    });
                                }
                                else {
                                    (0, lodash_2.assign)(row, {
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
                                        (0, lodash_2.assign)(ele, {
                                            [relation[1]]: row.id,
                                        });
                                    }
                                    else {
                                        (0, lodash_2.assign)(ele, {
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
                        (0, assert_1.default)(!value);
                        const row = {};
                        await applyUpsert(row, data);
                        return row;
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
    async get(path) {
        const node = this.findNode(path);
        let value = node.getValue();
        if (node.isDirty()) {
            const operation = await node.composeOperation();
            const projection = await node.getProjection();
            value = (await this.applyOperation(node.getEntity(), (0, lodash_1.cloneDeep)(value), operation, projection, path));
        }
        if (value instanceof Array) {
            return value;
        }
        return [value];
    }
    async isDirty(path) {
        const node = this.findNode(path);
        return node ? node.isDirty() : false;
    }
    findNode(path, create) {
        const paths = path.split('.');
        let node = this.root[paths[0]];
        let iter = 1;
        while (iter < paths.length && node) {
            const childPath = paths[iter];
            iter++;
            node = node.getChild(childPath, create);
        }
        return node;
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
                node = node.getChild(split, true);
                idx++;
            }
        }
    }
    async setAction(path, action) {
        const node = this.findNode(path, true);
        node.setAction(action);
    }
    async setUpdateData(path, attr, value) {
        await this.setUpdateDataInner(path, attr, value);
    }
    async setMultipleData(path, data) {
        for (const d of data) {
            await this.setUpdateDataInner(path, d[0], d[1]);
        }
    }
    async setForeignKey(path, id) {
        const node = this.findNode(path);
        const parent = node.getParent();
        const attr = path.slice(path.lastIndexOf('.') + 1);
        const rel = (0, relation_1.judgeRelation)(this.schema, parent.getEntity(), attr);
        if (rel === 2) {
            parent.setUpdateData('entity', node.getEntity());
            parent.setUpdateData('entityId', id);
        }
        else {
            (0, assert_1.default)(typeof rel === 'string');
            parent.setUpdateData(`${attr}Id`, id);
        }
    }
    async refresh(path) {
        const node = this.findNode(path);
        await node.refresh(path);
        await node.reGetValue();
    }
    async getNamedFilters(path) {
        const node = this.findNode(path);
        (0, assert_1.default)(node instanceof ListNode);
        return node.getNamedFilters();
    }
    async getNamedFilterByName(path, name) {
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
    async getNamedSorters(path) {
        const node = await this.findNode(path);
        (0, assert_1.default)(node instanceof ListNode);
        return node.getNamedSorters();
    }
    async getNamedSorterByName(path, name) {
        const node = await this.findNode(path);
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
    async testAction(path, action, realId) {
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
        await this.beforeExecute(node, action);
        await this.getAspectProxy().operate({
            entity: node.getEntity(),
            operation,
        }, path);
        // 清空缓存
        node.resetUpdateData();
    }
}
__decorate([
    Feature_1.Action
], RunningNode.prototype, "addNode", null);
__decorate([
    Feature_1.Action
], RunningNode.prototype, "removeNode", null);
__decorate([
    Feature_1.Action
], RunningNode.prototype, "setUpdateData", null);
__decorate([
    Feature_1.Action
], RunningNode.prototype, "setMultipleData", null);
__decorate([
    Feature_1.Action
], RunningNode.prototype, "setForeignKey", null);
__decorate([
    Feature_1.Action
], RunningNode.prototype, "refresh", null);
__decorate([
    Feature_1.Action
], RunningNode.prototype, "setNamedFilters", null);
__decorate([
    Feature_1.Action
], RunningNode.prototype, "addNamedFilter", null);
__decorate([
    Feature_1.Action
], RunningNode.prototype, "removeNamedFilter", null);
__decorate([
    Feature_1.Action
], RunningNode.prototype, "removeNamedFilterByName", null);
__decorate([
    Feature_1.Action
], RunningNode.prototype, "setNamedSorters", null);
__decorate([
    Feature_1.Action
], RunningNode.prototype, "addNamedSorter", null);
__decorate([
    Feature_1.Action
], RunningNode.prototype, "removeNamedSorter", null);
__decorate([
    Feature_1.Action
], RunningNode.prototype, "removeNamedSorterByName", null);
__decorate([
    Feature_1.Action
], RunningNode.prototype, "execute", null);
exports.RunningNode = RunningNode;
