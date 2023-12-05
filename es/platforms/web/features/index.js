import React, { useContext } from 'react';
const FeaturesContext = React.createContext({
    features: {},
});
const FeaturesProvider = ({ features, children }) => {
    return (<FeaturesContext.Provider value={{ features }}>
            {children}
        </FeaturesContext.Provider>);
};
const useFeatures = () => {
    const { features } = useContext(FeaturesContext);
    return features;
};
export { FeaturesProvider, useFeatures };
