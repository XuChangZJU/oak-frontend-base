import { DebugStore } from './debugStore';
import { FormCreateData, EntityDict } from "oak-domain/lib/types/Entity";
import { EntityDict as BaseEntityDict } from 'oak-general-business/lib/base-ed/EntityDict';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Trigger } from 'oak-domain/lib/types/Trigger';
export declare function createDebugStore<ED extends EntityDict & BaseEntityDict>(storageSchema: StorageSchema<ED>, triggers?: Array<Trigger<ED, keyof ED>>, initialData?: {
    [T in keyof ED]?: Array<FormCreateData<ED[T]['OpSchema']>>;
}): DebugStore<ED>;
export * from '../cacheStore/context';
