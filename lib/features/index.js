"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
var cache_1 = require("./cache");
var location_1 = require("./location");
var runningTree_1 = require("./runningTree");
var locales_1 = require("./locales");
var eventBus_1 = require("./eventBus");
var localStorage_1 = require("./localStorage");
var notification_1 = require("./notification");
function initialize(aspectWrapper, storageSchema, context, cacheStore) {
    var cache = new cache_1.Cache(aspectWrapper, context, cacheStore);
    var location = new location_1.Location(aspectWrapper);
    var runningTree = new runningTree_1.RunningTree(aspectWrapper, cache, storageSchema);
    var locales = new locales_1.Locales(aspectWrapper);
    var eventBus = new eventBus_1.EventBus(aspectWrapper);
    var localStorage = new localStorage_1.LocalStorage(aspectWrapper);
    var notification = new notification_1.Notification(aspectWrapper);
    return {
        cache: cache,
        location: location,
        runningTree: runningTree,
        locales: locales,
        eventBus: eventBus,
        localStorage: localStorage,
        notification: notification,
    };
}
exports.initialize = initialize;
