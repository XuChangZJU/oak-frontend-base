"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const cache_1 = require("./cache");
const location_1 = require("./location");
const upload_1 = require("./upload");
const runningTree_1 = require("./runningTree");
const locales_1 = require("./locales");
function initialize(storageSchema, createContext, checkers) {
    const cache = new cache_1.Cache(storageSchema, createContext, checkers);
    const location = new location_1.Location();
    const runningTree = new runningTree_1.RunningTree(cache);
    const upload = new upload_1.Upload();
    const locales = new locales_1.Locales();
    return {
        cache,
        location,
        runningTree,
        upload,
        locales,
    };
}
exports.initialize = initialize;
