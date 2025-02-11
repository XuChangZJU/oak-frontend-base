import { Aspect, AspectWrapper, AttrUpdateMatrix, AuthDeduceRelationMap, Checker, EntityDict } from 'oak-domain/lib/types';
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
import { SubScriber } from './subscriber';
import { ContextMenuFactory } from './contextMenuFactory';
import { Geo } from './geo';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';

export function initializeStep2<
    ED extends EntityDict & BaseEntityDict,
    Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>,
    AD extends Record<string, Aspect<ED, Cxt>>>(
        features: Pick<BasicFeatures<ED, Cxt, FrontCxt, AD>, 'localStorage' | 'environment' | 'message'>,
        aspectWrapper: AspectWrapper<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>,
        storageSchema: StorageSchema<ED>,
        frontendContextBuilder: () => (store: CacheStore<ED, FrontCxt>) => FrontCxt,
        checkers: Array<Checker<ED, keyof ED, FrontCxt | Cxt>>,
        authDeduceRelationMap: AuthDeduceRelationMap<ED>,
        colorDict: ColorDict<ED>,
        getFullDataFn: () => any,
        getSubscribePointFn: () => Promise<{
            url: string;
            path: string;
        }>,
        makeBridgeUrlFn?: (url: string, headers?: Record<string, string>) => string,
        selectFreeEntities?: (keyof ED)[],
        updateFreeDict?: {
            [A in keyof ED]?: string[];
        },
        savedEntities?: (keyof ED)[],
        keepFreshPeriod?: number,
        attrUpdateMatrix?: AttrUpdateMatrix<ED>) {
    const { localStorage, environment, message } = features;
    const cache = new Cache<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>(storageSchema, aspectWrapper,
        frontendContextBuilder, checkers, getFullDataFn, localStorage, savedEntities, keepFreshPeriod, attrUpdateMatrix);
    const relationAuth = new RelationAuth<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>(cache, authDeduceRelationMap, selectFreeEntities, updateFreeDict);
    const runningTree = new RunningTree<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>(cache, storageSchema, relationAuth);
    const geo = new Geo(aspectWrapper);
    const port = new Port<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>(aspectWrapper);
    const style = new Style<ED>(colorDict);
    const locales = new Locales(cache, localStorage, environment, 'zh-CN', makeBridgeUrlFn);        // 临时性代码，应由上层传入
    const contextMenuFactory = new ContextMenuFactory<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>(cache, relationAuth);
    const subscriber = new SubScriber(cache, message, getSubscribePointFn);
    return {
        cache,
        relationAuth,
        runningTree,
        locales,
        port,
        style,
        geo,
        contextMenuFactory,
        subscriber,
    };
}

export function initializeStep1() {
    const location = new Location();
    const environment = new Environment();
    const eventBus = new EventBus();
    const localStorage = new LocalStorage();
    const notification = new Notification();
    const message = new Message();
    const navigator = new Navigator();

    return {
        location,
        environment,
        eventBus,
        notification,
        message,
        localStorage,
        navigator,
    }
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
        subscriber: SubScriber<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>;
    };
