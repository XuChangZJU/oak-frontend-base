"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const features_1 = require("./features");
const IntrinsicCheckers_1 = require("oak-domain/lib/store/IntrinsicCheckers");
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
function initialize(storageSchema, frontendContextBuilder, connector, checkers, option) {
    const { authDeduceRelationMap, actionDict, selectFreeEntities, updateFreeDict, colorDict, cacheKeepFreshPeriod, cacheSavedEntities } = option;
    const intrinsicCheckers = (0, IntrinsicCheckers_1.makeIntrinsicCheckers)(storageSchema, actionDict);
    const checkers2 = checkers.concat(intrinsicCheckers);
    const features1 = (0, features_1.initializeStep1)();
    const wrapper = {
        exec: async (name, params, ignoreContext) => {
            const context = ignoreContext ? undefined : features2.cache.getContext();
            const { result, opRecords, message } = await connector.callAspect(name, params, context);
            return {
                result,
                opRecords,
                message,
            };
        },
    };
    const features2 = (0, features_1.initializeStep2)(features1, wrapper, storageSchema, frontendContextBuilder, checkers2, authDeduceRelationMap, colorDict, () => '请查看数据库中的数据', () => connector.getSubscribePoint(), (url, headers) => connector.makeBridgeUrl(url, headers), selectFreeEntities, updateFreeDict, cacheSavedEntities, cacheKeepFreshPeriod);
    const features = Object.assign(features1, features2);
    return {
        features,
    };
}
exports.initialize = initialize;
