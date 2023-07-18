import {
    Aspect,
    AspectWrapper,
    Checker,
    Trigger,
    StorageSchema,
    Watcher,
    Routine,
    Timer,
    AuthDefDict,
} from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { Exportation, Importation  } from 'oak-domain/lib/types/Port';
import { createDynamicCheckers } from 'oak-domain/lib/checkers/index';
import { createDynamicTriggers } from 'oak-domain/lib/triggers/index';

import { ColorDict } from 'oak-domain/lib/types/Style';
import { createDebugStore, clearMaterializedData } from './debugStore';

import { BasicFeatures, initialize as initBasicFeatures } from './features';
import { intersection } from 'oak-domain/lib/utils/lodash';
import commonAspectDict from 'oak-common-aspect';
import { ActionDictOfEntityDict } from 'oak-domain/lib/types/Action';
import { analyzeActionDefDict } from 'oak-domain/lib/store/actionDef';
import { CommonAspectDict, registerPorts } from 'oak-common-aspect';
import { CacheStore } from './cacheStore/CacheStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { DebugStore } from './debugStore/DebugStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';

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
    backendContextBuilder: (contextStr?: string) => (store: DebugStore<ED, Cxt>) =>  Promise<Cxt>,
    aspectDict: AD,
    triggers?: Array<Trigger<ED, keyof ED, Cxt>>,
    checkers?: Array<Checker<ED, keyof ED, FrontCxt | Cxt>>,
    watchers?: Array<Watcher<ED, keyof ED, Cxt>>,
    timers?: Array<Timer<ED, Cxt>>,
    startRoutines?: Array<Routine<ED, Cxt>>,
    initialData?: {
        [T in keyof ED]?: Array<ED[T]['OpSchema']>;
    },
    actionDict?: ActionDictOfEntityDict<ED>,
    authDict?: AuthDefDict<ED>,
    relationDict?: {
        [K in keyof ED]?: {
            [R in NonNullable<ED[K]['Relation']>]?: ED[K]['Relation'][];
        }
    },
    colorDict?: ColorDict<ED>,
    importations?: Importation<ED, keyof ED, any>[],
    exportations?: Exportation<ED, keyof ED, any>[]
) {
    let intersected = intersection(Object.keys(commonAspectDict), Object.keys(aspectDict));
    if (intersected.length > 0) {
        throw new Error(
            `用户定义的aspect中不能和系统aspect同名：「${intersected.join(',')}」`
        );
    }
    const aspectDict2 = Object.assign({}, aspectDict, commonAspectDict);
    const checkers2 = (checkers || []).concat(createDynamicCheckers<ED, Cxt | FrontCxt>(storageSchema, authDict));
    const triggers2 = createDynamicTriggers<ED, Cxt>(storageSchema).concat(triggers || []);
    const debugStore = createDebugStore(
        storageSchema,
        backendContextBuilder,
        triggers2,
        checkers2,
        watchers || [],
        timers,
        startRoutines,
        initialData,
        actionDict
    );

    const cacheStore = new CacheStore(
        storageSchema,
        () => debugStore.getCurrentData(),
        () => clearMaterializedData(),
    );
    
    const wrapper: AspectWrapper<ED, Cxt, CommonAspectDict<ED, Cxt> & AD> = {
        exec: async (name, params) => {
            const context = frontendContextBuilder()(cacheStore);
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
    };

    const features = initBasicFeatures<ED, Cxt, FrontCxt, CommonAspectDict<ED, Cxt> & AD>(wrapper, storageSchema, () => frontendContextBuilder()(cacheStore), cacheStore, relationDict || {}, authDict || {}, colorDict || {});
    
    checkers2.forEach((checker) => cacheStore.registerChecker(checker as Checker<ED, keyof ED, SyncContext<ED>>));
    if (actionDict) {
        const { checkers: adCheckers } = analyzeActionDefDict(
            storageSchema,
            actionDict
        );
        adCheckers.forEach((checker) => cacheStore.registerChecker(checker));
    }

    registerPorts(importations || [], exportations || []);

    return {
        features,
    };
}
