import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Trigger } from "oak-domain/lib/types/Trigger";
import { EntityDict as BaseEntityDict } from 'oak-general-business/lib/base-ed/EntityDict';
import { aspectDict as basicAspectDict } from 'oak-general-business';

import { Aspect } from 'oak-general-business/lib/types/Aspect';
import { Feature, subscribe } from './types/Feature';
import { createDebugStore } from './debugStore';

import { initialize as createBasicFeatures, BasicFeatures } from './features/index';
import { assign, intersection, keys, mapValues, pull } from 'lodash';
import { EntityDict, FormCreateData } from 'oak-domain/lib/types/Entity';
import { FrontContext } from './FrontContext';
import { RuntimeContext } from "oak-general-business/lib/RuntimeContext";
import { DebugStore } from './debugStore/debugStore';
import { DebugContext } from './debugStore/context';
import { Schema as Application } from "oak-general-business/lib/base-ed/Application/Schema";
import { Schema as Token } from 'oak-general-business/lib/base-ed/Token/Schema';
import { AspectProxy } from './types/AspectProxy';
import { CacheStore } from './cacheStore/CacheStore';

class DebugRuntimeContext<ED extends EntityDict> extends DebugContext<ED> implements RuntimeContext<ED> {
    getApplication: () => Application;
    getToken: () => Token | undefined;

    constructor(store: DebugStore<ED>, ga: () => Application, gt: () => Token | undefined) {
        super(store);
        this.getApplication = ga;
        this.getToken = gt;
    }
};

function createAspectProxy<ED extends BaseEntityDict & EntityDict,
    AD extends Record<string, Aspect<ED>>,
    FD extends Record<string, Feature<ED, AD>>>(
        storageSchema: StorageSchema<ED>,
        triggers: Array<Trigger<ED, keyof ED>>,
        applicationId: string,
        features: BasicFeatures<ED, AD> & FD,
        aspectDict?: AD,
        initialData?: {
            [T in keyof ED]?: Array<FormCreateData<ED[T]['OpSchema']>>;
        }): AspectProxy<ED, AD & typeof basicAspectDict> {
    if (process.env.NODE_ENV === 'production') {
        // todo 发请求到后台获取数据
        throw new Error('method not implemented');
    }
    else {
        // todo initialData
        const debugStore = createDebugStore(storageSchema, triggers, initialData);       

        const connectAspectToDebugStore = (aspect: Aspect<ED>): (p: Parameters<typeof aspect>[0]) => ReturnType<typeof aspect> => {
            return async (params: Parameters<typeof aspect>[0]) => {
                const context2 = new DebugContext(debugStore);

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
                const getApplication = () => application as Application;
                const tokenValue = await features.token.getValue();
                let token: Token | undefined;
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
                    token = result[0] as Token;
                    // todo 判断 token的合法性
                }
                const getToken = () => token;

                const runningContext = new DebugRuntimeContext(debugStore, getApplication, getToken);
                await runningContext.begin();
                let aspectCompeleted = false;
                try {
                    const result = await aspect(params, runningContext);
                    await runningContext.commit();
                    aspectCompeleted = true;
    
                    await features.cache.sync(runningContext.opRecords);
                    return result;
                }
                catch(err) {
                    if (!aspectCompeleted) {
                        await runningContext.rollback();                        
                    }
                    throw err;
                }
            }
        };

        const aspectDict2 = assign({}, basicAspectDict, aspectDict);
        const aspectProxy = mapValues(aspectDict2, ele => connectAspectToDebugStore(ele));

        return aspectProxy as any;
    }
}


export function initialize<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>, FD extends Record<string, Feature<ED, AD>>>(
    storageSchema: StorageSchema<ED>,
    applicationId: string,
    createFeatures: (basicFeatures: BasicFeatures<ED, AD>) => FD,
    triggers?: Array<Trigger<ED, keyof ED>>,
    aspectDict?: AD,
    initialData?: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    }) {
    const cacheStore = new CacheStore<ED>(storageSchema);
    const basicFeatures = createBasicFeatures<ED, AD>(cacheStore);
    basicFeatures.runningNode.setStorageSchema(storageSchema);

    const userDefinedfeatures = createFeatures(basicFeatures);

    const intersect = intersection(keys(basicFeatures), keys(userDefinedfeatures));
    if (intersect.length > 0) {
        throw new Error(`用户定义的feature中不能和系统feature同名：「${intersect.join(',')}」`);
    }
    const features = assign(basicFeatures, userDefinedfeatures);


    // todo default triggers
    const aspectProxy = createAspectProxy<ED, AD, FD>(storageSchema, triggers || [],
        applicationId, features, aspectDict, initialData);

    keys(features).forEach(
        ele => {
            features[ele].setAspectProxy(aspectProxy);
        }
    );


    return {
        subscribe,
        features,
    };
}



export * from './features/node';
export * from './FrontContext';
export * from './types/Feature';
export * from './types/Pagination';
export * from './features/cache';
export * from './features';