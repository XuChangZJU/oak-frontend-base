import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Trigger } from "oak-domain/lib/types/Trigger";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { aspectDict as basicAspectDict } from 'oak-general-business';

import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Feature, subscribe } from './types/Feature';

import { initialize as createBasicFeatures, BasicFeatures } from './features/index';
import { assign, intersection, keys, mapValues, pull } from 'lodash';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { FrontContext } from './FrontContext';
import { RunningContext } from "oak-domain/lib/types/Context";
import { DebugStore, Context } from 'oak-debug-store';
import { Schema as Application } from "oak-domain/lib/base-domain/Application/Schema";
import { Schema as Token } from 'oak-domain/lib/base-domain/Token/Schema';
import { TriggerExecutor } from "oak-trigger-executor";
import { AspectProxy } from './types/AspectProxy';
import { CacheStore } from './dataStore/CacheStore';

class DebugRunningContext<ED extends EntityDict> extends Context<ED> implements RunningContext<ED> {
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
        context: FrontContext<ED>,
        storageSchema: StorageSchema<ED>,
        triggers: Array<Trigger<ED, keyof ED>>,
        applicationId: string,
        features: BasicFeatures<ED, AD> & FD,
        aspectDict?: AD,
        initialData?: {
            [T in keyof ED]?: Array<ED[T]['OpSchema']>;
        }): AspectProxy<ED, AD & typeof basicAspectDict> {
    if (process.env.NODE_ENV === 'production') {
        // todo 发请求到后台获取数据
        throw new Error('method not implemented');
    }
    else {
        // todo initialData        
        const executor = new TriggerExecutor<ED>();
        const debugStore = new DebugStore<ED>(executor, storageSchema);
        triggers.forEach(
            (trigger) => debugStore.registerTrigger(trigger)
        );

        const connectAspectToDebugStore = (aspect: Aspect<ED>): (p: Parameters<typeof aspect>[0]) => ReturnType<typeof aspect> => {
            return async (params: Parameters<typeof aspect>[0]) => {
                const context2 = new Context(debugStore);

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

                const runningContext = new DebugRunningContext(debugStore, getApplication, getToken)
                const result = aspect(params, runningContext);

                context.rowStore.sync(runningContext.opRecords, context);
                return result;
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
    const basicFeatures = createBasicFeatures<ED, AD>();
    basicFeatures.runningNode.setStorageSchema(storageSchema);

    const userDefinedfeatures = createFeatures(basicFeatures);

    const intersect = intersection(keys(basicFeatures), keys(userDefinedfeatures));
    if (intersect.length > 0) {
        throw new Error(`用户定义的feature中不能和系统feature同名：「${intersect.join(',')}」`);
    }
    const features = assign(basicFeatures, userDefinedfeatures);

    const cacheStore = new CacheStore<ED>(storageSchema);
    const context = new FrontContext(cacheStore);

    // todo default triggers
    const aspectProxy = createAspectProxy<ED, AD, FD>(context, storageSchema, triggers || [],
        applicationId, features, aspectDict, initialData);

    keys(features).forEach(
        ele => {
            features[ele].setAspectProxy(aspectProxy);
            features[ele].setContext(context);
        }
    );


    return {
        subscribe,
        features,
        getContext: () => context as FrontContext<ED>,
    };
}



export * from './features/node';
export * from './FrontContext';
export * from './types/Feature';
export * from './types/Pagination';
export * from './features/cache';
export * from './features';