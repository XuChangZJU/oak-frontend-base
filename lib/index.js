"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
const index_1 = require("./features/index");
const lodash_1 = require("lodash");
const FrontContext_1 = require("./FrontContext");
const oak_debug_store_1 = require("oak-debug-store");
const oak_trigger_executor_1 = require("oak-trigger-executor");
const CacheStore_1 = require("./dataStore/CacheStore");
class DebugRunningContext extends oak_debug_store_1.Context {
    getApplication;
    getToken;
    constructor(store, getRandomNumber, ga, gt) {
        super(store, getRandomNumber);
        this.getApplication = ga;
        this.getToken = gt;
    }
}
;
async function createAspectProxy(cacheStore, storageSchema, triggers, applicationId, features, getRandomNumber, aspectDict, initialData) {
    if (process.env.NODE_ENV === 'production') {
        // todo 发请求到后台获取数据
        throw new Error('method not implemented');
    }
    else {
        // todo initialData        
        const executor = new oak_trigger_executor_1.TriggerExecutor();
        const debugStore = new oak_debug_store_1.DebugStore(executor, storageSchema);
        triggers.forEach((trigger) => debugStore.registerTrigger(trigger));
        const context = new oak_debug_store_1.Context(debugStore, getRandomNumber);
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
        }, context);
        const getApplication = () => application;
        const connectAspectToDebugStore = (aspect) => {
            return async (params, frontContext) => {
                const context2 = new oak_debug_store_1.Context(debugStore, getRandomNumber);
                const tokenValue = await features.token.get(frontContext, 'value');
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
                const runningContext = new DebugRunningContext(debugStore, getRandomNumber, getApplication, getToken);
                const result = aspect(params, runningContext);
                cacheStore.sync(runningContext.opRecords, frontContext);
                return result;
            };
        };
        const aspectDict2 = (0, lodash_1.assign)({}, oak_general_business_1.aspectDict, aspectDict);
        const aspectProxy = (0, lodash_1.mapValues)(aspectDict2, ele => connectAspectToDebugStore(ele));
        return aspectProxy;
    }
}
async function initialize(storageSchema, applicationId, createFeatures, getRandomNumber, triggers, aspectDict, initialData) {
    const basicFeatures = (0, index_1.initialize)();
    const userDefinedfeatures = createFeatures(basicFeatures);
    const intersect = (0, lodash_1.intersection)((0, lodash_1.keys)(basicFeatures), (0, lodash_1.keys)(userDefinedfeatures));
    if (intersect.length > 0) {
        throw new Error(`用户定义的feature中不能和系统feature同名：「${intersect.join(',')}」`);
    }
    const features = (0, lodash_1.assign)(basicFeatures, userDefinedfeatures);
    const cacheStore = new CacheStore_1.CacheStore(storageSchema);
    // todo default triggers
    const aspectProxy = await createAspectProxy(cacheStore, storageSchema, triggers || [], applicationId, features, getRandomNumber, aspectDict, initialData);
    (0, lodash_1.keys)(features).forEach(ele => {
        features[ele].setAspectProxy(aspectProxy);
        // 为action注入逻辑，在顶层的action调用返回时，回调subscribe相关函数
        const originActionFn = features[ele]['action'];
        features[ele]['action'] = (context, params) => {
            const topAction = context.topAction;
            if (context.topAction) {
                context.topAction = false;
            }
            let result;
            try {
                result = originActionFn(context, params);
            }
            catch (e) {
                context.topAction = topAction;
                throw e;
            }
            context.topAction = topAction;
            if (topAction) {
                callbacks.forEach(ele => ele());
            }
            return result;
        };
    });
    const callbacks = [];
    const subscribe = (callback) => {
        callbacks.push(callback);
        return () => {
            (0, lodash_1.pull)(callbacks, callback);
        };
    };
    return {
        subscribe,
        features,
        createContext: () => new FrontContext_1.FrontContext(cacheStore, getRandomNumber),
    };
}
exports.initialize = initialize;
__exportStar(require("./features/node"), exports);
__exportStar(require("./FrontContext"), exports);
__exportStar(require("./types/Feature"), exports);
__exportStar(require("./features/cache"), exports);
__exportStar(require("./features"), exports);
