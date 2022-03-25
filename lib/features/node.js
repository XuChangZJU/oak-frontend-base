"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
const filter_1 = require("oak-domain/lib/schema/filter");
const assert_1 = __importDefault(require("assert"));
class Node {
    entity;
    projection;
    cache;
    parent;
    updateData;
    constructor(entity, projection, cache, parent) {
        this.entity = entity;
        this.projection = projection;
        this.cache = cache;
        this.parent = parent;
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
    constructor(entity, projection, cache, parent, append) {
        super(entity, projection, cache, parent);
        this.ids = [];
        this.children = [];
        this.append = append || false; // todo 根据environment来自动决定
    }
    async refresh() {
        const { entity, projection, filters, sorter, count } = this;
        const { ids } = await this.cache.refresh(entity, {
            data: projection,
            filter: filters && (0, filter_1.combineFilters)(filters),
            sorter,
            indexFrom: count && 0,
            count,
        });
        (0, assert_1.default)(ids);
        this.ids = ids;
        this.indexFrom = 0;
        this.hasMore = ids.length === count;
    }
    async nextPage() {
    }
    async prevPage() {
    }
}
class SingleNode extends Node {
    id;
    children;
    constructor(entity, projection, cache, parent, id) {
        super(entity, projection, cache, parent);
        this.id = id;
        this.children = {};
    }
    async refresh() {
        const { entity, projection, id } = this;
        (0, assert_1.default)(id);
        await this.cache.refresh(entity, {
            data: projection,
            filter: {
                id,
            },
        }); // 搞不懂为何这里过不去
    }
    async get() {
        const { entity, projection, id } = this;
        const row = id && this.cache.get(entity, {
            data: projection,
            filter: {
                id,
            },
        });
    }
}
