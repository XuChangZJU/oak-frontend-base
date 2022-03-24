"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheStore = void 0;
const oak_memory_tree_store_1 = require("oak-memory-tree-store");
class CacheStore extends oak_memory_tree_store_1.TreeStore {
    constructor(storageSchema) {
        super(storageSchema);
    }
}
exports.CacheStore = CacheStore;
