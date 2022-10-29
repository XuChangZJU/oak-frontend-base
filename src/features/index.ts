import { AspectWrapper, Checker, Context, EntityDict, Aspect } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';

import { CommonAspectDict } from 'oak-common-aspect';
import { Cache } from './cache';
import { Location } from './location';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { RunningTree } from './runningTree';
import { Locales } from './locales';
import { EventBus } from './eventBus';
import { LocalStorage } from './localStorage';
import { Notification } from './notification';
import { Message } from './message';
import { CacheStore } from '../cacheStore/CacheStore';
import { Navigator } from './navigator';

export function initialize<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> (
        aspectWrapper: AspectWrapper<ED, Cxt, AD>,
        storageSchema: StorageSchema<ED>,
        contextBuilder: () => Cxt,
        store: CacheStore<ED, Cxt>) {
    const cache = new Cache<ED, Cxt, AD>(aspectWrapper, contextBuilder, store);
    const location = new Location();
    const runningTree = new RunningTree<ED, Cxt, AD>(aspectWrapper, cache, storageSchema);
    const locales = new Locales(aspectWrapper);
    const eventBus = new EventBus();
    const localStorage = new LocalStorage();
    const notification = new Notification();
    const message = new Message();
    const navigator = new Navigator();
    return {
        cache,
        location,
        runningTree,
        locales,
        eventBus,
        localStorage,
        notification,
        message,
        navigator,
    };
}

export type BasicFeatures<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends Context<ED>,
    AD extends CommonAspectDict<ED, Cxt>
> = {
    cache: Cache<ED, Cxt, AD>;
    location: Location;
    runningTree: RunningTree<ED, Cxt, AD>;
    locales: Locales<ED, Cxt, AD>;
    eventBus: EventBus;
    localStorage: LocalStorage;
    notification: Notification;
    message: Message;
    navigator: Navigator;
};
