"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const tslib_1 = require("tslib");
const IntrinsicLogics_1 = require("oak-domain/lib/store/IntrinsicLogics");
const debugStore_1 = require("./debugStore");
const features_1 = require("./features");
const lodash_1 = require("oak-domain/lib/utils/lodash");
const oak_common_aspect_1 = tslib_1.__importDefault(require("oak-common-aspect"));
const oak_common_aspect_2 = require("oak-common-aspect");
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
function initialize(storageSchema, frontendContextBuilder, backendContextBuilder, aspectDict, triggers, checkers, watchers, timers, startRoutines, initialData, option) {
    const { actionDict, authDeduceRelationMap, attrUpdateMatrix, colorDict, importations, exportations, selectFreeEntities, updateFreeDict, cacheKeepFreshPeriod, cacheSavedEntities } = option;
    let intersected = (0, lodash_1.intersection)(Object.keys(oak_common_aspect_1.default), Object.keys(aspectDict));
    if (intersected.length > 0) {
        throw new Error(`用户定义的aspect中不能和系统aspect同名：「${intersected.join(',')}」`);
    }
    const aspectDict2 = Object.assign({}, aspectDict, oak_common_aspect_1.default);
    const { checkers: intCheckers, triggers: intTriggers, watchers: intWatchers } = (0, IntrinsicLogics_1.makeIntrinsicCTWs)(storageSchema, actionDict, attrUpdateMatrix);
    const checkers2 = checkers.concat(intCheckers);
    const triggers2 = triggers.concat(intTriggers);
    const watchers2 = watchers.concat(intWatchers);
    const features1 = (0, features_1.initializeStep1)();
    const debugStore = (0, debugStore_1.createDebugStore)(storageSchema, backendContextBuilder, triggers2, checkers2, watchers2, timers, startRoutines, initialData, actionDict, authDeduceRelationMap, features1.localStorage, selectFreeEntities, updateFreeDict);
    const wrapper = {
        exec: async (name, params, ignoreContext) => {
            const context = features2.cache.getContext();
            const str = !ignoreContext ? await context.toString() : '{}';
            const contextBackend = await backendContextBuilder(str)(debugStore);
            await contextBackend.begin();
            let result;
            let { opRecords } = contextBackend;
            let message;
            try {
                result = await aspectDict2[name]((0, lodash_1.cloneDeep)(params), contextBackend);
                await contextBackend.refineOpRecords();
                opRecords = contextBackend.opRecords;
                message = contextBackend.getMessage();
                await contextBackend.commit();
            }
            catch (err) {
                await contextBackend.rollback();
                throw err;
            }
            return {
                result,
                opRecords: opRecords,
                message,
            };
        },
    };
    const features2 = (0, features_1.initializeStep2)(features1, wrapper, storageSchema, frontendContextBuilder, checkers2, authDeduceRelationMap, colorDict, () => debugStore.getCurrentData(), async () => ({ url: '', path: '' }), undefined, selectFreeEntities, updateFreeDict, cacheSavedEntities, cacheKeepFreshPeriod, attrUpdateMatrix);
    (0, oak_common_aspect_2.registerPorts)(importations || [], exportations || []);
    const features = Object.assign(features2, features1);
    return {
        features,
    };
}
exports.initialize = initialize;
