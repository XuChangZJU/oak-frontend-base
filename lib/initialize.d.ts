import { Aspect, Checker, Trigger, StorageSchema, Context, RowStore } from "oak-domain/lib/types";
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { Feature, subscribe } from './types/Feature';
import { BasicFeatures } from './features';
export declare function initialize<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>>(storageSchema: StorageSchema<ED>, createFeatures: (basicFeatures: BasicFeatures<ED, Cxt, AD>) => FD, createContext: (store: RowStore<ED>) => Cxt, triggers?: Array<Trigger<ED, keyof ED>>, checkers?: Array<Checker<ED, keyof ED>>, aspectDict?: AD, initialData?: {
    [T in keyof ED]?: Array<ED[T]['OpSchema']>;
}): {
    subscribe: typeof subscribe;
    features: BasicFeatures<ED, Cxt, AD> & FD;
};
export * from './types/Feature';
export * from './types/Pagination';
