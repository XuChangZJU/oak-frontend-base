import React, { useContext, useEffect, useState, createElement } from 'react';
import { Aspect, Context, EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { BasicFeatures } from './../../../features';
import { Feature, subscribe } from './../../../types/Feature';


type ED = EntityDict & BaseEntityDict;
type Cxt = Context<ED>;
type AD = Record<string, Aspect<ED, Cxt>> & CommonAspectDict<ED, Cxt>;
type FD = Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>;
type features = BasicFeatures<ED, Cxt, AD> & FD;

const FeatureContext = React.createContext<{ features: features }>({
    features: {} as features,
});

const FeatureProvider: React.FC<{
    features: features;
    children: React.ReactNode;
}> = ({ features, children }) => {
    return createElement(
        FeatureContext.Provider,
        {
            value: { features },
        },
        children
    );
};

const useFeature = () => {
    const { features } = useContext(FeatureContext);
    return {
        features,
    };
};

function useFormData<Value>(
    useHook: (options: {
        features: features;
    }) => Promise<Value>
) {
    const { features } = useContext(FeatureContext);

    const [state, setState] = useState<Value>({} as Value);

    let sub: any;

    useEffect(() => {
        subscribe2();
        return () => {
            unsubscribe2();
        };
    }, []);

    const subscribe2 = () => {
        if (!sub) {
            sub = subscribe(() => reRender());
        }
    };

    const unsubscribe2 = () => {
        if (sub) {
            sub();
            sub = undefined;
        }
    };

    const reRender = async () => {
        // 使用外部传入的 hook
        const data = await useHook({ features });
        setState(data);
    };

    return state;
}

export { FeatureProvider, useFeature, useFormData };
