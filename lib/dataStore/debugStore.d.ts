import { DebugStore } from 'oak-debug-store';
import { EntityDef } from "oak-domain/lib/types/Entity";
import { StorageSchema } from 'oak-domain/lib/types/Storage';
export declare function createDebugStore<ED extends {
    [E: string]: EntityDef;
}>(storageSchema: StorageSchema<ED>, initialData?: {
    [T in keyof ED]?: {
        [ID: string]: ED[T]['OpSchema'];
    };
}): DebugStore<ED>;
export * from './context';
