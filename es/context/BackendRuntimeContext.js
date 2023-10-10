import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
export class BackendRuntimeContext extends AsyncContext {
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
