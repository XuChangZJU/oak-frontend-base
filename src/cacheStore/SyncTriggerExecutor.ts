// 简化版的对checker的同步检查
import { assert } from 'oak-domain/lib/utils/assert';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { Checker, CheckerType, SelectOption, OperateOption, CHECKER_PRIORITY_MAP, 
    Trigger, RemoveTrigger, UpdateTrigger, TRIGGER_DEFAULT_PRIORITY } from 'oak-domain/lib/types';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { translateCheckerInSyncContext } from 'oak-domain/lib/store/checker';
import { checkFilterRepel } from 'oak-domain/lib/store/filter';

export default class SyncTriggerExecutor<ED extends EntityDict & BaseEntityDict, Cxt extends SyncContext<ED>> {
    static All_Checker_Types: CheckerType[] = ['data', 'logical', 'logicalRelation', 'relation', 'row'];
    private checkerMap: {
        [K in keyof ED]?: {
            [A: string]: Array<{
                priority: number;
                fn: (operation: ED[K]['Operation'], context: SyncContext<ED>, option: SelectOption | OperateOption) => void;
                type: CheckerType;
                when: 'before' | 'after';
                filter?: ED[K]['Update']['filter'] | ((operation: ED[K]['Operation'], context: SyncContext<ED>, option: SelectOption | OperateOption) => ED[K]['Update']['filter']);
            }>;
        };
    } = {};

    private addToCheckerMap<T extends keyof ED>(action: string, entity: T, priority: number, when: 'before' | 'after',
        fn: (operation: ED[T]['Operation'], context: SyncContext<ED>, option: SelectOption | OperateOption) => void,
        type: CheckerType, 
        filter?: ED[T]['Update']['filter'] | ((operation: ED[T]['Operation'], context: SyncContext<ED>, option: SelectOption | OperateOption) => ED[T]['Update']['filter'])) {
        if (this.checkerMap[entity] && this.checkerMap[entity]![action]) {
            let iter = 0;
            const checkers = this.checkerMap[entity]![action]!;
            for (; iter < checkers.length; iter++) {
                if (priority <= checkers[iter].priority!) {
                    break;
                }
            }
            checkers.splice(iter, 0, {
                type,
                priority: priority!,
                fn,
                when,
                filter,
            });
        }
        else if (this.checkerMap[entity]) {
            Object.assign(this.checkerMap[entity]!, {
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


    registerChecker<T extends keyof ED>(checker: Checker<ED, T, Cxt>) {
        let { entity, action, priority, type, conditionalFilter } = checker;
        const { fn, when } = translateCheckerInSyncContext(checker);
        if (action instanceof Array) {
            action.forEach(
                a => this.addToCheckerMap(a as string, entity, priority || CHECKER_PRIORITY_MAP[type], when, fn as any, type, conditionalFilter)
            );
        }
        else {
            this.addToCheckerMap(action as string, entity, priority || CHECKER_PRIORITY_MAP[type], when, fn as any, type, conditionalFilter);
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


    check<T extends keyof ED>(entity: T, operation: Omit<ED[T]['Operation'], 'id'>, context: Cxt, when?: 'before' | 'after', checkerTypes?: CheckerType[]) {
        const { action } = operation;
        const checkers = this.checkerMap[entity] && this.checkerMap[entity]![action];
        if (checkers) {
            const checkers2 = checkers.filter(ele => (!checkerTypes || checkerTypes.includes(ele.type)) && (!when || ele.when === when));
            for (const checker of checkers2) {
                const { filter } = checker;
                if (filter) {
                    const filterr = typeof filter === 'function' ? filter(operation as ED[T]['Operation'], context, {}) : filter;
                    assert(!(filter instanceof Promise), `对${entity as string}的动作${action}上定义的checker，其filter返回了Promise，请注意将同步和异步的返回区分对待`);
                    const isRepel = checkFilterRepel<ED, T, SyncContext<ED>>(entity, context, filterr, operation.filter, true);
                    assert(typeof isRepel === 'boolean');
                    if (isRepel) {
                        continue;
                    }
                }
                checker.fn(operation as ED[T]['Operation'], context, {} as any);
            }
        }
    }
}