import { EntityDict, Context, OakException, Aspect } from 'oak-domain/lib/types';
import { CommonAspectDict } from 'oak-common-aspect';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { BasicFeatures } from '../features/index';
import { Feature } from './Feature';

export interface ExceptionHandler<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature>> {
    (features: FD & BasicFeatures<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>) : void;
};

export type ExceptionHandlerDict<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>, AD extends Record<string, Aspect<ED, Cxt>>, FD extends Record<string, Feature>> = Record<string, ExceptionHandler<ED, Cxt, AD, FD>>;
