import { DebugStore } from 'oak-debug-store';
import { EntityDef } from "oak-domain/lib/types/Entity";
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { TriggerEntityShape } from "oak-domain/lib/types/Trigger";
export declare function createDebugStore<E extends string, ED extends {
    [K in E]: EntityDef<E, ED, K, SH>;
}, SH extends TriggerEntityShape = TriggerEntityShape>(storageSchema: StorageSchema, initialData?: {
    [T in E]?: {
        [ID: string]: ED[T]['OpSchema'];
    };
}): DebugStore<E, ED, SH>;
export * from './context';
