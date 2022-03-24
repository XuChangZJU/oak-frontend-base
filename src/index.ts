import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Trigger } from "oak-domain/lib/types/Trigger";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { aspectDict as basicAspectDict } from 'oak-general-business';

import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Feature } from './types/Feature';

import { initialize as createBasicFeatures, Actions as FeatureActions, BasicFeatures } from './features/index';
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

async function createAspectProxy<ED extends BaseEntityDict & EntityDict,
    AD extends Record<string, Aspect<ED>>,
    FD extends Record<string, Feature<ED, AD>>>(
        frontContext: FrontContext<ED>,
        storageSchema: StorageSchema<ED>,
        triggers: Array<Trigger<ED, keyof ED>>,
        applicationId: string,
        features: BasicFeatures<ED, AD> & FD,
        aspectDict?: AD,
        initialData?: {
            [T in keyof ED]?: Array<ED[T]['OpSchema']>;
        }): Promise<AspectProxy<ED, AD & typeof basicAspectDict>> {
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
        const context = new Context(debugStore);

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
        const getApplication = () => application as Application;

        const connectAspectToDebugStore = async (aspect: Aspect<ED>) => {
            const context2 = new Context(debugStore);

            const tokenValue = features.token.getValue();
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
            const runningContext = new DebugRunningContext(debugStore, getApplication, getToken);
            const result = (params: Parameters<typeof aspect>[0]) => aspect(params, runningContext);

            frontContext.rowStore.sync(runningContext.opRecords, frontContext);
            return result;
        };

        const aspectDict2 = assign({}, basicAspectDict, aspectDict);
        const aspectProxy = mapValues(aspectDict2, ele => connectAspectToDebugStore(ele));

        return aspectProxy as any;
    }
}

export async function initialize<
    ED extends EntityDict & BaseEntityDict,
    AD extends Record<string, Aspect<ED>>,
    FD extends Record<string, Feature<ED, AD>>,
    FAD extends {
        [F in keyof FD]: {
            [M: string]: (...params: any) => any;
        };
    }>(
        storageSchema: StorageSchema<ED>,
        applicationId: string,
        createFeatures: (basicFeatures: BasicFeatures<ED, AD>) => FD,
        triggers?: Array<Trigger<ED, keyof ED>>,
        aspectDict?: AD,
        initialData?: {
            [T in keyof ED]?: Array<ED[T]['OpSchema']>;
        }) {

    const basicFeatures = createBasicFeatures<ED, AD>();
    const userDefinedfeatures = createFeatures(basicFeatures);

    const intersect = intersection(keys(basicFeatures), keys(userDefinedfeatures));
    if (intersect.length > 0) {
        throw new Error(`用户定义的feature中不能和系统feature同名：「${intersect.join(',')}」`);
    }
    const features = assign(basicFeatures, userDefinedfeatures);

    const cacheStore = new CacheStore<ED>(storageSchema);
    const frontContext = new FrontContext<ED>(cacheStore);

    // todo default triggers
    const aspectProxy = await createAspectProxy<ED, AD, FD>(frontContext, storageSchema, triggers!, applicationId, features, aspectDict, initialData);

    keys(features).forEach(
        ele => {
            features[ele].setAspectProxy(aspectProxy);
            features[ele].setFrontContext(frontContext);
        }
    );

    const callbacks: Array<() => void> = [];

    const subscribe = (callback: () => void) => {
        callbacks.push(callback);
        return () => {
            pull(callbacks, callback);
        };
    };

    /**
     * 这里的封装不够优雅，以后再优化
     * @param name 
     * @param method 
     * @param params 
     * @returns 
     */
    const action = async <F extends keyof (FeatureActions<ED, AD> & FAD),
        M extends keyof ((FeatureActions<ED, AD> & FAD)[F])>(
            name: F,
            method: M,
            ...params: Parameters<(FeatureActions<ED, AD> & FAD)[F][M]>): Promise<ReturnType<(FeatureActions<ED, AD> & FAD)[F][M]>> => {
        await frontContext.begin();
        try {
            const feature = features[name as any] as any;
            const result = feature[method](...(params as any));
            frontContext.commit();
            callbacks.forEach(
                ele => ele()
            );            
            return result;
        }
        catch(err) {
            frontContext.rollback();
            callbacks.forEach(
                ele => ele()
            );
            throw err;
        }
    };

    return {
        subscribe,
        action,
    };
}
