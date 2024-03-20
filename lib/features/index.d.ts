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
export declare function initializeStep2<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends Record<string, Aspect<ED, Cxt>>>(features: Pick<BasicFeatures<ED, Cxt, FrontCxt, AD>, 'localStorage' | 'environment' | 'message'>, aspectWrapper: AspectWrapper<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>, storageSchema: StorageSchema<ED>, frontendContextBuilder: () => (store: CacheStore<ED, FrontCxt>) => FrontCxt, checkers: Array<Checker<ED, keyof ED, FrontCxt | Cxt>>, authDeduceRelationMap: AuthDeduceRelationMap<ED>, colorDict: ColorDict<ED>, getFullDataFn: () => any, getSubscribePointFn: () => Promise<{
    url: string;
    path: string;
}>, makeBridgeUrlFn?: (url: string, headers?: Record<string, string>) => string, selectFreeEntities?: (keyof ED)[], updateFreeDict?: {
    [A in keyof ED]?: string[];
}, savedEntities?: (keyof ED)[], keepFreshPeriod?: number, attrUpdateMatrix?: AttrUpdateMatrix<ED>): {
    cache: Cache<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>;
    relationAuth: RelationAuth<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>;
    runningTree: RunningTree<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>;
    locales: Locales<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>;
    port: Port<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>;
    style: Style<ED>;
    geo: Geo<ED, Cxt, AD & CommonAspectDict<ED, Cxt>>;
    contextMenuFactory: ContextMenuFactory<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>;
    subscriber: SubScriber<ED, Cxt, FrontCxt, AD & CommonAspectDict<ED, Cxt>>;
};
export declare function initializeStep1(): {
    location: Location;
    environment: Environment;
    eventBus: EventBus;
    notification: Notification;
    message: Message;
    localStorage: LocalStorage;
    navigator: Navigator;
};
export type BasicFeatures<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>, AD extends Record<string, Aspect<ED, Cxt>>> = {
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
