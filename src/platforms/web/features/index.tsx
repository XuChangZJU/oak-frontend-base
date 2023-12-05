import React, { useContext, createElement } from 'react';
import { Feature } from '../../../types/Feature';


const FeaturesContext = React.createContext<{ features: any }>({
    features: {},
});

const FeaturesProvider: React.FC<{
    features: Record<string, Feature>;
    children: React.ReactNode;
}> = ({ features, children }) => {
    return (
        <FeaturesContext.Provider value={{ features }}>
            {children}
        </FeaturesContext.Provider>
    );
};

const useFeatures = <FD2 extends Record<string, Feature>>() => {
    const { features } = useContext<{
        features: FD2;
    }>(FeaturesContext);
    return features;
};


export { FeaturesProvider, useFeatures };
