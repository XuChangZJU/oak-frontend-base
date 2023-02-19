// 简化版的对checker的同步检查
import assert from 'assert';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { Checker, CheckerType, SelectOption, OperateOption, DATA_CHECKER_DEFAULT_PRIORITY, CHECKER_DEFAULT_PRIORITY } from 'oak-domain/lib/types';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { translateCheckerInSyncContext } from 'oak-domain/lib/store/checker';
import { checkFilterRepel } from 'oak-domain/lib/store/filter';

export default class CheckerExecutor<ED extends EntityDict & BaseEntityDict,Cxt extends SyncContext<ED>> {
    private checkerMap: {
        [K in keyof ED]?: {
            [A: string]: Array<{
                priority: number;
                fn: (operation: Omit<ED[K]['Operation'], 'id'>, context: Cxt, option: SelectOption | OperateOption) => void;
                type: CheckerType;
                when: 'before' | 'after';
                filter?: ED[K]['Update']['filter'] | ((operation: Omit<ED[K]['Operation'], 'id'>, context: Cxt, option: SelectOption | OperateOption) => ED[K]['Update']['filter']);
            }>;
        };
    } = {};
    registerChecker<T extends keyof ED>(checker: Checker<ED, T, Cxt>) {
        let { entity, action, priority, type, conditionalFilter } = checker;
        const { fn, when } = translateCheckerInSyncContext(checker);
        if (priority === undefined) {
            priority = type === 'data' ? DATA_CHECKER_DEFAULT_PRIORITY : CHECKER_DEFAULT_PRIORITY;
        }
        const addCheckerMap = (action2: string) => {
            if (this.checkerMap[entity] && this.checkerMap[entity]![action2]) {
                let iter = 0;
                const checkers = this.checkerMap[entity]![action2]!;
                for (; iter < checkers.length; iter ++) {
                    if (priority! <= checkers[iter].priority!) {
                        break;
                    }
                }
                checkers.splice(iter, 0, {
                    type,
                    priority: priority!,
                    fn: fn as (operation: Omit<ED[T]['Operation'], 'id'>, context: Cxt, option: OperateOption | SelectOption) => void,
                    when,
                    filter: conditionalFilter,
                });
            }
            else if (this.checkerMap[entity]) {
                Object.assign(this.checkerMap[entity]!, {
                    [action2]: [{
                        type,
                        priority,
                        fn,
                        when,
                        filter: conditionalFilter,
                    }],
                });
            }
            else {
                Object.assign(this.checkerMap, {
                    [entity]: {
                        [action2]: [{
                            type,
                            priority,
                            fn,
                            when,
                            filter: conditionalFilter,
                        }],
                    },
                });
            }
        };
        if (action instanceof Array) {
            action.forEach(
                a => addCheckerMap(a as string)
            );
        }
        else {
            addCheckerMap(action as string);
        }
    }

    check<T extends keyof ED>(entity: T, operation: Omit<ED[T]['Operation'], 'id'>, context: Cxt, when?: 'before' | 'after', checkerTypes?: CheckerType[]) {
        const { action } = operation;
        const checkers = this.checkerMap[entity] && this.checkerMap[entity]![action];
        if (checkers) {
            const checkers2 = checkers.filter(ele => (!checkerTypes || checkerTypes.includes(ele.type)) && (!when || ele.when === when));
            for (const checker of checkers2) {
                const { filter } = checker;
                if (filter) {
                    const filterr = typeof filter === 'function' ? filter(operation, context, {}) : filter;
                    assert(!(filter instanceof Promise), `对${entity as string}的动作${action}上定义的checker，其filter返回了Promise，请注意将同步和异步的返回区分对待`);
                    const isRepel = checkFilterRepel<ED, T, Cxt>(entity, context, filterr, operation.filter, true);
                    assert(typeof isRepel === 'boolean');
                    if (isRepel) {
                        continue;
                    }
                }
                checker.fn(operation, context, {} as any);
            }
        }
    }
}