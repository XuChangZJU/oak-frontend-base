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

import { initialize as createBasicFeatures, BasicFeatures } from './features';
import { intersection } from 'oak-domain/lib/utils/lodash';
import { ActionDictOfEntityDict } from 'oak-domain/lib/types/Action';
import { analyzeActionDefDict } from 'oak-domain/lib/store/actionDef';
import { CommonAspectDict } from 'oak-common-aspect';
import { CacheStore } from './cacheStore/CacheStore';
import { createCheckers } from 'oak-domain/lib/checkers';


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
        context: Cxt
    ) => FD,
    contextBuilder: (cxtString?: string) => (store: RowStore<ED, Cxt>) => Cxt,
    connector: Connector<ED, Cxt>,
    checkers?: Array<Checker<ED, keyof ED, Cxt>>,
    actionDict?: ActionDictOfEntityDict<ED>
) {
    const cacheStore = new CacheStore(storageSchema, contextBuilder);
    const checkers2 = createCheckers<ED, Cxt>(storageSchema).concat(checkers || []);
    checkers2.forEach((checker) => cacheStore.registerChecker(checker));
    if (actionDict) {
        const { checkers: adCheckers } = analyzeActionDefDict(
            storageSchema,
            actionDict
        );
        adCheckers.forEach((checker) => cacheStore.registerChecker(checker));
    }
    const context = contextBuilder()(cacheStore);

    const wrapper: AspectWrapper<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> = {
        exec: async (name, params) => {
            const { result, opRecords } = await connector.callAspect(name as string, params, context);
            return {
                result,
                opRecords,
            };
        },
    };

    const basicFeatures = createBasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>(
        wrapper,
        storageSchema,
        context,
        cacheStore,
        () => contextBuilder()(cacheStore)
    );

    // basicFeatures.runningNode.setStorageSchema(storageSchema);

    const userDefinedfeatures = createFeatures(wrapper, basicFeatures, context);

    const intersect = intersection(Object.keys(basicFeatures), Object.keys(userDefinedfeatures));
    if (intersect.length > 0) {
        throw new Error(
            `用户定义的feature中不能和系统feature同名：「${intersect.join(
                ','
            )}」`
        );
    }
    const features = Object.assign(basicFeatures, userDefinedfeatures);

    return {
        features,
        context,
    };
}
