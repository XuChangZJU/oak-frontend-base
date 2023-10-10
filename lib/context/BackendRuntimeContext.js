"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendRuntimeContext = void 0;
const AsyncRowStore_1 = require("oak-domain/lib/store/AsyncRowStore");
class BackendRuntimeContext extends AsyncRowStore_1.AsyncContext {
    subscriberId;
    getSubscriberId() {
        return this.subscriberId;
    }
    getSerializedData() {
        return {
            sid: this.subscriberId,
        };
    }
    async initialize(data) {
        if (data?.sid) {
            this.subscriberId = data.sid;
        }
    }
}
exports.BackendRuntimeContext = BackendRuntimeContext;
