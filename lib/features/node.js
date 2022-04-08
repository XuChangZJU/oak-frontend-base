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
const uuid_1 = require("uuid");
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
    constructor(entity, fullPath, schema, projection, parent, action) {
        this.entity = entity;
        this.fullPath = fullPath;
        this.schema = schema;
        this.projection = projection;
        this.parent = parent;
        this.action = action;
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
    constructor(entity, fullPath, schema, projection, parent, pagination, filters, sorter, action) {
        super(entity, fullPath, schema, projection, parent, action);
        this.ids = [];
        this.value = [];
        this.children = [];
        this.filters = filters || [];
        this.sorter = sorter || [];
        this.pagination = pagination || DEFAULT_PAGINATION;
    }
    composeAction() {
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
            const subAction = node.composeAction();
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
    async getChild(path, create, cache) {
        const idx = parseInt(path, 10);
        let node = this.children[idx];
        if (create && !node) {
            node = new SingleNode(this.entity, `${this.fullPath}.${idx}`, this.schema, undefined, this, this.ids[idx]);
            node.setValue(this.value[idx]);
            this.addChild(path, node);
        }
        return node;
    }
    getFilter() {
        return (0, filter_1.combineFilters)(this.filters);
    }
    async refresh(cache) {
        const { filters, sorter, pagination, entity, projection } = this;
        (0, assert_1.default)(projection);
        const { step } = pagination;
        const { ids } = await cache.refresh(entity, {
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
    }
    updateChildrenValue() {
        this.children.forEach((ele, idx) => ele.setValue(this.value[idx]));
    }
    async getValue(cache) {
        const { entity, ids, projection } = this;
        if (ids.length) {
            const filter = {
                id: {
                    $in: ids,
                },
            }; // 这里也没搞懂，用EntityShape能过，ED[T]['Schema']就不过
            const rows = await cache.get({
                entity,
                selection: {
                    data: projection,
                    filter,
                }
            });
            this.value = ids.map(id => rows.find(ele => ele.id === id));
        }
        else {
            this.value = [];
        }
        this.updateChildrenValue();
        return this.value;
    }
    setValue(value) {
        this.value = value;
        this.updateChildrenValue();
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
    constructor(entity, fullPath, schema, projection, parent, id, action) {
        super(entity, fullPath, schema, projection, parent, action);
        this.id = id;
        this.children = {};
    }
    async refresh(cache) {
        (0, assert_1.default)(this.projection);
        if (this.action !== 'create') {
            await cache.refresh(this.entity, {
                data: this.projection,
                filter: {
                    id: this.id,
                },
            });
        }
    }
    composeAction() {
        if (!this.isDirty()) {
            return;
        }
        const action = this.action === 'create' ? {
            action: 'create',
            data: (0, lodash_1.cloneDeep)(this.updateData) || {},
        } : {
            action: this.action || 'update',
            data: (0, lodash_1.cloneDeep)(this.updateData) || {},
            filter: {
                id: this.id,
            },
        };
        for (const attr in this.children) {
            const subAction = this.children[attr].composeAction();
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
                    node = new SingleNode(path, `${this.fullPath}.${path}`, this.schema, undefined, this, this.value.entityId);
                }
                else {
                    // 新建对象并关联
                    (0, assert_1.default)(!this.value || this.value.entity);
                    const id = (0, uuid_1.v4)({ random: await getRandomValues(16) });
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
                    node = new SingleNode(path, `${this.fullPath}.${path}`, this.schema, undefined, this, id, 'create');
                }
            }
            else if (typeof relation === 'string') {
                if (this.value && this.value[`${path}Id`]) {
                    node = new SingleNode(relation, `${this.fullPath}.${path}`, this.schema, undefined, this, this.value[`${path}Id`]);
                }
                else {
                    // 新建对象并关联
                    (0, assert_1.default)(!this.value || !this.value.entity);
                    const id = (0, uuid_1.v4)({ random: await getRandomValues(16) });
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
                    node = new SingleNode(path, `${this.fullPath}.${path}`, this.schema, undefined, this, id, 'create');
                }
            }
            else {
                (0, assert_1.default)(relation instanceof Array);
                node = new ListNode(relation[0], `${this.fullPath}.${path}`, this.schema, undefined, this);
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
    async getValue(cache) {
        const { entity, id, projection } = this;
        (0, assert_1.default)(projection);
        if (id) {
            const filter = {
                id,
            };
            const value = await cache.get({
                entity,
                selection: {
                    data: projection,
                    filter,
                }
            });
            this.value = value[0];
            this.updateChildrenValues();
        }
        return this.value;
    }
    setValue(value) {
        this.value = value;
        this.updateChildrenValues();
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
        const context = this.getContext();
        if (isPicker || isList2) {
            node = new ListNode(entity2, fullPath, this.schema, projection, parentNode, pagination, filters, sorter);
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
            node = new SingleNode(entity2, fullPath, this.schema, projection, parentNode, id, !id ? 'create' : undefined);
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
    async refresh(path) {
        const node = await this.findNode(path);
        await node.refresh(this.cache);
    }
    async applyAction(entity, value, operation) {
        if (operation instanceof Array) {
            (0, assert_1.default)(value instanceof Array);
            for (const action of operation) {
                switch (action.action) {
                    case 'create': {
                        value.push(await this.applyAction(entity, undefined, action));
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
                        await this.applyAction(entity, row, action);
                    }
                }
            }
            return value;
        }
        else {
            if (value instanceof Array) {
                // todo 这里还有种可能不是对所有的行，只对指定id的行操作
                return (await Promise.all(value.map(async (row) => await this.applyAction(entity, row, operation)))).filter(ele => !!ele);
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
                            (0, lodash_1.set)(row, attr, await this.applyAction(attr, row[attr], actionData[attr]));
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
                        else if (typeof relation === 'string') {
                            (0, lodash_1.set)(row, attr, await this.applyAction(relation, row[attr], actionData[attr]));
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
                        else {
                            (0, assert_1.default)(relation instanceof Array);
                            (0, lodash_1.set)(row, attr, await this.applyAction(relation[0], row[attr], actionData[attr]));
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
                };
                switch (action) {
                    case 'create': {
                        (0, assert_1.default)(!value);
                        const row = {
                            id: (0, uuid_1.v4)({ random: await getRandomValues(16) }),
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
        let value = await node.getValue(this.cache);
        if (node.isDirty()) {
            const operation = node.composeAction();
            value = (await this.applyAction(node.getEntity(), value, operation));
        }
        if (value instanceof Array) {
            return value;
        }
        return [value];
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
    async setUpdateData(path, attr, value) {
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
    setStorageSchema(schema) {
        this.schema = schema;
    }
}
__decorate([
    Feature_1.Action
], RunningNode.prototype, "refresh", null);
__decorate([
    Feature_1.Action
], RunningNode.prototype, "setUpdateData", null);
exports.RunningNode = RunningNode;
