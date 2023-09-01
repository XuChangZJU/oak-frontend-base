import React, { useContext, createElement } from 'react';
import { Aspect, EntityDict, CheckerType, AggregationResult } from "oak-domain/lib/types";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { BasicFeatures } from '../../../features/index';
import { Feature } from '../../../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';

type ED = EntityDict & BaseEntityDict;
type FD = BasicFeatures<ED, AsyncContext<ED>, SyncContext<ED>, Record<string, Aspect<ED, AsyncContext<ED>> & CommonAspectDict<ED, AsyncContext<ED>>>>;

const FeaturesContext = React.createContext<{ features: any }>({
    features: {},
});

const FeaturesProvider: React.FC<{
    features: Record<string, Feature>;
    children: React.ReactNode;
}> = ({ features, children }) => {
    return createElement(
        FeaturesContext.Provider,
        {
            value: { features },
        },
        children
    );
};

const useFeatures = <FD2 extends Record<string, Feature>>() => {
    const { features } = useContext<{
        features: FD2;
    }>(FeaturesContext);
    return features;
};

// function useFormData<Value>(
//     useHook: (options: Record<string, any>) => Promise<Value>
// ) {
//     const features = useContext(FeaturesContext);

//     const [state, setState] = useState<Value>({} as Value);

//     let sub: any;

//     useEffect(() => {
//         subscribe2();
//         return () => {
//             unsubscribe2();
//         };
//     }, []);

//     const subscribe2 = () => {
//         if (!sub) {
//             sub = subscribe(() => reRender());
//         }
//     };

//     const unsubscribe2 = () => {
//         if (sub) {
//             sub();
//             sub = undefined;
//         }
//     };

//     const reRender = async () => {
//         // 使用外部传入的 hook
//         const data = await useHook({ features });
//         setState(data);
//     };

//     return state;
// }

export { FeaturesProvider, useFeatures };
