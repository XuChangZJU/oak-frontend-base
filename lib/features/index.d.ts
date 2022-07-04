import { AspectWrapper, Context, EntityDict } from 'oak-domain/lib/types';
import { CommonAspectDict } from 'oak-common-aspect';
import { Cache } from './cache';
import { Location } from './location';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { RunningTree } from './runningTree';
import { Locales } from './locales';
import { EventBus } from './eventBus';
import { CacheStore } from '../cacheStore/CacheStore';
export declare function initialize<ED extends EntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>>(aspectWrapper: AspectWrapper<ED, Cxt, AD>, storageSchema: StorageSchema<ED>, context: Cxt, cacheStore: CacheStore<ED, Cxt>): BasicFeatures<ED, Cxt, AD>;
export declare type BasicFeatures<ED extends EntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> = {
    cache: Cache<ED, Cxt, AD>;
    location: Location<ED, Cxt, AD>;
    runningTree: RunningTree<ED, Cxt, AD>;
    locales: Locales<ED, Cxt, AD>;
    eventBus: EventBus<ED, Cxt, AD>;
};
