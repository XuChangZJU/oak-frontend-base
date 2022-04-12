import { EntityDict } from 'oak-domain/lib/types/Entity';
import { BaseEntityDict } from 'oak-general-business/lib/base-ed/EntityDict';
import { Aspect, Checker } from 'oak-general-business';

import { Cache } from './cache';
import { Location } from './location';
import { RunningNode } from './node';
import { CacheStore } from '../cacheStore/CacheStore';
import { StorageSchema } from 'oak-domain/lib/types/Storage';

export function initialize<ED extends EntityDict & BaseEntityDict,
    AD extends Record<string, Aspect<ED>>> (
        storageSchema: StorageSchema<ED>,
        applicationId: string,        
        checkers?: Array<Checker<ED, keyof ED>>): BasicFeatures<ED, AD> {
    const cache = new Cache<ED, AD>(storageSchema, applicationId, checkers);
    const location = new Location();
    const runningNode = new RunningNode<ED, AD>(cache);

    return {
        cache,
        location,
        runningNode,
    };
}

export type BasicFeatures<ED extends EntityDict & BaseEntityDict, AD extends Record<string, Aspect<ED>>> = {
    cache: Cache<ED, AD>;
    location: Location;
    runningNode: RunningNode<ED, AD>;
};
