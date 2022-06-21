import { Aspect, AspectWrapper, Checker, Trigger, StorageSchema, Context, RowStore, Watcher } from "oak-domain/lib/types";
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { Feature, subscribe } from './types/Feature';
import { BasicFeatures } from './features';
import { ActionDictOfEntityDict } from "oak-domain/lib/types/Action";
import { AspectDict } from "oak-common-aspect/src/aspectDict";
/**
 * dev模式下，前后端可以使用同一个Cxt，内部自己区分
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
export declare function initialize<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & AspectDict<ED, Cxt>>>>(storageSchema: StorageSchema<ED>, createFeatures: (aspectWrapper: AspectWrapper<ED, Cxt, AD>, basicFeatures: BasicFeatures<ED, Cxt, AD & AspectDict<ED, Cxt>>, context: Cxt) => FD, contextBuilder: (cxtString?: string) => (store: RowStore<ED, Cxt>) => Cxt, contextCreator: (store: RowStore<ED, Cxt>) => Cxt, aspectDict: AD, triggers?: Array<Trigger<ED, keyof ED, Cxt>>, checkers?: Array<Checker<ED, keyof ED, Cxt>>, watchers?: Array<Watcher<ED, keyof ED, Cxt>>, initialData?: {
    [T in keyof ED]?: Array<ED[T]['OpSchema']>;
}, actionDict?: ActionDictOfEntityDict<ED>): {
    subscribe: typeof subscribe;
    features: BasicFeatures<ED, Cxt, {
        operate: typeof import("oak-common-aspect/src/crud").operate;
        select: typeof import("oak-common-aspect/src/crud").select;
        amap: typeof import("oak-common-aspect/src/amap").amap;
        getTranslations: typeof import("oak-common-aspect/src/locales").getTranslations;
    } & AD> & FD;
};
