"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const features_1 = require("./features");
const lodash_1 = require("oak-domain/lib/utils/lodash");
const actionDef_1 = require("oak-domain/lib/store/actionDef");
const CacheStore_1 = require("./cacheStore/CacheStore");
function makeContentTypeAndBody(data) {
    return {
        contentType: 'application/json',
        body: JSON.stringify(data),
    };
}
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
function initialize(storageSchema, createFeatures, contextBuilder, connector, checkers, actionDict) {
    const cacheStore = new CacheStore_1.CacheStore(storageSchema, contextBuilder);
    if (checkers) {
        checkers.forEach((checker) => cacheStore.registerChecker(checker));
    }
    if (actionDict) {
        const { checkers: adCheckers } = (0, actionDef_1.analyzeActionDefDict)(storageSchema, actionDict);
        adCheckers.forEach((checker) => cacheStore.registerChecker(checker));
    }
    const context = contextBuilder()(cacheStore);
    const wrapper = {
        exec: async (name, params) => {
            const { result, opRecords } = await connector.callAspect(name, params, context);
            return {
                result,
                opRecords,
            };
        },
    };
    const basicFeatures = (0, features_1.initialize)(wrapper, storageSchema, context, cacheStore);
    // basicFeatures.runningNode.setStorageSchema(storageSchema);
    const userDefinedfeatures = createFeatures(wrapper, basicFeatures, context);
    const intersect = (0, lodash_1.intersection)(Object.keys(basicFeatures), Object.keys(userDefinedfeatures));
    if (intersect.length > 0) {
        throw new Error(`用户定义的feature中不能和系统feature同名：「${intersect.join(',')}」`);
    }
    const features = Object.assign(basicFeatures, userDefinedfeatures);
    return {
        features,
        context,
    };
}
exports.initialize = initialize;
