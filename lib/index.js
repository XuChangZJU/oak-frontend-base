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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const oak_general_business_1 = require("oak-general-business");
const Feature_1 = require("./types/Feature");
const debugStore_1 = require("./debugStore");
const index_1 = require("./features/index");
const lodash_1 = require("lodash");
const FrontContext_1 = require("./FrontContext");
const context_1 = require("./debugStore/context");
const CacheStore_1 = require("./cacheStore/CacheStore");
class DebugRuntimeContext extends context_1.DebugContext {
    getApplication;
    getToken;
    constructor(store, ga, gt) {
        super(store);
        this.getApplication = ga;
        this.getToken = gt;
    }
}
;
function createAspectProxy(context, storageSchema, triggers, applicationId, features, aspectDict, initialData) {
    if (process.env.NODE_ENV === 'production') {
        // todo 发请求到后台获取数据
        throw new Error('method not implemented');
    }
    else {
        // todo initialData
        const debugStore = (0, debugStore_1.createDebugStore)(storageSchema, triggers, initialData);
        const connectAspectToDebugStore = (aspect) => {
            return async (params) => {
                const context2 = new context_1.DebugContext(debugStore);
                const { result: [application] } = await debugStore.select('application', {
                    data: {
                        id: 1,
                        systemId: 1,
                        system: {
                            id: 1,
                        },
                    },
                    filter: {
                        id: applicationId,
                    }
                }, context2);
                const getApplication = () => application;
                const tokenValue = await features.token.getValue();
                let token;
                if (tokenValue) {
                    const { result } = await debugStore.select('token', {
                        data: {
                            id: 1,
                            userId: 1,
                            playerId: 1,
                        },
                        filter: {
                            id: tokenValue,
                        }
                    }, context2);
                    token = result[0];
                    // todo 判断 token的合法性
                }
                const getToken = () => token;
                const runningContext = new DebugRuntimeContext(debugStore, getApplication, getToken);
                const result = aspect(params, runningContext);
                context.rowStore.sync(runningContext.opRecords, context);
                return result;
            };
        };
        const aspectDict2 = (0, lodash_1.assign)({}, oak_general_business_1.aspectDict, aspectDict);
        const aspectProxy = (0, lodash_1.mapValues)(aspectDict2, ele => connectAspectToDebugStore(ele));
        return aspectProxy;
    }
}
function initialize(storageSchema, applicationId, createFeatures, triggers, aspectDict, initialData) {
    const basicFeatures = (0, index_1.initialize)();
    basicFeatures.runningNode.setStorageSchema(storageSchema);
    const userDefinedfeatures = createFeatures(basicFeatures);
    const intersect = (0, lodash_1.intersection)((0, lodash_1.keys)(basicFeatures), (0, lodash_1.keys)(userDefinedfeatures));
    if (intersect.length > 0) {
        throw new Error(`用户定义的feature中不能和系统feature同名：「${intersect.join(',')}」`);
    }
    const features = (0, lodash_1.assign)(basicFeatures, userDefinedfeatures);
    const cacheStore = new CacheStore_1.CacheStore(storageSchema);
    const context = new FrontContext_1.FrontContext(cacheStore);
    // todo default triggers
    const aspectProxy = createAspectProxy(context, storageSchema, triggers || [], applicationId, features, aspectDict, initialData);
    (0, lodash_1.keys)(features).forEach(ele => {
        features[ele].setAspectProxy(aspectProxy);
        features[ele].setContext(context);
    });
    return {
        subscribe: Feature_1.subscribe,
        features,
        getContext: () => context,
    };
}
exports.initialize = initialize;
__exportStar(require("./features/node"), exports);
__exportStar(require("./FrontContext"), exports);
__exportStar(require("./types/Feature"), exports);
__exportStar(require("./types/Pagination"), exports);
__exportStar(require("./features/cache"), exports);
__exportStar(require("./features"), exports);
