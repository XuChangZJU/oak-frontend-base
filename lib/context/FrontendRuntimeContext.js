"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrontendRuntimeContext = void 0;
const SyncRowStore_1 = require("oak-domain/lib/store/SyncRowStore");
class FrontendRuntimeContext extends SyncRowStore_1.SyncContext {
    subscriber;
    constructor(store, features) {
        super(store);
        this.subscriber = features.subscriber;
    }
    getSerializedData() {
        const sid = this.subscriber.getSubscriberId();
        return {
            sid,
        };
    }
}
exports.FrontendRuntimeContext = FrontendRuntimeContext;
