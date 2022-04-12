import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Checker, Trigger } from "oak-general-business";
import { BaseEntityDict as BaseEntityDict } from 'oak-general-business/lib/base-ed/EntityDict';
import { aspectDict as basicAspectDict } from 'oak-general-business';

import { Aspect } from 'oak-general-business';
import { Feature, subscribe } from './types/Feature';
import { createDebugStore } from './debugStore';

import { initialize as createBasicFeatures, BasicFeatures } from './features/index';
import { assign, intersection, keys, mapValues } from 'lodash';
import { EntityDict, FormCreateData } from 'oak-domain/lib/types/Entity';
import { DebugContext } from './debugStore/context';
import { AspectProxy } from './types/AspectProxy';
import { CacheStore } from './cacheStore/CacheStore';

function createAspectProxy<ED extends BaseEntityDict & EntityDict,
    AD extends Record<string, Aspect<ED>>,
    FD extends Record<string, Feature<ED, AD>>>(
        storageSchema: StorageSchema<ED>,
        triggers: Array<Trigger<ED, keyof ED>>,
        checkers: Array<Checker<ED, keyof ED>>,
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
        const debugStore = createDebugStore(storageSchema, triggers, checkers, initialData);       

        const connectAspectToDebugStore = (aspect: Aspect<ED>): (p: Parameters<typeof aspect>[0]) => ReturnType<typeof aspect> => {
            return async (params: Parameters<typeof aspect>[0]) => {
                const tokenValue = features.cache.getTokenValue();

                const runningContext = new DebugContext(debugStore, applicationId, tokenValue);
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
    checkers?: Array<Checker<ED, keyof ED>>,
    aspectDict?: AD,
    initialData?: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    }) {
    const basicFeatures = createBasicFeatures<ED, AD>(storageSchema, applicationId, checkers);
    basicFeatures.runningNode.setStorageSchema(storageSchema);

    const userDefinedfeatures = createFeatures(basicFeatures);

    const intersect = intersection(keys(basicFeatures), keys(userDefinedfeatures));
    if (intersect.length > 0) {
        throw new Error(`用户定义的feature中不能和系统feature同名：「${intersect.join(',')}」`);
    }
    const features = assign(basicFeatures, userDefinedfeatures);


    // todo default triggers
    const aspectProxy = createAspectProxy<ED, AD, FD>(storageSchema, triggers || [], checkers || [],
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
export * from './types/Feature';
export * from './types/Pagination';
export * from './features/cache';
export * from './features';