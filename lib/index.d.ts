import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Trigger } from "oak-domain/lib/types/Trigger";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Feature } from './types/Feature';
import { Actions as FeatureActions, BasicFeatures } from './features/index';
import { EntityDict } from 'oak-domain/lib/types/Entity';
export declare function initialize<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>, FD extends Record<string, Feature<ED, AD>>, FAD extends {
    [F in keyof FD]: {
        [M: string]: (...params: any) => any;
    };
}>(storageSchema: StorageSchema<ED>, applicationId: string, createFeatures: (basicFeatures: BasicFeatures<ED, AD>) => FD, triggers?: Array<Trigger<ED, keyof ED>>, aspectDict?: AD, initialData?: {
    [T in keyof ED]?: Array<ED[T]['OpSchema']>;
}): Promise<{
    subscribe: (callback: () => void) => () => void;
    action: <F extends keyof FeatureActions<ED, AD> | keyof FAD, M extends keyof (FeatureActions<ED, AD> & FAD)[F]>(name: F, method: M, ...params: Parameters<(FeatureActions<ED, AD> & FAD)[F][M]>) => Promise<ReturnType<(FeatureActions<ED, AD> & FAD)[F][M]>>;
    features: BasicFeatures<ED, AD> & FD;
}>;
