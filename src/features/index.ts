import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-domain/EntityDict';
import { Aspect } from 'oak-domain/lib/types/Aspect';

import { Cache } from './cache';
import { Location } from './location';
import { Token } from './token';
import { RunningNode } from './node';

export function initialize<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>> (): BasicFeatures<ED, AD> {
    const cache = new Cache<ED, AD>();
    const location = new Location();
    const token = new Token(cache as any);
    const runningNode = new RunningNode<ED, AD>(cache);

    return {
        cache,
        location,
        token,
        runningNode,
    };
}

export type BasicFeatures<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>> = {
    cache: Cache<ED, AD>;
    location: Location;
    token: Token;
    runningNode: RunningNode<ED, AD>;
};
