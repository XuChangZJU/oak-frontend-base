import React from 'react';
import { Feature } from '../../../types/Feature';
declare const FeaturesProvider: React.FC<{
    features: Record<string, Feature>;
    children: React.ReactNode;
}>;
declare const useFeatures: <FD2 extends Record<string, Feature>>() => FD2;
export { FeaturesProvider, useFeatures };
