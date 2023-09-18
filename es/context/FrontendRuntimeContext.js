import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
export class FrontendRuntimeContext extends SyncContext {
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
