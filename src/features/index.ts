import { Aspect, AspectWrapper, AuthCascadePath, AuthDeduceRelationMap, EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ColorDict } from 'oak-domain/lib/types/Style';

import { CommonAspectDict } from 'oak-common-aspect';
import { Cache } from './cache';
import { Location } from './location';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { RunningTree } from './runningTree';
import { Locales } from './locales';
import { EventBus } from './eventBus';
import { LocalStorage } from './localStorage';
import { Notification } from './notification';
import { Environment } from './environment';
import { Message } from './message';
import { CacheStore } from '../cacheStore/CacheStore';
import { Navigator } from './navigator';
import { Port } from './port';
import { RelationAuth } from './relationAuth';
import { Style } from './style';
import { ContextMenuFactory } from './contextMenuFactory';
import { Geo } from './geo';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';

export function initialize<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends Record<string, Aspect<ED, Cxt>>> (
        aspectWrapper: AspectWrapper<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>,
        storageSchema: StorageSchema<ED>,
        contextBuilder: () => FrontCxt,
        store: CacheStore<ED, FrontCxt>,
        actionCascadePathGraph: AuthCascadePath<ED>[],
        relationCascadePathGraph: AuthCascadePath<ED>[],
        authDeduceRelationMap: AuthDeduceRelationMap<ED>,
        selectFreeEntities: (keyof ED)[],
        colorDict: ColorDict<ED>,
        makeBridgeUrlFn?: (url: string, headers?: Record<string, string>) => string) {
    const cache = new Cache<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>(aspectWrapper, contextBuilder, store);
    const location = new Location();
    const environment = new Environment();
    const relationAuth = new RelationAuth<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>(aspectWrapper, contextBuilder, cache, 
        actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, selectFreeEntities);
    const runningTree = new RunningTree<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>(cache, storageSchema, relationAuth);
    const geo = new Geo(aspectWrapper);
    const eventBus = new EventBus();
    const localStorage = new LocalStorage();
    const notification = new Notification();
    const message = new Message();
    const navigator = new Navigator();
    const port = new Port<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>(aspectWrapper);
    const style = new Style<ED>(colorDict);
    const locales = new Locales(cache, localStorage, environment, makeBridgeUrlFn);
    const contextMenuFactory = new ContextMenuFactory<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>(cache, relationAuth, actionCascadePathGraph);
    return {
        cache,
        location,
        relationAuth,
        runningTree,
        locales,
        eventBus,
        localStorage,
        notification,
        message,
        navigator,
        port,
        style,
        geo,
        contextMenuFactory,
    } as BasicFeatures<ED, Cxt, FrontCxt, AD>;
}

export type BasicFeatures<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends AsyncContext<ED>,
    FrontCxt extends SyncContext<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>
> = {
    cache: Cache<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>;
    location: Location;
    runningTree: RunningTree<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>;
    locales: Locales<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>;
    eventBus: EventBus;
    localStorage: LocalStorage;
    notification: Notification;
    message: Message;
    navigator: Navigator;
    port: Port<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>;
    relationAuth: RelationAuth<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>;
    environment: Environment;
    style: Style<ED>;
    geo: Geo<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>;
    contextMenuFactory: ContextMenuFactory<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>;
};
