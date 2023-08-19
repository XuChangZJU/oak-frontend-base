import { Aspect, Checker, StorageSchema, Connector } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { CommonAspectDict } from 'oak-common-aspect';
import { CacheStore } from './cacheStore/CacheStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
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
export declare function initialize<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends Record<string, Aspect<ED, Cxt>>>(storageSchema: StorageSchema<ED>, frontendContextBuilder: () => (store: CacheStore<ED, FrontCxt>) => FrontCxt, connector: Connector<ED, Cxt, FrontCxt>, checkers: Array<Checker<ED, keyof ED, FrontCxt | Cxt>>, option: InitializeOptions<ED>): {
    features: {
        location: import("./features/location").Location;
        environment: import("./features/environment").Environment;
        eventBus: import("./features/eventBus").EventBus;
        notification: import("./features/notification").Notification;
        message: import("./features/message").Message;
        localStorage: import(".").LocalStorage;
        navigator: import("./features/navigator.web").Navigator;
    } & {
        cache: import(".").Cache<ED, Cxt, FrontCxt, CommonAspectDict<ED, Cxt> & AD>;
        relationAuth: import("./features/relationAuth").RelationAuth<ED, Cxt, FrontCxt, CommonAspectDict<ED, Cxt> & AD>;
        runningTree: import("./features/runningTree").RunningTree<ED, Cxt, FrontCxt, CommonAspectDict<ED, Cxt> & AD>;
        locales: import("./features/locales").Locales<ED, Cxt, FrontCxt, CommonAspectDict<ED, Cxt> & AD>;
        port: import("./features/port").Port<ED, Cxt, CommonAspectDict<ED, Cxt> & AD>;
        style: import("./features/style").Style<ED>;
        geo: import("./features/geo").Geo<ED, Cxt, CommonAspectDict<ED, Cxt> & AD>;
        contextMenuFactory: import("./features/contextMenuFactory").ContextMenuFactory<ED, Cxt, FrontCxt, CommonAspectDict<ED, Cxt> & AD>;
    };
};
