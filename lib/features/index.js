"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeStep1 = exports.initializeStep2 = void 0;
const cache_1 = require("./cache");
const location_1 = require("./location");
const runningTree_1 = require("./runningTree");
const locales_1 = require("./locales");
const eventBus_1 = require("./eventBus");
const localStorage_1 = require("./localStorage");
const notification_1 = require("./notification");
const environment_1 = require("./environment");
const message_1 = require("./message");
const navigator_1 = require("./navigator");
const port_1 = require("./port");
const relationAuth_1 = require("./relationAuth");
const style_1 = require("./style");
const subscriber_1 = require("./subscriber");
const contextMenuFactory_1 = require("./contextMenuFactory");
const geo_1 = require("./geo");
function initializeStep2(features, aspectWrapper, storageSchema, frontendContextBuilder, checkers, actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, colorDict, getFullDataFn, getSubscribePointFn, makeBridgeUrlFn, selectFreeEntities, createFreeEntities, updateFreeEntities, savedEntities, keepFreshPeriod) {
    const { localStorage, environment, message } = features;
    const cache = new cache_1.Cache(storageSchema, aspectWrapper, frontendContextBuilder, checkers, getFullDataFn, localStorage, savedEntities, keepFreshPeriod);
    const relationAuth = new relationAuth_1.RelationAuth(cache, actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, selectFreeEntities, createFreeEntities, updateFreeEntities);
    const runningTree = new runningTree_1.RunningTree(cache, storageSchema, relationAuth);
    const geo = new geo_1.Geo(aspectWrapper);
    const port = new port_1.Port(aspectWrapper);
    const style = new style_1.Style(colorDict);
    const locales = new locales_1.Locales(cache, localStorage, environment, 'zh-CN', makeBridgeUrlFn); // 临时性代码，应由上层传入
    const contextMenuFactory = new contextMenuFactory_1.ContextMenuFactory(cache, relationAuth, actionCascadePathGraph);
    const subscriber = new subscriber_1.SubScriber(cache, message, getSubscribePointFn);
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
exports.initializeStep2 = initializeStep2;
function initializeStep1() {
    const location = new location_1.Location();
    const environment = new environment_1.Environment();
    const eventBus = new eventBus_1.EventBus();
    const localStorage = new localStorage_1.LocalStorage();
    const notification = new notification_1.Notification();
    const message = new message_1.Message();
    const navigator = new navigator_1.Navigator();
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
exports.initializeStep1 = initializeStep1;
