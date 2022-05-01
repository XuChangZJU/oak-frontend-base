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
class Node {
    entity;
    fullPath;
    schema;
    projection; // 只在Page层有
    parent;
    action;
    dirty;
    updateData;
    cache;
    needReGetValue;
    refreshing;
    refreshFn;
    constructor(entity, fullPath, schema, cache, projection, parent, action) {
        this.entity = entity;
        this.fullPath = fullPath;
        this.schema = schema;
        this.cache = cache;
        this.projection = projection;
        this.parent = parent;
        this.action = action;
        this.dirty = false;
        this.needReGetValue = true;
        this.refreshing = false;
    }
    getSubEntity(path) {
        const relation = (0, relation_1.judgeRelation)(this.schema, this.entity, path);
        if (relation === 2) {
            return {
                entity: path,
                isList: false,
            };
        }
        else if (typeof relation === 'string') {
            return {
                entity: relation,
                isList: false,
            };
        }
        else {
            (0, assert_1.default)(relation instanceof Array);
            return {
                entity: relation[0],
                isList: true,
            };
        }
    }
    getEntity() {
        return this.entity;
    }
    setUpdateData(attr, value) {
        if (!this.updateData) {
            this.updateData = {};
        }
        this.setDirty();
        (0, lodash_1.set)(this.updateData, attr, value);
    }
    setDirty() {
        if (!this.dirty) {
            this.dirty = true;
        }
    }
    isDirty() {
        return this.dirty;
    }
    getParent() {
        return this.parent;
    }
    getProjection() {
        return this.projection;
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
    value;
    filters;
    sorter;
    pagination;
    constructor(entity, fullPath, schema, cache, projection, parent, pagination, filters, sorter, action) {
        super(entity, fullPath, schema, cache, projection, parent, action);
        this.ids = [];
        this.value = [];
        this.children = [];
        this.filters = filters || [];
        this.sorter = sorter || [];
        this.pagination = pagination || DEFAULT_PAGINATION;
        if (projection) {
            this.registerValueSentry((records) => this.onRecordSynchoronized(records));
        }
    }
    async composeOperation() {
        if (!this.isDirty()) {
            return;
        }
        if (this.action || this.updateData) {
            return {
                action: this.action || 'update',
                data: (0, lodash_1.cloneDeep)(this.updateData),
                filter: (0, filter_1.combineFilters)(this.filters),
            }; // todo 这里以后再增加对选中id的过滤
        }
        const actions = [];
        for (const node of this.children) {
            const subAction = await node.composeOperation();
            if (subAction) {
                actions.push(subAction);
            }
        }
        return actions;
    }
    addChild(path, node) {
        const { children } = this;
        const idx = parseInt(path, 10);
        (0, assert_1.default)(!children[idx]);
        children[idx] = node;
    }
    removeChild(path) {
        const { children } = this;
        const idx = parseInt(path, 10);
        (0, assert_1.default)(children[idx]);
        (0, lodash_1.unset)(children, idx);
    }
    async getChild(path, create) {
        const idx = parseInt(path, 10);
        let node = this.children[idx];
        if (create && !node) {
            node = new SingleNode(this.entity, `${this.fullPath}.${idx}`, this.schema, this.cache, undefined, this, this.ids[idx]);
            node.setValue(this.value[idx]);
            this.addChild(path, node);
        }
        return node;
    }
    getFilter() {
        return (0, filter_1.combineFilters)(this.filters);
    }
    setFilters(filters) {
        this.filters = filters;
    }
    async refresh() {
        const { filters, sorter, pagination, entity, projection } = this;
        (0, assert_1.default)(projection);
        const { step } = pagination;
        this.refreshing = true;
        const { ids } = await this.cache.refresh(entity, {
            data: projection,
            filter: filters.length > 0 ? (0, filter_1.combineFilters)(filters) : undefined,
            sorter,
            indexFrom: 0,
            count: step,
        });
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
        const { entity, ids, projection } = this;
        (0, assert_1.default)(projection);
        if (ids.length > 0) {
            const rows = await this.cache.get({
                entity,
                selection: {
                    data: projection,
                    filter: {
                        id: {
                            $in: ids,
                        }
                    },
                },
            });
            this.value = ids.map((id) => rows.find((ele) => ele.id === id)).filter(ele => !!ele);
        }
        else {
            this.value = [];
        }
        this.updateChildrenValue();
    }
    async onRecordSynchoronized(records) {
        if (this.refreshing) {
            this.needReGetValue = true;
            return;
        }
        for (const record of records) {
            const { a } = record;
            switch (a) {
                case 'c': {
                    const { e, d } = record;
                    if (e === this.entity) {
                        const { id } = d;
                        const filter = (0, filter_1.combineFilters)([{ id }, ...this.filters]);
                        const { ids } = await this.cache.operate(e, {
                            data: {
                                id: 1,
                            },
                            filter,
                            action: 'select',
                        }, false, { obscure: true });
                        if (ids.length > 0) {
                            // todo 这里更严格应该还要考虑sorter，但前端可能没有完整的供sort用的cache数据
                            this.ids.push(id);
                            this.needReGetValue = true;
                        }
                    }
                    break;
                }
                case 'r':
                case 'u': {
                    const { e, f } = record;
                    if (e === this.entity) {
                        // todo 这里更严格应该考虑f对当前value有无影响，同上面一样这里可能没有完整的供f用的cache数据
                        this.needReGetValue = true;
                    }
                }
                case 's': {
                    const { d } = record;
                    for (const e in d) {
                        if (e === this.entity) {
                            for (const id in d[e]) {
                                if (this.ids.includes(id)) {
                                    this.needReGetValue = true;
                                    break;
                                }
                                else {
                                    const filter = (0, filter_1.combineFilters)([{ id }, ...this.filters]);
                                    const { ids } = await this.cache.operate(e, {
                                        data: {
                                            id: 1,
                                        },
                                        filter,
                                        action: 'select',
                                    }, false, { obscure: true });
                                    if (ids.length > 0) {
                                        // todo 这里更严格应该还要考虑sorter，但前端可能没有完整的供sort用的cache数据
                                        this.ids.push(id);
                                        this.needReGetValue = true;
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
    }
    async getValue() {
        if (this.needReGetValue) {
            await this.reGetValue();
            this.needReGetValue = false;
        }
        return this.value;
    }
    setValue(value) {
        this.value = value;
        this.updateChildrenValue();
    }
    resetUpdateData() {
        this.updateData = undefined;
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
    constructor(entity, fullPath, schema, cache, projection, parent, id, action) {
        super(entity, fullPath, schema, cache, projection, parent, action);
        this.id = id;
        this.children = {};
        if (projection) {
            this.registerValueSentry((record) => this.onRecordSynchoronized(record));
        }
    }
    async refresh() {
        (0, assert_1.default)(this.projection);
        if (this.action !== 'create') {
            this.refreshing = true;
            await this.cache.refresh(this.entity, {
                data: this.projection,
                filter: {
                    id: this.id,
                },
            });
            this.refreshing = false;
        }
    }
    async composeOperation(action2) {
        if (!this.isDirty() && !action2) {
            return;
        }
        const action = this.action === 'create' ? {
            action: 'create',
            data: (0, lodash_2.assign)({}, this.updateData, { id: await generateNewId() }),
        } : {
            action: action2 || this.action || 'update',
            data: (0, lodash_1.cloneDeep)(this.updateData) || {},
            filter: {
                id: this.id,
            },
        };
        for (const attr in this.children) {
            const subAction = await this.children[attr].composeOperation();
            if (subAction) {
                (0, lodash_2.assign)(action.data, {
                    [attr]: subAction,
                });
            }
        }
        return action;
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
    async getChild(path, create, cache) {
        let node = this.children[path];
        if (create && !node) {
            (0, assert_1.default)(cache);
            const relation = (0, relation_1.judgeRelation)(this.schema, this.entity, path);
            if (relation === 2) {
                // 基于entityId的多对一
                if (this.value && this.value.entityId) {
                    node = new SingleNode(path, `${this.fullPath}.${path}`, this.schema, this.cache, undefined, this, this.value.entityId);
                }
                else {
                    // 新建对象并关联
                    (0, assert_1.default)(!this.value || this.value.entity);
                    const id = await generateNewId();
                    /*  await cache.operate(this.entity, {
                         action: 'update',
                         data: {
                             entity: path as any,
                             [path]: {
                                 action: 'create',
                                 data: {
                                     id,
                                 },
                             },
                         },
                         filter: {
                             id: this.id!,
                         }
                     } as any); */
                    node = new SingleNode(path, `${this.fullPath}.${path}`, this.schema, this.cache, undefined, this, id, 'create');
                }
            }
            else if (typeof relation === 'string') {
                if (this.value && this.value[`${path}Id`]) {
                    node = new SingleNode(relation, `${this.fullPath}.${path}`, this.schema, this.cache, undefined, this, this.value[`${path}Id`]);
                }
                else {
                    // 新建对象并关联
                    (0, assert_1.default)(!this.value || !this.value.entity);
                    const id = await generateNewId();
                    /* await cache.operate(this.entity, {
                        action: 'update',
                        data: {
                            [path]: {
                                action: 'create',
                                data: {
                                    id,
                                },
                            },
                        },
                        filter: {
                            id: this.id!,
                        }
                    } as any); */
                    node = new SingleNode(path, `${this.fullPath}.${path}`, this.schema, this.cache, undefined, this, id, 'create');
                }
            }
            else {
                (0, assert_1.default)(relation instanceof Array);
                node = new ListNode(relation[0], `${this.fullPath}.${path}`, this.schema, this.cache, undefined, this);
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
        const { entity, id, projection } = this;
        (0, assert_1.default)(projection);
        if (id) {
            const filter = {
                id,
            };
            const value = await this.cache.get({
                entity,
                selection: {
                    data: projection,
                    filter,
                }
            });
            this.value = value[0];
            this.updateChildrenValues();
        }
    }
    async getValue() {
        if (this.needReGetValue) {
            await this.reGetValue();
            this.needReGetValue = false;
        }
        return this.value;
    }
    setValue(value) {
        this.value = value;
        this.updateChildrenValues();
    }
    resetUpdateData() {
        this.updateData = undefined;
        // this.action = undefined;
        this.dirty = false;
        for (const attr in this.children) {
            this.children[attr]?.resetUpdateData();
        }
    }
    async onRecordSynchoronized(records) {
        if (this.refreshing) {
            this.needReGetValue = true;
            return;
        }
        for (const record of records) {
            const { a } = record;
            switch (a) {
                case 'c': {
                }
                case 'r':
                case 'u': {
                    const { e, f } = record;
                    if (e === this.entity) {
                        // todo 这里更严格应该考虑f对当前filter有无影响，同上面一样这里可能没有完整的供f用的cache数据
                        this.needReGetValue = true;
                    }
                }
                case 's': {
                    const { d } = record;
                    for (const e in d) {
                        if (e === this.entity) {
                            for (const id in d[e]) {
                                if (this.id === id) {
                                    this.needReGetValue = true;
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
    async createNode(path, parent, entity, isList, isPicker, projection, id, pagination, filters, sorter) {
        let node;
        const parentNode = parent ? await this.findNode(parent) : undefined;
        const fullPath = parent ? `${parent}.${path}` : `${path}`;
        const subEntity = parentNode && parentNode.getSubEntity(path);
        const entity2 = subEntity ? subEntity.entity : entity;
        const isList2 = subEntity ? subEntity.isList : isList;
        if (isPicker || isList2) {
            node = new ListNode(entity2, fullPath, this.schema, this.cache, projection, parentNode, pagination, filters, sorter);
        }
        else {
            /*  let id2: string = id || v4({ random: await getRandomValues(16) });
             if (!id) {
                 // 如果!isList并且没有id，说明是create，在这里先插入cache
                 await context.rowStore.operate(entity2, {
                     action: 'create',
                     data: {
                         id: id2,
                     } as FormCreateData<ED[T]['OpSchema']>,
                 }, context);
             } */
            node = new SingleNode(entity2, fullPath, this.schema, this.cache, projection, parentNode, id, !id ? 'create' : undefined);
        }
        if (parentNode) {
            parentNode.addChild(path, node);
        }
        else {
            this.root[path] = node;
        }
        return entity2;
    }
    async destroyNode(path) {
        const node = await this.findNode(path);
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
    async applyOperation(entity, value, operation, projection) {
        if (operation instanceof Array) {
            (0, assert_1.default)(value instanceof Array);
            for (const action of operation) {
                switch (action.action) {
                    case 'create': {
                        value.push(await this.applyOperation(entity, undefined, action, projection));
                    }
                    case 'remove': {
                        const { filter } = action;
                        (0, assert_1.default)(filter.id);
                        const row = value.find(ele => ele.id === filter.id);
                        (0, lodash_1.pull)(value, row);
                    }
                    default: {
                        const { filter } = action;
                        (0, assert_1.default)(filter.id);
                        const row = value.find(ele => ele.id === filter.id);
                        await this.applyOperation(entity, row, action, projection);
                    }
                }
            }
            return value;
        }
        else {
            if (value instanceof Array) {
                // todo 这里还有种可能不是对所有的行，只对指定id的行操作
                return (await Promise.all(value.map(async (row) => await this.applyOperation(entity, row, operation, projection)))).filter(ele => !!ele);
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
                                (0, lodash_1.set)(row, attr, await this.applyOperation(attr, row[attr], actionData[attr], projection[attr]));
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
                                (0, lodash_1.set)(row, attr, await this.applyOperation(relation, row[attr], actionData[attr], projection[attr]));
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
                                (0, lodash_1.set)(row, attr, await this.applyOperation(relation[0], row[attr], actionData[attr], projection[attr]));
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
                                const [entityRow] = await this.cache.get({
                                    entity,
                                    selection: {
                                        data: projection[attr],
                                        filter: {
                                            id: entityId,
                                        },
                                    }
                                });
                                (0, lodash_1.set)(row, attr, entityRow);
                            }
                            else if (typeof relation === 'string' && actionData.hasOwnProperty(`${attr}Id`)) {
                                const [entityRow] = await this.cache.get({
                                    entity: relation,
                                    selection: {
                                        data: projection[attr],
                                        filter: {
                                            id: actionData[`${attr}Id`],
                                        },
                                    }
                                });
                                (0, lodash_1.set)(row, attr, entityRow);
                            }
                        }
                    }
                };
                switch (action) {
                    case 'create': {
                        (0, assert_1.default)(!value);
                        const row = {
                            id: await generateNewId(),
                        };
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
        const node = await this.findNode(path);
        let value = await node.getValue();
        if (node.isDirty()) {
            const operation = await node.composeOperation();
            const projection = node.getProjection();
            value = (await this.applyOperation(node.getEntity(), value, operation, projection));
        }
        if (value instanceof Array) {
            return value;
        }
        return [value];
    }
    async isDirty(path) {
        const node = await this.findNode(path);
        return node.isDirty();
    }
    async findNode(path) {
        const paths = path.split('.');
        let node = this.root[paths[0]];
        let iter = 1;
        while (iter < paths.length) {
            const childPath = paths[iter];
            node = (await node.getChild(childPath));
            iter++;
        }
        return node;
    }
    async setUpdateDataInner(path, attr, value) {
        let node = await this.findNode(path);
        const attrSplit = attr.split('.');
        let idx = 0;
        for (const split of attrSplit) {
            const entity = node.getEntity();
            const relation = (0, relation_1.judgeRelation)(this.schema, entity, split);
            if (relation === 1) {
                // todo transform data format
                const attrName = attrSplit.slice(idx).join('.');
                node.setUpdateData(attrName, value);
                /* this.cache.operate(entity, {
                    action: 'update',
                    data: {
                        [attrName]: value,
                    } as any,
                    filter: node.getFilter(),
                }); */
                return;
            }
            else {
                node.setDirty();
                node = (await node.getChild(split, true, this.cache));
                idx++;
            }
        }
    }
    async setUpdateData(path, attr, value) {
        await this.setUpdateDataInner(path, attr, value);
    }
    async setMultipleData(path, data) {
        for (const d of data) {
            await this.setUpdateDataInner(path, d[0], d[1]);
        }
    }
    async refresh(path) {
        const node = await this.findNode(path);
        await node.refresh();
    }
    async setFilters(path, filters, refresh = true) {
        const node = await this.findNode(path);
        if (node instanceof ListNode) {
            node.setFilters(filters);
            if (refresh) {
                await node.refresh();
            }
        }
    }
    async execute(path, action, isTry) {
        const node = await this.findNode(path);
        const operation = await node.composeOperation(action);
        // 先在cache中尝试能否执行，如果权限上否决了在这里就失败
        if (operation instanceof Array) {
            for (const oper of operation) {
                await this.cache.operate(node.getEntity(), oper, false);
            }
        }
        else if (operation) {
            await this.cache.operate(node.getEntity(), operation, false);
        }
        else {
            return;
        }
        if (isTry) {
            return;
        }
        await this.getAspectProxy().operate({
            entity: node.getEntity(),
            operation,
        });
        // 清空缓存
        node.resetUpdateData();
    }
}
__decorate([
    Feature_1.Action
], RunningNode.prototype, "setUpdateData", null);
__decorate([
    Feature_1.Action
], RunningNode.prototype, "setMultipleData", null);
__decorate([
    Feature_1.Action
], RunningNode.prototype, "refresh", null);
__decorate([
    Feature_1.Action
], RunningNode.prototype, "setFilters", null);
__decorate([
    Feature_1.Action
], RunningNode.prototype, "execute", null);
exports.RunningNode = RunningNode;
