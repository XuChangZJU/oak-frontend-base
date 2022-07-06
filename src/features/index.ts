import { AspectWrapper, Checker, Context, EntityDict, RowStore } from 'oak-domain/lib/types';

import { CommonAspectDict } from 'oak-common-aspect';
import { Cache } from './cache';
import { Location } from './location';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { RunningTree } from './runningTree';
import { Locales } from './locales';
import { EventBus } from './eventBus';
import { LocalStorage } from './localStorage';
import { CacheStore } from '../cacheStore/CacheStore';

export function initialize<ED extends EntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> (
        aspectWrapper: AspectWrapper<ED, Cxt, AD>,
        storageSchema: StorageSchema<ED>,
        context: Cxt,
        cacheStore: CacheStore<ED, Cxt>): BasicFeatures<ED, Cxt, AD> {
    const cache = new Cache<ED, Cxt, AD>(aspectWrapper, context, cacheStore);
    const location = new Location(aspectWrapper);
    const runningTree = new RunningTree<ED, Cxt, AD>(aspectWrapper, cache, storageSchema);
    const locales = new Locales(aspectWrapper);
    const eventBus = new EventBus(aspectWrapper);
    const localStorage = new LocalStorage(aspectWrapper);
    return {
        cache,
        location,
        runningTree,
        locales,
        eventBus,
        localStorage,
    };
}

export type BasicFeatures<
    ED extends EntityDict,
    Cxt extends Context<ED>,
    AD extends CommonAspectDict<ED, Cxt>
> = {
    cache: Cache<ED, Cxt, AD>;
    location: Location<ED, Cxt, AD>;
    runningTree: RunningTree<ED, Cxt, AD>;
    locales: Locales<ED, Cxt, AD>;
    eventBus: EventBus<ED, Cxt, AD>;
    localStorage: LocalStorage<ED, Cxt, AD>;
};
