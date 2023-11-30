import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
export class FrontendRuntimeContext extends SyncContext {
    subscriber;
    env;
    constructor(store, features) {
        super(store);
        this.subscriber = features.subscriber;
        this.env = features.environment;
    }
    getSerializedData() {
        const sid = this.subscriber.getSubscriberId();
        const be = this.env.getBriefEnv();
        return {
            sid,
            be,
        };
    }
}
