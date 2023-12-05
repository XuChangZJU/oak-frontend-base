import React, { useContext } from 'react';
import { Feature } from '../../../types/Feature';

const FeaturesContext = React.createContext<{ features: any }>({
    features: {},
});

type Props = {
    features: Record<string, Feature>;
    children: React.ReactNode;
};

const FeaturesProvider = (props: Props) => {
    const { features, children } = props;
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
