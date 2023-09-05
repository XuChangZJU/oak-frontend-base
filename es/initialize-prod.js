import { initializeStep1 as initBasicFeaturesStep1, initializeStep2 as initBasicFeaturesStep2 } from './features';
import { makeIntrinsicCTWs } from 'oak-domain/lib/store/actionDef';
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
export function initialize(storageSchema, frontendContextBuilder, connector, checkers, option) {
    const { actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, actionDict, selectFreeEntities, createFreeEntities, updateFreeEntities, colorDict, cacheKeepFreshPeriod, cacheSavedEntities } = option;
    const { checkers: intCheckers } = makeIntrinsicCTWs(storageSchema, actionDict);
    const checkers2 = checkers.concat(intCheckers);
    const features1 = initBasicFeaturesStep1();
    const wrapper = {
        exec: async (name, params) => {
            const context = features2.cache.buildContext();
            const { result, opRecords, message } = await connector.callAspect(name, params, context);
            return {
                result,
                opRecords,
                message,
            };
        },
    };
    const features2 = initBasicFeaturesStep2(features1, wrapper, storageSchema, frontendContextBuilder, checkers2, actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, colorDict, () => '请查看数据库中的数据', () => connector.getSubscribePoint(), (url, headers) => connector.makeBridgeUrl(url, headers), selectFreeEntities, createFreeEntities, updateFreeEntities, cacheSavedEntities, cacheKeepFreshPeriod);
    const features = Object.assign(features1, features2);
    return {
        features,
    };
}
