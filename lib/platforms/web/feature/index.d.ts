import React from 'react';
import { Aspect, Context, EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { BasicFeatures } from './../../../features';
import { Feature } from './../../../types/Feature';
declare type ED = EntityDict & BaseEntityDict;
declare type Cxt = Context<ED>;
declare type AD = Record<string, Aspect<ED, Cxt>> & CommonAspectDict<ED, Cxt>;
declare type FD = Record<string, Feature<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>>;
declare type features = BasicFeatures<ED, Cxt, AD> & FD;
declare const FeatureProvider: React.FC<{
    features: features;
    children: React.ReactNode;
}>;
declare const useFeature: () => {
    features: features;
};
declare function useFormData<Value>(useHook: (options: {
    features: features;
}) => Promise<Value>): Value;
export { FeatureProvider, useFeature, useFormData };
