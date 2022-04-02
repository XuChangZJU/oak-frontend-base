import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DebugStore } from 'oak-debug-store';
import { EntityDef, Selection, SelectionResult } from "oak-domain/lib/types/Entity";
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { TriggerExecutor } from 'oak-trigger-executor';


export function createDebugStore<ED extends {
    [E: string]: EntityDef;
}>(storageSchema: StorageSchema<ED>, initialData?: {
    [T in keyof ED]?: {
        [ID: string]: ED[T]['OpSchema'];
    };
}){
    const executor = new TriggerExecutor<ED>();
    const store = new DebugStore<ED>(executor, storageSchema, initialData);
    return store;
}

export * from './context';