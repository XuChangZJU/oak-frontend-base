import {
    Aspect,
    AspectWrapper,
    Checker,
    Trigger,
    StorageSchema,
    Watcher,
    Routine,
    Timer,
} from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict, OpRecord, SubDataDef } from 'oak-domain/lib/types/Entity';
import { makeIntrinsicCTWs } from 'oak-domain/lib/store/actionDef';

import { createDebugStore, clearMaterializedData } from './debugStore';

import { initializeStep1 as initBasicFeaturesStep1, initializeStep2 as initBasicFeaturesStep2 } from './features';
import { intersection } from 'oak-domain/lib/utils/lodash';
import commonAspectDict from 'oak-common-aspect';
import { CommonAspectDict, registerPorts } from 'oak-common-aspect';
import { CacheStore } from './cacheStore/CacheStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { DebugStore } from './debugStore/DebugStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
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
    AD extends Record<string, Aspect<ED, Cxt>>,
>(
    storageSchema: StorageSchema<ED>,
    frontendContextBuilder: () => (store: CacheStore<ED, FrontCxt>) => FrontCxt,
    backendContextBuilder: (contextStr?: string) => (store: DebugStore<ED, Cxt>) => Promise<Cxt>,
    aspectDict: AD,
    triggers: Array<Trigger<ED, keyof ED, Cxt>>,
    checkers: Array<Checker<ED, keyof ED, FrontCxt | Cxt>>,
    watchers: Array<Watcher<ED, keyof ED, Cxt>>,
    timers: Array<Timer<ED, Cxt>>,
    startRoutines: Array<Routine<ED, Cxt>>,
    initialData: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    },
    option: InitializeOptions<ED>
) {
    const { actionCascadePathGraph, actionDict, relationCascadePathGraph, authDeduceRelationMap,
        colorDict, importations, exportations, selectFreeEntities, createFreeEntities, updateFreeEntities,
        cacheKeepFreshPeriod, cacheSavedEntities } = option;
    let intersected = intersection(Object.keys(commonAspectDict), Object.keys(aspectDict));
    if (intersected.length > 0) {
        throw new Error(
            `用户定义的aspect中不能和系统aspect同名：「${intersected.join(',')}」`
        );
    }
    const aspectDict2 = Object.assign({}, aspectDict, commonAspectDict);
    const { checkers: intCheckers, triggers: intTriggers, watchers: intWatchers } = makeIntrinsicCTWs<ED, Cxt, FrontCxt>(storageSchema, actionDict);
    const checkers2 = checkers.concat(intCheckers);
    const triggers2 = triggers.concat(intTriggers);
    const watchers2 = watchers.concat(intWatchers);

    const features1 = initBasicFeaturesStep1();

    const debugStore = createDebugStore(
        storageSchema,
        backendContextBuilder,
        triggers2,
        checkers2,
        watchers2,
        timers,
        startRoutines,
        initialData,
        actionDict,
        actionCascadePathGraph,
        relationCascadePathGraph,
        authDeduceRelationMap,
        (key, data) => features1.localStorage.save(key, data),
        (key) => features1.localStorage.load(key),
        selectFreeEntities,
        createFreeEntities,
        updateFreeEntities
    );

    const wrapper: AspectWrapper<ED, Cxt, CommonAspectDict<ED, Cxt> & AD> = {
        exec: async (name, params) => {
            const context = features2.cache.buildContext();
            const str = context.toString();
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
                message: contextBackend.getMessage(),
            };
        },

        /**
         * dev模式下订阅数据没有意义（单用户模式）
         * @param data 
         * @returns 
         */
        sub: function (data: SubDataDef<ED, keyof ED>[], callback: (records: OpRecord<ED>[], ids: string[]) => void): Promise<void> {
            return Promise.resolve();
        },
        unsub: function (ids: string[]): Promise<void> {
            return Promise.resolve();
        },
    };

    const features2 = initBasicFeaturesStep2<ED, Cxt, FrontCxt, CommonAspectDict<ED, Cxt> & AD>(
        features1,
        wrapper,
        storageSchema,
        frontendContextBuilder,
        checkers2,
        actionCascadePathGraph,
        relationCascadePathGraph,
        authDeduceRelationMap,
        colorDict,
        () => debugStore.getCurrentData(),
        undefined,
        selectFreeEntities,
        createFreeEntities,
        updateFreeEntities,
        cacheSavedEntities,
        cacheKeepFreshPeriod
    );


    registerPorts(importations || [], exportations || []);

    const features = Object.assign(features2, features1)
    return {
        features,
    };
}
