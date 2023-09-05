import React, { useContext, createElement } from 'react';
const FeaturesContext = React.createContext({
    features: {},
});
const FeaturesProvider = ({ features, children }) => {
    return createElement(FeaturesContext.Provider, {
        value: { features },
    }, children);
};
const useFeatures = () => {
    const { features } = useContext(FeaturesContext);
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
