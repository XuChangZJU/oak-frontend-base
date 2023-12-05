"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrontendRuntimeContext = void 0;
const SyncRowStore_1 = require("oak-domain/lib/store/SyncRowStore");
class FrontendRuntimeContext extends SyncRowStore_1.SyncContext {
    subscriber;
    env;
    navigator;
    constructor(store, features) {
        super(store);
        this.subscriber = features.subscriber;
        this.env = features.environment;
        this.navigator = features.navigator;
    }
    getSerializedData() {
        const sid = this.subscriber.getSubscriberId();
        const be = this.env.getBriefEnv();
        const ns = this.navigator.getState();
        return {
            sid,
            be,
            ns,
        };
    }
}
exports.FrontendRuntimeContext = FrontendRuntimeContext;
