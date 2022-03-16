import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DebugStore } from 'oak-debug-store';
import { EntityDef, Selection, SelectionResult } from "oak-domain/lib/types/Entity";
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Trigger, TriggerEntityShape } from "oak-domain/lib/types/Trigger";
import { TriggerExecutor } from 'oak-trigger-executor';


export function createDebugStore<ED extends {
    [E: string]: EntityDef;
}>(storageSchema: StorageSchema<ED>, triggers: Array<Trigger<ED, keyof ED>>, initialData?: {
    [T in keyof ED]?: {
        [ID: string]: ED[T]['OpSchema'];
    };
}) {
    const executor = new TriggerExecutor<ED>();
    // todo 这里需要恢复前端物化的缓存数据，在没有情况下再使用initialData;
    const store = new DebugStore<ED>(executor, storageSchema, initialData);
    triggers.forEach(
        (trigger) => store.registerTrigger(trigger)
    );
    return store;
}
