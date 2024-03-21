import {
    Aspect,
    AspectWrapper,
    Checker,
    StorageSchema,
    Connector,
} from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict, OpRecord, SubDataDef } from 'oak-domain/lib/types/Entity';

import { initializeStep1 as initBasicFeaturesStep1, initializeStep2 as initBasicFeaturesStep2 } from './features';
import { makeIntrinsicCheckers } from 'oak-domain/lib/store/IntrinsicCheckers';
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
    connector: Connector<ED, FrontCxt>,
    checkers: Array<Checker<ED, keyof ED, FrontCxt | Cxt>>,
    option: InitializeOptions<ED, Cxt>
) {
    const { authDeduceRelationMap, actionDict, selectFreeEntities, updateFreeDict, colorDict, cacheKeepFreshPeriod, cacheSavedEntities } = option;

    const intrinsicCheckers = makeIntrinsicCheckers<ED, Cxt, FrontCxt>(storageSchema, actionDict);
    const checkers2 = checkers.concat(intrinsicCheckers);

    const features1 = initBasicFeaturesStep1();

    const wrapper: AspectWrapper<ED, Cxt, AD & CommonAspectDict<ED, Cxt>> = {
        exec: async (name, params, ignoreContext) => {
            const context = ignoreContext ? undefined : features2.cache.getContext();
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
        frontendContextBuilder,
        checkers2,
        authDeduceRelationMap,
        colorDict,
        () => '请查看数据库中的数据',
        () => connector.getSubscribePoint(),
        (url, headers) => connector.makeBridgeUrl(url, headers),
        selectFreeEntities,
        updateFreeDict,
        cacheSavedEntities,
        cacheKeepFreshPeriod
    );

    const features = Object.assign(features1, features2);
    return {
        features,
    };
}
