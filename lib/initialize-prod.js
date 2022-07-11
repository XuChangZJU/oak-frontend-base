"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const Exception_1 = require("oak-domain/lib/types/Exception");
const features_1 = require("./features");
const lodash_1 = require("lodash");
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
function initialize(storageSchema, createFeatures, contextBuilder, serverUrl, checkers, actionDict) {
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
            const cxtStr = await context.toString();
            const { contentType, body } = makeContentTypeAndBody(params);
            const response = await global.fetch(serverUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': contentType,
                    'oak-cxt': cxtStr,
                    'oak-aspect': name,
                },
                body,
            });
            if (response.status > 299) {
                const err = new Exception_1.OakExternalException(`网络请求返回异常，status是${response.status}`);
                throw err;
            }
            // todo 处理各种异常
            const { result, opRecords } = await response.json();
            return {
                result,
                opRecords,
            };
        },
    };
    const basicFeatures = (0, features_1.initialize)(wrapper, storageSchema, context, cacheStore);
    // basicFeatures.runningNode.setStorageSchema(storageSchema);
    const userDefinedfeatures = createFeatures(wrapper, basicFeatures, context);
    const intersect = (0, lodash_1.intersection)((0, lodash_1.keys)(basicFeatures), (0, lodash_1.keys)(userDefinedfeatures));
    if (intersect.length > 0) {
        throw new Error(`用户定义的feature中不能和系统feature同名：「${intersect.join(',')}」`);
    }
    const features = (0, lodash_1.assign)(basicFeatures, userDefinedfeatures);
    return {
        features,
        context,
    };
}
exports.initialize = initialize;
