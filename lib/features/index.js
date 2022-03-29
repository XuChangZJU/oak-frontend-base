"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const cache_1 = require("./cache");
const location_1 = require("./location");
const token_1 = require("./token");
const node_1 = require("./node");
function initialize() {
    const cache = new cache_1.Cache();
    const location = new location_1.Location();
    const token = new token_1.Token(cache);
    const runningNode = new node_1.RunningNode(cache);
    return {
        cache,
        location,
        token,
        runningNode,
    };
}
exports.initialize = initialize;
