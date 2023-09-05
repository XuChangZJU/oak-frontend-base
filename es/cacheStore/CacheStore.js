import { readOnlyActions } from 'oak-domain/lib/actions/action';
import { TreeStore } from 'oak-memory-tree-store';
import { assert } from 'oak-domain/lib/utils/assert';
import SyncTriggerExecutor from './SyncTriggerExecutor';
;
export class CacheStore extends TreeStore {
    triggerExecutor;
    constructor(storageSchema) {
        super(storageSchema);
        this.triggerExecutor = new SyncTriggerExecutor();
    }
    aggregate(entity, aggregation, context, option) {
        return this.aggregateSync(entity, aggregation, context, option);
    }
    cascadeUpdate(entity, operation, context, option) {
        assert(context.getCurrentTxnId());
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
        assert(context.getCurrentTxnId());
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
        assert(context.getCurrentTxnId());
        const { action } = operation;
        if (readOnlyActions.includes(action)) {
            // 只读查询的checker只能在根部入口执行
            this.triggerExecutor.check(entity, operation, context, undefined, checkerTypes);
            return;
        }
        this.operate(entity, operation, context, {
            checkerTypes,
        });
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
        this.triggerExecutor.registerChecker(checker);
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
