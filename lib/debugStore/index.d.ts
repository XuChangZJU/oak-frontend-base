import { DebugStore } from './debugStore';
import { Checker, Trigger, StorageSchema, FormCreateData, Context, EntityDict, RowStore } from "oak-domain/lib/types";
export declare function createDebugStore<ED extends EntityDict, Cxt extends Context<ED>>(storageSchema: StorageSchema<ED>, createContext: (store: RowStore<ED, Cxt>) => Cxt, triggers?: Array<Trigger<ED, keyof ED, Cxt>>, checkers?: Array<Checker<ED, keyof ED, Cxt>>, initialData?: {
    [T in keyof ED]?: Array<FormCreateData<ED[T]['OpSchema']>>;
}): DebugStore<ED, Cxt>;
