"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugStore = void 0;
const oak_memory_tree_store_1 = require("oak-memory-tree-store");
const TriggerExecutor_1 = require("oak-domain/lib/store/TriggerExecutor");
const RelationAuth_1 = require("oak-domain/lib/store/RelationAuth");
;
;
class DebugStore extends oak_memory_tree_store_1.TreeStore {
    executor;
    relationAuth;
    constructor(storageSchema, contextBuilder, authDeduceRelationMap, selectFreeEntities, updateFreeDict) {
        super(storageSchema);
        this.executor = new TriggerExecutor_1.TriggerExecutor((cxtString) => contextBuilder(cxtString)(this));
        this.relationAuth = new RelationAuth_1.RelationAuth(storageSchema, authDeduceRelationMap, selectFreeEntities, updateFreeDict);
    }
    async exec(script, txnId) {
        throw new Error('debugStore dont support exec script directly');
    }
    aggregate(entity, aggregation, context, option) {
        return this.aggregateAsync(entity, aggregation, context, option);
    }
    begin(option) {
        return super.beginAsync();
    }
    commit(txnId) {
        return super.commitAsync(txnId);
    }
    rollback(txnId) {
        return super.rollbackAsync(txnId);
    }
    async cascadeUpdateAsync(entity, operation, context, option) {
        // 如果是在modi处理过程中，所有的trigger也可以延时到apply时再处理（这时候因为modi中的数据并不实际存在，处理会有问题）
        if (!option.blockTrigger && !option.modiParentEntity) {
            await this.executor.preOperation(entity, operation, context, option);
        }
        const result = await super.cascadeUpdateAsync(entity, operation, context, option);
        if (!option.blockTrigger && !option.modiParentEntity) {
            await this.executor.postOperation(entity, operation, context, option);
        }
        return result;
    }
    async operate(entity, operation, context, option) {
        const autoCommit = !context.getCurrentTxnId();
        let result;
        if (autoCommit) {
            await context.begin();
        }
        /**
         * 这里似乎还有点问题，如果在后续的checker里增加了cascadeUpdate，是无法在一开始检查权限的
         * 后台的DbStore也一样          by Xc 20230801
         */ if (autoCommit) {
            await context.begin();
        }
        try {
            await this.relationAuth.checkRelationAsync(entity, operation, context);
            result = await super.operateAsync(entity, operation, context, option);
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
    async select(entity, selection, context, option) {
        const autoCommit = !context.getCurrentTxnId();
        if (autoCommit) {
            await context.begin();
        }
        Object.assign(selection, {
            action: 'select',
        });
        // select的trigger应加在根结点的动作之前
        try {
            if (!option.blockTrigger) {
                await this.executor.preOperation(entity, selection, context, option);
            }
            if (!option.dontCollect) {
                await this.relationAuth.checkRelationAsync(entity, selection, context);
            }
            const result = await super.selectAsync(entity, selection, context, option);
            if (!option.blockTrigger) {
                await this.executor.postOperation(entity, selection, context, option, result);
            }
            if (autoCommit) {
                await context.commit();
            }
            return result;
        }
        catch (err) {
            if (autoCommit) {
                await context.rollback();
            }
            throw err;
        }
    }
    async count(entity, selection, context, option) {
        return super.countAsync(entity, selection, context, option);
    }
    registerTrigger(trigger) {
        this.executor.registerTrigger(trigger);
    }
    registerChecker(checker) {
        this.executor.registerChecker(checker);
    }
}
exports.DebugStore = DebugStore;
