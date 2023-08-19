import {
    Aspect,
    AspectWrapper,
    Checker,
    StorageSchema,
    Connector,
} from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types/Entity';

import { initializeStep1 as initBasicFeaturesStep1, initializeStep2 as initBasicFeaturesStep2 } from './features';
import { makeIntrinsicCTWs } from 'oak-domain/lib/store/actionDef';
import { CommonAspectDict } from 'oak-common-aspect';
import { CacheStore } from './cacheStore/CacheStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { InitializeOptions } from './types/Initialize';

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
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>
>(
    storageSchema: StorageSchema<ED>,
    frontendContextBuilder: () => (store: CacheStore<ED, FrontCxt>) => FrontCxt,
    connector: Connector<ED, Cxt, FrontCxt>,
    checkers: Array<Checker<ED, keyof ED, FrontCxt | Cxt>>,
    option: InitializeOptions<ED>
) {
    const {  actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, actionDict, 
        selectFreeEntities, createFreeEntities, updateFreeEntities, colorDict } = option;


    const { checkers: intCheckers } = makeIntrinsicCTWs<ED, Cxt, FrontCxt>(storageSchema, actionDict);
    const checkers2 = checkers.concat(intCheckers);

    const features1 = initBasicFeaturesStep1();

    const cacheStore = new CacheStore<ED, FrontCxt>(
        storageSchema,
    );

    const wrapper: AspectWrapper<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> = {
        exec: async (name, params) => {
            const context = frontendContextBuilder()(cacheStore);
            const { result, opRecords, message } = await connector.callAspect(name as string, params, context);
            return {
                result,
                opRecords,
                message,
            };
        },
    };

    const features2 = initBasicFeaturesStep2<ED, Cxt, FrontCxt, CommonAspectDict<ED, Cxt> & AD>(
        features1,
        wrapper, 
        storageSchema, 
        () => frontendContextBuilder()(cacheStore), 
        cacheStore, 
        actionCascadePathGraph,
        relationCascadePathGraph,
        authDeduceRelationMap,
        selectFreeEntities,
        createFreeEntities,
        updateFreeEntities,
        colorDict,
        () => '请查看数据库中的数据',
        (url, headers) => connector.makeBridgeUrl(url, headers)
    );

    checkers2.forEach((checker) => cacheStore.registerChecker(checker));

    const features = Object.assign(features1, features2);
    return {
        features,
    };
}
