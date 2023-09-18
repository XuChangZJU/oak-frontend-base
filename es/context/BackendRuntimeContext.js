import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
export class BackendRuntimeContext extends AsyncContext {
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
    async initialized() {
    }
}
