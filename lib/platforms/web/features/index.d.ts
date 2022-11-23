import React from 'react';
import { Feature } from './../../../types/Feature';
declare type FD = Record<string, Feature>;
declare const FeaturesProvider: React.FC<{
    features: FD;
    children: React.ReactNode;
}>;
declare const useFeatures: <FD_1 extends Record<string, Feature>>() => FD_1;
export { FeaturesProvider, useFeatures };
