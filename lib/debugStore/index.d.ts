import { DebugStore } from './debugStore';
import { Checker, Trigger, StorageSchema, Context, EntityDict, RowStore, ActionDictOfEntityDict, Watcher } from "oak-domain/lib/types";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
export declare function clearMaterializedData(): void;
export declare function createDebugStore<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>>(storageSchema: StorageSchema<ED>, contextBuilder: (cxtString?: string) => (store: RowStore<ED, Cxt>) => Cxt, triggers: Array<Trigger<ED, keyof ED, Cxt>>, checkers: Array<Checker<ED, keyof ED, Cxt>>, watchers: Array<Watcher<ED, keyof ED, Cxt>>, initialData?: {
    [T in keyof ED]?: Array<ED[T]['OpSchema']>;
}, actionDict?: ActionDictOfEntityDict<ED>): DebugStore<ED, Cxt>;
