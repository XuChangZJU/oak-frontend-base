"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const cache_1 = require("./cache");
const location_1 = require("./location");
const node_1 = require("./node");
const uplpad_1 = require("./uplpad");
function initialize(storageSchema, createContext, checkers) {
    const cache = new cache_1.Cache(storageSchema, createContext, checkers);
    const location = new location_1.Location();
    const runningNode = new node_1.RunningNode(cache);
    const upload = new uplpad_1.Upload();
    return {
        cache,
        location,
        runningNode,
        upload,
    };
}
exports.initialize = initialize;
