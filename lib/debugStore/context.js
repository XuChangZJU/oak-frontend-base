"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugContext = void 0;
const assert_1 = __importDefault(require("assert"));
const oak_memory_tree_store_1 = require("oak-memory-tree-store");
class DebugContext extends oak_memory_tree_store_1.Context {
    txn;
    on(event, callback) {
        this.txn.events[event].push(callback);
    }
    async begin(options) {
        (0, assert_1.default)(!this.txn);
        await super.begin();
        this.txn = {
            events: {
                commit: [],
                rollback: [],
            },
        };
    }
    async commit() {
        await super.commit();
        for (const fn of this.txn.events.commit) {
            await fn(this);
        }
        this.txn = undefined;
    }
    async rollback() {
        await super.rollback();
        for (const fn of this.txn.events.rollback) {
            await fn(this);
        }
        this.txn = undefined;
    }
}
exports.DebugContext = DebugContext;
