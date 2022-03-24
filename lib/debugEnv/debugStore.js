"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDebugStore = void 0;
const oak_debug_store_1 = require("oak-debug-store");
const oak_trigger_executor_1 = require("oak-trigger-executor");
function createDebugStore(storageSchema, triggers, initialData) {
    const executor = new oak_trigger_executor_1.TriggerExecutor();
    // todo 这里需要恢复前端物化的缓存数据，在没有情况下再使用initialData;
    const store = new oak_debug_store_1.DebugStore(executor, storageSchema, initialData);
    triggers.forEach((trigger) => store.registerTrigger(trigger));
    return store;
}
exports.createDebugStore = createDebugStore;
