import React from 'react';
import { Feature } from '../../../types/Feature';
type Props = {
    features: Record<string, Feature>;
    children: React.ReactNode;
};
declare const FeaturesProvider: (props: Props) => React.JSX.Element;
declare const useFeatures: <FD2 extends Record<string, Feature>>() => FD2;
export { FeaturesProvider, useFeatures };
