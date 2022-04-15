import { Aspect, Checker, Trigger, StorageSchema, Context, RowStore } from "oak-domain/lib/types";
import { EntityDict, FormCreateData } from 'oak-domain/lib/types/Entity';

import { Feature, subscribe } from './types/Feature';
import { createDebugStore } from './debugStore';

import { initialize as createBasicFeatures, BasicFeatures } from './features';
import { assign, intersection, keys, mapValues } from 'lodash';
import { AspectProxy } from './types/AspectProxy';
import baseAspectDict from './aspects';

function createAspectProxy<ED extends EntityDict, Cxt extends Context<ED>, 
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature<ED, Cxt, AD>>>(
        storageSchema: StorageSchema<ED>,
        createContext: (store: RowStore<ED>) => Cxt,
        triggers: Array<Trigger<ED, keyof ED>>,
        checkers: Array<Checker<ED, keyof ED>>,
        features: BasicFeatures<ED, Cxt, AD> & FD,
        aspectDict?: AD,
        initialData?: {
            [T in keyof ED]?: Array<FormCreateData<ED[T]['OpSchema']>>;
        }): AspectProxy<ED, Cxt, AD & typeof baseAspectDict> {
    if (process.env.NODE_ENV === 'production') {
        // todo 发请求到后台获取数据
        throw new Error('method not implemented');
    }
    else {
        // todo initialData
        const debugStore = createDebugStore(storageSchema, createContext, triggers, checkers, initialData);       

        const connectAspectToDebugStore = (aspect: Aspect<ED, Cxt>): (p: Parameters<typeof aspect>[0]) => ReturnType<typeof aspect> => {
            return async (params: Parameters<typeof aspect>[0]) => {
                const runningContext = createContext(debugStore);
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

        const aspectProxy = mapValues(assign({}, baseAspectDict, aspectDict), ele => connectAspectToDebugStore(ele));

        return aspectProxy as any;
    }
}


export function initialize<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>>(
    storageSchema: StorageSchema<ED>,
    createFeatures: (basicFeatures: BasicFeatures<ED, Cxt, AD>) => FD,
    createContext: (store: RowStore<ED>) => Cxt,
    triggers?: Array<Trigger<ED, keyof ED>>,
    checkers?: Array<Checker<ED, keyof ED>>,
    aspectDict?: AD,
    initialData?: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    }) {
    const basicFeatures = createBasicFeatures<ED, Cxt, AD>(storageSchema, createContext, checkers);
    basicFeatures.runningNode.setStorageSchema(storageSchema);

    const userDefinedfeatures = createFeatures(basicFeatures);

    const intersect = intersection(keys(basicFeatures), keys(userDefinedfeatures));
    if (intersect.length > 0) {
        throw new Error(`用户定义的feature中不能和系统feature同名：「${intersect.join(',')}」`);
    }
    const features = assign(basicFeatures, userDefinedfeatures);


    // todo default triggers
    const aspectProxy = createAspectProxy<ED, Cxt, AD, FD>(storageSchema, createContext, triggers || [], checkers || [],
        features, aspectDict, initialData);


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



export * from './types/Feature';
export * from './types/Pagination';
