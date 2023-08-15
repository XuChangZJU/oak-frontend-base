import React from 'react';
import { Aspect, EntityDict } from "oak-domain/lib/types";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { BasicFeatures } from '../../../features/index';
import { Feature } from '../../../types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
declare type ED = EntityDict & BaseEntityDict;
declare type FD = BasicFeatures<ED, AsyncContext<ED>, SyncContext<ED>, Record<string, Aspect<ED, AsyncContext<ED>> & CommonAspectDict<ED, AsyncContext<ED>>>>;
declare const FeaturesProvider: React.FC<{
    features: FD;
    children: React.ReactNode;
}>;
declare const useFeatures: <FD2 extends FD & Record<string, Feature>>() => FD2;
export { FeaturesProvider, useFeatures };
