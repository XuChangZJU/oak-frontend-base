import { makeIntrinsicCTWs } from 'oak-domain/lib/store/actionDef';
import { createDebugStore } from './debugStore';
import { initializeStep1 as initBasicFeaturesStep1, initializeStep2 as initBasicFeaturesStep2 } from './features';
import { intersection } from 'oak-domain/lib/utils/lodash';
import commonAspectDict from 'oak-common-aspect';
import { registerPorts } from 'oak-common-aspect';
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
export function initialize(storageSchema, frontendContextBuilder, backendContextBuilder, aspectDict, triggers, checkers, watchers, timers, startRoutines, initialData, option) {
    const { actionCascadePathGraph, actionDict, relationCascadePathGraph, authDeduceRelationMap, colorDict, importations, exportations, selectFreeEntities, createFreeEntities, updateFreeEntities, cacheKeepFreshPeriod, cacheSavedEntities } = option;
    let intersected = intersection(Object.keys(commonAspectDict), Object.keys(aspectDict));
    if (intersected.length > 0) {
        throw new Error(`用户定义的aspect中不能和系统aspect同名：「${intersected.join(',')}」`);
    }
    const aspectDict2 = Object.assign({}, aspectDict, commonAspectDict);
    const { checkers: intCheckers, triggers: intTriggers, watchers: intWatchers } = makeIntrinsicCTWs(storageSchema, actionDict);
    const checkers2 = checkers.concat(intCheckers);
    const triggers2 = triggers.concat(intTriggers);
    const watchers2 = watchers.concat(intWatchers);
    const features1 = initBasicFeaturesStep1();
    const debugStore = createDebugStore(storageSchema, backendContextBuilder, triggers2, checkers2, watchers2, timers, startRoutines, initialData, actionDict, actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, (key, data) => features1.localStorage.save(key, data), (key) => features1.localStorage.load(key), selectFreeEntities, createFreeEntities, updateFreeEntities);
    const wrapper = {
        exec: async (name, params) => {
            const context = features2.cache.buildContext();
            const str = context.toString();
            const contextBackend = await backendContextBuilder(str)(debugStore);
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
                message: contextBackend.getMessage(),
            };
        },
    };
    const features2 = initBasicFeaturesStep2(features1, wrapper, storageSchema, frontendContextBuilder, checkers2, actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, colorDict, () => debugStore.getCurrentData(), async () => ({ url: '', path: '' }), undefined, selectFreeEntities, createFreeEntities, updateFreeEntities, cacheSavedEntities, cacheKeepFreshPeriod);
    registerPorts(importations || [], exportations || []);
    const features = Object.assign(features2, features1);
    return {
        features,
    };
}
