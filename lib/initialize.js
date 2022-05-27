"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const Feature_1 = require("./types/Feature");
const debugStore_1 = require("./debugStore");
const features_1 = require("./features");
const lodash_1 = require("lodash");
const aspects_1 = __importDefault(require("./aspects"));
const actionDef_1 = require("oak-domain/lib/store/actionDef");
function createAspectProxy(storageSchema, createContext, triggers, checkers, features, aspectDict, initialData, actionDict) {
    if (process.env.NODE_ENV === 'production') {
        // todo 发请求到后台获取数据
        throw new Error('method not implemented');
    }
    else {
        // todo initialData
        const debugStore = (0, debugStore_1.createDebugStore)(storageSchema, createContext, triggers, checkers, initialData, actionDict);
        const connectAspectToDebugStore = (aspect) => {
            return async (params, scene) => {
                const runningContext = createContext(debugStore, scene);
                await runningContext.begin();
                let aspectCompeleted = false;
                try {
                    const result = await aspect(params, runningContext);
                    await runningContext.commit();
                    aspectCompeleted = true;
                    await features.cache.sync(runningContext.opRecords);
                    return result;
                }
                catch (err) {
                    if (!aspectCompeleted) {
                        await runningContext.rollback();
                    }
                    throw err;
                }
            };
        };
        const aspectProxy = (0, lodash_1.mapValues)((0, lodash_1.assign)({}, aspects_1.default, aspectDict), ele => connectAspectToDebugStore(ele));
        return aspectProxy;
    }
}
function initialize(storageSchema, createFeatures, createContext, triggers, checkers, aspectDict, initialData, actionDict) {
    const basicFeatures = (0, features_1.initialize)(storageSchema, createContext, checkers);
    if (actionDict) {
        const { checkers: adCheckers } = (0, actionDef_1.analyzeActionDefDict)(storageSchema, actionDict);
        basicFeatures.cache.registerCheckers(adCheckers);
    }
    basicFeatures.runningNode.setStorageSchema(storageSchema);
    basicFeatures.runningTree.setStorageSchema(storageSchema);
    const userDefinedfeatures = createFeatures(basicFeatures);
    const intersect = (0, lodash_1.intersection)((0, lodash_1.keys)(basicFeatures), (0, lodash_1.keys)(userDefinedfeatures));
    if (intersect.length > 0) {
        throw new Error(`用户定义的feature中不能和系统feature同名：「${intersect.join(',')}」`);
    }
    const features = (0, lodash_1.assign)(basicFeatures, userDefinedfeatures);
    // todo default triggers
    const aspectProxy = createAspectProxy(storageSchema, createContext, triggers || [], checkers || [], features, aspectDict, initialData, actionDict);
    (0, lodash_1.keys)(features).forEach(ele => {
        features[ele].setAspectProxy(aspectProxy);
    });
    return {
        subscribe: Feature_1.subscribe,
        features,
    };
}
exports.initialize = initialize;
__exportStar(require("./types/Feature"), exports);
__exportStar(require("./types/Pagination"), exports);
