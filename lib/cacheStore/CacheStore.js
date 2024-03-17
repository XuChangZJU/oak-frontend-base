"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheStore = void 0;
const tslib_1 = require("tslib");
const oak_memory_tree_store_1 = require("oak-memory-tree-store");
const assert_1 = require("oak-domain/lib/utils/assert");
const SyncTriggerExecutor_1 = tslib_1.__importDefault(require("./SyncTriggerExecutor"));
;
class CacheStore extends oak_memory_tree_store_1.TreeStore {
    triggerExecutor;
    constructor(storageSchema) {
        super(storageSchema);
        this.triggerExecutor = new SyncTriggerExecutor_1.default();
    }
    aggregate(entity, aggregation, context, option) {
        return this.aggregateSync(entity, aggregation, context, option);
    }
    cascadeUpdate(entity, operation, context, option) {
        (0, assert_1.assert)(context.getCurrentTxnId());
        if (!option.blockTrigger) {
            this.triggerExecutor.check(entity, operation, context, 'before', option.checkerTypes);
        }
        if (operation.data) {
            // 有时前台需要测试某个action行为，data会传undefined
            const result = super.cascadeUpdate(entity, operation, context, option);
            if (!option.blockTrigger) {
                this.triggerExecutor.check(entity, operation, context, 'after', option.checkerTypes);
            }
            return result;
        }
        return {};
    }
    operate(entity, operation, context, option) {
        (0, assert_1.assert)(context.getCurrentTxnId());
        const result = super.operateSync(entity, operation, context, option);
        return result;
    }
    sync(opRecords, context) {
        const autoCommit = !context.getCurrentTxnId();
        if (autoCommit) {
            context.begin();
        }
        let result;
        try {
            result = super.sync(opRecords, context, {});
        }
        catch (err) {
            if (autoCommit) {
                context.rollback();
            }
            throw err;
        }
        if (autoCommit) {
            context.commit();
        }
        return result;
    }
    check(entity, operation, context, checkerTypes) {
        (0, assert_1.assert)(context.getCurrentTxnId());
        // check不再支持CascadeOperation了，不然处理不了data为undefined，通过filter来check create
        this.triggerExecutor.check(entity, operation, context, undefined, checkerTypes);
    }
    select(entity, selection, context, option) {
        const autoCommit = !context.getCurrentTxnId();
        if (autoCommit) {
            context.begin();
        }
        let result;
        try {
            result = super.selectSync(entity, selection, context, option);
        }
        catch (err) {
            if (autoCommit) {
                context.rollback();
            }
            throw err;
        }
        if (autoCommit) {
            context.commit();
        }
        return result;
    }
    registerChecker(checker) {
        this.triggerExecutor.registerChecker(checker, this.getSchema());
    }
    /* registerTrigger<T extends keyof ED>(trigger: Trigger<ED, T, Cxt>) {
        this.triggerExecutor.registerTrigger(trigger);
    } */
    count(entity, selection, context, option) {
        const autoCommit = !context.getCurrentTxnId();
        if (autoCommit) {
            context.begin();
        }
        let result;
        try {
            result = super.countSync(entity, selection, context, option);
        }
        catch (err) {
            if (autoCommit) {
                context.rollback();
            }
            throw err;
        }
        if (autoCommit) {
            context.commit();
        }
        return result;
    }
    begin(option) {
        return super.beginSync();
    }
    commit(txnId) {
        return super.commitSync(txnId);
    }
    rollback(txnId) {
        return super.rollbackSync(txnId);
    }
}
exports.CacheStore = CacheStore;
