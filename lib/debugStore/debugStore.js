"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugStore = void 0;
const oak_memory_tree_store_1 = require("oak-memory-tree-store");
const TriggerExecutor_1 = require("oak-domain/lib/store/TriggerExecutor");
const concurrent_1 = require("oak-domain/lib/utils/concurrent");
;
class DebugStore extends oak_memory_tree_store_1.TreeStore {
    executor;
    rwLock;
    constructor(storageSchema, contextBuilder, initialData, initialStat) {
        super(storageSchema, initialData, initialStat);
        this.executor = new TriggerExecutor_1.TriggerExecutor((scene) => contextBuilder(this, scene));
        this.rwLock = new concurrent_1.RWLock();
    }
    async cascadeUpdate(entity, operation, context, params) {
        await this.executor.preOperation(entity, operation, context, params);
        const result = super.cascadeUpdate(entity, operation, context, params);
        await this.executor.postOperation(entity, operation, context, params);
        return result;
    }
    async cascadeSelect(entity, selection, context, params) {
        const selection2 = Object.assign({
            action: 'select',
        }, selection);
        await this.executor.preOperation(entity, selection2, context, params);
        const result = await super.cascadeSelect(entity, selection2, context, params);
        await this.executor.postOperation(entity, selection2, context, params, result);
        return result;
    }
    async operate(entity, operation, context, params) {
        if (!params || !params.noLock) {
            await this.rwLock.acquire('S');
        }
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
        if (!params || !params.noLock) {
            this.rwLock.release();
        }
        return result;
    }
    async select(entity, selection, context, params) {
        if (!params || !params.noLock) {
            await this.rwLock.acquire('S');
        }
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
        if (!params || !params.noLock) {
            this.rwLock.release();
        }
        return result;
    }
    registerTrigger(trigger) {
        this.executor.registerTrigger(trigger);
    }
    registerChecker(checker) {
        this.executor.registerChecker(checker);
    }
    startInitializing() {
        this.rwLock.acquire('X');
    }
    endInitalizing() {
        this.rwLock.release();
    }
}
exports.DebugStore = DebugStore;
