import { Aspect, Checker, Trigger, StorageSchema, Watcher, Routine, Timer } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { CommonAspectDict } from 'oak-common-aspect';
import { CacheStore } from './cacheStore/CacheStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { DebugStore } from './debugStore/DebugStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { InitializeOptions } from './types/Initialize';
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
export declare function initialize<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends Record<string, Aspect<ED, Cxt>>>(storageSchema: StorageSchema<ED>, frontendContextBuilder: () => (store: CacheStore<ED, FrontCxt>) => FrontCxt, backendContextBuilder: (contextStr?: string) => (store: DebugStore<ED, Cxt>) => Promise<Cxt>, aspectDict: AD, triggers: Array<Trigger<ED, keyof ED, Cxt>>, checkers: Array<Checker<ED, keyof ED, FrontCxt | Cxt>>, watchers: Array<Watcher<ED, keyof ED, Cxt>>, timers: Array<Timer<ED, keyof ED, Cxt>>, startRoutines: Array<Routine<ED, keyof ED, Cxt>>, initialData: {
    [T in keyof ED]?: Array<ED[T]['OpSchema']>;
}, option: InitializeOptions<ED, Cxt>): {
    features: {
        cache: import("./features/cache").Cache<ED, Cxt, FrontCxt, CommonAspectDict<ED, Cxt> & AD>;
        relationAuth: import("./features/relationAuth").RelationAuth<ED, Cxt, FrontCxt, CommonAspectDict<ED, Cxt> & AD>;
        runningTree: import("./features/runningTree").RunningTree<ED, Cxt, FrontCxt, CommonAspectDict<ED, Cxt> & AD>;
        locales: import("./features/locales").Locales<ED, Cxt, FrontCxt, CommonAspectDict<ED, Cxt> & AD>;
        port: import("./features/port").Port<ED, Cxt, CommonAspectDict<ED, Cxt> & AD>;
        style: import("./features/style").Style<ED>;
        geo: import("./features/geo").Geo<ED, Cxt, CommonAspectDict<ED, Cxt> & AD>;
        contextMenuFactory: import("./features/contextMenuFactory").ContextMenuFactory<ED, Cxt, FrontCxt, CommonAspectDict<ED, Cxt> & AD>;
        subscriber: import("./features/subscriber").SubScriber<ED, Cxt, FrontCxt, CommonAspectDict<ED, Cxt> & AD>;
    } & {
        location: import("./features/location").Location;
        environment: import("./features/environment").Environment;
        eventBus: import("./features/eventBus").EventBus;
        notification: import("./features/notification").Notification;
        message: import("./features/message").Message;
        localStorage: import("./features/localStorage").LocalStorage;
        navigator: import("./features/navigator.web").Navigator;
    };
};
