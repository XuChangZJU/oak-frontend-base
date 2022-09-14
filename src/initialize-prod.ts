import {
    Aspect,
    AspectWrapper,
    Checker,
    StorageSchema,
    Context,
    RowStore,
    Connector,
} from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types/Entity';

import { Feature } from './types/Feature';

import { initialize as initBasicFeatures, BasicFeatures } from './features';
import { intersection } from 'oak-domain/lib/utils/lodash';
import { ActionDictOfEntityDict } from 'oak-domain/lib/types/Action';
import { analyzeActionDefDict } from 'oak-domain/lib/store/actionDef';
import { CommonAspectDict } from 'oak-common-aspect';
import { CacheStore } from './cacheStore/CacheStore';
import { createDynamicCheckers } from 'oak-domain/lib/checkers';


function makeContentTypeAndBody(data: any) {
    return {
        contentType: 'application/json',
        body: JSON.stringify(data),
    };
}
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
    FD extends Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>
>(
    storageSchema: StorageSchema<ED>,
    createFeatures: (
        aspectWrapper: AspectWrapper<ED, Cxt, AD>,
        basicFeatures: BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>,
    ) => FD,
    frontendContextBuilder: (features: FD & BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>) => (store: RowStore<ED, Cxt>) => Cxt,
    connector: Connector<ED, Cxt>,
    checkers?: Array<Checker<ED, keyof ED, Cxt>>,
    actionDict?: ActionDictOfEntityDict<ED>
) {
    const checkers2 = createDynamicCheckers<ED, Cxt>(storageSchema).concat(checkers || []);

    const wrapper: AspectWrapper<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> = {
    } as any;

    const basicFeatures = initBasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>(
        wrapper,
        storageSchema
    );

    const userDefinedfeatures = createFeatures(wrapper, basicFeatures);

    const intersected = intersection(Object.keys(basicFeatures), Object.keys(userDefinedfeatures));
    if (intersected.length > 0) {
        throw new Error(
            `用户定义的feature中不能和系统feature同名：「${intersected.join(
                ','
            )}」`
        );
    }
    const features = Object.assign(basicFeatures, userDefinedfeatures);
    const cacheStore = new CacheStore(
        storageSchema,
        () => frontendContextBuilder(features)
    );

    wrapper.exec = async (name, params) => {
        const context = frontendContextBuilder(features)(cacheStore);
        const { result, opRecords } = await connector.callAspect(name as string, params, context);
        return {
            result,
            opRecords,
        };
    },

    // cache这个feature依赖于cacheStore和contextBuilder，后注入
    basicFeatures.cache.init(() => frontendContextBuilder(features)(cacheStore), cacheStore);

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
