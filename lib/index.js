"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const token_1 = require("./features/token");
const lodash_1 = require("lodash");
const FrontContext_1 = require("./FrontContext");
function populateFeatures(featureClazzDict) {
    const result = {};
    for (const k in featureClazzDict) {
        (0, lodash_1.assign)(result, {
            [k]: new featureClazzDict[k](),
        });
    }
    return result;
}
async function initialize(storageSchema, applicationId, featureClazzDict, triggers, aspectDict, initialData) {
    const token = new token_1.Token();
    // todo default triggers
    const frontContext = new FrontContext_1.FrontContext(storageSchema, triggers, applicationId, () => token.getTokenValue(), aspectDict, initialData);
    const featureDict = {
        token: token_1.Token,
    };
    function ppf() {
        return populateFeatures(featureClazzDict);
    }
    if (featureClazzDict) {
        (0, lodash_1.assign)(featureDict, ppf());
    }
    const featureDict2 = featureDict;
    const subscribe = (features, callback) => {
        const unsubscribes = features.map((f) => {
            const feature = featureDict2[f];
            return feature.subscribe(callback);
        });
        return () => {
            unsubscribes.forEach(ele => ele());
        };
    };
    const getFeature = (f, params) => {
        // const context = new FrontContext<ED, typeof aspectDict2>(store, aspectProxy) as any; 
        const feature = featureDict2[f];
        return feature.get(frontContext, params); // 这里有个类型的转换暂时写不出来，因为populateFeatures没法传递generic types在返回值里
    };
    const actionFeature = (f, t, p) => {
        // const context = new FrontContext<ED, typeof aspectDict2>(store, aspectProxy) as any;        
        const feature = featureDict2[f];
        return feature.action(frontContext, t, p);
    };
    return {
        subscribe,
        getFeature,
        actionFeature,
    };
}
exports.initialize = initialize;
