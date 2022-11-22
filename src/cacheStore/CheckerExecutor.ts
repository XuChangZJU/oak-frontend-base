// 简化版的对checker的同步检查
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { Checker, CheckerType } from 'oak-domain/lib/types';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { translateCheckerInSyncContext } from 'oak-domain/lib/store/checker';

export default class CheckerExecutor<ED extends EntityDict & BaseEntityDict,Cxt extends SyncContext<ED>> {
    private checkerMap: {
        [K in keyof ED]?: {
            [A: string]: Array<{
                priority: number;
                fn: (operation: ED[K]['Operation'], context: Cxt) => void;
                type: CheckerType;
            }>;
        };
    } = {};
    registerChecker<T extends keyof ED>(checker: Checker<ED, T, Cxt>) {
        const { entity, action, priority = 1, type } = checker;
        const fn = translateCheckerInSyncContext(checker);
        const addCheckerMap = (action2: string) => {
            if (this.checkerMap[entity] && this.checkerMap[entity]![action2]) {
                let iter = 0;
                const checkers = this.checkerMap[entity]![action2]!;
                for (; iter < checkers.length; iter ++) {
                    if (priority >= checkers[iter].priority) {
                        break;
                    }
                }
                checkers.splice(iter, 0, {
                    type,
                    priority,
                    fn,
                });
            }
            else if (this.checkerMap[entity]) {
                Object.assign(this.checkerMap[entity]!, {
                    [action2]: [{
                        type,
                        priority,
                        fn,
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

    check<T extends keyof ED>(entity: T, operation: ED[T]['Operation'], context: Cxt, checkerTypes?: CheckerType[]) {
        const { action } = operation;
        const checkers = this.checkerMap[entity] && this.checkerMap[entity]![action];
        if (checkers) {
            const checkers2 = checkerTypes ? checkers.filter(ele => checkerTypes.includes(ele.type)) : checkers;
            for (const checker of checkers2) {
                checker.fn(operation, context);
            }
        }
    }
}