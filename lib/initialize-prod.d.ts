import { Aspect, AspectWrapper, Checker, StorageSchema, Context, RowStore, Connector } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { Feature } from './types/Feature';
import { BasicFeatures } from './features';
import { ActionDictOfEntityDict } from 'oak-domain/lib/types/Action';
import { CommonAspectDict } from 'oak-common-aspect';
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
export declare function initialize<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>>(storageSchema: StorageSchema<ED>, createFeatures: (aspectWrapper: AspectWrapper<ED, Cxt, AD>, basicFeatures: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>) => FD, frontendContextBuilder: (features: FD & BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>) => (store: RowStore<ED, Cxt>) => Cxt, connector: Connector<ED, Cxt>, checkers?: Array<Checker<ED, keyof ED, Cxt>>, actionDict?: ActionDictOfEntityDict<ED>): {
    features: {
        cache: import(".").Cache<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>;
        location: import("./features/location").Location<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>;
        runningTree: import("./features/runningTree").RunningTree<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>;
        locales: import("./features/locales").Locales<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>;
        eventBus: import("./features/eventBus").EventBus<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>;
        localStorage: import(".").LocalStorage<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>;
        notification: import("./features/notification").Notification<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>;
        message: import("./features/message").Message<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>;
    } & FD;
};
