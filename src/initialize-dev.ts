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

import { initialize as createBasicFeatures, BasicFeatures } from './features';
import { intersection } from 'oak-domain/lib/utils/lodash';
import commonAspectDict from 'oak-common-aspect';
import { ActionDictOfEntityDict } from 'oak-domain/lib/types/Action';
import { analyzeActionDefDict } from 'oak-domain/lib/store/actionDef';
import { CommonAspectDict } from 'oak-common-aspect';
import { CacheStore } from './cacheStore/CacheStore';

/**
 * dev模式下，前后端可以使用同一个Cxt，内部自己区分
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
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>
>(
    storageSchema: StorageSchema<ED>,
    createFeatures: (
        aspectWrapper: AspectWrapper<ED, Cxt, AD>,
        basicFeatures: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>,
        context: Cxt
    ) => FD,
    contextBuilder: (cxtString?: string) => (store: RowStore<ED, Cxt>) => Cxt,
    aspectDict: AD,
    triggers?: Array<Trigger<ED, keyof ED, Cxt>>,
    checkers?: Array<Checker<ED, keyof ED, Cxt>>,
    watchers?: Array<Watcher<ED, keyof ED, Cxt>>,
    initialData?: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    },
    actionDict?: ActionDictOfEntityDict<ED>
) {
    let intersect = intersection(Object.keys(commonAspectDict), Object.keys(aspectDict));
    if (intersect.length > 0) {
        throw new Error(
            `用户定义的aspect中不能和系统aspect同名：「${intersect.join(',')}」`
        );
    }
    const aspectDict2 = Object.assign({}, commonAspectDict, aspectDict);
    const checkers2 = createDynamicCheckers<ED, Cxt>(storageSchema).concat(checkers || []);
    const triggers2 = createDynamicTriggers<ED, Cxt>(storageSchema).concat(triggers || []);
    const debugStore = createDebugStore(
        storageSchema,
        contextBuilder,
        triggers2,
        checkers2,
        watchers || [],
        initialData,
        actionDict
    );

    const cacheStore = new CacheStore(
        storageSchema,
        contextBuilder,
        () => debugStore.getCurrentData(),
        () => clearMaterializedData(),
    );
    checkers2.forEach((checker) => cacheStore.registerChecker(checker));
    if (actionDict) {
        const { checkers: adCheckers } = analyzeActionDefDict(
            storageSchema,
            actionDict
        );
        adCheckers.forEach((checker) => cacheStore.registerChecker(checker));
    }
    const context = contextBuilder()(cacheStore);

    const wrapper: AspectWrapper<ED, Cxt, typeof aspectDict2> = {
        exec: async (name, params) => {
            const str = await context.toString();
            const contextBackend = contextBuilder(str)(debugStore);
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

    const basicFeatures = createBasicFeatures<ED, Cxt, typeof aspectDict2>(
        wrapper,
        storageSchema,
        context,
        cacheStore,
        () => contextBuilder()(cacheStore)
    );

    // basicFeatures.runningNode.setStorageSchema(storageSchema);

    const userDefinedFeatures = createFeatures(wrapper, basicFeatures, context);

    intersect = intersection(
        Object.keys(basicFeatures),
        Object.keys(userDefinedFeatures)
    );
    if (intersect.length > 0) {
        throw new Error(
            `用户定义的feature中不能和系统feature同名：「${intersect.join(
                ','
            )}」`
        );
    }
    const features = Object.assign(basicFeatures, userDefinedFeatures);

    return {
        features,
        context,
    };
}
