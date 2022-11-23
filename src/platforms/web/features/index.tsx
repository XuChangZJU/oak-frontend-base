import React, { useContext, createElement } from 'react';
import { Feature } from './../../../types/Feature';

type FD = Record<string, Feature>;

const FeatureContext = React.createContext<{ features: any }>({
    features: {},
});

const FeaturesProvider: React.FC<{
    features: FD;
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

const useFeatures = <FD extends Record<string, Feature>>() => {
    const { features } = useContext<{
        features: FD;
    }>(FeatureContext);
    return features;
};

// function useFormData<Value>(
//     useHook: (options: Record<string, any>) => Promise<Value>
// ) {
//     const features = useContext(FeatureContext);

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
