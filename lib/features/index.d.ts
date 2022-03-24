import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Aspect } from 'oak-domain/lib/types/Aspect';
import * as Cache from './cache';
import * as Location from './location';
import * as Token from './token';
export declare function initialize<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>>(): BasicFeatures<ED, AD>;
export declare type BasicFeatures<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>> = {
    cache: Cache.Cache<ED, AD>;
    location: Location.Location;
    token: Token.Token;
};
export declare type Actions<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>> = {
    cache: Cache.Action<ED, AD>;
    location: Location.Action;
    token: Token.Action;
};
