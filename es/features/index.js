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
export function initializeStep2(features, aspectWrapper, storageSchema, frontendContextBuilder, checkers, actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, colorDict, getFullDataFn, getSubscribePointFn, makeBridgeUrlFn, selectFreeEntities, createFreeEntities, updateFreeEntities, savedEntities, keepFreshPeriod) {
    const { localStorage, environment } = features;
    const cache = new Cache(storageSchema, aspectWrapper, frontendContextBuilder, checkers, getFullDataFn, localStorage, savedEntities, keepFreshPeriod);
    const relationAuth = new RelationAuth(cache, actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, selectFreeEntities, createFreeEntities, updateFreeEntities);
    const runningTree = new RunningTree(cache, storageSchema, relationAuth);
    const geo = new Geo(aspectWrapper);
    const port = new Port(aspectWrapper);
    const style = new Style(colorDict);
    const locales = new Locales(cache, localStorage, environment, 'zh-CN', makeBridgeUrlFn); // 临时性代码，应由上层传入
    const contextMenuFactory = new ContextMenuFactory(cache, relationAuth, actionCascadePathGraph);
    const subscriber = new SubScriber(cache, getSubscribePointFn);
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
