"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
const lodash_1 = require("oak-domain/lib/utils/lodash");
const Feature_1 = require("../types/Feature");
class EventBus extends Feature_1.Feature {
    EventTable = {};
    sub(type, callback) {
        if (this.EventTable[type]) {
            this.EventTable[type].push(callback);
        }
        else {
            Object.assign(this.EventTable, {
                [type]: [callback],
            });
        }
    }
    unsub(type, callback) {
        (0, lodash_1.pull)(this.EventTable[type], callback);
    }
    unsubAll(type) {
        (0, lodash_1.unset)(this.EventTable, type);
    }
    pub(type, options) {
        if (this.EventTable[type]) {
            for (const f of this.EventTable[type]) {
                f(options);
            }
        }
    }
}
exports.EventBus = EventBus;
