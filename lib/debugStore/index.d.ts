import { DebugStore } from './DebugStore';
import { Checker, Trigger, StorageSchema, EntityDict, ActionDictOfEntityDict, Watcher, Routine, Timer, AuthDeduceRelationMap } from "oak-domain/lib/types";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { LocalStorage } from '../features/localStorage';
export declare function createDebugStore<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>>(storageSchema: StorageSchema<ED>, contextBuilder: (cxtString?: string) => (store: DebugStore<ED, Cxt>) => Promise<Cxt>, triggers: Array<Trigger<ED, keyof ED, Cxt>>, checkers: Array<Checker<ED, keyof ED, Cxt>>, watchers: Array<Watcher<ED, keyof ED, Cxt>>, timers: Array<Timer<ED, keyof ED, Cxt>>, startRoutines: Array<Routine<ED, keyof ED, Cxt>>, initialData: {
    [T in keyof ED]?: Array<ED[T]['OpSchema']>;
}, actionDict: ActionDictOfEntityDict<ED>, authDeduceRelationMap: AuthDeduceRelationMap<ED>, localStorage: LocalStorage, selectFreeEntities?: (keyof ED)[], updateFreeDict?: {
    [A in keyof ED]?: string[];
}): DebugStore<ED, Cxt>;
