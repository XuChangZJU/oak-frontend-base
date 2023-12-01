"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendRuntimeContext = void 0;
const AsyncRowStore_1 = require("oak-domain/lib/store/AsyncRowStore");
class BackendRuntimeContext extends AsyncRowStore_1.AsyncContext {
    subscriberId;
    be;
    ns;
    getNavigatorState() {
        return this.ns;
    }
    getSubscriberId() {
        return this.subscriberId;
    }
    getBriefEnvironment() {
        return this.be;
    }
    getSerializedData() {
        return {
            sid: this.subscriberId,
            be: this.be,
            ns: this.ns,
        };
    }
    async initialize(data) {
        if (data?.sid) {
            this.subscriberId = data.sid;
        }
        if (data?.be) {
            this.be = data.be;
        }
        if (data?.ns) {
            this.ns = data.ns;
        }
    }
}
exports.BackendRuntimeContext = BackendRuntimeContext;
