import { assign } from 'lodash';
import { DebugStore } from './debugStore';
import { DebugContext } from './context';
import { FormCreateData, Selection, EntityDict } from "oak-domain/lib/types/Entity";
import { BaseEntityDict as BaseEntityDict } from 'oak-general-business/lib/base-ed/EntityDict';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Checker, Trigger, TriggerExecutor } from 'oak-general-business';
import { data as generalData, triggers as generalTriggers, checkers as generalCheckers } from 'oak-general-business';

async function initDataInStore<ED extends EntityDict & BaseEntityDict>(store: DebugStore<ED>, initialData?: {
    [T in keyof ED]?: Array<FormCreateData<ED[T]['OpSchema']>>;
}) {
    if (false) {
        // todo 在不同环境下读取相应的store数据并初始化
    }
    else {
        const context = new DebugContext(store);
        await context.begin();
        if (initialData) {
            for (const entity in initialData) {
                await store.operate(entity, {
                    action: 'create',
                    data: initialData[entity]!,
                }, context);
            }
        }
        for (const entity in (generalData as typeof initialData)) {
            await store.operate(entity, {
                action: 'create',
                data: (generalData as typeof initialData)![entity]!,
            }, context); 
        }
        await context.commit();
    }
}


export function createDebugStore<ED extends EntityDict & BaseEntityDict>(
    storageSchema: StorageSchema<ED>,
    triggers?: Array<Trigger<ED, keyof ED>>,
    checkers?: Array<Checker<ED, keyof ED>>,
    initialData?: {
    [T in keyof ED]?: Array<FormCreateData<ED[T]['OpSchema']>>;
}){
    const executor = new TriggerExecutor<ED>();
    const store = new DebugStore<ED>(executor, storageSchema);
    
    (generalTriggers).forEach(
        ele => store.registerTrigger(ele as any)
    );
    triggers?.forEach(
        ele => store.registerTrigger(ele)
    );

    generalCheckers.forEach(
        ele => store.registerChecker(ele as any)
    );
    checkers?.forEach(
        ele => store.registerChecker(ele)
    );

    // 如果有物化存储的数据使用此数据，否则使用initialData初始化debugStore
    initDataInStore(store, initialData);    
    return store;
}

export * from '../cacheStore/context';