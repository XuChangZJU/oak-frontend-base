import { Cache } from './cache';
import { Location } from './location';
import { RunningTree } from './runningTree';
import { Locales } from './locales';
import { EventBus } from './eventBus';
import { LocalStorage } from './localStorage';
import { Notification } from './notification';
import { Environment } from './environment';
import { Message } from './message';
import { Navigator } from './navigator';
import { Port } from './port';
import { RelationAuth } from './relationAuth';
import { Style } from './style';
import { SubScriber } from './subscriber';
import { ContextMenuFactory } from './contextMenuFactory';
import { Geo } from './geo';
export function initializeStep2(features, aspectWrapper, storageSchema, frontendContextBuilder, checkers, authDeduceRelationMap, colorDict, getFullDataFn, getSubscribePointFn, makeBridgeUrlFn, selectFreeEntities, updateFreeDict, savedEntities, keepFreshPeriod) {
    const { localStorage, environment, message } = features;
    const cache = new Cache(storageSchema, aspectWrapper, frontendContextBuilder, checkers, getFullDataFn, localStorage, savedEntities, keepFreshPeriod);
    const relationAuth = new RelationAuth(cache, authDeduceRelationMap, selectFreeEntities, updateFreeDict);
    const runningTree = new RunningTree(cache, storageSchema, relationAuth);
    const geo = new Geo(aspectWrapper);
    const port = new Port(aspectWrapper);
    const style = new Style(colorDict);
    const locales = new Locales(cache, localStorage, environment, 'zh-CN', makeBridgeUrlFn); // 临时性代码，应由上层传入
    const contextMenuFactory = new ContextMenuFactory(cache, relationAuth);
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
    };
}
