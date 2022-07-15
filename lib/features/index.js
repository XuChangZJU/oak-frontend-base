"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const cache_1 = require("./cache");
const location_1 = require("./location");
const runningTree_1 = require("./runningTree");
const locales_1 = require("./locales");
const eventBus_1 = require("./eventBus");
const localStorage_1 = require("./localStorage");
const notification_1 = require("./notification");
function initialize(aspectWrapper, storageSchema, context, cacheStore) {
    const cache = new cache_1.Cache(aspectWrapper, context, cacheStore);
    const location = new location_1.Location(aspectWrapper);
    const runningTree = new runningTree_1.RunningTree(aspectWrapper, cache, storageSchema);
    const locales = new locales_1.Locales(aspectWrapper);
    const eventBus = new eventBus_1.EventBus(aspectWrapper);
    const localStorage = new localStorage_1.LocalStorage(aspectWrapper);
    const notification = new notification_1.Notification(aspectWrapper);
    return {
        cache,
        location,
        runningTree,
        locales,
        eventBus,
        localStorage,
        notification,
    };
}
exports.initialize = initialize;
