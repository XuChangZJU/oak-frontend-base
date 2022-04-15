import { DebugStore } from './debugStore';
import { Checker, Trigger, StorageSchema, FormCreateData, Context, EntityDict, RowStore } from "oak-domain/lib/types";
import {  } from 'oak-domain/lib/types';
import {  TriggerExecutor } from 'oak-domain/lib/store/TriggerExecutor';

async function initDataInStore<ED extends EntityDict, Cxt extends Context<ED>>(store: DebugStore<ED>, createContext: (store: RowStore<ED>) => Cxt, initialData?: {
    [T in keyof ED]?: Array<FormCreateData<ED[T]['OpSchema']>>;
}) {
    if (false) {
        // todo 在不同环境下读取相应的store数据并初始化
    }
    else {
        const context = createContext(store);
        await context.begin();
        if (initialData) {
            for (const entity in initialData) {
                await store.operate(entity, {
                    action: 'create',
                    data: initialData[entity]!,
                }, context);
            }
        }
        await context.commit();
    }
}


export function createDebugStore<ED extends EntityDict, Cxt extends Context<ED>>(
    storageSchema: StorageSchema<ED>,
    createContext: (store: RowStore<ED>) => Cxt,
    triggers?: Array<Trigger<ED, keyof ED>>,
    checkers?: Array<Checker<ED, keyof ED>>,
    initialData?: {
    [T in keyof ED]?: Array<FormCreateData<ED[T]['OpSchema']>>;
}){
    const executor = new TriggerExecutor<ED>();
    const store = new DebugStore<ED>(executor, storageSchema);
    
    triggers?.forEach(
        ele => store.registerTrigger(ele)
    );

    checkers?.forEach(
        ele => store.registerChecker(ele)
    );

    // 如果有物化存储的数据使用此数据，否则使用initialData初始化debugStore
    initDataInStore(store, createContext, initialData);    
    return store;
}
