"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugStore = void 0;
const oak_memory_tree_store_1 = require("oak-memory-tree-store");
class DebugStore extends oak_memory_tree_store_1.TreeStore {
    executor;
    constructor(executor, storageSchema, initialData) {
        super(storageSchema, true, initialData);
        this.executor = executor;
    }
    async operate(entity, operation, context, params) {
        const autoCommit = !context.txn;
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
        const autoCommit = !context.txn;
        if (autoCommit) {
            await context.begin();
        }
        let result;
        const selection2 = Object.assign({
            action: 'select',
        }, selection);
        try {
            await this.executor.preOperation(entity, selection2, context);
            result = await super.select(entity, selection, context, params);
            await this.executor.postOperation(entity, selection2, context);
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
    async count(entity, selection, context, params) {
        throw new Error("Method not implemented.");
    }
    registerTrigger(trigger) {
        this.executor.registerTrigger(trigger);
    }
}
exports.DebugStore = DebugStore;
