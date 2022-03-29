"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunningNode = exports.Node = void 0;
const filter_1 = require("oak-domain/lib/schema/filter");
const Feature_1 = require("../types/Feature");
const assert_1 = __importDefault(require("assert"));
const lodash_1 = require("lodash");
class Node {
    entity;
    projection; // 只在最外层有
    cache;
    parent;
    updateData;
    constructor(entity, cache, projection, parent) {
        this.entity = entity;
        this.projection = projection;
        this.cache = cache;
        this.parent = parent;
    }
    doRefresh(context, filter, sorter, indexFrom, count) {
        const { entity, projection } = this;
        return this.cache.action(context, {
            type: 'refresh',
            payload: {
                entity,
                selection: {
                    data: projection,
                    filter,
                    sorter,
                    indexFrom,
                    count,
                },
            },
        });
    }
}
exports.Node = Node;
class ListNode extends Node {
    ids;
    children;
    append;
    filters;
    sorter;
    indexFrom;
    count;
    hasMore;
    total;
    constructor(entity, cache, projection, parent, filters, sorter, append) {
        super(entity, cache, projection, parent);
        this.ids = [];
        this.children = [];
        this.append = append || false; // todo 根据environment来自动决定
        this.filters = filters || [];
        this.sorter = sorter || [];
    }
    addChild(path, node) {
        const { children } = this;
        children[path] = node;
    }
    async refresh(context) {
        const { entity, projection, filters, sorter, count } = this;
        const { ids } = await super.doRefresh(context, (0, filter_1.combineFilters)(filters), sorter, 0, count);
        (0, assert_1.default)(ids);
        this.ids = ids;
        this.indexFrom = 0;
        this.hasMore = ids.length === count;
    }
    async getData(context, projection) {
        const { entity, ids } = this;
        if (ids) {
            const filter = {
                id: {
                    $in: ids,
                },
            }; // 这里也没搞懂，用EntityShape能过，ED[T]['Schema']就不过
            return this.cache.get(context, {
                entity,
                selection: {
                    data: projection,
                    filter,
                }
            });
        }
    }
    async nextPage() {
    }
    async prevPage() {
    }
}
class SingleNode extends Node {
    id;
    children;
    constructor(entity, cache, projection, parent, id) {
        super(entity, cache, projection, parent);
        this.id = id;
        this.children = {};
    }
    async refresh(context) {
        const { entity, projection, id } = this;
        (0, assert_1.default)(id);
        await super.doRefresh(context, { id });
    }
    addChild(path, node) {
        const { children } = this;
        (0, lodash_1.assign)(children, {
            [path]: node,
        });
    }
    async getData(context, projection) {
        const { entity, id } = this;
        (0, assert_1.default)(id);
        const filter = {
            id,
        };
        return (await this.cache.get(context, {
            entity,
            selection: {
                data: projection,
                filter,
            }
        }));
    }
}
class RunningNode extends Feature_1.Feature {
    cache;
    constructor(cache) {
        super();
        this.cache = cache;
    }
    async get(context, params) {
        const { type, payload } = params;
        switch (type) {
            case 'data': {
                const { node, projection } = payload;
                if (node instanceof ListNode) {
                    return node.getData(context, projection);
                }
                else {
                    return node.getData(context, projection);
                }
            }
        }
    }
    action(context, action) {
        const { type, payload } = action;
        switch (type) {
            case 'init': {
                const { path, parent, entity, isList, id, projection, filters, sorter, append } = payload;
                const node = isList ? new ListNode(entity, this.cache, projection, parent, filters, sorter, append) :
                    new SingleNode(entity, this.cache, projection, parent, id);
                if (parent) {
                    (0, assert_1.default)(path);
                    const { addChild } = node;
                    if (id) {
                        (0, assert_1.default)(typeof path === 'string');
                        node.addChild(path, node);
                    }
                    else {
                        (0, assert_1.default)(typeof path === 'number');
                        node.addChild(path, node);
                    }
                }
                return node;
            }
            default: {
                break;
            }
        }
        throw new Error('Method not implemented.');
    }
}
exports.RunningNode = RunningNode;
