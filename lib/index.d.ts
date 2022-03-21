import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Trigger } from "oak-domain/lib/types/Trigger";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Feature } from './types/Feature';
import { EntityDict } from 'oak-domain/lib/types/Entity';
export declare function initialize<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>, FD extends Record<string, new <P extends EntityDict & BaseEntityDict, Q extends Record<string, Aspect<P>>>() => Feature<P, Q>>>(storageSchema: StorageSchema<ED>, applicationId: string, featureClazzDict?: FD, triggers?: Array<Trigger<ED, keyof ED>>, aspectDict?: AD, initialData?: {
    [T in keyof ED]?: Array<ED[T]['OpSchema']>;
}): Promise<{
    subscribe: <F extends "token" | keyof FD>(features: F[], callback: () => void) => () => void;
    getFeature: <F_1 extends "token" | keyof FD>(f: F_1, params?: Parameters<InstanceType<FD[F_1]>["get"]>[1] | undefined) => ReturnType<InstanceType<FD[F_1]>["get"]>;
    actionFeature: <F_2 extends "token" | keyof FD>(f: F_2, t: Parameters<InstanceType<FD[F_2]>["action"]>[1], p?: Parameters<InstanceType<FD[F_2]>["action"]>[2] | undefined) => ReturnType<InstanceType<FD[F_2]>["action"]>;
}>;
