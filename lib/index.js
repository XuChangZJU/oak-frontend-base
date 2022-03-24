"use strict";
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
    constructor(store, ga, gt) {
        super(store);
        this.getApplication = ga;
        this.getToken = gt;
    }
}
;
async function createAspectProxy(frontContext, storageSchema, triggers, applicationId, features, aspectDict, initialData) {
    if (process.env.NODE_ENV === 'production') {
        // todo 发请求到后台获取数据
        throw new Error('method not implemented');
    }
    else {
        // todo initialData        
        const executor = new oak_trigger_executor_1.TriggerExecutor();
        const debugStore = new oak_debug_store_1.DebugStore(executor, storageSchema);
        triggers.forEach((trigger) => debugStore.registerTrigger(trigger));
        const context = new oak_debug_store_1.Context(debugStore);
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
        const connectAspectToDebugStore = async (aspect) => {
            const context2 = new oak_debug_store_1.Context(debugStore);
            const tokenValue = features.token.getValue();
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
            const runningContext = new DebugRunningContext(debugStore, getApplication, getToken);
            const result = (params) => aspect(params, runningContext);
            frontContext.rowStore.sync(runningContext.opRecords, frontContext);
            return result;
        };
        const aspectDict2 = (0, lodash_1.assign)({}, oak_general_business_1.aspectDict, aspectDict);
        const aspectProxy = (0, lodash_1.mapValues)(aspectDict2, ele => connectAspectToDebugStore(ele));
        return aspectProxy;
    }
}
async function initialize(storageSchema, applicationId, createFeatures, triggers, aspectDict, initialData) {
    const basicFeatures = (0, index_1.initialize)();
    const userDefinedfeatures = createFeatures(basicFeatures);
    const intersect = (0, lodash_1.intersection)((0, lodash_1.keys)(basicFeatures), (0, lodash_1.keys)(userDefinedfeatures));
    if (intersect.length > 0) {
        throw new Error(`用户定义的feature中不能和系统feature同名：「${intersect.join(',')}」`);
    }
    const features = (0, lodash_1.assign)(basicFeatures, userDefinedfeatures);
    const cacheStore = new CacheStore_1.CacheStore(storageSchema);
    const frontContext = new FrontContext_1.FrontContext(cacheStore);
    // todo default triggers
    const aspectProxy = await createAspectProxy(frontContext, storageSchema, triggers, applicationId, features, aspectDict, initialData);
    (0, lodash_1.keys)(features).forEach(ele => {
        features[ele].setAspectProxy(aspectProxy);
        features[ele].setFrontContext(frontContext);
    });
    const callbacks = [];
    const subscribe = (callback) => {
        callbacks.push(callback);
        return () => {
            (0, lodash_1.pull)(callbacks, callback);
        };
    };
    /**
     * 这里的封装不够优雅，以后再优化
     * @param name
     * @param method
     * @param params
     * @returns
     */
    const action = async (name, method, ...params) => {
        await frontContext.begin();
        try {
            const feature = features[name];
            const result = feature[method](...params);
            frontContext.commit();
            callbacks.forEach(ele => ele());
            return result;
        }
        catch (err) {
            frontContext.rollback();
            callbacks.forEach(ele => ele());
            throw err;
        }
    };
    return {
        subscribe,
        action,
    };
}
exports.initialize = initialize;
