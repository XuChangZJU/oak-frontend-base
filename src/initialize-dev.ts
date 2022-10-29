import {
    Aspect,
    AspectWrapper,
    Checker,
    Trigger,
    StorageSchema,
    Context,
    RowStore,
    OakRowInconsistencyException,
    Watcher,
} from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { createDynamicCheckers } from 'oak-domain/lib/checkers/index';
import { createDynamicTriggers } from 'oak-domain/lib/triggers/index';

import { Feature } from './types/Feature';
import { createDebugStore, clearMaterializedData } from './debugStore';

import { BasicFeatures, initialize as initBasicFeatures } from './features';
import { intersection } from 'oak-domain/lib/utils/lodash';
import commonAspectDict from 'oak-common-aspect';
import { ActionDictOfEntityDict } from 'oak-domain/lib/types/Action';
import { analyzeActionDefDict } from 'oak-domain/lib/store/actionDef';
import { CommonAspectDict } from 'oak-common-aspect';
import { CacheStore } from './cacheStore/CacheStore';

/**
 * @param storageSchema
 * @param createFeatures
 * @param contextBuilder
 * @param context
 * @param triggers
 * @param checkers
 * @param watchers
 * @param aspectDict
 * @param initialData
 * @param actionDict
 * @returns
 */
export function initialize<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends Context<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>,
    FD extends Record<string, Feature>
>(
    storageSchema: StorageSchema<ED>,
    createFeatures: (
        aspectWrapper: AspectWrapper<ED, Cxt, AD>,
        basicFeatures: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>,
    ) => FD,
    frontendContextBuilder: (features: FD & BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>) => (store: RowStore<ED, Cxt>) => Cxt,
    backendContextBuilder: (contextStr?: string) => (store: RowStore<ED, Cxt>) =>  Promise<Cxt>,
    aspectDict: AD,
    triggers?: Array<Trigger<ED, keyof ED, Cxt>>,
    checkers?: Array<Checker<ED, keyof ED, Cxt>>,
    watchers?: Array<Watcher<ED, keyof ED, Cxt>>,
    initialData?: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    },
    actionDict?: ActionDictOfEntityDict<ED>
) {
    let intersected = intersection(Object.keys(commonAspectDict), Object.keys(aspectDict));
    if (intersected.length > 0) {
        throw new Error(
            `用户定义的aspect中不能和系统aspect同名：「${intersected.join(',')}」`
        );
    }
    const aspectDict2 = Object.assign({}, aspectDict, commonAspectDict);
    const checkers2 = createDynamicCheckers<ED, Cxt>(storageSchema).concat(checkers || []);
    const triggers2 = createDynamicTriggers<ED, Cxt>(storageSchema).concat(triggers || []);
    const debugStore = createDebugStore(
        storageSchema,
        backendContextBuilder,
        triggers2,
        checkers2,
        watchers || [],
        initialData,
        actionDict
    );

    const features = {} as FD & BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>;

    const cacheStore = new CacheStore(
        storageSchema,
        () => frontendContextBuilder(features),
        () => debugStore.getCurrentData(),
        () => clearMaterializedData(),
    );
    
    const wrapper: AspectWrapper<ED, Cxt, CommonAspectDict<ED, Cxt> & AD> = {
        exec: async (name, params) => {
            const context = frontendContextBuilder(features)(cacheStore);
            const str = await context.toString();
            const contextBackend = await backendContextBuilder(str)(debugStore);
            await contextBackend.begin();
            let result;
            try {
                result = await aspectDict2[name](params, contextBackend);
                await contextBackend.commit();
            } catch (err) {
                await contextBackend.rollback();
                throw err;
            }
            return {
                result,
                opRecords: contextBackend.opRecords,
            };
        },
    };

    const basicFeatures = initBasicFeatures(wrapper, storageSchema, () => frontendContextBuilder(features)(cacheStore), cacheStore);
    const userDefinedfeatures = createFeatures(wrapper, basicFeatures);

    intersected = intersection(Object.keys(basicFeatures), Object.keys(userDefinedfeatures));
    if (intersected.length > 0) {
        throw new Error(
            `用户定义的feature中不能和系统feature同名：「${intersected.join(
                ','
            )}」`
        );
    }
    Object.assign(features, basicFeatures, userDefinedfeatures);

    checkers2.forEach((checker) => cacheStore.registerChecker(checker));
    if (actionDict) {
        const { checkers: adCheckers } = analyzeActionDefDict(
            storageSchema,
            actionDict
        );
        adCheckers.forEach((checker) => cacheStore.registerChecker(checker));
    }

    return {
        features,
    };
}
