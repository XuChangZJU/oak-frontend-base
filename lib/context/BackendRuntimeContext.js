"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendRuntimeContext = void 0;
const AsyncRowStore_1 = require("oak-domain/lib/store/AsyncRowStore");
class BackendRuntimeContext extends AsyncRowStore_1.AsyncContext {
    subscriberId;
    constructor(store, data, headers) {
        super(store, headers);
        if (data) {
            this.subscriberId = data.sid;
        }
    }
    getSubscriberId() {
        return this.subscriberId;
    }
    getSerializedData() {
        return {
            sid: this.subscriberId,
        };
    }
    async initialized() {
    }
}
exports.BackendRuntimeContext = BackendRuntimeContext;
