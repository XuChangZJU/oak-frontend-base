import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DebugStore } from 'oak-debug-store';
import { EntityDef, Selection, SelectionResult } from "oak-domain/lib/types/Entity";
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Trigger, TriggerEntityShape } from "oak-domain/lib/types/Trigger";
import { TriggerExecutor } from 'oak-trigger-executor';


export function createDebugStore<E extends string, ED extends {
    [K in E]: EntityDef<E, ED, K, SH>;
}, SH extends TriggerEntityShape = TriggerEntityShape>(storageSchema: StorageSchema, initialData?: {
    [T in E]?: {
        [ID: string]: ED[T]['OpSchema'];
    };
}){
    const executor = new TriggerExecutor<E, ED, SH>();
    const store = new DebugStore<E, ED, SH>(executor, storageSchema, initialData);
    return store;
}

export * from './context';