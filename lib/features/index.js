"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeStep1 = exports.initializeStep2 = void 0;
var cache_1 = require("./cache");
var location_1 = require("./location");
var runningTree_1 = require("./runningTree");
var locales_1 = require("./locales");
var eventBus_1 = require("./eventBus");
var localStorage_1 = require("./localStorage");
var notification_1 = require("./notification");
var environment_1 = require("./environment");
var message_1 = require("./message");
var navigator_1 = require("./navigator");
var port_1 = require("./port");
var relationAuth_1 = require("./relationAuth");
var style_1 = require("./style");
var subscriber_1 = require("./subscriber");
var contextMenuFactory_1 = require("./contextMenuFactory");
var geo_1 = require("./geo");
function initializeStep2(features, aspectWrapper, storageSchema, frontendContextBuilder, checkers, actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, colorDict, getFullDataFn, getSubscribePointFn, makeBridgeUrlFn, selectFreeEntities, createFreeEntities, updateFreeEntities, savedEntities, keepFreshPeriod) {
    var localStorage = features.localStorage, environment = features.environment;
    var cache = new cache_1.Cache(storageSchema, aspectWrapper, frontendContextBuilder, checkers, getFullDataFn, localStorage, savedEntities, keepFreshPeriod);
    var relationAuth = new relationAuth_1.RelationAuth(cache, actionCascadePathGraph, relationCascadePathGraph, authDeduceRelationMap, selectFreeEntities, createFreeEntities, updateFreeEntities);
    var runningTree = new runningTree_1.RunningTree(cache, storageSchema, relationAuth);
    var geo = new geo_1.Geo(aspectWrapper);
    var port = new port_1.Port(aspectWrapper);
    var style = new style_1.Style(colorDict);
    var locales = new locales_1.Locales(cache, localStorage, environment, 'zh-CN', makeBridgeUrlFn); // 临时性代码，应由上层传入
    var contextMenuFactory = new contextMenuFactory_1.ContextMenuFactory(cache, relationAuth, actionCascadePathGraph);
    var subscriber = new subscriber_1.SubScriber(cache, getSubscribePointFn);
    return {
        cache: cache,
        relationAuth: relationAuth,
        runningTree: runningTree,
        locales: locales,
        port: port,
        style: style,
        geo: geo,
        contextMenuFactory: contextMenuFactory,
        subscriber: subscriber,
    };
}
exports.initializeStep2 = initializeStep2;
function initializeStep1() {
    var location = new location_1.Location();
    var environment = new environment_1.Environment();
    var eventBus = new eventBus_1.EventBus();
    var localStorage = new localStorage_1.LocalStorage();
    var notification = new notification_1.Notification();
    var message = new message_1.Message();
    var navigator = new navigator_1.Navigator();
    return {
        location: location,
        environment: environment,
        eventBus: eventBus,
        notification: notification,
        message: message,
        localStorage: localStorage,
        navigator: navigator,
    };
}
exports.initializeStep1 = initializeStep1;
