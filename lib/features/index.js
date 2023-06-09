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
var message_1 = require("./message");
var navigator_1 = require("./navigator");
var port_1 = require("./port");
var relation_1 = require("./relation");
var style_1 = require("./style");
var geo_1 = require("./geo");
function initialize(aspectWrapper, storageSchema, contextBuilder, store, relationDict, authDict, colorDict, makeBridgeUrlFn) {
    var cache = new cache_1.Cache(aspectWrapper, contextBuilder, store);
    var location = new location_1.Location();
    var runningTree = new runningTree_1.RunningTree(cache, storageSchema, authDict);
    var locales = new locales_1.Locales(aspectWrapper);
    var geo = new geo_1.Geo(aspectWrapper);
    var eventBus = new eventBus_1.EventBus();
    var localStorage = new localStorage_1.LocalStorage();
    var notification = new notification_1.Notification();
    var message = new message_1.Message();
    var navigator = new navigator_1.Navigator();
    var port = new port_1.Port(aspectWrapper);
    var relation = new relation_1.Relation(cache, relationDict);
    var style = new style_1.Style(colorDict);
    return {
        cache: cache,
        location: location,
        runningTree: runningTree,
        locales: locales,
        eventBus: eventBus,
        localStorage: localStorage,
        notification: notification,
        message: message,
        navigator: navigator,
        port: port,
        relation: relation,
        style: style,
        geo: geo,
    };
}
exports.initialize = initialize;
