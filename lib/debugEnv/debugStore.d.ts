import { DebugStore } from 'oak-debug-store';
import { EntityDef } from "oak-domain/lib/types/Entity";
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Trigger } from "oak-domain/lib/types/Trigger";
export declare function createDebugStore<ED extends {
    [E: string]: EntityDef;
}>(storageSchema: StorageSchema<ED>, triggers: Array<Trigger<ED, keyof ED>>, initialData?: {
    [T in keyof ED]?: {
        [ID: string]: ED[T]['OpSchema'];
    };
}): DebugStore<ED>;
