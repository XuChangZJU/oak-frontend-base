import { Aspect, AspectWrapper, Checker, Trigger, StorageSchema, Context, RowStore, Watcher } from 'oak-domain/lib/types';
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
export declare function initialize<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>>(storageSchema: StorageSchema<ED>, createFeatures: (aspectWrapper: AspectWrapper<ED, Cxt, AD>, basicFeatures: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>) => FD, frontendContextBuilder: (features: FD & BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>) => (store: RowStore<ED, Cxt>) => Cxt, backendContextBuilder: (contextStr?: string) => (store: RowStore<ED, Cxt>) => Promise<Cxt>, aspectDict: AD, triggers?: Array<Trigger<ED, keyof ED, Cxt>>, checkers?: Array<Checker<ED, keyof ED, Cxt>>, watchers?: Array<Watcher<ED, keyof ED, Cxt>>, initialData?: {
    [T in keyof ED]?: Array<ED[T]['OpSchema']>;
}, actionDict?: ActionDictOfEntityDict<ED>): {
    features: {
        cache: import(".").Cache<ED, Cxt, {
            operate: typeof import("oak-common-aspect/src/crud").operate;
            select: typeof import("oak-common-aspect/src/crud").select;
            fetchRows: typeof import("oak-common-aspect/src/crud").fetchRows;
            amap: typeof import("oak-common-aspect/src/amap").amap;
            getTranslations: typeof import("oak-common-aspect/src/locales").getTranslations;
        } & AD>;
        location: import("./features/location").Location<ED, Cxt, {
            operate: typeof import("oak-common-aspect/src/crud").operate;
            select: typeof import("oak-common-aspect/src/crud").select;
            fetchRows: typeof import("oak-common-aspect/src/crud").fetchRows;
            amap: typeof import("oak-common-aspect/src/amap").amap;
            getTranslations: typeof import("oak-common-aspect/src/locales").getTranslations;
        } & AD>;
        runningTree: import("./features/runningTree").RunningTree<ED, Cxt, {
            operate: typeof import("oak-common-aspect/src/crud").operate;
            select: typeof import("oak-common-aspect/src/crud").select;
            fetchRows: typeof import("oak-common-aspect/src/crud").fetchRows;
            amap: typeof import("oak-common-aspect/src/amap").amap;
            getTranslations: typeof import("oak-common-aspect/src/locales").getTranslations;
        } & AD>;
        locales: import("./features/locales").Locales<ED, Cxt, {
            operate: typeof import("oak-common-aspect/src/crud").operate;
            select: typeof import("oak-common-aspect/src/crud").select;
            fetchRows: typeof import("oak-common-aspect/src/crud").fetchRows;
            amap: typeof import("oak-common-aspect/src/amap").amap;
            getTranslations: typeof import("oak-common-aspect/src/locales").getTranslations;
        } & AD>;
        eventBus: import("./features/eventBus").EventBus<ED, Cxt, {
            operate: typeof import("oak-common-aspect/src/crud").operate;
            select: typeof import("oak-common-aspect/src/crud").select;
            fetchRows: typeof import("oak-common-aspect/src/crud").fetchRows;
            amap: typeof import("oak-common-aspect/src/amap").amap;
            getTranslations: typeof import("oak-common-aspect/src/locales").getTranslations;
        } & AD>;
        localStorage: import(".").LocalStorage<ED, Cxt, {
            operate: typeof import("oak-common-aspect/src/crud").operate;
            select: typeof import("oak-common-aspect/src/crud").select;
            fetchRows: typeof import("oak-common-aspect/src/crud").fetchRows;
            amap: typeof import("oak-common-aspect/src/amap").amap;
            getTranslations: typeof import("oak-common-aspect/src/locales").getTranslations;
        } & AD>;
        notification: import("./features/notification").Notification<ED, Cxt, {
            operate: typeof import("oak-common-aspect/src/crud").operate;
            select: typeof import("oak-common-aspect/src/crud").select;
            fetchRows: typeof import("oak-common-aspect/src/crud").fetchRows;
            amap: typeof import("oak-common-aspect/src/amap").amap;
            getTranslations: typeof import("oak-common-aspect/src/locales").getTranslations;
        } & AD>;
        message: import("./features/message").Message<ED, Cxt, {
            operate: typeof import("oak-common-aspect/src/crud").operate;
            select: typeof import("oak-common-aspect/src/crud").select;
            fetchRows: typeof import("oak-common-aspect/src/crud").fetchRows;
            amap: typeof import("oak-common-aspect/src/amap").amap;
            getTranslations: typeof import("oak-common-aspect/src/locales").getTranslations;
        } & AD>;
    } & FD;
};
