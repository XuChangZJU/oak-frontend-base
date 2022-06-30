"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const debugStore_1 = require("./debugStore");
const features_1 = require("./features");
const lodash_1 = require("lodash");
const oak_common_aspect_1 = __importDefault(require("oak-common-aspect"));
const actionDef_1 = require("oak-domain/lib/store/actionDef");
const CacheStore_1 = require("./cacheStore/CacheStore");
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
function initialize(storageSchema, createFeatures, contextBuilder, aspectDict, triggers, checkers, watchers, initialData, actionDict) {
    let intersect = (0, lodash_1.intersection)((0, lodash_1.keys)(oak_common_aspect_1.default), (0, lodash_1.keys)(aspectDict));
    if (intersect.length > 0) {
        throw new Error(`用户定义的aspect中不能和系统aspect同名：「${intersect.join(',')}」`);
    }
    const aspectDict2 = (0, lodash_1.assign)({}, oak_common_aspect_1.default, aspectDict);
    const debugStore = (0, debugStore_1.createDebugStore)(storageSchema, contextBuilder, triggers || [], checkers || [], watchers || [], initialData, actionDict);
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
    const basicFeatures = (0, features_1.initialize)(wrapper, storageSchema, context, cacheStore);
    // basicFeatures.runningNode.setStorageSchema(storageSchema);
    const userDefinedfeatures = createFeatures(wrapper, basicFeatures, context);
    intersect = (0, lodash_1.intersection)((0, lodash_1.keys)(basicFeatures), (0, lodash_1.keys)(userDefinedfeatures));
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
