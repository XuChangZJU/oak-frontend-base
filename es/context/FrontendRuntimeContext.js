import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
export class FrontendRuntimeContext extends SyncContext {
    subscriber;
    env;
    navigator;
    constructor(store, features) {
        super(store);
        this.subscriber = features.subscriber;
        this.env = features.environment;
        this.navigator = features.navigator;
    }
    async getSerializedData() {
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
