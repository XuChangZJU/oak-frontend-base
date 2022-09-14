import { AspectWrapper, Context, EntityDict } from 'oak-domain/lib/types';
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
export declare function initialize<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>>(aspectWrapper: AspectWrapper<ED, Cxt, AD>, storageSchema: StorageSchema<ED>): {
    cache: Cache<ED, Cxt, AD>;
    location: Location<ED, Cxt, AD>;
    runningTree: RunningTree<ED, Cxt, AD>;
    locales: Locales<ED, Cxt, AD>;
    eventBus: EventBus<ED, Cxt, AD>;
    localStorage: LocalStorage<ED, Cxt, AD>;
    notification: Notification<ED, Cxt, AD>;
    message: Message<ED, Cxt, AD>;
};
export declare type BasicFeatures<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>, AD extends CommonAspectDict<ED, Cxt>> = {
    cache: Cache<ED, Cxt, AD>;
    location: Location<ED, Cxt, AD>;
    runningTree: RunningTree<ED, Cxt, AD>;
    locales: Locales<ED, Cxt, AD>;
    eventBus: EventBus<ED, Cxt, AD>;
    localStorage: LocalStorage<ED, Cxt, AD>;
    notification: Notification<ED, Cxt, AD>;
    message: Message<ED, Cxt, AD>;
};
