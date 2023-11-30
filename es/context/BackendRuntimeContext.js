import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
export class BackendRuntimeContext extends AsyncContext {
    subscriberId;
    be;
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
        };
    }
    async initialize(data) {
        if (data?.sid) {
            this.subscriberId = data.sid;
        }
        if (data?.be) {
            this.be = data.be;
        }
    }
}
