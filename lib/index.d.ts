import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Trigger } from "oak-domain/lib/types/Trigger";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Feature } from './types/Feature';
import { BasicFeatures } from './features/index';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { FrontContext } from './FrontContext';
export declare function initialize<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>, FD extends Record<string, Feature<ED, AD>>>(storageSchema: StorageSchema<ED>, applicationId: string, createFeatures: (basicFeatures: BasicFeatures<ED, AD>) => FD, getRandomNumber: (length: number) => Promise<Uint8Array>, triggers?: Array<Trigger<ED, keyof ED>>, aspectDict?: AD, initialData?: {
    [T in keyof ED]?: Array<ED[T]['OpSchema']>;
}): Promise<{
    subscribe: (callback: () => void) => () => void;
    features: BasicFeatures<ED, AD> & FD;
    createContext: () => FrontContext<ED>;
}>;
export * from './features/node';
export * from './FrontContext';
export * from './types/Feature';
export * from './features/cache';
export * from './features';
