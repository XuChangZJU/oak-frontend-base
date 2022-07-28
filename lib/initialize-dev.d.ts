import { Aspect, AspectWrapper, Checker, Trigger, StorageSchema, Context, RowStore, Watcher } from 'oak-domain/lib/types';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { Feature } from './types/Feature';
import { BasicFeatures } from './features';
import { ActionDictOfEntityDict } from 'oak-domain/lib/types/Action';
import { CommonAspectDict } from 'oak-common-aspect';
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
export declare function initialize<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>>(storageSchema: StorageSchema<ED>, createFeatures: (aspectWrapper: AspectWrapper<ED, Cxt, AD>, basicFeatures: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>, context: Cxt) => FD, contextBuilder: (cxtString?: string) => (store: RowStore<ED, Cxt>) => Cxt, aspectDict: AD, triggers?: Array<Trigger<ED, keyof ED, Cxt>>, checkers?: Array<Checker<ED, keyof ED, Cxt>>, watchers?: Array<Watcher<ED, keyof ED, Cxt>>, initialData?: {
    [T in keyof ED]?: Array<ED[T]['OpSchema']>;
}, actionDict?: ActionDictOfEntityDict<ED>): {
    features: BasicFeatures<ED, Cxt, {
        operate: typeof import("oak-common-aspect/lib/crud").operate;
        select: typeof import("oak-common-aspect/lib/crud").select;
        amap: typeof import("oak-common-aspect/lib/amap").amap;
        getTranslations: typeof import("oak-common-aspect/lib/locales").getTranslations;
    } & AD> & FD;
    context: Cxt;
};
