"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDebugStore = void 0;
const debugStore_1 = require("./debugStore");
const context_1 = require("./context");
const TriggerExecutor_1 = require("oak-domain/lib/store/TriggerExecutor");
const oak_general_business_1 = require("oak-general-business");
async function initDataInStore(store, initialData) {
    if (false) {
        // todo 在不同环境下读取相应的store数据并初始化
    }
    else {
        const context = new context_1.DebugContext(store);
        await context.begin();
        if (initialData) {
            for (const entity in initialData) {
                await store.operate(entity, {
                    action: 'create',
                    data: initialData[entity],
                }, context);
            }
        }
        for (const entity in oak_general_business_1.data) {
            await store.operate(entity, {
                action: 'create',
                data: oak_general_business_1.data[entity],
            }, context);
        }
        await context.commit();
    }
}
function createDebugStore(storageSchema, triggers, initialData) {
    const executor = new TriggerExecutor_1.TriggerExecutor();
    const store = new debugStore_1.DebugStore(executor, storageSchema);
    oak_general_business_1.triggers.forEach(ele => store.registerTrigger(ele));
    triggers?.forEach(ele => store.registerTrigger(ele));
    // 如果有物化存储的数据使用此数据，否则使用initialData初始化debugStore
    initDataInStore(store, initialData);
    return store;
}
exports.createDebugStore = createDebugStore;
__exportStar(require("../cacheStore/context"), exports);
