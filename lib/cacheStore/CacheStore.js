"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheStore = void 0;
const TriggerExecutor_1 = require("oak-domain/lib/store/TriggerExecutor");
const oak_memory_tree_store_1 = require("oak-memory-tree-store");
class CacheStore extends oak_memory_tree_store_1.TreeStore {
    executor;
    constructor(storageSchema, contextBuilder, initialData) {
        super(storageSchema, initialData);
        this.executor = new TriggerExecutor_1.TriggerExecutor(contextBuilder);
    }
    async operate(entity, operation, context, params) {
        const autoCommit = !context.getCurrentTxnId();
        let result;
        if (autoCommit) {
            await context.begin();
        }
        try {
            await this.executor.preOperation(entity, operation, context);
            result = await super.operate(entity, operation, context, params);
            await this.executor.postOperation(entity, operation, context);
        }
        catch (err) {
            await context.rollback();
            throw err;
        }
        if (autoCommit) {
            await context.commit();
        }
        return result;
    }
    async select(entity, selection, context, params) {
        const autoCommit = !context.getCurrentTxnId();
        if (autoCommit) {
            await context.begin();
        }
        let result;
        try {
            result = await super.select(entity, selection, context, params);
        }
        catch (err) {
            await context.rollback();
            throw err;
        }
        if (autoCommit) {
            await context.commit();
        }
        return result;
    }
    registerChecker(checker) {
        this.executor.registerChecker(checker);
    }
}
exports.CacheStore = CacheStore;
