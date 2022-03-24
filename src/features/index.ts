import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Aspect } from 'oak-domain/lib/types/Aspect';

import * as Cache from './cache';
import * as Location from './location';
import * as Token from './token';

export function initialize<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>> (): BasicFeatures<ED, AD> {
    const cache = new Cache.Cache<ED, AD>();
    const location = new Location.Location();
    const token = new Token.Token(cache as any);

    return {
        cache,
        location,
        token,
    };
}

export type BasicFeatures<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>> = {
    cache: Cache.Cache<ED, AD>;
    location: Location.Location;
    token: Token.Token;
}

export type Actions<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>>  = {
    cache: Cache.Action<ED, AD>;
    location: Location.Action;
    token: Token.Action;
};
