"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugStore = void 0;
const oak_memory_tree_store_1 = require("oak-memory-tree-store");
const TriggerExecutor_1 = require("oak-domain/lib/store/TriggerExecutor");
class DebugStore extends oak_memory_tree_store_1.TreeStore {
    executor;
    constructor(storageSchema, contextBuilder, initialData, initialStat) {
        super(storageSchema, initialData, initialStat);
        this.executor = new TriggerExecutor_1.TriggerExecutor(() => contextBuilder(this));
    }
    async cascadeUpdate(entity, operation, context, params) {
        await this.executor.preOperation(entity, operation, context);
        const result = super.cascadeUpdate(entity, operation, context, params);
        await this.executor.postOperation(entity, operation, context);
        return result;
    }
    async cascadeSelect(entity, selection, context, params) {
        const selection2 = Object.assign({
            action: 'select',
        }, selection);
        await this.executor.preOperation(entity, selection2, context);
        const result = await super.cascadeSelect(entity, selection, context, params);
        await this.executor.postOperation(entity, selection2, context);
        return result;
    }
    async operate(entity, operation, context, params) {
        const autoCommit = !context.getCurrentTxnId();
        let result;
        if (autoCommit) {
            await context.begin();
        }
        try {
            result = await super.operate(entity, operation, context, params);
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
    registerTrigger(trigger) {
        this.executor.registerTrigger(trigger);
    }
    registerChecker(checker) {
        this.executor.registerChecker(checker);
    }
}
exports.DebugStore = DebugStore;
