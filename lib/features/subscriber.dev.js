"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubScriber = void 0;
const lodash_1 = require("oak-domain/lib/utils/lodash");
const Feature_1 = require("../types/Feature");
class SubScriber extends Feature_1.Feature {
    eventCallbackMap = {
        connect: [],
        disconnect: [],
    };
    constructor(cache, getSubscribePointFn) {
        super();
    }
    on(event, callback) {
        this.eventCallbackMap[event].push(callback);
    }
    off(event, callback) {
        (0, lodash_1.pull)(this.eventCallbackMap[event], callback);
    }
    async sub(data, callback) {
        console.log('data subscribe 在dev模式下不起作用');
    }
    async unsub(ids) { }
    getSubscriberId() {
        return undefined;
    }
}
exports.SubScriber = SubScriber;
