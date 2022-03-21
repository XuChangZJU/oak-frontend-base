import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { Trigger } from "oak-domain/lib/types/Trigger";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';

import { Aspect } from 'oak-domain/lib/types/Aspect';
import { Feature } from './types/Feature';

import { Token } from './features/token';
import { assign } from 'lodash';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { FrontContext } from './FrontContext';


function populateFeatures<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>, FD extends Record<string, new <P extends EntityDict & BaseEntityDict, Q extends Record<string, Aspect<P>>>() => Feature<P, Q>>>(featureClazzDict: FD)
: {
    [T in keyof FD]: InstanceType<FD[T]>;
} {
    const result = {};
    for (const k in featureClazzDict) {
        assign(result, {
            [k]: new featureClazzDict[k]<ED, AD>(),
        });
    }

    return result as any;
}

export async function initialize<ED extends EntityDict & BaseEntityDict,
    AD extends Record<string, Aspect<ED>>,
    FD extends Record<string, new <P extends EntityDict & BaseEntityDict, Q extends Record<string, Aspect<P>>>() => Feature<P, Q>>>(
    storageSchema: StorageSchema<ED>,
    applicationId: string,
    featureClazzDict?: FD,
    triggers?: Array<Trigger<ED, keyof ED>>,
    aspectDict?: AD,
    initialData?: {
        [T in keyof ED]? : Array<ED[T]['OpSchema']>;
    }) {

    const token = new Token<ED, AD>();
    // todo default triggers
    const frontContext = new FrontContext<ED, AD>(storageSchema, triggers!, applicationId, () => token.getTokenValue(), aspectDict, initialData);    

    const featureDict = {
        token: Token,
    };
    function ppf() {
        return populateFeatures<ED, AD, FD>(featureClazzDict!);
    }
    if (featureClazzDict) {
        assign(featureDict, ppf());
    }

    const featureDict2 = featureDict as typeof featureDict & ReturnType<typeof ppf>;

    const subscribe = <F extends keyof typeof featureDict | keyof FD>(features: F[], callback: () => void) => {
        const unsubscribes = features.map(
            (f) => {
                const feature = featureDict2[f];
                return feature.subscribe(callback);
            }
        );
        return () => {
            unsubscribes.forEach(
                ele => ele()
            );
        };
    };

    const getFeature = <F extends keyof typeof featureDict | keyof FD>(f: F, params?: Parameters<InstanceType<FD[F]>['get']>[1]): ReturnType<InstanceType<FD[F]>['get']> => {
        // const context = new FrontContext<ED, typeof aspectDict2>(store, aspectProxy) as any; 
        const feature = featureDict2[f];
        return feature.get(frontContext as any, params) as any; // 这里有个类型的转换暂时写不出来，因为populateFeatures没法传递generic types在返回值里
    };

    const actionFeature = <F extends keyof typeof featureDict | keyof FD>(f: F, t: Parameters<InstanceType<FD[F]>['action']>[1], p?: Parameters<InstanceType<FD[F]>['action']>[2]): ReturnType<InstanceType<FD[F]>['action']> => {
        // const context = new FrontContext<ED, typeof aspectDict2>(store, aspectProxy) as any;        
        const feature = featureDict2[f];
        return feature.action(frontContext as any, t, p) as any;
    };

    return {
        subscribe,
        getFeature,
        actionFeature,
    };
}
