import { Aspect, Checker, Trigger, StorageSchema, Context, RowStore } from "oak-domain/lib/types";
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { Feature, subscribe } from './types/Feature';
import { BasicFeatures } from './features';
import { ActionDictOfEntityDict } from "oak-domain/lib/types/Action";
export declare function initialize<ED extends EntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature<ED, Cxt, AD>>>(storageSchema: StorageSchema<ED>, createFeatures: (basicFeatures: BasicFeatures<ED, Cxt, AD>) => FD, createContext: (store: RowStore<ED, Cxt>, scene: string) => Cxt, triggers?: Array<Trigger<ED, keyof ED, Cxt>>, checkers?: Array<Checker<ED, keyof ED, Cxt>>, aspectDict?: AD, initialData?: {
    [T in keyof ED]?: Array<ED[T]['OpSchema']>;
}, actionDict?: ActionDictOfEntityDict<ED>): {
    subscribe: typeof subscribe;
    features: BasicFeatures<ED, Cxt, AD> & FD;
};
export * from './types/Feature';
export * from './types/Pagination';
