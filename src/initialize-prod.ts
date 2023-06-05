import {
    Aspect,
    AspectWrapper,
    Checker,
    StorageSchema,
    Connector,
} from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types/Entity';

import { initialize as initBasicFeatures } from './features';
import { analyzeActionDefDict } from 'oak-domain/lib/store/actionDef';
import { CommonAspectDict } from 'oak-common-aspect';
import { CacheStore } from './cacheStore/CacheStore';
import { createDynamicCheckers } from 'oak-domain/lib/checkers';
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
    const {  actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, actionDict, selectFreeEntities, colorDict } = option;
    const checkers2 = (checkers || []).concat(createDynamicCheckers<ED, Cxt | FrontCxt>(storageSchema));

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

    const features = initBasicFeatures(
        wrapper,
        storageSchema, 
        () => frontendContextBuilder()(cacheStore), 
        cacheStore, 
        actionCascadePathGraph,
        relationCascadePathGraph,
        authDeduceRelationMap,
        selectFreeEntities,
        colorDict
    );

    checkers2.forEach((checker) => cacheStore.registerChecker(checker as Checker<ED, keyof ED, SyncContext<ED>>));
    if (actionDict) {
        const { checkers: adCheckers } = analyzeActionDefDict(
            storageSchema,
            actionDict
        );
        adCheckers.forEach((checker) => cacheStore.registerChecker(checker));
    }
    cacheStore.registerGeneralChecker('relation', (entity, operation, context) => features.relationAuth.checkRelation(entity, operation, context));

    return {
        features,
    };
}
