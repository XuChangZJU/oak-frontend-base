import { Aspect, Checker, Trigger, StorageSchema, Watcher, Routine, Timer, AuthDefDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { Exportation, Importation } from 'oak-domain/lib/types/Port';
import { BasicFeatures } from './features';
import { ActionDictOfEntityDict } from 'oak-domain/lib/types/Action';
import { CommonAspectDict } from 'oak-common-aspect';
import { CacheStore } from './cacheStore/CacheStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { DebugStore } from './debugStore/DebugStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
/**
 * @param storageSchema
 * @param createFeatures
 * @param contextBuilder
 * @param context
 * @param triggers
 * @param checkers
 * @param watchers
 * @param aspectDict
 * @param initialData
 * @param actionDict
 * @returns
 */
export declare function initialize<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends Record<string, Aspect<ED, Cxt>>>(storageSchema: StorageSchema<ED>, frontendContextBuilder: () => (store: CacheStore<ED, FrontCxt>) => FrontCxt, backendContextBuilder: (contextStr?: string) => (store: DebugStore<ED, Cxt>) => Promise<Cxt>, aspectDict: AD, triggers?: Array<Trigger<ED, keyof ED, Cxt>>, checkers?: Array<Checker<ED, keyof ED, FrontCxt | Cxt>>, watchers?: Array<Watcher<ED, keyof ED, Cxt>>, timers?: Array<Timer<ED, Cxt>>, startRoutines?: Array<Routine<ED, Cxt>>, initialData?: {
    [T in keyof ED]?: Array<ED[T]['OpSchema']>;
}, actionDict?: ActionDictOfEntityDict<ED>, authDict?: AuthDefDict<ED>, importations?: Importation<ED, keyof ED, any>[], exportations?: Exportation<ED, keyof ED, any>[]): {
    features: BasicFeatures<ED, Cxt, FrontCxt, CommonAspectDict<ED, Cxt> & AD>;
};
