import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { Checker, CheckerType, StorageSchema } from 'oak-domain/lib/types';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
export default class SyncTriggerExecutor<ED extends EntityDict & BaseEntityDict, Cxt extends SyncContext<ED>> {
    static All_Checker_Types: CheckerType[];
    private checkerMap;
    private addToCheckerMap;
    registerChecker<T extends keyof ED>(checker: Checker<ED, T, Cxt>, schema: StorageSchema<ED>): void;
    check<T extends keyof ED>(entity: T, operation: {
        action: ED[T]['Action'];
        data?: ED[T]['Operation']['data'];
        filter?: ED[T]['Operation']['filter'];
    }, context: Cxt, when?: 'before' | 'after', checkerTypes?: CheckerType[]): void;
}
