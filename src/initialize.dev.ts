import { Aspect, AspectWrapper, Checker, Trigger, StorageSchema, Context, RowStore, OakRowInconsistencyException, Watcher } from "oak-domain/lib/types";
import { EntityDict, FormCreateData } from 'oak-domain/lib/types/Entity';

import { Feature, subscribe } from './types/Feature';
import { createDebugStore } from './debugStore';

import { initialize as createBasicFeatures, BasicFeatures } from './features';
import { assign, intersection, keys, mapValues } from 'lodash';
import commonAspectDict from 'oak-common-aspect';
import { ActionDictOfEntityDict } from "oak-domain/lib/types/Action";
import { analyzeActionDefDict } from "oak-domain/lib/store/actionDef";
import { AspectDict } from "oak-common-aspect/src/aspectDict";
import { CacheStore } from "./cacheStore/CacheStore";

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
export function initialize<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD & AspectDict<ED, Cxt>>>>(
    storageSchema: StorageSchema<ED>,
    createFeatures: (aspectWrapper: AspectWrapper<ED, Cxt, AD> ,basicFeatures: BasicFeatures<ED, Cxt, AD & AspectDict<ED, Cxt>>, context: Cxt) => FD,
    contextBuilder: (cxtString?: string) => (store: RowStore<ED, Cxt>) => Cxt,
    contextCreator: (store: RowStore<ED, Cxt>) => Cxt,
    aspectDict: AD,
    triggers?: Array<Trigger<ED, keyof ED, Cxt>>,
    checkers?: Array<Checker<ED, keyof ED, Cxt>>,
    watchers?: Array<Watcher<ED, keyof ED, Cxt>>,
    initialData?: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    },
    actionDict?: ActionDictOfEntityDict<ED>) {

    let intersect = intersection(keys(commonAspectDict), keys(aspectDict));
    if (intersect.length > 0) {
        throw new Error(`用户定义的aspect中不能和系统aspect同名：「${intersect.join(',')}」`);
    }
    const aspectDict2 = assign({}, commonAspectDict, aspectDict);
    const debugStore = createDebugStore(storageSchema, contextBuilder, triggers || [], checkers || [], watchers || [], initialData, actionDict);

    const cacheStore = new CacheStore(storageSchema, contextBuilder);
    if (checkers) {
        checkers.forEach(
            (checker) => cacheStore.registerChecker(checker)
        );
    }
    if (actionDict) {
        const { checkers: adCheckers } = analyzeActionDefDict(storageSchema, actionDict);
        adCheckers.forEach(
            (checker) => cacheStore.registerChecker(checker)
        );
    }
    const context = contextBuilder()(cacheStore);

    const wrapper: AspectWrapper<ED, Cxt, typeof aspectDict2> = {
        exec: async (name, params) => {
            const str = await context.toString();
            const contextBackend = contextBuilder(str)(debugStore);
            await contextBackend.begin();
            let result;
            try {
                result = await aspectDict2[name](params, contextBackend);
                await contextBackend.commit();
            }
            catch (err) {
                await contextBackend.rollback();
                throw err;
            }
            return {
                result,
                opRecords: contextBackend.opRecords,
            };
        }
    };

    const basicFeatures = createBasicFeatures<ED, Cxt, typeof aspectDict2>(wrapper, storageSchema, context, cacheStore);

    // basicFeatures.runningNode.setStorageSchema(storageSchema);

    const userDefinedfeatures = createFeatures(wrapper, basicFeatures, context);

    intersect = intersection(keys(basicFeatures), keys(userDefinedfeatures));
    if (intersect.length > 0) {
        throw new Error(`用户定义的feature中不能和系统feature同名：「${intersect.join(',')}」`);
    }
    const features = assign(basicFeatures, userDefinedfeatures);

    return {
        subscribe,
        features,
    };
}
