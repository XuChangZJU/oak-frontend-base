"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDebugStore = void 0;
const oak_debug_store_1 = require("oak-debug-store");
const oak_trigger_executor_1 = require("oak-trigger-executor");
function createDebugStore(storageSchema, initialData) {
    const executor = new oak_trigger_executor_1.TriggerExecutor();
    const store = new oak_debug_store_1.DebugStore(executor, storageSchema, initialData);
    return store;
}
exports.createDebugStore = createDebugStore;
__exportStar(require("./context"), exports);
