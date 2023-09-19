"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 简化版的对checker的同步检查
const assert_1 = require("oak-domain/lib/utils/assert");
const types_1 = require("oak-domain/lib/types");
const checker_1 = require("oak-domain/lib/store/checker");
const filter_1 = require("oak-domain/lib/store/filter");
class SyncTriggerExecutor {
    static All_Checker_Types = ['data', 'logical', 'logicalRelation', 'relation', 'row'];
    checkerMap = {};
    addToCheckerMap(action, entity, priority, when, fn, type, filter) {
        if (this.checkerMap[entity] && this.checkerMap[entity][action]) {
            let iter = 0;
            const checkers = this.checkerMap[entity][action];
            for (; iter < checkers.length; iter++) {
                if (priority <= checkers[iter].priority) {
                    break;
                }
            }
            checkers.splice(iter, 0, {
                type,
                priority: priority,
                fn,
                when,
                filter,
            });
        }
        else if (this.checkerMap[entity]) {
            Object.assign(this.checkerMap[entity], {
                [action]: [{
                        type,
                        priority,
                        fn,
                        when,
                        filter,
                    }],
            });
        }
        else {
            Object.assign(this.checkerMap, {
                [entity]: {
                    [action]: [{
                            type,
                            priority,
                            fn,
                            when,
                            filter,
                        }],
                },
            });
        }
    }
    registerChecker(checker) {
        let { entity, action, priority, type, conditionalFilter } = checker;
        const { fn, when } = (0, checker_1.translateCheckerInSyncContext)(checker);
        if (action instanceof Array) {
            action.forEach(a => this.addToCheckerMap(a, entity, priority || types_1.CHECKER_PRIORITY_MAP[type], when, fn, type, conditionalFilter));
        }
        else {
            this.addToCheckerMap(action, entity, priority, when, fn, type, conditionalFilter);
        }
    }
    /* registerTrigger<T extends keyof ED>(trigger: Trigger<ED, T, Cxt>) {
        const {
            action,
            entity,
            priority,
            fn,
            when,
            filter,
        } = trigger as UpdateTrigger<ED, T, Cxt>;

        if (when === 'commit') {
            return;
        }
        if (action instanceof Array) {
            action.forEach(
                (a) => this.addToCheckerMap(a, entity, priority || TRIGGER_DEFAULT_PRIORITY, when, fn as any, undefined, filter)
            );
        }
        else {
            this.addToCheckerMap(action ,entity, priority || TRIGGER_DEFAULT_PRIORITY, when, fn as any, undefined, filter);
        }
    } */
    check(entity, operation, context, when, checkerTypes) {
        const { action } = operation;
        const checkers = this.checkerMap[entity] && this.checkerMap[entity][action];
        if (checkers) {
            const checkers2 = checkers.filter(ele => (!checkerTypes || checkerTypes.includes(ele.type)) && (!when || ele.when === when));
            for (const checker of checkers2) {
                const { filter } = checker;
                if (filter) {
                    const filterr = typeof filter === 'function' ? filter(operation, context, {}) : filter;
                    (0, assert_1.assert)(!(filter instanceof Promise), `对${entity}的动作${action}上定义的checker，其filter返回了Promise，请注意将同步和异步的返回区分对待`);
                    const isRepel = (0, filter_1.checkFilterRepel)(entity, context, filterr, operation.filter, true);
                    (0, assert_1.assert)(typeof isRepel === 'boolean');
                    if (isRepel) {
                        continue;
                    }
                }
                checker.fn(operation, context, {});
            }
        }
    }
}
exports.default = SyncTriggerExecutor;
